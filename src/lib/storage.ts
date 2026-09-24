import { supabase } from "@/integrations/supabase/client";

const MAX_DIMENSION = 1280;
export const RESTAURANT_ASSETS_BUCKET = "restaurant-assets" as const;
export const MENU_IMAGES_BUCKET = "menu-images" as const;

/** Compress + resize an image in the browser before upload. */
export async function compressImage(file: File): Promise<Blob> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

export async function uploadImage(
  bucket: typeof RESTAURANT_ASSETS_BUCKET | typeof MENU_IMAGES_BUCKET,
  restaurantId: string,
  file: File,
  prefix = "img",
): Promise<string> {
  const blob = await compressImage(file);
  const path = `${restaurantId}/${prefix}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) throw error;
  return `${bucket}/${path}`;
}

/** Turns a stored "bucket/path" reference into a temporary viewable URL. */
export async function signedUrl(reference: string | null): Promise<string | null> {
  if (!reference) return null;
  if (reference.startsWith("http")) return reference;
  const [bucket, ...rest] = reference.split("/");
  const path = rest.join("/");
  if (!bucket || !path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
