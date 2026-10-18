import "dotenv/config";
import mysql from "mysql2/promise";
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const apply = process.argv.includes("--apply");
const source = "/home/nho/Downloads/dhf_db_Users_2026-09-15_200214";
const folder = "/home/nho/Downloads/nho-users-import-2026-09-15";
const url = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  dateStrings: true,
});
try {
  const dump = await readFile(source, "utf8");
  const ddl = dump.match(
    /CREATE TABLE `Users` \([\s\S]*?\) ENGINE=[^;]+;/,
  )?.[0];
  if (!ddl) throw Error("Users table is missing from the export");
  await connection.query(
    ddl
      .replace("CREATE TABLE `Users`", "CREATE TEMPORARY TABLE `import_users`")
      .split("\n")
      .filter((line) => !line.trim().startsWith("CONSTRAINT "))
      .join("\n")
      .replace(/,\n\) ENGINE/, "\n) ENGINE"),
  );
  const inserts = dump
    .split("\n")
    .filter((line) => line.startsWith("INSERT INTO `Users` VALUES "));
  if (!inserts.length) throw Error("No user rows in the export");
  for (const sql of inserts)
    await connection.query(
      sql.replace("INSERT INTO `Users`", "INSERT INTO `import_users`"),
    );
  const [users] = await connection.query(
    "SELECT * FROM import_users ORDER BY userId",
  );
  if (
    users.length !== 85 ||
    users.some(
      (user) => !/^\$2[aby]\$\d\d\$[./A-Za-z0-9]{53}$/.test(user.password),
    )
  )
    throw Error("Unexpected user count or password format");
  const [sourceRoles] = await connection.query("SELECT * FROM dhf_db.Roles");
  for (const user of users) {
    if (!sourceRoles.some((role) => role.roleId === user.roleId))
      throw Error(`Missing source role ${user.roleId}`);
    if ([user.name, user.email].some((value) => [...value].length > 191))
      throw Error("A user field exceeds the app limit");
  }
  await connection.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
  await connection.beginTransaction();
  const [existing] = await connection.query(
    "SELECT * FROM access_User FOR UPDATE",
  );
  const [roles] = await connection.query("SELECT * FROM access_Role");
  const report = {
    applied: apply,
    sourceUsers: users.length,
    addedUsers: 0,
    existingUsers: 0,
    addedRoles: [],
    users: [],
  };
  if (apply) {
    const [tables] = await connection.query("SHOW TABLES");
    const backup = {
      database: url.pathname.slice(1),
      createdAt: new Date().toISOString(),
      tables: {},
    };
    for (const entry of tables) {
      const table = Object.values(entry)[0];
      backup.tables[table] = (
        await connection.query("SELECT * FROM ??", [table])
      )[0];
    }
    await writeFile(
      `${folder}/database-before-import.json`,
      JSON.stringify(backup, null, 2),
      { mode: 0o600 },
    );
    await writeFile(
      `${folder}/source-users.json`,
      JSON.stringify({ source, users, roles: sourceRoles }, null, 2),
      { mode: 0o600 },
    );
  }
  const aliases = {
    "Super Admin": "Super Administrator",
    "Human Resources": "HR",
  };
  const roleMap = new Map();
  for (const user of users) {
    if (roleMap.has(user.roleId)) continue;
    const sourceRole = sourceRoles.find((role) => role.roleId === user.roleId);
    const name = aliases[sourceRole.name] || sourceRole.name;
    let role = roles.find(
      (role) => role.name.toLowerCase() === name.toLowerCase(),
    );
    if (!role) {
      role = { id: randomUUID(), name };
      // Legacy numeric permission IDs do not map to the app's permission keys.
      // Keep them in the archive; new roles can be configured in Roles.
      if (apply)
        await connection.query(
          "INSERT INTO access_Role (id,name,description,createdAt,updatedAt) VALUES (?,?,?,?,?)",
          [
            role.id,
            role.name,
            `Imported from dhf_db role ${sourceRole.roleId}; permissions require configuration.`,
            sourceRole.createdAt,
            sourceRole.updatedAt,
          ],
        );
      roles.push(role);
      report.addedRoles.push(name);
    }
    roleMap.set(user.roleId, role.id);
  }
  const usernames = new Set(
    existing.map((user) => user.username.toLowerCase()),
  );
  for (const user of users) {
    const match = existing.find(
      (account) => account.email.toLowerCase() === user.email.toLowerCase(),
    );
    if (match) {
      report.existingUsers++;
      report.users.push({
        sourceUserId: user.userId,
        userId: match.id,
        username: match.username,
        existing: true,
      });
      continue;
    }
    const base =
      user.email
        .split("@")[0]
        .replace(/[^A-Za-z0-9._-]/g, "_")
        .slice(0, 160) || "user";
    let username = base.length >= 3 ? base : `${base}-user`;
    let suffix = 0;
    while (usernames.has(username.toLowerCase()))
      username = `${base}-${user.userId}${suffix++ ? `-${suffix}` : ""}`;
    usernames.add(username.toLowerCase());
    const id = randomUUID();
    if (apply) {
      await connection.query(
        "INSERT INTO access_User (id,username,email,name,passwordHash,status,createdAt,updatedAt) VALUES (?,?,?,?,?,'active',?,?)",
        [
          id,
          username,
          user.email,
          user.name,
          user.password,
          user.createdAt,
          user.updatedAt,
        ],
      );
      await connection.query(
        "INSERT INTO access_UserRole (userId,roleId) VALUES (?,?)",
        [id, roleMap.get(user.roleId)],
      );
    }
    report.addedUsers++;
    report.users.push({
      sourceUserId: user.userId,
      userId: id,
      username,
      existing: false,
    });
  }
  if (apply) {
    const [actual] = await connection.query("SELECT * FROM access_User");
    for (const user of users) {
      const account = actual.find(
        (account) => account.email.toLowerCase() === user.email.toLowerCase(),
      );
      if (!account) throw Error("An exported user was not imported");
      if (
        !existing.some((old) => old.id === account.id) &&
        account.passwordHash !== user.password
      )
        throw Error("Imported password hash differs from the export");
    }
    for (const old of existing) {
      const current = actual.find((account) => account.id === old.id);
      if (!current || current.passwordHash !== old.passwordHash)
        throw Error("An existing account was modified");
    }
    report.totalUsers = actual.length;
    await connection.commit();
    await writeFile(
      `${folder}/import-report.json`,
      JSON.stringify(report, null, 2),
      { mode: 0o600 },
    );
  } else await connection.rollback();
  console.log(JSON.stringify({ ...report, users: undefined }, null, 2));
} catch (error) {
  await connection.rollback();
  // Do not log SQL statements that can contain password hashes.
  console.error("User import failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
