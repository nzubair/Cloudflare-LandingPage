import { execSync } from "child_process";
import * as fs from "fs";

const defaultQuotes = {
  quotes: [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "inspirational" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "inspirational" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "inspirational" },
    { text: "Everything you can imagine is real.", author: "Pablo Picasso", category: "inspirational" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "inspirational" },
    { text: "I'm not superstitious, but I am a little stitious.", author: "Michael Scott", category: "humorous" },
    { text: "I used to think I was indecisive, but now I'm not so sure.", author: "Unknown", category: "humorous" },
    { text: "The road to success is always under construction.", author: "Lily Tomlin", category: "humorous" },
    { text: "I am so clever that sometimes I don't understand a single word of what I am saying.", author: "Oscar Wilde", category: "humorous" },
    { text: "Behind every great man is a woman rolling her eyes.", author: "Jim Carrey", category: "humorous" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "informational" },
    { text: "The only constant in life is change.", author: "Heraclitus", category: "informational" },
    { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien", category: "informational" },
    { text: "What we think, we become.", author: "Buddha", category: "informational" },
    { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "informational" },
  ],
};

const tmpFile = ".tmp-quotes.json";
fs.writeFileSync(tmpFile, JSON.stringify(defaultQuotes));

try {
  execSync(`wrangler kv:key put --binding=CONFIG "quotes" --path="${tmpFile}"`, {
    stdio: "inherit",
  });
  console.log("Default quotes initialized successfully.");
} catch (error) {
  console.error("Failed to initialize quotes:", error);
  process.exit(1);
} finally {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
}
