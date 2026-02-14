import { program } from "commander";
import { execSync } from "child_process";
import * as fs from "fs";

program
  .requiredOption("--domain <hostname>", "Domain to configure (e.g., example.net)")
  .requiredOption(
    "--style <variant>",
    "One of: minimalist, modern, playful"
  )
  .parse();

const opts = program.opts();

const validStyles = ["minimalist", "modern", "playful"];
if (!validStyles.includes(opts.style)) {
  console.error(
    `Invalid style "${opts.style}". Must be one of: ${validStyles.join(", ")}`
  );
  process.exit(1);
}

const domainPattern = /^[a-zA-Z0-9.-]+$/;
if (!domainPattern.test(opts.domain)) {
  console.error(`Invalid domain "${opts.domain}". Must contain only alphanumeric characters, dots, and hyphens.`);
  process.exit(1);
}

const tmpFile = ".tmp-config.json";
fs.writeFileSync(tmpFile, JSON.stringify({ style: opts.style }));

try {
  execSync(`wrangler kv key put --binding=CONFIG --remote --preview false "domain:${opts.domain}" --path="${tmpFile}"`, {
    stdio: "inherit",
  });
  console.log(`Style for "${opts.domain}" set to "${opts.style}".`);
} catch (error) {
  console.error("Failed to set style:", error);
  process.exit(1);
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
