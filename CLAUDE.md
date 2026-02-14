# Claude.md - Domain Placeholder Worker

## Project Overview

This is a Cloudflare Worker that serves as a generic placeholder page for parked/in-development domains. It displays the domain name with a random background image and quote, configurable per domain via KV storage.

**Key Features:**
- Single worker serves unlimited domains
- Dynamic domain name display
- Random images stored in Workers KV (no external dependencies)
- Random quotes with author attribution
- Three style variations: minimalist (default), modern, playful
- Per-domain style configuration via KV lookup
- CLI tools for image and configuration management

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Storage:** Cloudflare Workers KV (two namespaces: IMAGES, CONFIG)
- **Language:** TypeScript
- **Build:** Wrangler CLI
- **CI/CD:** GitHub Actions
- **License:** MIT

## Project Structure

```
domain-placeholder-worker/
├── src/
│   ├── index.ts              # Main worker entry point
│   ├── handlers/
│   │   └── placeholder.ts    # Request handler logic
│   ├── templates/
│   │   ├── base.ts           # Base HTML template
│   │   └── styles/
│   │       ├── minimalist.ts # Minimalist style CSS
│   │       ├── modern.ts     # Modern style CSS
│   │       └── playful.ts    # Playful style CSS
│   ├── services/
│   │   ├── config.ts         # KV config operations
│   │   ├── images.ts         # KV image operations
│   │   └── quotes.ts         # Quote selection logic
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── utils/
│       └── random.ts         # Random selection utilities
├── scripts/
│   ├── upload-image.ts       # Single image upload CLI
│   ├── upload-images.ts      # Batch image upload CLI
│   ├── set-style.ts          # Domain style configuration
│   ├── add-quote.ts          # Add quote to collection
│   ├── init-quotes.ts        # Initialize default quotes
│   └── list-images.ts        # List all stored images
├── images/                   # Local image storage (gitignored, for uploads)
├── wrangler.toml             # Wrangler configuration
├── package.json
├── tsconfig.json
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment
├── README.md                 # User documentation with Deploy button
├── PRD.md                    # Product Requirements Document
└── Claude.md                 # This file
```

## KV Schema

### Namespace: CONFIG

```typescript
// Key: "quotes"
interface QuotesConfig {
  quotes: Array<{
    text: string;
    author: string;
    category: "inspirational" | "humorous" | "informational";
  }>;
}

// Key: "image-manifest"
interface ImageManifest {
  images: Array<{
    id: string;        // e.g., "nature-001"
    category: "nature" | "abstract" | "cityscape";
    description: string;
  }>;
}

// Key: "domain:{hostname}" (e.g., "domain:example.net")
interface DomainConfig {
  style: "minimalist" | "modern" | "playful";
  enabled: boolean;
}
```

### Namespace: IMAGES

```typescript
// Key: "image:{id}" (e.g., "image:nature-001")
// Value: base64-encoded JPEG binary string
```

## Implementation Details

### Main Worker Flow (src/index.ts)

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Extract hostname from request
    const url = new URL(request.url);
    const domain = url.hostname;
    
    // 2. Get domain config (style) from KV, default to "minimalist"
    const config = await getDomainConfig(env.CONFIG, domain);
    
    // 3. Get random image from KV
    const image = await getRandomImage(env.CONFIG, env.IMAGES);
    
    // 4. Get random quote from KV
    const quote = await getRandomQuote(env.CONFIG);
    
    // 5. Generate HTML with appropriate style
    const html = generateHTML(domain, image, quote, config.style);
    
    // 6. Return response
    return new Response(html, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};
```

### Environment Bindings (wrangler.toml)

```toml
name = "domain-placeholder-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "CONFIG"
id = "<CONFIG_NAMESPACE_ID>"
preview_id = "<CONFIG_PREVIEW_NAMESPACE_ID>"

[[kv_namespaces]]
binding = "IMAGES"
id = "<IMAGES_NAMESPACE_ID>"
preview_id = "<IMAGES_PREVIEW_NAMESPACE_ID>"

# Example routes - users will customize these
# routes = [
#   { pattern = "*example.net/*", zone_name = "example.net" }
# ]
```

### TypeScript Types (src/types/index.ts)

```typescript
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
  enabled: boolean;
}

export interface QuotesData {
  quotes: Quote[];
}

