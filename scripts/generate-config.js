#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATE = path.join(ROOT, "wrangler.template.toml");
const OUTPUT = path.join(ROOT, "wrangler.toml");
const ENV_FILE = path.join(ROOT, ".env");

const REQUIRED_VARS = [
  "CONFIG_KV_NAMESPACE_ID",
  "CONFIG_KV_PREVIEW_NAMESPACE_ID",
  "IMAGES_KV_NAMESPACE_ID",
  "IMAGES_KV_PREVIEW_NAMESPACE_ID",
];

// Load .env file if it exists (simple KEY=VALUE parser, no external deps)
if (fs.existsSync(ENV_FILE)) {
  const lines = fs.readFileSync(ENV_FILE, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Check all required vars are present
const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error("Missing required environment variables:");
  for (const v of missing) {
    console.error(`  - ${v}`);
  }
  console.error(
    "\nSet them in a .env file or export them before running this script."
  );
  console.error("See .env.example for the full list.");
  process.exit(1);
}

// Read template and replace placeholders
let content = fs.readFileSync(TEMPLATE, "utf-8");
for (const varName of REQUIRED_VARS) {
  content = content.replace(
    new RegExp(`\\{\\{${varName}\\}\\}`, "g"),
    process.env[varName]
  );
}

fs.writeFileSync(OUTPUT, content, "utf-8");
console.log("Generated wrangler.toml from template.");
