import { prisma } from '../src/shared/database/client.js';
import { nextPatientNumber } from '../src/modules/crm/patient/patient-code.js';
try {
  const count = await prisma.$transaction(async tx => {
    const rows = await tx.patient.findMany({ select: { id: true, patientCode: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
    const used = new Set(rows.map(row => row.patientCode));
    let next = nextPatientNumber(rows);
    let count = 0;
    for (const row of rows) {
      if (/^PAT-[1-9][0-9]*$/.test(row.patientCode)) continue;
      let code = /^PAT-0*[1-9][0-9]*$/.test(row.patientCode) ? `PAT-${BigInt(row.patientCode.slice(4))}` : `PAT-${next++}`;
      if (used.has(code)) code = `PAT-${next++}`;
      await tx.patient.update({ where: { id: row.id }, data: { patientCode: code } });
      used.add(code);
      count++;
    }
    return count;
  });
  console.log(`Updated ${count} patient codes.`);
} finally { await prisma.$disconnect(); }
