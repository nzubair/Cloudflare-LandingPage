import { execSync } from "child_process";

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
