export interface Env {
  CONFIG: KVNamespace;
  IMAGES: KVNamespace;
}

export type StyleVariant = "minimalist" | "modern" | "playful";
export type QuoteCategory = "inspirational" | "humorous" | "informational";
export type ImageCategory = "nature" | "abstract" | "cityscape";

export interface Quote {
  text: string;
  author: string;
  category: QuoteCategory;
}

export interface ImageMeta {
  id: string;
  category: ImageCategory;
  description: string;
}

export interface DomainConfig {
  style: StyleVariant;
  enabled?: boolean;
}

export interface QuotesData {
  quotes: Quote[];
}

export interface ImageManifest {
  images: ImageMeta[];
}
