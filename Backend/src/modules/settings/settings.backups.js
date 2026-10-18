import { spawn } from "node:child_process";
import { mkdir, readdir, stat, unlink, rename } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { getSettings } from "./settings.service.js";
import { resolveBackupTool } from "./backup-tool.js";
const directory = path.resolve(process.env.NHO_BACKUP_DIRECTORY || "backups");
let busy = false;
export async function listBackups() {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  return (
    await Promise.all(
      (await readdir(directory))
        .filter((n) => /^nho-.*\.sql$/.test(n))
        .map(async (name) => {
          const info = await stat(path.join(directory, name));
          return {
            name,
            bytes: info.size,
            createdAt: info.mtime.toISOString(),
          };
        }),
    )
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function createBackup() {
  if (busy)
    throw Object.assign(new Error("A database backup is already running."), {
      status: 409,
    });
  busy = true;
  let temporary;
  try {
    const executable = await resolveBackupTool();
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const name = `nho-${new Date().toISOString().replaceAll(":", "-")}.sql`;
    temporary = path.join(directory, `${name}.partial`);
    const url = new URL(process.env.DATABASE_URL);
    const args = [
      "--single-transaction",
      "--quick",
      "--no-tablespaces",
      "--routines",
      "--triggers",
      "--events",
      "--hex-blob",
      "--default-character-set=utf8mb4",
      "--host",
      url.hostname,
      "--port",
      url.port || "3306",
      "--user",
      decodeURIComponent(url.username),
      // Include CREATE DATABASE and USE as well as every table/view and its
      // data. No table selection or row filter is applied to this dump.
      "--databases",
      decodeURIComponent(url.pathname.slice(1)),
    ];
    const child = spawn(executable, args, {
      windowsHide: true,
      env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stderr.resume();
    const completion = new Promise((resolve, reject) => {
      child.on("error", (error) =>
        reject(
          new Error(
            `Database backup tool could not start (${error.code || "unknown error"}). Check NHO_MYSQLDUMP_PATH and executable permissions.`,
          ),
        ),
      );
      child.on("close", (code) =>
        code === 0
          ? resolve()
          : reject(
              new Error(
                "Database backup failed. Check database backup privileges.",
              ),
            ),
      );
    });
    // Wait for the output file to close before cleanup, including spawn failures.
    const results = await Promise.allSettled([
      pipeline(child.stdout, createWriteStream(temporary, { mode: 0o600 })),
      completion,
    ]);
    const failure =
      results[1].status === "rejected"
        ? results[1]
        : results.find((result) => result.status === "rejected");
    if (failure) throw failure.reason;
    await rename(temporary, path.join(directory, name));
    const settings = await getSettings("system");
    for (const file of await listBackups())
      if (
        Date.parse(file.createdAt) <
        Date.now() - settings.backupRetentionDays * 86400000
      )
        await unlink(path.join(directory, file.name));
    return (await listBackups()).find((f) => f.name === name);
  } finally {
    busy = false;
    if (temporary) await unlink(temporary).catch(() => {});
  }
}
export function startBackupSchedule() {
  const tick = async () => {
    try {
      const config = await getSettings("system");
      if (!config.backupEnabled || busy) return;
      const last = (await listBackups())[0];
      if (
        !last ||
        Date.now() - Date.parse(last.createdAt) >=
          config.backupIntervalHours * 3600000
      )
        await createBackup();
    } catch (e) {
      console.error("Scheduled database backup failed:", e.message);
    }
  };
  const timer = setInterval(tick, 60_000);
  timer.unref();
  return () => clearInterval(timer);
}
