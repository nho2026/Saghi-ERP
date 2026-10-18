import "dotenv/config";
import { prisma } from "../src/shared/database/client.js";
import { HikvisionClient } from "../src/modules/attendance/hikvision/hikvision.client.js";
import { getSettings } from "../src/modules/settings/settings.service.js";

// Device searches only: this import never writes to the terminal.
const apply = process.argv.includes("--apply");
const normalize = (name) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
try {
  const settings = await getSettings("hr");
  const snapshots = [];
  for (const device of await prisma.attendanceDevice.findMany()) {
    snapshots.push({ device, users: await new HikvisionClient(device).allUsers() });
  }
  const result = await prisma.$transaction(async (tx) => {
    const employees = await tx.employee.findMany();
    const usedCodes = new Set(employees.map((employee) => employee.employeeCode));
    let nextCode = 1;
    const summary = { deviceUsers: 0, alreadyLinked: 0, created: 0, matched: 0, skipped: [] };
    for (const { device, users } of snapshots) {
      for (const user of users) {
        summary.deviceUsers++;
        const employeeNo = String(user.employeeNo ?? user.employeeNoString ?? "").trim();
        const name = String(user.name ?? "").trim().replace(/\s+/g, " ");
        if (!employeeNo || !name) {
          summary.skipped.push({ device: device.name, employeeNo, reason: "Missing number or name" });
          continue;
        }
        const person = await tx.attendancePerson.findUnique({ where: { deviceId_employeeNo: { deviceId: device.id, employeeNo } } });
        if (person?.employeeId) { summary.alreadyLinked++; continue; }
        const matches = employees.filter((employee) => normalize(`${employee.firstName} ${employee.lastName}`) === normalize(name));
        if (matches.length > 1) {
          summary.skipped.push({ device: device.name, employeeNo, reason: "Ambiguous employee name" });
          continue;
        }
        let employee = matches[0];
        if (employee) {
          const other = await tx.attendancePerson.findFirst({ where: { deviceId: device.id, employeeId: employee.id, employeeNo: { not: employeeNo } } });
          if (other) {
            summary.skipped.push({ device: device.name, employeeNo, reason: "Name matches another linked device user" });
            continue;
          }
          summary.matched++;
        } else {
          let employeeCode;
          do { employeeCode = `EMP-${String(nextCode++).padStart(4, "0")}`; } while (usedCodes.has(employeeCode));
          usedCodes.add(employeeCode);
          const [firstName, ...rest] = name.split(" ");
          const data = { employeeCode, firstName, lastName: rest.join(" "), hireDate: new Date(), checkInTime: settings.startTime, checkOutTime: settings.endTime, status: "active" };
          employee = apply ? await tx.employee.create({ data }) : { id: `preview:${employeeCode}`, ...data };
          employees.push(employee);
          summary.created++;
        }
        if (apply) {
          const linked = await tx.attendancePerson.upsert({
            where: { deviceId_employeeNo: { deviceId: device.id, employeeNo } },
            update: { employeeId: employee.id },
            create: { deviceId: device.id, employeeNo, name, employeeId: employee.id },
          });
          await tx.attendanceEvent.updateMany({ where: { deviceId: device.id, employeeNo, personId: null }, data: { personId: linked.id } });
        }
      }
    }
    return summary;
  }, { timeout: 120000 });
  console.log(JSON.stringify({ applied: apply, ...result }, null, 2));
} finally {
  await prisma.$disconnect();
}
