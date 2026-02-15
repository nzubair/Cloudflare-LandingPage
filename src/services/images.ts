import { ImageManifest, ImageMeta } from "../types";
import { randomElement } from "../utils/random";

function isImageManifest(value: unknown): value is ImageManifest {
  if (!value || typeof value !== "object") return false;
  const obj = value as { images?: unknown };
  if (!Array.isArray(obj.images)) return false;
  return obj.images.every(
    (item) =>
      !!item &&
      typeof item === "object" &&
      typeof (item as { id?: unknown }).id === "string"
  );
}

export async function getImageManifest(
  kv: KVNamespace
): Promise<ImageManifest> {
  const raw = await kv.get("image-manifest");
  if (!raw) return { images: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isImageManifest(parsed)) return parsed;
    return { images: [] };
  } catch {
    return { images: [] };
  }
}

export async function getRandomImage(
  configKv: KVNamespace,
  imagesKv: KVNamespace
): Promise<{ base64: string; credit: string }> {
  const manifest = await getImageManifest(configKv);

  if (manifest.images.length === 0) {
    return { base64: "", credit: "" };
  }

  const meta = randomElement(manifest.images);
  if (!meta) return { base64: "", credit: "" };
  const base64 = await imagesKv.get(`image:${meta.id}`);

  return { base64: base64 ?? "", credit: meta.credit ?? "" };
}

export async function uploadImage(
  kv: KVNamespace,
  id: string,
  base64: string
): Promise<void> {
  await kv.put(`image:${id}`, base64);
}

export async function updateManifest(
  kv: KVNamespace,
  image: ImageMeta
): Promise<void> {
  const manifest = await getImageManifest(kv);
  const existing = manifest.images.findIndex((i) => i.id === image.id);

  if (existing >= 0) {
    manifest.images[existing] = image;
  } else {
    manifest.images.push(image);
  }

  await kv.put("image-manifest", JSON.stringify(manifest));
}
