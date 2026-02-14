import { program } from "commander";
import { execSync } from "child_process";

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

const config = JSON.stringify({ style: opts.style, enabled: true });

try {
  execSync(
    `wrangler kv:key put --binding=CONFIG "domain:${opts.domain}" '${config}'`,
    { stdio: "inherit" }
  );
  console.log(`Style for "${opts.domain}" set to "${opts.style}".`);
} catch (error) {
  console.error("Failed to set style:", error);
  process.exit(1);
}
