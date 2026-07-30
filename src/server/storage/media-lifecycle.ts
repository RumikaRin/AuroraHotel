export const TEMP_FILE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface MediaItem {
  isPublic: boolean;
  attachedEntityId?: string | null;
  createdAt?: Date;
}

export function determineMediaTargetStore(item: MediaItem): "private" | "public" {
  if (item.isPublic && item.attachedEntityId) {
    return "public";
  }
  return "private";
}

export function shouldCleanupTempFile(item: MediaItem): boolean {
  if (item.attachedEntityId) {
    return false;
  }
  if (!item.createdAt) {
    return false;
  }
  const ageMs = Date.now() - new Date(item.createdAt).getTime();
  return ageMs > TEMP_FILE_TTL_MS;
}
