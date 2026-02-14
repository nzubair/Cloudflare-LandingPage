import { ImageManifest, ImageMeta } from "../types";
import { randomElement } from "../utils/random";

export async function getImageManifest(
  kv: KVNamespace
): Promise<ImageManifest> {
  const raw = await kv.get("image-manifest");
  if (!raw) return { images: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { images: [] };
  }
}

export async function getRandomImage(
  configKv: KVNamespace,
  imagesKv: KVNamespace
): Promise<string> {
  const manifest = await getImageManifest(configKv);

  if (manifest.images.length === 0) {
    return "";
  }

  const meta = randomElement(manifest.images);
  if (!meta) return "";
  const base64 = await imagesKv.get(`image:${meta.id}`);

  return base64 ?? "";
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
