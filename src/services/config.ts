import { DomainConfig, StyleVariant } from "../types";

const DEFAULT_CONFIG: DomainConfig = {
  style: "minimalist",
  enabled: true,
};

const VALID_STYLES: StyleVariant[] = ["minimalist", "modern", "playful"];

export async function getDomainConfig(
  kv: KVNamespace,
  domain: string
): Promise<DomainConfig> {
  const raw = await kv.get(`domain:${domain}`);
  if (!raw) return DEFAULT_CONFIG;

  const config: DomainConfig = JSON.parse(raw);

  if (!VALID_STYLES.includes(config.style)) {
    config.style = "minimalist";
  }

  return config;
}

export async function setDomainConfig(
  kv: KVNamespace,
  domain: string,
  config: DomainConfig
): Promise<void> {
  await kv.put(`domain:${domain}`, JSON.stringify(config));
}