export interface ImageManifest {
  images: ImageMeta[];
}
```

### HTML Template Structure (src/templates/base.ts)

The HTML should:
1. Be a complete, self-contained HTML5 document
2. Embed the image as a base64 data URL in CSS background
3. Include Google Fonts (Playfair Display for domain, Inter for quote)
4. Apply style-specific CSS based on the variant
5. Be responsive (mobile-friendly)

```typescript
export function generateHTML(
  domain: string,
  imageBase64: string,
  quote: Quote,
  style: StyleVariant
): string {
  const styleCSS = getStyleCSS(style);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${domain}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
  <style>
    ${getBaseCSS()}
    ${styleCSS}
  </style>
</head>
<body>
  <div class="background" style="background-image: url('data:image/jpeg;base64,${imageBase64}')"></div>
  <div class="overlay"></div>
  <main class="content">
    <h1 class="domain">${domain}</h1>
    <blockquote class="quote">
      <p>"${quote.text}"</p>
      <cite>— ${quote.author}</cite>
    </blockquote>
  </main>
</body>
</html>`;
}
```

### Base CSS

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: brightness(0.7) saturate(0.8);
  z-index: -2;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
  color: #ffffff;
}

.domain {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 8vw, 5rem);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 1.5rem;
}

.quote {
  max-width: 600px;
}

.quote p {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 400;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.quote cite {
  font-family: 'Inter', sans-serif;
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-style: normal;
  opacity: 0.7;
}
```

### Style Variations

**Minimalist (default):** Use base CSS as-is

**Modern:**
```css
/* Modern style overrides */
.domain {
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  letter-spacing: 0.1em;
}

.background {
  filter: brightness(0.75) saturate(0.9);
}

.overlay {
  background: linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%);
}

.quote p {
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
}
```

**Playful:**
```css
/* Playful style overrides */
.background {
  filter: brightness(0.8) saturate(1.1);
}

.domain {
  font-family: 'Playfair Display', serif;
  animation: fadeInUp 0.8s ease-out;
}

.quote {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## CLI Scripts

### Upload Single Image (scripts/upload-image.ts)

```typescript
// Usage: npx ts-node scripts/upload-image.ts --file ./image.jpg --id nature-001 --category nature --description "Misty mountains"

import { program } from 'commander';
import * as fs from 'fs';
import { execSync } from 'child_process';

program
  .requiredOption('--file <path>', 'Path to image file')
  .requiredOption('--id <id>', 'Image ID (e.g., nature-001)')
  .requiredOption('--category <category>', 'Category: nature, abstract, cityscape')
  .option('--description <desc>', 'Image description', '')
  .parse();

const opts = program.opts();

// Read and encode image
const imageBuffer = fs.readFileSync(opts.file);
const base64 = imageBuffer.toString('base64');

// Upload to KV
execSync(`wrangler kv:key put --namespace-id=<IMAGES_NS_ID> "image:${opts.id}" "${base64}"`, { stdio: 'inherit' });

// Update manifest (fetch, modify, put back)
// ... implementation details
```

### Initialize Default Quotes (scripts/init-quotes.ts)

This script initializes the 15 default quotes in KV:

```typescript
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
    { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "informational" }
  ]
};
```

## Deployment

### GitHub Actions Workflow (.github/workflows/deploy.yml)

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Deploy to Cloudflare Button

Add to README.md:
```markdown
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/domain-placeholder-worker)
```

## Development Workflow

```bash
# Install dependencies
npm install

# Create KV namespaces (first time only)
wrangler kv:namespace create CONFIG
wrangler kv:namespace create IMAGES
wrangler kv:namespace create CONFIG --preview
wrangler kv:namespace create IMAGES --preview

# Update wrangler.toml with namespace IDs

# Initialize default quotes
npm run init-quotes

# Upload images
npm run upload-image -- --file ./images/mountain.jpg --id nature-001 --category nature

# Local development
npm run dev

# Deploy
npm run deploy
```

## Testing Checklist

- [ ] Worker responds to requests on configured domains
- [ ] Domain name is correctly extracted and displayed
- [ ] Random image is selected and displayed on each request
- [ ] Random quote is selected and displayed on each request
- [ ] Style is correctly applied based on domain config
- [ ] Default style (minimalist) is used when no config exists
- [ ] All three style variants render correctly
- [ ] Mobile responsive layout works
- [ ] CLI tools work for image upload
- [ ] CLI tools work for configuration
- [ ] GitHub Actions deployment succeeds
- [ ] Deploy button creates working deployment

## Error Handling

- If image manifest is empty or missing: Return error page or use fallback
- If quotes are empty or missing: Use a default quote
- If image fetch fails: Use a solid color fallback background
- If domain config is missing: Use default "minimalist" style

## Performance Considerations

- Images are embedded as base64 in HTML (single request, no additional fetches)
- Google Fonts are loaded asynchronously with `display=swap`
- CSS is inlined (no additional requests)
- KV reads are cached at the edge
- Target total HTML response size: < 800KB (500KB image + 300KB overhead)

## Security Considerations

- No user input is reflected without sanitization
- Domain names are displayed but could contain XSS vectors (sanitize!)
- No cookies or session state
- No external API calls at runtime
- All content is static/pre-configured
