import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

program
  .requiredOption("--dir <path>", "Directory containing images")
  .requiredOption(
    "--category <string>",
    "Category for all images: nature, abstract, cityscape"
  )
  .option("--credit <html>", "Photo credit HTML fragment applied to all images", "")
  .parse();

const opts = program.opts();

const validCategories = ["nature", "abstract", "cityscape"];
if (!validCategories.includes(opts.category)) {
  console.error(
    `Invalid category "${opts.category}". Must be one of: ${validCategories.join(", ")}`
  );
  process.exit(1);
}

if (!fs.existsSync(opts.dir)) {
  console.error(`Directory not found: ${opts.dir}`);
  process.exit(1);
}

const files = fs
  .readdirSync(opts.dir)
  .filter((f: string) => /\.(jpg|jpeg)$/i.test(f));

if (files.length === 0) {
  console.error("No .jpg/.jpeg files found in directory.");
  process.exit(1);
}

console.log(`Found ${files.length} image(s) to upload.`);

for (const file of files) {
  const basename = path.basename(file, path.extname(file));
  const id = `${opts.category}-${basename}`;
  const filePath = path.join(opts.dir, file);

  console.log(`\nUploading: ${file} as ${id}...`);

  try {
    const args = [
      "ts-node", "scripts/upload-image.ts",
      "--file", filePath,
      "--id", id,
      "--category", opts.category,
      "--description", basename,
    ];
    if (opts.credit) {
      args.push("--credit", opts.credit);
    }
    execFileSync("npx", args, { stdio: "inherit" });
  } catch (error) {
    console.error(`Failed to upload ${file}:`, error);
  }
}

console.log("\nBatch upload complete.");
