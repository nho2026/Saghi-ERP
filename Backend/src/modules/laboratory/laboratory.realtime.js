import { prisma } from "../../shared/database/client.js";
import { verifyToken } from "../../shared/security/token.js";
import { effectivePermissions } from "../../shared/security/access-policy.js";

let channel;
export function attachLaboratoryRealtime(io) {
  channel = io.of("/laboratory");
  channel.use(async (socket, next) => {
    try {
      const cookie = (socket.handshake.headers.cookie ?? "")
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("access_token="))
        ?.slice(13);
      const payload = verifyToken(cookie || socket.handshake.auth?.token);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: { permissions: { include: { permission: true } } },
              },
            },
          },
        },
      });
      if (!user || user.status !== "active") throw new Error("Unauthorized");
      const permissions = effectivePermissions(
        new Set(
          user.roles.flatMap(({ role }) =>
            role.permissions.map(({ permission }) => permission.key),
          ),
        ),
      );
      if (
        !user.roles.some(({ role }) => role.name === "Super Administrator") &&
        !permissions.has("*") &&
        !permissions.has("laboratory.orders.view")
      )
        throw new Error("Forbidden");
      next();
    } catch {
      next(new Error("Laboratory access required."));
    }
  });
  channel.on("connection", (socket) => {
    socket.emit("laboratory:changed");
  });
}

export function laboratoryChangeMiddleware(req, res, next) {
  if (["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
    res.once("finish", () => {
      if (
        res.statusCode >= 200 &&
        res.statusCode < 300 &&
        req.method === "POST" &&
        /\/call-ticket\/?$/.test(req.path ?? "")
      )
        channel?.emit("laboratory:ticket-called");
      if (res.statusCode >= 200 && res.statusCode < 300)
        channel?.emit("laboratory:changed");
    });
  }
  next();
}
