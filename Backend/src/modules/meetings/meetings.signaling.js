import { getSettings } from "../settings/settings.service.js";
import { Server } from "socket.io";
import { prisma } from "../../shared/database/client.js";
import { verifyToken } from "../../shared/security/token.js";
import { meetingDepartmentIdFor } from "./meeting-department.js";

const cookieValue = (header = "", name) =>
  header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);

export function attachMeetingSignaling(
  httpServer,
  allowedOrigins,
  production = false,
) {
  const io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: {
      origin(origin, callback) {
        if (!production || !origin || allowedOrigins.includes(origin))
          return callback(null, true);
        callback(new Error("Origin is not allowed by CORS."));
      },
      credentials: true,
    },
    maxHttpBufferSize: 100_000,
  });

  io.use(async (socket, next) => {
    try {
      const token =
        cookieValue(socket.handshake.headers.cookie, "access_token") ||
        socket.handshake.auth?.token;
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          employee: { select: { departmentId: true } },
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
      socket.data.user = user;
      socket.data.isSuperAdmin = user.roles.some(
        ({ role }) => role.name === "Super Administrator",
      );
      socket.data.permissionKeys = new Set(
        user.roles.flatMap(({ role }) =>
          role.permissions.map(({ permission }) => permission.key),
        ),
      );
      if (socket.data.isSuperAdmin) socket.data.permissionKeys.add("*");
      if (
        !socket.data.permissionKeys.has("*") &&
        !["meetings.view", "meetings.join"].every((key) =>
          socket.data.permissionKeys.has(key),
        )
      )
        throw new Error("Meeting permission required");
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    const allowed = (action) =>
      socket.data.permissionKeys.has("*") ||
      socket.data.permissionKeys.has(`meetings.${action}`);
    socket.on("meeting:join", async ({ roomCode }, callback = () => {}) => {
      try {
        const meeting = await prisma.meeting.findUnique({
          where: { roomCode },
          include: {
            department: true,
            creator: { select: { id: true, name: true } },
          },
        });
        if (!meeting || meeting.status !== "active")
          throw new Error("Meeting is unavailable.");
        const departmentId = await meetingDepartmentIdFor(socket.data.user);
        if (!socket.data.isSuperAdmin && meeting.departmentId !== departmentId)
          throw new Error("This meeting belongs to another department.");
        if (socket.data.roomCode) throw new Error("Already joined a meeting.");
        const policy = await getSettings("meetings");
        const peers = [...(io.sockets.adapter.rooms.get(roomCode) ?? [])]
          .map((id) => io.sockets.sockets.get(id))
          .filter(Boolean)
          .map((peer) => ({ id: peer.id, name: peer.data.user.name }));
        if (peers.length >= policy.participantLimit)
          throw new Error("This meeting has reached its participant limit.");
        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.attendanceId = (
          await prisma.meetingParticipant.create({
            data: { meetingId: meeting.id, userId: socket.data.user.id },
          })
        ).id;
        socket.to(roomCode).emit("meeting:peer-joined", {
          id: socket.id,
          name: socket.data.user.name,
        });
        callback({
          ok: true,
          meeting: {
            id: meeting.id,
            title: meeting.title,
            roomCode: meeting.roomCode,
            status: meeting.status,
            createdAt: meeting.createdAt,
            department: meeting.department,
            creator: meeting.creator,
          },
          peers,
          self: { id: socket.id, name: socket.data.user.name },
        });
      } catch (error) {
        callback({ ok: false, message: error.message });
      }
    });

    for (const event of ["webrtc:offer", "webrtc:answer", "webrtc:ice"]) {
      socket.on(event, ({ target, payload }) => {
        const targetSocket = io.sockets.sockets.get(target);
        if (
          socket.data.roomCode &&
          targetSocket &&
          targetSocket.data.roomCode === socket.data.roomCode
        )
          targetSocket.emit(event, {
            from: socket.id,
            name: socket.data.user.name,
            payload,
          });
      });
    }

    socket.on("meeting:chat", ({ text } = {}, callback = () => {}) => {
      if (!allowed("chat"))
        return callback({
          ok: false,
          message: "Missing permission: meetings.chat",
        });
      const roomCode = socket.data.roomCode;
      const cleanText = typeof text === "string" ? text.trim() : "";
      if (!roomCode)
        return callback({
          ok: false,
          message: "Join a meeting before sending messages.",
        });
      if (!cleanText)
        return callback({ ok: false, message: "Message cannot be empty." });
      if (cleanText.length > 2000)
        return callback({ ok: false, message: "Message is too long." });

      const item = {
        id: crypto.randomUUID(),
        sender: socket.data.user.name,
        text: cleanText,
        at: new Date().toISOString(),
      };
      io.to(roomCode).emit("meeting:chat", item);
      callback({ ok: true });
    });

    socket.on("meeting:speaking", ({ speaking } = {}) => {
      if (!socket.data.roomCode) return;
      socket.to(socket.data.roomCode).emit("meeting:speaking", {
        id: socket.id,
        speaking: Boolean(speaking),
      });
    });

    socket.on("meeting:end", async ({ roomCode }, callback = () => {}) => {
      try {
        if (!allowed("end"))
          throw new Error("Missing permission: meetings.end");
        const meeting = await prisma.meeting.findUnique({
          where: { roomCode },
        });
        if (!meeting || meeting.status !== "active")
          throw new Error("Meeting is already closed.");
        if (
          !socket.data.isSuperAdmin &&
          meeting.creatorId !== socket.data.user.id
        )
          throw new Error(
            "Only the meeting creator or Super Administrator can close it.",
          );
        const endedAt = new Date();
        await prisma.$transaction([
          prisma.meeting.update({
            where: { id: meeting.id },
            data: { status: "ended", endedAt },
          }),
          prisma.meetingParticipant.updateMany({
            where: { meetingId: meeting.id, leftAt: null },
            data: { leftAt: endedAt },
          }),
        ]);
        io.to(roomCode).emit("meeting:ended", { roomCode });
        io.in(roomCode).socketsLeave(roomCode);
        callback({ ok: true });
      } catch (error) {
        callback({ ok: false, message: error.message });
      }
    });

    socket.on("disconnect", async () => {
      if (socket.data.roomCode)
        socket
          .to(socket.data.roomCode)
          .emit("meeting:peer-left", { id: socket.id });
      if (socket.data.attendanceId)
        await prisma.meetingParticipant
          .update({
            where: { id: socket.data.attendanceId },
            data: { leftAt: new Date() },
          })
          .catch(() => {});
    });
  });
  return io;
}
