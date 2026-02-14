# specs.md - Technical Specifications

## Project Metadata

```yaml
name: domain-placeholder-worker
version: 1.0.0
license: MIT
runtime: cloudflare-workers
language: typescript
node_version: ">=18.0.0"
package_manager: npm
```

## Constraints

### Hard Constraints
- No external image dependencies at runtime (all images in KV)
- Single HTML response (no additional asset requests except Google Fonts)
- Base64-encoded images embedded in HTML
- Must work with wildcard routes (`*domain.net/*`)
- No cookies, sessions, or state between requests
- No user input reflection without sanitization

### Soft Constraints
- Total HTML response size: < 800KB
- Image file size: < 500KB each (JPEG, optimized)
- Response time: < 100ms (excluding font load)
- Image dimensions: 1920×1080

## Dependencies

### Production
```json
{
  "wrangler": "^3.0.0"
}
```

### Development
```json
{
  "typescript": "^5.0.0",
  "commander": "^11.0.0",
  "@cloudflare/workers-types": "^4.0.0",
  "ts-node": "^10.0.0",
  "@types/node": "^20.0.0"
}
```

## File Structure

```
/
├── src/
│   ├── index.ts                 # Worker entry point, exports default fetch handler
│   ├── handlers/
│   │   └── placeholder.ts       # Main request handling logic
│   ├── templates/
│   │   ├── base.ts              # HTML template generator
│   │   └── styles/
│   │       ├── index.ts         # Style exports
│   │       ├── minimalist.ts    # Minimalist CSS
│   │       ├── modern.ts        # Modern CSS  
│   │       └── playful.ts       # Playful CSS
│   ├── services/
│   │   ├── config.ts            # KV config read/write
│   │   ├── images.ts            # KV image operations
│   │   └── quotes.ts            # Quote retrieval
│   ├── types/
│   │   └── index.ts             # All TypeScript interfaces
│   └── utils/
│       ├── random.ts            # Random selection helpers
│       └── sanitize.ts          # HTML sanitization
├── scripts/
│   ├── upload-image.ts          # CLI: upload single image
│   ├── upload-images.ts         # CLI: batch upload images
│   ├── set-style.ts             # CLI: set domain style
│   ├── add-quote.ts             # CLI: add quote
│   ├── init-quotes.ts           # CLI: initialize default quotes
│   ├── init-manifest.ts         # CLI: initialize image manifest
│   └── list-images.ts           # CLI: list stored images
├── images/                      # Local images for upload (gitignored)
├── wrangler.toml
├── package.json
├── tsconfig.json
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml
├── README.md
├── PRD.md
├── CLAUDE.md
└── specs.md
```

## API Contracts

### Worker Entry Point
```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>
}
```

### Environment Bindings
```typescript
interface Env {
  CONFIG: KVNamespace;
  IMAGES: KVNamespace;
}
```

### Service Functions

```typescript
// src/services/config.ts
export async function getDomainConfig(kv: KVNamespace, domain: string): Promise<DomainConfig>
export async function setDomainConfig(kv: KVNamespace, domain: string, config: DomainConfig): Promise<void>

// src/services/images.ts
export async function getImageManifest(kv: KVNamespace): Promise<ImageManifest>
export async function getRandomImage(configKv: KVNamespace, imagesKv: KVNamespace): Promise<string> // returns base64
export async function uploadImage(kv: KVNamespace, id: string, base64: string): Promise<void>
export async function updateManifest(kv: KVNamespace, image: ImageMeta): Promise<void>

// src/services/quotes.ts
export async function getQuotes(kv: KVNamespace): Promise<QuotesData>
export async function getRandomQuote(kv: KVNamespace): Promise<Quote>
export async function addQuote(kv: KVNamespace, quote: Quote): Promise<void>

// src/templates/base.ts
export function generateHTML(domain: string, imageBase64: string, quote: Quote, style: StyleVariant): string

// src/templates/styles/index.ts
export function getBaseCSS(): string
export function getStyleCSS(style: StyleVariant): string

// src/utils/random.ts
export function randomElement<T>(array: T[]): T

// src/utils/sanitize.ts
export function sanitizeDomain(domain: string): string
```

## Type Definitions

```typescript
// src/types/index.ts

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

## KV Schema

### Namespace: CONFIG

| Key Pattern | Value Type | Description |
|-------------|------------|-------------|
| `quotes` | `QuotesData` (JSON) | All quotes |
| `image-manifest` | `ImageManifest` (JSON) | Image metadata |
| `domain:{hostname}` | `DomainConfig` (JSON) | Per-domain config |

### Namespace: IMAGES

| Key Pattern | Value Type | Description |
|-------------|------------|-------------|
| `image:{id}` | `string` (base64) | Image binary data |

## Configuration Files

### wrangler.toml
```toml
name = "domain-placeholder-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "CONFIG"
id = ""  # Set after creation
preview_id = ""  # Set after creation

[[kv_namespaces]]
binding = "IMAGES"
id = ""  # Set after creation
preview_id = ""  # Set after creation

