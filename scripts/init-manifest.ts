import { execSync } from "child_process";

// WARNING: This script overwrites the image manifest with an empty one.
// All existing image metadata (IDs, categories, credits) will be lost.
// Only run this for first-time setup. Use upload-image.ts to manage images.
console.warn("WARNING: This will overwrite the image manifest with an empty one, removing all existing image metadata.");

const emptyManifest = { images: [] };
const json = JSON.stringify(emptyManifest);

try {
  execSync(`wrangler kv key put --binding=CONFIG --remote --preview false "image-manifest" '${json}'`, {
    stdio: "inherit",
  });
  console.log("Image manifest initialized successfully.");
} catch (error) {
  console.error("Failed to initialize manifest:", error);
  process.exit(1);
}
