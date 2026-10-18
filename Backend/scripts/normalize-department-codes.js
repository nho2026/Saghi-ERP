import { prisma } from '../src/shared/database/client.js';
try {
  const count = await prisma.$transaction(async tx => {
    const rows = await tx.department.findMany({ select: { id: true, code: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
    let next = rows.reduce((max, row) => /^DEP-[1-9][0-9]*$/.test(row.code) && BigInt(row.code.slice(4)) > max ? BigInt(row.code.slice(4)) : max, 0n);
    let count = 0;
    for (const row of rows) {
      if (/^DEP-[1-9][0-9]*$/.test(row.code)) continue;
      await tx.department.update({ where: { id: row.id }, data: { code: `DEP-${++next}` } });
      count++;
    }
    return count;
  });
  console.log(`Updated ${count} department codes.`);
} finally { await prisma.$disconnect(); }
