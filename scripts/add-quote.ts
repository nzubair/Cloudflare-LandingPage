import { program } from "commander";
import { execSync } from "child_process";
import * as fs from "fs";

program
  .requiredOption("--text <string>", "Quote text")
  .requiredOption("--author <string>", "Attribution")
  .requiredOption(
    "--category <string>",
    "One of: inspirational, humorous, informational"
  )
  .parse();

const opts = program.opts();

const validCategories = ["inspirational", "humorous", "informational"];
if (!validCategories.includes(opts.category)) {
  console.error(
    `Invalid category "${opts.category}". Must be one of: ${validCategories.join(", ")}`
  );
  process.exit(1);
}

const tmpFile = ".tmp-quotes.json";

try {
  // Get current quotes
  let quotesData = { quotes: [] as any[] };
  try {
    const raw = execSync(`wrangler kv key get --binding=CONFIG --remote --preview false "quotes"`, {
      encoding: "utf-8",
    });
    quotesData = JSON.parse(raw);
  } catch {
    // Quotes don't exist yet, use empty
  }

  // Add new quote
  quotesData.quotes.push({
    text: opts.text,
    author: opts.author,
    category: opts.category,
  });

  fs.writeFileSync(tmpFile, JSON.stringify(quotesData));
  execSync(`wrangler kv key put --binding=CONFIG --remote --preview false "quotes" --path="${tmpFile}"`, {
    stdio: "inherit",
  });

  console.log("Quote added successfully.");
} catch (error) {
  console.error("Failed to add quote:", error);
  process.exit(1);
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
