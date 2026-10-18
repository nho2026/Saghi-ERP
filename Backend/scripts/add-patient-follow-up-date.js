import { prisma } from "../src/shared/database/client.js";

try {
  const columns = await prisma.$queryRaw`
    SELECT COLUMN_NAME FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'healthcare_Patient'
      AND COLUMN_NAME = 'followUpDate'
  `;
  if (columns.length === 0) {
    await prisma.$executeRaw`ALTER TABLE healthcare_Patient ADD COLUMN followUpDate DATETIME(3) NULL`;
    console.log("Added patient follow-up date. Existing patient records were preserved.");
  } else {
    console.log("Patient follow-up date column already exists.");
  }
  await prisma.patient.findMany({ take: 1, select: { id: true, followUpDate: true } });
  console.log("Verified patient follow-up date query.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