# Routes configured per deployment
# routes = [
#   { pattern = "*example.net/*", zone_name = "example.net" }
# ]
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["@cloudflare/workers-types", "node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### package.json scripts
```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "init-quotes": "ts-node scripts/init-quotes.ts",
    "init-manifest": "ts-node scripts/init-manifest.ts",
    "upload-image": "ts-node scripts/upload-image.ts",
    "upload-images": "ts-node scripts/upload-images.ts",
    "set-style": "ts-node scripts/set-style.ts",
    "add-quote": "ts-node scripts/add-quote.ts",
    "list-images": "ts-node scripts/list-images.ts",
    "setup": "npm run init-quotes && npm run init-manifest"
  }
}
```

## CLI Specifications

### upload-image
```
Usage: npm run upload-image -- [options]

Options:
  --file <path>         Required. Path to image file (JPEG)
  --id <string>         Required. Unique image ID (e.g., "nature-001")
  --category <string>   Required. One of: nature, abstract, cityscape
  --description <text>  Optional. Human-readable description

Example:
  npm run upload-image -- --file ./images/mountain.jpg --id nature-001 --category nature --description "Misty mountain"
```

### upload-images
```
Usage: npm run upload-images -- [options]

Options:
  --dir <path>          Required. Directory containing images
  --category <string>   Required. Category for all images

Behavior:
  - Scans directory for .jpg/.jpeg files
  - Auto-generates IDs from filenames (e.g., mountain.jpg → {category}-mountain)
  - Updates manifest after each upload

Example:
  npm run upload-images -- --dir ./images/nature --category nature
```

### set-style
```
Usage: npm run set-style -- [options]

Options:
  --domain <hostname>   Required. Domain to configure (e.g., "example.net")
  --style <variant>     Required. One of: minimalist, modern, playful

Example:
  npm run set-style -- --domain example.net --style playful
```

### add-quote
```
Usage: npm run add-quote -- [options]

Options:
  --text <string>       Required. Quote text
  --author <string>     Required. Attribution
  --category <string>   Required. One of: inspirational, humorous, informational

Example:
  npm run add-quote -- --text "Stay hungry, stay foolish." --author "Steve Jobs" --category inspirational
```

### list-images
```
Usage: npm run list-images

Output: Table of all images in manifest with id, category, description
```

## Default Content

### Quotes (15 total)
```typescript
const DEFAULT_QUOTES: Quote[] = [
  // Inspirational (5)
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "inspirational" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "inspirational" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "inspirational" },
  { text: "Everything you can imagine is real.", author: "Pablo Picasso", category: "inspirational" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "inspirational" },
  
  // Humorous (5)
  { text: "I'm not superstitious, but I am a little stitious.", author: "Michael Scott", category: "humorous" },
  { text: "I used to think I was indecisive, but now I'm not so sure.", author: "Unknown", category: "humorous" },
  { text: "The road to success is always under construction.", author: "Lily Tomlin", category: "humorous" },
  { text: "I am so clever that sometimes I don't understand a single word of what I am saying.", author: "Oscar Wilde", category: "humorous" },
  { text: "Behind every great man is a woman rolling her eyes.", author: "Jim Carrey", category: "humorous" },
  
  // Informational (5)
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "informational" },
  { text: "The only constant in life is change.", author: "Heraclitus", category: "informational" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien", category: "informational" },
  { text: "What we think, we become.", author: "Buddha", category: "informational" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "informational" }
];
```

## Styling Specifications

### Base Styles (All Variants)
```css
/* Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; overflow: hidden; }

/* Background */
.background {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: -2;
}

/* Content */
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

/* Domain */
.domain {
  font-size: clamp(2rem, 8vw, 5rem);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 1.5rem;
}

/* Quote */
.quote { max-width: 600px; }
.quote p {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.75rem;
  line-height: 1.6;
}
.quote cite {
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-style: normal;
  opacity: 0.7;
}
```

### Variant: Minimalist
```css
.background { filter: brightness(0.7) saturate(0.8); }
.overlay { background: rgba(0, 0, 0, 0.1); }
.domain { font-family: 'Playfair Display', serif; font-weight: 700; }
.quote p, .quote cite { font-family: 'Inter', sans-serif; }
```

### Variant: Modern
```css
.background { filter: brightness(0.75) saturate(0.9); }
.overlay { background: linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%); }
.domain { font-family: 'Inter', sans-serif; font-weight: 300; letter-spacing: 0.1em; }
.quote p { font-size: clamp(1.125rem, 2.5vw, 1.5rem); }
```

### Variant: Playful
```css
.background { filter: brightness(0.8) saturate(1.1); }
.domain { font-family: 'Playfair Display', serif; animation: fadeInUp 0.8s ease-out; }
.quote { animation: fadeInUp 0.8s ease-out 0.2s both; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## GitHub Actions

### deploy.yml
```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Required Secrets
| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Workers edit permission |

## Error Handling

| Condition | Behavior |
|-----------|----------|
| Missing image manifest | Return 500 with error message |
| Empty image manifest | Return 500 with error message |
| Image fetch fails | Use solid color fallback (#1a1a2e) |
| Missing quotes | Use fallback quote: "Coming soon..." — This Domain |
| Missing domain config | Use default style: "minimalist" |
| Invalid style value | Fall back to "minimalist" |

## Security Requirements

1. **Domain Sanitization**: Escape HTML entities in domain names before rendering
2. **No Eval**: Never use `eval()` or `Function()` constructor
3. **No User Input Storage**: Do not persist any request data
4. **Content-Type**: Always set `Content-Type: text/html;charset=UTF-8`
5. **No CORS Headers**: Not needed for HTML responses

## Testing Checklist

- [ ] Worker builds without TypeScript errors
- [ ] Worker responds with valid HTML
- [ ] Domain name is correctly extracted from various URL formats
- [ ] Domain name is properly sanitized (XSS prevention)
- [ ] Random image selection works
- [ ] Random quote selection works
- [ ] All three styles render correctly
- [ ] Fallback behavior works when KV is empty
- [ ] Mobile responsive layout
- [ ] CLI: upload-image works
- [ ] CLI: upload-images batch works
- [ ] CLI: set-style updates config
- [ ] CLI: add-quote appends to quotes
- [ ] CLI: init-quotes populates defaults
- [ ] GitHub Actions deploys successfully
- [ ] Deploy button creates working instance
