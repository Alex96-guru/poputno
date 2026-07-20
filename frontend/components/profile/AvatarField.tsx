"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

/** Uploads are downscaled to this square before they ever leave the browser. */
const MAX_SIZE = 256;
const JPEG_QUALITY = 0.82;
/** Guards against decoding something huge; the resize output is ~20KB. */
const MAX_FILE_BYTES = 15 * 1024 * 1024;

/** Centre-crop to a square, downscale, and encode as a data URI. */
async function fileToAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Это не изображение. Подойдут JPG, PNG, WebP или GIF.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Файл больше 15 МБ — выберите изображение поменьше.");
  }

  let bitmap: ImageBitmap;
  try {
    // from-image applies the EXIF rotation, so phone photos aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Не удалось прочитать изображение — возможно, оно повреждено.");
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(side, MAX_SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Браузер не смог обработать изображение.");
  }
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

interface Props {
  value: string;
  onChange: (next: string) => void;
  onError: (message: string | null) => void;
}

export default function AvatarField({ value, onChange, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const accept = async (file: File | undefined) => {
    if (!file) return;
    onError(null);
    setBusy(true);
    try {
      onChange(await fileToAvatar(file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[14px] font-semibold text-ink">Фото профиля</span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void accept(e.dataTransfer.files[0]);
        }}
        className={`flex items-center gap-4 rounded-btn border border-dashed p-4 transition ${
          dragging ? "border-accent bg-accent/5" : "border-border bg-surface-2"
        }`}
      >
        <span
          aria-hidden
          className="h-16 w-16 shrink-0 rounded-pill border border-border bg-white bg-cover bg-center"
          style={value ? { backgroundImage: `url(${value})` } : undefined}
        >
          {!value && (
            <span className="grid h-full w-full place-items-center text-subtle">
              <ImagePlus className="h-5 w-5" />
            </span>
          )}
        </span>

        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-[14px] text-muted">
            Перетащите фото сюда или{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-accent-ink underline underline-offset-2"
            >
              выберите на устройстве
            </button>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-subtle">
              {busy ? "Обрабатываем…" : "JPG, PNG, WebP или GIF"}
            </span>
            {value && !busy && (
              <button
                type="button"
                onClick={() => {
                  onError(null);
                  onChange("");
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#C0392B]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Удалить
              </button>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void accept(e.target.files?.[0]);
            // Let the same file be picked again after a failure.
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
