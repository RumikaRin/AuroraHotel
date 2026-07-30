import { basename } from "node:path";

export const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;
export const maximumUploadBytes = 10 * 1024 * 1024;

export interface UploadCandidate {
  originalName: string;
  mimeType: string;
  size: number;
  bytes: Buffer;
  authorized: boolean;
}

export async function assertUploadAllowed(
  candidate: UploadCandidate,
  contentValidator: (bytes: Buffer, mimeType: string) => Promise<boolean>,
): Promise<void> {
  if (!candidate.authorized) {
    throw new Error("Upload authorization denied");
  }
  if (
    candidate.size < 1 ||
    candidate.size > maximumUploadBytes ||
    candidate.bytes.byteLength !== candidate.size
  ) {
    throw new Error("Upload size is invalid");
  }
  if (!(allowedMimeTypes as readonly string[]).includes(candidate.mimeType)) {
    throw new Error("Upload MIME type is not allowed");
  }
  if (
    basename(candidate.originalName) !== candidate.originalName ||
    /[\u0000-\u001f<>:"\/\\|?*]/u.test(candidate.originalName)
  ) {
    throw new Error("Upload filename is unsafe");
  }
  if (!(await contentValidator(candidate.bytes, candidate.mimeType))) {
    throw new Error("Upload content does not match its declared MIME type");
  }
}
