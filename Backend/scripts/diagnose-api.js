import "dotenv/config";
import os from "node:os";
import { performance } from "node:perf_hooks";
import mysql from "mysql2/promise";

if (process.argv.includes("--help")) {
  console.log(
    "Usage: npm run diagnose:api -- [https://your-api-host/api/health] [--http-only]",
  );
  console.log(
    "Checks local health, optional public health, and database connectivity. No data is changed.",
  );
  process.exit(0);
}

const publicAddress = process.argv
  .slice(2)
  .find((arg) => !arg.startsWith("--"));
const targets = [
  ["Local API", `http://127.0.0.1:${process.env.PORT || 4000}/api/health`],
];
if (publicAddress) {
  try {
    const url = new URL(publicAddress);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error("Invalid URL");
    }
    if (url.pathname === "/") url.pathname = "/api/health";
    targets.push(["Public API", url.href]);
  } catch {
    console.error(
      "Provide an HTTP(S) health URL without credentials, query strings or fragments.",
    );
    process.exit(1);
  }
}

console.log(
  `Host: ${os.platform()}, Node ${process.version}, ${os.availableParallelism()} available CPUs`,
);
console.log(
  `Memory: ${Math.round(os.freemem() / 1024 ** 2)} MiB free / ${Math.round(os.totalmem() / 1024 ** 2)} MiB total`,
);
if (os.platform() !== "win32")
  console.log(
    `System load (1/5/15 min): ${os
      .loadavg()
      .map((n) => n.toFixed(2))
      .join(" / ")}`,
  );

for (const [label, address] of targets) {
  for (let sample = 1; sample <= 3; sample++) {
    const started = performance.now();
    try {
      const response = await fetch(address, {
        signal: AbortSignal.timeout(5000),
        redirect: "manual",
        headers: { Accept: "application/json" },
      });
      // Bound response size; do not print response bodies or credentials.
      const reader = response.body?.getReader();
      let body = "";
      let bytes = 0;
      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > 16_384) break;
            body += new TextDecoder().decode(value);
          }
        } finally {
          await reader.cancel();
        }
      }
      let healthy = false;
      try {
        healthy = response.ok && JSON.parse(body).status === "ok";
      } catch {}
      console.log(
        `${label} ${sample}/3: HTTP ${response.status}, ${(performance.now() - started).toFixed(0)} ms, health=${healthy ? "ok" : "unexpected response"}`,
      );
      if (!healthy) process.exitCode = 1;
    } catch (error) {
      console.log(
        `${label} ${sample}/3: FAILED after ${(performance.now() - started).toFixed(0)} ms (${error.cause?.code || error.name})`,
      );
      process.exitCode = 1;
    }
  }
}

if (!process.argv.includes("--http-only")) {
  let connection;
  let started = performance.now();
  try {
    const url = new URL(process.env.DATABASE_URL);
    connection = await mysql.createConnection({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.slice(1)),
      connectTimeout: 5000,
      ...(url.searchParams.get("sslaccept") === "strict" ? { ssl: {} } : {}),
    });
    console.log(
      `Database connect: ${(performance.now() - started).toFixed(0)} ms`,
    );
    for (let sample = 1; sample <= 3; sample++) {
      started = performance.now();
      await connection.query({ sql: "SELECT 1", timeout: 5000 });
      console.log(
        `Database SELECT 1 ${sample}/3: ${(performance.now() - started).toFixed(0)} ms`,
      );
    }
  } catch (error) {
    console.log(
      `Database: FAILED (${error.code || error.name}). Uses a separate MySQL connection; check database URL/TLS configuration if the app can connect.`,
    );
    process.exitCode = 1;
  } finally {
    connection?.destroy();
  }
}
console.log(
  "Local health bypasses authentication and the database. Compare it with public health to identify proxy/network overhead.",
);
console.log(
  "Database measurements use a new connection; they do not measure the API process's connection-pool wait or business queries.",
);
