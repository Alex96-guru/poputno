/** Longest side a chat photo is scaled down to before it leaves the browser. */
const MAX_SIZE = 1280;
const JPEG_QUALITY = 0.82;
/** Guards against decoding something enormous; the output is far smaller. */
const MAX_FILE_BYTES = 20 * 1024 * 1024;

/**
 * Downscale an image and encode it as a JPEG data URI, keeping its aspect
 * ratio. Throws with a user-facing message when the file is not a usable image.
 */
export async function fileToChatImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Это не изображение. Подойдут JPG, PNG, WebP или GIF.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Файл больше 20 МБ — выберите изображение поменьше.");
  }

  let bitmap: ImageBitmap;
  try {
    // from-image applies EXIF rotation, so phone photos aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Не удалось прочитать изображение — возможно, оно повреждено.");
  }

  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Браузер не смог обработать изображение.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
