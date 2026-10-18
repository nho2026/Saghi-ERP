import { leadService } from "./lead.service.js";
import { unlink } from "node:fs/promises";
import path from "node:path";

const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

export const leadController = {
  list: handle(async (req, res) => res.json(await leadService.list(req.query))),
  get: handle(async (req, res) =>
    res.json(await leadService.get(req.params.id)),
  ),
  create: handle(async (req, res) =>
    res.status(201).json(await leadService.create(req.validatedBody)),
  ),
  update: handle(async (req, res) =>
    res.json(await leadService.update(req.params.id, req.validatedBody)),
  ),
  remove: handle(async (req, res) => {
    await leadService.remove(req.params.id);
    res.status(204).end();
  }),
  attachments: handle(async (req, res) => {
    const files = (req.files ?? []).map((file) => ({
      fileName: file.originalname,
      fileUrl: `/public/lead-attachments/${file.filename}`,
      mimeType: file.mimetype,
      fileSize: file.size,
    }));
    res
      .status(201)
      .json(await leadService.addAttachments(req.params.id, files));
  }),
  removeAttachment: handle(async (req, res) => {
    const attachment = await leadService.removeAttachment(
      req.params.attachmentId,
    );
    const diskPath = path.resolve(
      process.cwd(),
      attachment.fileUrl.replace(/^\/public\//, "public/"),
    );
    await unlink(diskPath).catch(() => undefined);
    res.status(204).end();
  }),
};
