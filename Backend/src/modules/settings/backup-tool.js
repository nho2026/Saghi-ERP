import { access, readdir } from "node:fs/promises";
import path from "node:path";

export async function resolveBackupTool(
  env = process.env,
  platform = process.platform,
) {
  if (env.NHO_MYSQLDUMP_PATH) return env.NHO_MYSQLDUMP_PATH;
  if (platform !== "win32") return "mysqldump";
  const directories = (env.PATH || env.Path || "")
    .split(path.delimiter)
    .filter(Boolean);
  for (const root of [
    env.ProgramFiles || "C:\\Program Files",
    env["ProgramFiles(x86)"],
  ].filter(Boolean)) {
    const mysql = path.join(root, "MySQL");
    for (const entry of await readdir(mysql, { withFileTypes: true }).catch(
      () => [],
    ))
      if (entry.isDirectory())
        directories.push(path.join(mysql, entry.name, "bin"));
    for (const entry of await readdir(root, { withFileTypes: true }).catch(
      () => [],
    ))
      if (entry.isDirectory() && /^MariaDB/i.test(entry.name))
        directories.push(path.join(root, entry.name, "bin"));
  }
  directories.push("C:\\xampp\\mysql\\bin");
  for (const directory of directories) {
    for (const name of ["mysqldump.exe", "mariadb-dump.exe"]) {
      const candidate = path.join(directory.replace(/^"|"$/g, ""), name);
      if (
        await access(candidate).then(
          () => true,
          () => false,
        )
      )
        return candidate;
    }
  }
  throw new Error(
    "MySQL backup tool was not found. Set NHO_MYSQLDUMP_PATH to the full path of mysqldump.exe and restart the backend.",
  );
}
