import ffmpeg from "ffmpeg-static";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const run = promisify(execFile);
const fail = (message) => {
  throw Object.assign(new Error(message), { status: 400 });
};
export async function prepareMedia(file, voice = false) {
  if (!file?.buffer?.length) fail("Choose a file to send.");
  const mime = file.mimetype.split(";")[0];
  const allowed = {
    "image/jpeg": "image",
    "image/png": "image",
    "video/mp4": "video",
    "video/3gpp": "video",
    "audio/mpeg": "audio",
    "audio/mp4": "audio",
    "audio/aac": "audio",
    "audio/amr": "audio",
    "audio/ogg": "audio",
    "application/pdf": "document",
    "text/plain": "document",
    "application/msword": "document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "document",
    "application/vnd.ms-excel": "document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "document",
    "application/vnd.ms-powerpoint": "document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "document",
  };
  if (voice && !["audio/webm", "audio/ogg", "audio/mp4"].includes(mime))
    fail("Unsupported voice recording.");
  const type = voice ? "audio" : allowed[mime];
  if (!type) fail("This file format is not supported by WhatsApp.");
  if (file.buffer.length > (type === "image" ? 5 : 16) * 1024 * 1024)
    fail(
      type === "image"
        ? "Images must be 5 MB or smaller."
        : "Files must be 16 MB or smaller.",
    );
  if (!voice)
    return {
      buffer: file.buffer,
      mime,
      type,
      filename: file.originalname.replace(/[\r\n]/g, "").slice(0, 180),
    };
  const dir = await mkdtemp(join(tmpdir(), "nho-voice-"));
  try {
    await writeFile(join(dir, "input"), file.buffer);
    await run(
      ffmpeg,
      [
        "-nostdin",
        "-protocol_whitelist",
        "file,pipe",
        "-i",
        join(dir, "input"),
        "-vn",
        "-ac",
        "1",
        "-c:a",
        "libopus",
        "-b:a",
        "32k",
        "-t",
        "300",
        join(dir, "voice.ogg"),
      ],
      { timeout: 30000, maxBuffer: 1024 * 1024 },
    );
    return {
      buffer: await readFile(join(dir, "voice.ogg")),
      mime: "audio/ogg; codecs=opus",
      type: "audio",
      filename: "voice.ogg",
    };
  } catch {
    fail("The voice recording could not be processed. Record it again.");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
