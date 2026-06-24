import { get, set, del, keys } from "idb-keyval";

const PHOTO_PREFIX = "forge-photo-";

export function photoKey(
  type: "hair" | "skin",
  month: string,
  variant: string
): string {
  return `${PHOTO_PREFIX}${type}-${month}-${variant}`;
}

export async function savePhoto(
  key: string,
  blob: Blob
): Promise<void> {
  await set(key, blob);
}

export async function getPhoto(key: string): Promise<Blob | undefined> {
  return get<Blob>(key);
}

export async function deletePhoto(key: string): Promise<void> {
  await del(key);
}

export async function getAllPhotoKeys(): Promise<string[]> {
  const allKeys = await keys();
  return (allKeys as string[]).filter((k) =>
    String(k).startsWith(PHOTO_PREFIX)
  );
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function base64ToBlob(base64: string): Promise<Blob> {
  const res = await fetch(base64);
  return res.blob();
}

export async function exportPhotosAsBase64(): Promise<
  Record<string, string>
> {
  const photoKeys = await getAllPhotoKeys();
  const result: Record<string, string> = {};
  for (const key of photoKeys) {
    const blob = await getPhoto(key);
    if (blob) {
      result[key] = await blobToBase64(blob);
    }
  }
  return result;
}

export async function importPhotosFromBase64(
  photos: Record<string, string>
): Promise<void> {
  for (const [key, base64] of Object.entries(photos)) {
    const blob = await base64ToBlob(base64);
    await savePhoto(key, blob);
  }
}

export function compressImage(file: File, maxWidth = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        "image/jpeg",
        0.8
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}
