import type { MediaKind } from "./types";

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov"]);

export const MAX_FILES = 8;
export const MAX_BYTES = 40 * 1024 * 1024;
export const MAX_DIRECT_BYTES = 200 * 1024 * 1024;

export const UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export function classifyFile(mime: string, originalName: string): { kind: MediaKind; ext: string } | null {
  const ext = originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  const type = mime.toLowerCase();
  const imageMime = type.startsWith("image/");
  const videoMime = type.startsWith("video/");
  const unknown = type === "" || type === "application/octet-stream";

  if (IMAGE_EXT.has(ext) && (imageMime || unknown) && !videoMime) {
    return { kind: "image", ext: ext === "jpeg" ? "jpg" : ext };
  }
  if (VIDEO_EXT.has(ext) && (videoMime || unknown) && !imageMime) {
    return { kind: "video", ext };
  }
  return null;
}

export function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isBlobUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
