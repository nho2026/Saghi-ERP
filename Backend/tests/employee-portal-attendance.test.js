import assert from "node:assert/strict";
import { test } from "node:test";

const queries = {};
globalThis.__nhoPrisma = {
  employee: { async findUnique(query) {
    queries.employee = query;
    return { id: "own-employee", scheduleType: "static", checkInTime: "09:00", checkOutTime: "17:00", workSchedule: null };
  } },
  attendanceEvent: { async findMany(query) {
    queries.events = query;
    return [
      { id: "in", occurredAt: new Date("2026-09-30T21:30:00Z"), eventType: "check_in", person: { id: "person", employeeId: "own-employee" } },
      { id: "out", occurredAt: new Date("2026-10-01T05:30:00Z"), eventType: "check_out", person: { id: "person", employeeId: "own-employee" } },
    ];
  } },
  employeeAttendance: { async findMany(query) {
    queries.manual = query;
    return [
      { attendanceDate: new Date("2026-10-01T00:00:00Z"), checkIn: null, checkOut: null, workedMinutes: 0, lateMinutes: 0, status: "absent" },
      { attendanceDate: new Date("2026-10-02T00:00:00Z"), checkIn: null, checkOut: null, workedMinutes: 0, lateMinutes: 0, status: "leave" },
    ];
  } },
  systemSetting: { async findUnique() { return null; } },
};
const { employeePortalService } = await import("../src/modules/employee-portal/employee-portal.service.js");
const { myAttendanceQuerySchema } = await import("../src/modules/employee-portal/employee-portal.schema.js");
const { requestPermission } = await import("../src/shared/security/access-policy.js");

test("unlinked accounts receive no attendance and make no employee queries", async () => {
  assert.deepEqual(await employeePortalService.myAttendance({ user: { id: "user" }, month: "2026-10" }), { linked: false, records: [] });
  assert.deepEqual(queries, {});
});

test("attendance is scoped to the signed-in employee with Baghdad month boundaries", async () => {
  const result = await employeePortalService.myAttendance({ user: { id: "user", employee: { id: "own-employee" } }, month: "2026-10", employeeId: "another-employee" });
  assert.deepEqual(queries.employee.where, { id: "own-employee" });
  assert.deepEqual(queries.events.where.person, { employeeId: "own-employee" });
  assert.equal(queries.manual.where.employeeId, "own-employee");
  assert.equal(queries.events.where.occurredAt.gte.toISOString(), "2026-09-30T21:00:00.000Z");
  assert.equal(queries.events.where.occurredAt.lt.toISOString(), "2026-10-31T21:00:00.000Z");
  assert.equal(queries.manual.where.attendanceDate.gte.toISOString(), "2026-10-01T00:00:00.000Z");
  assert.equal(result.linked, true);
  assert.equal(result.records.length, 2);
  assert.equal(result.records[0].attendanceDate, "2026-10-01");
  assert.equal(result.records[0].workedMinutes, 480);
  assert.equal(result.records[0].status, "present");
  assert.equal(result.records[1].status, "leave");
  assert.equal(Object.hasOwn(result.records[0], "employeeId"), false);
});

test("attendance month validation and self-service permissions", () => {
  for (const month of ["2026-00", "2026-13", "26-10", "2026-10-01", "0000-01", undefined, ["2026-10"]])
    assert.equal(myAttendanceQuerySchema.safeParse({ month }).success, false);
  assert.deepEqual(myAttendanceQuerySchema.parse({ month: "2026-10", employeeId: "another-employee" }), { month: "2026-10" });
  assert.equal(requestPermission("GET", "/api/employee-portal/my-attendance?month=2026-10"), null);
  assert.notEqual(requestPermission("POST", "/api/employee-portal/my-attendance"), null);
});
