import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const apply = process.argv.includes('--apply');
const folder = '/home/nho/Downloads/nho-employees-import-2026-09-15';
const plan = JSON.parse(await readFile(`${folder}/import-plan.json`, 'utf8'));
const source = JSON.parse(await readFile(`${folder}/source-employees.json`, 'utf8'));
if (plan.employees.length !== 103 || source.employees.length !== 103) throw Error('Unexpected employee count');
const url = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname, port: Number(url.port || 3306),
  user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
  database: url.pathname.slice(1), dateStrings: true,
});
const normalize = value => String(value || '').trim().toLowerCase();
try {
  await connection.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
  await connection.beginTransaction();
  const [oldEmployees] = await connection.query('SELECT * FROM hr_Employees FOR UPDATE');
  const [users] = await connection.query('SELECT id FROM access_User');
  for (const employee of plan.employees) {
    if (employee.userId && !users.some(user => user.id === employee.userId)) throw Error('A planned user account no longer exists');
    if (!Number.isFinite(employee.salary) || employee.salary < 0) throw Error('Invalid salary');
  }
  const [salarySettings] = await connection.query('SELECT DISTINCT currencyId,payType FROM hr_EmployeeSalary');
  const currencyId = salarySettings[0]?.currencyId || 'USD';
  const payType = salarySettings[0]?.payType || 'monthly';
  if (salarySettings.some(setting => setting.currencyId !== currencyId || setting.payType !== payType)) throw Error('Current salary settings are inconsistent');
  const [settings] = await connection.query("SELECT value FROM system_Settings WHERE category='hr'");
  const hr = settings[0]?.value || {};
  const report = {
    applied: apply, removedEmployees: oldEmployees.length, importedEmployees: plan.employees.length,
    salaryCurrency: currencyId, salaryPayType: payType, salaryConversionApplied: false,
    checkInTime: hr.startTime || '09:00', checkOutTime: hr.endTime || '17:00',
    unlinkedSharedAccounts: plan.duplicateLinks,
    bonusAmountsArchived: plan.employees.filter(employee => employee.bonus > 0).length,
    sourceDetailsArchive: `${folder}/source-employees.json`, affectedRecords: {},
  };
  const [references] = await connection.query("SELECT TABLE_NAME,COLUMN_NAME,DELETE_RULE FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r USING(CONSTRAINT_SCHEMA,CONSTRAINT_NAME,TABLE_NAME) WHERE k.REFERENCED_TABLE_SCHEMA=? AND k.REFERENCED_TABLE_NAME='hr_Employees'", [url.pathname.slice(1)]);
  for (const reference of references) {
    const [count] = await connection.query('SELECT COUNT(*) n FROM ?? WHERE ?? IN (SELECT id FROM hr_Employees)', [reference.TABLE_NAME, reference.COLUMN_NAME]);
    report.affectedRecords[`${reference.TABLE_NAME}.${reference.COLUMN_NAME}`] = { count: count[0].n, onDelete: reference.DELETE_RULE };
  }
  if (!apply) {
    await connection.rollback();
    console.log(JSON.stringify(report, null, 2));
  } else {
    const [tables] = await connection.query('SHOW TABLES');
    const backup = { database: url.pathname.slice(1), createdAt: new Date().toISOString(), tables: {} };
    for (const entry of tables) {
      const table = Object.values(entry)[0];
      backup.tables[table] = (await connection.query('SELECT * FROM ??', [table]))[0];
    }
    await writeFile(`${folder}/database-immediately-before-import.json`, JSON.stringify(backup, null, 2), { mode: 0o600 });
    for (const reference of references.filter(reference => reference.DELETE_RULE === 'RESTRICT' || reference.DELETE_RULE === 'NO ACTION')) {
      await connection.query('DELETE FROM ?? WHERE ?? IN (SELECT id FROM hr_Employees)', [reference.TABLE_NAME, reference.COLUMN_NAME]);
    }
    await connection.query('DELETE FROM hr_Employees');
    const departmentMap = new Map(), positionMap = new Map();
    for (const [directories, table, map, sourceDirectories, sourceIdKey] of [
      [plan.departments, 'hr_Department', departmentMap, source.departments, 'departmentId'],
      [plan.positions, 'hr_Position', positionMap, source.positions, 'roleId'],
    ]) {
      const [existing] = await connection.query('SELECT id,name FROM ??', [table]);
      for (const directory of directories) {
        const match = existing.find(entry => normalize(entry.name) === normalize(directory.name));
        const id = match?.id || directory.id;
        if (!match) {
          const original = sourceDirectories.find(entry => entry[sourceIdKey] === directory.sourceId);
          if (table === 'hr_Department') {
            await connection.query("INSERT INTO hr_Department (id,code,name,status,createdAt,updatedAt) VALUES (?,?,?,'active',?,?)", [id, `DHF-DEPT-${directory.sourceId}`, directory.name, original.createdAt, original.updatedAt]);
          } else {
            await connection.query("INSERT INTO hr_Position (id,name,status,createdAt,updatedAt) VALUES (?,?,'active',?,?)", [id, directory.name, original.createdAt, original.updatedAt]);
          }
          existing.push({ id, name: directory.name });
        }
        map.set(directory.id, id);
      }
    }
    for (const employee of plan.employees) {
      await connection.query('INSERT INTO hr_Employees (id,employeeCode,userId,firstName,lastName,departmentId,positionId,hireDate,status,checkInTime,checkOutTime,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [employee.id, employee.employeeCode, employee.userId, employee.firstName, employee.lastName, departmentMap.get(employee.departmentId), positionMap.get(employee.positionId), employee.hireDate, employee.status, report.checkInTime, report.checkOutTime, employee.createdAt, employee.updatedAt]);
      await connection.query('INSERT INTO hr_EmployeeSalary (id,employeeId,baseSalary,currencyId,payType,effectiveFrom,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)',
        [randomUUID(), employee.id, employee.salary, currencyId, payType, employee.hireDate, employee.createdAt, employee.updatedAt]);
    }
    const [actual] = await connection.query('SELECT e.*,s.baseSalary FROM hr_Employees e JOIN hr_EmployeeSalary s ON s.employeeId=e.id');
    if (actual.length !== 103) throw Error('Imported employee count mismatch');
    for (const expected of plan.employees) {
      const employee = actual.find(employee => employee.id === expected.id);
      if (!employee || employee.firstName !== expected.firstName || employee.lastName !== expected.lastName || employee.userId !== expected.userId || employee.baseSalary !== expected.salary || employee.departmentId !== departmentMap.get(expected.departmentId) || employee.positionId !== positionMap.get(expected.positionId)) throw Error('Employee verification failed');
    }
    if (actual.some(employee => oldEmployees.some(old => old.id === employee.id))) throw Error('An old employee remains');
    await connection.commit();
    await writeFile(`${folder}/import-report.json`, JSON.stringify(report, null, 2), { mode: 0o600 });
    console.log(JSON.stringify(report, null, 2));
  }
} catch (error) {
  await connection.rollback();
  console.error('Employee import failed:', error.code || error.message);
  process.exitCode = 1;
} finally { await connection.end(); }
