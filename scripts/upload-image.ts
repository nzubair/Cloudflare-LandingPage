import { program } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execSync } from "child_process";

program
  .requiredOption("--file <path>", "Path to image file (JPEG)")
  .requiredOption("--id <string>", 'Unique image ID (e.g., "nature-001")')
  .requiredOption(
    "--category <string>",
    "One of: nature, abstract, cityscape"
  )
  .option("--description <text>", "Human-readable description", "")
  .option("--credit <html>", "Photo credit HTML fragment (simple strings only)")
  .option("--credit-file <path>", "Path to a text file containing the credit HTML (recommended for links with special characters)")
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

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "upload-image-"));
const tmpFile = path.join(tmpDir, "image.txt");
const tmpManifest = path.join(tmpDir, "manifest.json");
fs.writeFileSync(tmpFile, base64);

try {
  // Upload image data to IMAGES namespace
  execSync(`wrangler kv key put --binding=IMAGES --remote --preview false "image:${opts.id}" --path="${tmpFile}"`, {
    stdio: "inherit",
  });

  // Get current manifest
  let manifest = { images: [] as any[] };
  try {
    const raw = execSync(`wrangler kv key get --binding=CONFIG --remote --preview false "image-manifest"`, {
      encoding: "utf-8",
    });
    manifest = JSON.parse(raw);
  } catch {
    // Manifest doesn't exist yet, use empty
  }

  // Update manifest
  const existing = manifest.images.findIndex((i: any) => i.id === opts.id);
  const meta: Record<string, string> = {
    id: opts.id,
    category: opts.category,
    description: opts.description,
  };
  const credit = opts.creditFile
    ? fs.readFileSync(opts.creditFile, "utf-8").trim()
    : opts.credit;
  if (credit) {
    meta.credit = credit;
  }

  if (existing >= 0) {
    manifest.images[existing] = meta;
  } else {
    manifest.images.push(meta);
  }

  fs.writeFileSync(tmpManifest, JSON.stringify(manifest));
  execSync(`wrangler kv key put --binding=CONFIG --remote --preview false "image-manifest" --path="${tmpManifest}"`, {
    stdio: "inherit",
  });

  console.log(`Image "${opts.id}" uploaded successfully.`);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
