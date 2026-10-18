import 'dotenv/config';
import mysql from 'mysql2/promise';
const c=await mysql.createConnection(process.env.DATABASE_URL);
try {
 const q=async(s,p=[])=>(await c.query(s,p))[0];
 const col=async(n)=>(await q("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='attendance_AttendanceEvent' AND COLUMN_NAME=?",[n])).length;
 const [{n:before}]=await q('SELECT COUNT(*) n FROM attendance_AttendanceEvent');
 await q(`CREATE TABLE IF NOT EXISTS attendance_AttendancePerson (
 id VARCHAR(191) PRIMARY KEY, deviceId VARCHAR(191) NOT NULL, employeeId VARCHAR(191), employeeNo VARCHAR(191) NOT NULL, name VARCHAR(191) NOT NULL,
 cardNo VARCHAR(191), hasFingerprint BOOLEAN NOT NULL DEFAULT false, hasFace BOOLEAN NOT NULL DEFAULT false, hasPassword BOOLEAN NOT NULL DEFAULT false,
 createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), updatedAt DATETIME(3) NOT NULL,
 UNIQUE KEY AttendancePerson_deviceId_employeeNo_key(deviceId,employeeNo), KEY AttendancePerson_employeeId_idx(employeeId),
 CONSTRAINT AttendancePerson_deviceId_fkey FOREIGN KEY(deviceId) REFERENCES attendance_AttendanceDevice(id) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT AttendancePerson_employeeId_fkey FOREIGN KEY(employeeId) REFERENCES hr_Employees(id) ON DELETE SET NULL ON UPDATE CASCADE
 ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
 if(!await col('personId')) await q('ALTER TABLE attendance_AttendanceEvent ADD COLUMN personId VARCHAR(191) NULL');
 if(await col('employeeId')) {
  if((await q('SELECT deviceId,employeeNo FROM attendance_AttendanceEvent GROUP BY deviceId,employeeNo HAVING COUNT(DISTINCT employeeId)>1')).length) throw new Error('Conflicting employee links; migration stopped without removing historical links.');
  await q(`INSERT INTO attendance_AttendancePerson(id,deviceId,employeeId,employeeNo,name,updatedAt)
   SELECT UUID(),e.deviceId,MAX(e.employeeId),e.employeeNo,COALESCE(MAX(e.personName),CONCAT('Employee #',e.employeeNo)),NOW(3)
   FROM attendance_AttendanceEvent e LEFT JOIN attendance_AttendancePerson p ON p.deviceId=e.deviceId AND p.employeeNo=e.employeeNo
   WHERE p.id IS NULL GROUP BY e.deviceId,e.employeeNo`);
  await q(`UPDATE attendance_AttendanceEvent e JOIN attendance_AttendancePerson p ON p.deviceId=e.deviceId AND p.employeeNo=e.employeeNo SET e.personId=p.id,p.employeeId=COALESCE(p.employeeId,e.employeeId)`);
  const [{n}]=await q(`SELECT COUNT(*) n FROM attendance_AttendanceEvent e LEFT JOIN attendance_AttendancePerson p ON p.id=e.personId WHERE p.id IS NULL OR (e.employeeId IS NOT NULL AND NOT(e.employeeId <=> p.employeeId))`);
  if(n) throw new Error('Historical link verification failed.');
  const keys=await q("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='attendance_AttendanceEvent' AND COLUMN_NAME='employeeId' AND REFERENCED_TABLE_NAME IS NOT NULL");
  for(const k of keys) await q(`ALTER TABLE attendance_AttendanceEvent DROP FOREIGN KEY ${c.escapeId(k.CONSTRAINT_NAME)}`);
  await q('ALTER TABLE attendance_AttendanceEvent DROP COLUMN employeeId');
 }
 const keys=await q("SELECT 1 FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='attendance_AttendanceEvent' AND COLUMN_NAME='personId' AND REFERENCED_TABLE_NAME IS NOT NULL");
 if(!keys.length) await q('ALTER TABLE attendance_AttendanceEvent ADD CONSTRAINT AttendanceEvent_personId_fkey FOREIGN KEY(personId) REFERENCES attendance_AttendancePerson(id) ON DELETE SET NULL ON UPDATE CASCADE');
 const [{n:after}]=await q('SELECT COUNT(*) n FROM attendance_AttendanceEvent');
 if(before!==after) throw new Error('Event count changed during migration.');
 console.log(`Device-user table restored; ${after} attendance events preserved.`);
} finally {await c.end();}
