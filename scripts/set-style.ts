import { program } from "commander";
import { execSync } from "child_process";
import * as fs from "fs";

program
  .requiredOption("--domain <hostname>", "Domain to configure (e.g., example.net)")
  .option(
    "--style <variant>",
    "One of: minimalist, modern, playful"
  )
  .option(
    "--show-quotes <boolean>",
    "Show or hide the quote block (true/false)"
  )
  .parse();

const opts = program.opts();

const validStyles = ["minimalist", "modern", "playful"];
if (opts.style && !validStyles.includes(opts.style)) {
  console.error(
    `Invalid style "${opts.style}". Must be one of: ${validStyles.join(", ")}`
  );
  process.exit(1);
}

if (opts.showQuotes !== undefined && !["true", "false"].includes(opts.showQuotes)) {
  console.error(
    `Invalid --show-quotes value "${opts.showQuotes}". Must be true or false.`
  );
  process.exit(1);
}

if (!opts.style && opts.showQuotes === undefined) {
  console.error("At least one of --style or --show-quotes must be provided.");
  process.exit(1);
}

const domainPattern = /^[a-zA-Z0-9.-]+$/;
if (!domainPattern.test(opts.domain)) {
  console.error(`Invalid domain "${opts.domain}". Must contain only alphanumeric characters, dots, and hyphens.`);
  process.exit(1);
}

// Fetch existing config to merge with new values
let existing: Record<string, unknown> = {};
try {
  const raw = execSync(
    `wrangler kv key get --binding=CONFIG --remote --preview false "domain:${opts.domain}"`,
    { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
  );
  existing = JSON.parse(raw);
} catch {
  // No existing config — start fresh
}

const config = {
  style: opts.style || existing.style || "minimalist",
  ...(typeof existing.enabled === "boolean" ? { enabled: existing.enabled } : {}),
  showQuotes: opts.showQuotes !== undefined
    ? opts.showQuotes === "true"
    : typeof existing.showQuotes === "boolean"
      ? existing.showQuotes
      : true,
};

const tmpFile = ".tmp-config.json";
fs.writeFileSync(tmpFile, JSON.stringify(config));

try {
  execSync(`wrangler kv key put --binding=CONFIG --remote --preview false "domain:${opts.domain}" --path="${tmpFile}"`, {
    stdio: "inherit",
  });
  const changes: string[] = [];
  if (opts.style) changes.push(`style="${opts.style}"`);
  if (opts.showQuotes !== undefined) changes.push(`showQuotes=${opts.showQuotes}`);
  console.log(`Domain "${opts.domain}" updated: ${changes.join(", ")}.`);
} catch (error) {
  console.error("Failed to update config:", error);
  process.exit(1);
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
