import { DomainConfig, StyleVariant } from "../types";

const DEFAULT_CONFIG: DomainConfig = {
  style: "minimalist",
  enabled: true,
  showQuotes: true,
};

const VALID_STYLES: StyleVariant[] = ["minimalist", "modern", "playful"];

function isDomainConfig(value: unknown): value is DomainConfig {
  if (!value || typeof value !== "object") return false;
  const obj = value as { style?: unknown };
  return typeof obj.style === "string";
}

export async function getDomainConfig(
  kv: KVNamespace,
  domain: string
): Promise<DomainConfig> {
  const raw = await kv.get(`domain:${domain}`);
  if (!raw) return DEFAULT_CONFIG;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isDomainConfig(parsed)) return DEFAULT_CONFIG;

    if (!VALID_STYLES.includes(parsed.style)) {
      parsed.style = "minimalist";
    }

    if (typeof parsed.enabled !== "boolean") {
      parsed.enabled = true;
    }

    if (typeof parsed.showQuotes !== "boolean") {
      parsed.showQuotes = true;
    }

    return parsed;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function setDomainConfig(
  kv: KVNamespace,
  domain: string,
  config: DomainConfig
): Promise<void> {
  await kv.put(`domain:${domain}`, JSON.stringify(config));
}
