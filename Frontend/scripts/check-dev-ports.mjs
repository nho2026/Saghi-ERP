import { createServer } from "node:net";

// These ports match Vite's proxy and Electron's development renderer URL.
const services = [
  { port: 3000, name: "frontend" },
  { port: 4000, name: "backend" },
];

const results = await Promise.all(
  services.map(
    ({ port, name }) =>
      new Promise((resolve) => {
        const server = createServer();
        server.once("error", (error) => {
          resolve(
            error.code === "EADDRINUSE"
              ? `Port ${port} (${name}) is already in use. Stop the existing dev server or Electron dev session with Ctrl+C in its terminal.`
              : `Cannot use port ${port} (${name}): ${error.message}`,
          );
        });
        server.listen({ port, exclusive: true }, () => {
          server.close(() => resolve(null));
        });
      }),
  ),
);

const errors = results.filter(Boolean);
if (errors.length) {
  console.error(errors.join("\n"));
  console.error(
    "electron:dev starts both servers. Run it once, without separate Backend or Frontend dev commands.",
  );
  process.exitCode = 1;
}
