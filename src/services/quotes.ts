import { Quote, QuotesData } from "../types";
import { randomElement } from "../utils/random";

const FALLBACK_QUOTE: Quote = {
  text: "Coming soon...",
  author: "This Domain",
  category: "informational",
};

function isQuotesData(value: unknown): value is QuotesData {
  if (!value || typeof value !== "object") return false;
  const obj = value as { quotes?: unknown };
  if (!Array.isArray(obj.quotes)) return false;
  return obj.quotes.every(
    (item) =>
      !!item &&
      typeof item === "object" &&
      typeof (item as { text?: unknown }).text === "string" &&
      typeof (item as { author?: unknown }).author === "string"
  );
}

export async function getQuotes(kv: KVNamespace): Promise<QuotesData> {
  const raw = await kv.get("quotes");
  if (!raw) return { quotes: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isQuotesData(parsed)) return parsed;
    return { quotes: [] };
  } catch {
    return { quotes: [] };
  }
}

export async function getRandomQuote(kv: KVNamespace): Promise<Quote> {
  const data = await getQuotes(kv);

  if (data.quotes.length === 0) {
    return FALLBACK_QUOTE;
  }

  return randomElement(data.quotes) ?? FALLBACK_QUOTE;
}

export async function addQuote(kv: KVNamespace, quote: Quote): Promise<void> {
  const data = await getQuotes(kv);
  data.quotes.push(quote);
  await kv.put("quotes", JSON.stringify(data));
}
