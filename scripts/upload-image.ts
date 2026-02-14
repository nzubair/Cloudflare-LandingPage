import { program } from "commander";
import * as fs from "fs";
import { execSync } from "child_process";

program
  .requiredOption("--file <path>", "Path to image file (JPEG)")
  .requiredOption("--id <string>", 'Unique image ID (e.g., "nature-001")')
  .requiredOption(
    "--category <string>",
    "One of: nature, abstract, cityscape"
  )
  .option("--description <text>", "Human-readable description", "")
  .parse();

const opts = program.opts();

const validCategories = ["nature", "abstract", "cityscape"];
if (!validCategories.includes(opts.category)) {
  console.error(
    `Invalid category "${opts.category}". Must be one of: ${validCategories.join(", ")}`
  );
  process.exit(1);
}

if (!fs.existsSync(opts.file)) {
  console.error(`File not found: ${opts.file}`);
  process.exit(1);
}

const imageBuffer = fs.readFileSync(opts.file);
const base64 = imageBuffer.toString("base64");

// Write base64 to a temp file to avoid shell argument length limits
const tmpFile = `.tmp-image-${opts.id}.txt`;
fs.writeFileSync(tmpFile, base64);

try {
  // Upload image data to IMAGES namespace
  execSync(
    `wrangler kv:key put --binding=IMAGES "image:${opts.id}" --path="${tmpFile}"`,
    { stdio: "inherit" }
  );

  // Get current manifest
  let manifest = { images: [] as any[] };
  try {
    const raw = execSync(`wrangler kv:key get --binding=CONFIG "image-manifest"`, {
      encoding: "utf-8",
    });
    manifest = JSON.parse(raw);
  } catch {
    // Manifest doesn't exist yet, use empty
  }

  // Update manifest
  const existing = manifest.images.findIndex((i: any) => i.id === opts.id);
  const meta = {
    id: opts.id,
    category: opts.category,
    description: opts.description,
  };

  if (existing >= 0) {
    manifest.images[existing] = meta;
  } else {
    manifest.images.push(meta);
  }

  const manifestJson = JSON.stringify(manifest);
  execSync(
    `wrangler kv:key put --binding=CONFIG "image-manifest" '${manifestJson}'`,
    { stdio: "inherit" }
  );

  console.log(`Image "${opts.id}" uploaded successfully.`);
} finally {
  // Clean up temp file
  if (fs.existsSync(tmpFile)) {
    fs.unlinkSync(tmpFile);
  }
}
