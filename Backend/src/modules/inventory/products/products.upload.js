import multer from "multer";
import path from "node:path";
import { mkdir } from "node:fs";
import { randomUUID } from "node:crypto";
const imageDirectory = path.resolve(process.cwd(), "public", "product-images");
export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, done) => {
      // Recreate upload storage if it was removed after the server started.
      mkdir(imageDirectory, { recursive: true }, (error) => {
        done(error, imageDirectory);
      });
    },
    filename: (_req, file, done) =>
      done(
        null,
        `${randomUUID()}${path.extname(file.originalname).toLowerCase() || ".jpg"}`,
      ),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, done) =>
    done(
      null,
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.mimetype,
      ),
    ),
});
