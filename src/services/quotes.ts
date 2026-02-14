import { Quote, QuotesData } from "../types";
import { randomElement } from "../utils/random";

const FALLBACK_QUOTE: Quote = {
  text: "Coming soon...",
  author: "This Domain",
  category: "informational",
};

export async function getQuotes(kv: KVNamespace): Promise<QuotesData> {
  const raw = await kv.get("quotes");
  if (!raw) return { quotes: [] };
  return JSON.parse(raw);
}

export async function getRandomQuote(kv: KVNamespace): Promise<Quote> {
  const data = await getQuotes(kv);

  if (data.quotes.length === 0) {
    return FALLBACK_QUOTE;
  }

  return randomElement(data.quotes);
}

export async function addQuote(kv: KVNamespace, quote: Quote): Promise<void> {
  const data = await getQuotes(kv);
  data.quotes.push(quote);
  await kv.put("quotes", JSON.stringify(data));
}
