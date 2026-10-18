import { prisma } from '../src/shared/database/client.js';
import { createWithCode } from '../src/shared/database/automatic-code.js';

const departments = [
  ...['Cardiology', 'Emergency Medicine', 'Internal Medicine', 'Pediatrics', 'Radiology', 'General Surgery', 'Dermatology', 'Ophthalmology', 'Orthopedics', 'Neurology', 'Clinical Laboratory'].map(name => ({ name, type: 'hospital' })),
  ...['Finance', 'Human Resources', 'Administration'].map(name => ({ name, type: 'office' })),
];
try {
  const result = await prisma.$transaction(async tx => {
    let created = 0;
    let existing = 0;
    for (const department of departments) {
      const found = await tx.department.findUnique({ where: { name: department.name } });
      if (found) { existing++; continue; }
      await createWithCode(tx.department, { data: { ...department, status: 'active' } }, 'DEP');
      created++;
    }
    return { created, existing };
  });
  console.log(`Department seed complete: ${result.created} created, ${result.existing} already existed (preserved).`);
} finally {
  await prisma.$disconnect();
}
