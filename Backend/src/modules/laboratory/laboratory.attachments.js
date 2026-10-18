import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../../shared/database/client.js";

const directory = path.resolve(process.cwd(), "storage", "laboratory");
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
export const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
}).single("file");

export function attachmentType(buffer) {
  if (buffer.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  if (
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255)
    return "image/jpeg";
  if (["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString()))
    return "image/gif";
  if (
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  )
    return "image/webp";
  throw fail("Attach a PDF, JPG, PNG, GIF or WebP file (maximum 5 MB).");
}

export async function addAttachment(orderId, file, actor, db = prisma) {
  if (!file) throw fail("Select a file to attach.");
  const mime = attachmentType(file.buffer);
  const id = randomUUID();
  const filename = path.join(directory, id);
  await mkdir(directory, { recursive: true });
  try {
    return await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM laboratory_Orders WHERE id = ${orderId} FOR UPDATE`;
      const order = await tx.laboratoryOrder.findUnique({
        where: { id: orderId },
      });
      if (!order) throw fail("Laboratory request not found.", 404);
      if (order.status !== "completed")
        throw fail(
          "Reports can only be attached to completed laboratory results.",
          409,
        );
      const attachments = Array.isArray(order.attachments)
        ? order.attachments
        : [];
      if (attachments.length >= 20)
        throw fail("A request can have up to 20 attachments.");
      await writeFile(filename, file.buffer, { flag: "wx" });
      await tx.laboratoryOrder.update({
        where: { id: orderId },
        data: {
          attachments: [
            ...attachments,
            {
              id,
              name: path.basename(file.originalname).slice(0, 191),
              mime,
              size: file.size,
              uploadedBy: actor,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      });
    });
  } catch (error) {
    await unlink(filename).catch(() => {});
    throw error;
  }
}

export async function getAttachment(orderId, attachmentId, db = prisma) {
  const order = await db.laboratoryOrder.findUnique({
    where: { id: orderId },
    select: { attachments: true },
  });
  const file =
    Array.isArray(order?.attachments) &&
    order.attachments.find((item) => item.id === attachmentId);
  if (!file || !/^[a-f0-9-]{36}$/.test(file.id))
    throw fail("Attachment not found.", 404);
  return { ...file, path: path.join(directory, file.id) };
}
