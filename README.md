# Domain Placeholder Worker

A Cloudflare Worker that serves placeholder pages for parked or in-development domains. Displays the domain name over a random background image with an inspirational quote.

## Features

- Single worker serves unlimited domains via wildcard routing
- Random background images stored in Workers KV (no external dependencies)
- Random quotes with author attribution
- Three style variants: minimalist (default), modern, playful
- Per-domain style configuration
- CLI tools for image and content management
- Fully self-contained HTML responses (no extra asset requests besides Google Fonts)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create KV namespaces

```bash
wrangler kv:namespace create CONFIG
wrangler kv:namespace create IMAGES
wrangler kv:namespace create CONFIG --preview
wrangler kv:namespace create IMAGES --preview
```

Update `wrangler.toml` with the returned namespace IDs.

### 3. Initialize default content

```bash
npm run setup
```

### 4. Upload images

```bash
# Single image
npm run upload-image -- --file ./images/mountain.jpg --id nature-001 --category nature --description "Misty mountain"

# Batch upload
npm run upload-images -- --dir ./images/nature --category nature
```

### 5. Run locally

```bash
npm run dev
```

### 6. Deploy

```bash
npm run deploy
```

## CLI Tools

| Command | Description |
|---------|-------------|
| `npm run setup` | Initialize default quotes and image manifest |
| `npm run upload-image` | Upload a single image to KV |
| `npm run upload-images` | Batch upload images from a directory |
| `npm run set-style` | Set style variant for a domain |
| `npm run add-quote` | Add a quote to the collection |
| `npm run list-images` | List all stored images |

## Style Variants

- **minimalist** — Clean serif headings, subtle overlay (default)
- **modern** — Light sans-serif headings, gradient overlay
- **playful** — Animated fade-in, vibrant saturation

Set per domain:

```bash
npm run set-style -- --domain example.net --style playful
```

## Configuration

### Environment Variables

Copy `.env.example` and fill in your values:

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Workers edit permission |
| `CONFIG_KV_NAMESPACE_ID` | KV namespace ID for config data |
| `IMAGES_KV_NAMESPACE_ID` | KV namespace ID for image data |

### Routes

Configure domain routing in `wrangler.toml`:

```toml
routes = [
  { pattern = "*example.net/*", zone_name = "example.net" }
]
```

## GitHub Actions

Automated deployment on push to `main`. Add `CLOUDFLARE_API_TOKEN` to your repository secrets.

## License

MIT
