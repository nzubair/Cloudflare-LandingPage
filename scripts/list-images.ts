import { execSync } from "child_process";

try {
  const raw = execSync(`wrangler kv:key get --binding=CONFIG "image-manifest"`, {
    encoding: "utf-8",
  });
  const manifest = JSON.parse(raw);

  if (manifest.images.length === 0) {
    console.log("No images in manifest.");
    process.exit(0);
  }

  console.log("\nStored Images:");
  console.log("─".repeat(60));
  console.log(
    "ID".padEnd(25) + "Category".padEnd(15) + "Description"
  );
  console.log("─".repeat(60));

  for (const img of manifest.images) {
    console.log(
      img.id.padEnd(25) +
        img.category.padEnd(15) +
        (img.description || "—")
    );
  }

  console.log("─".repeat(60));
  console.log(`Total: ${manifest.images.length} image(s)`);
} catch (error) {
  console.error(
    "Failed to list images. Make sure the manifest is initialized."
  );
  process.exit(1);
}
