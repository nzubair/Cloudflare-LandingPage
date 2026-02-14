# Cloudflare-LandingPage

A Cloudflare Worker that serves placeholder pages for parked or in-development domains. Displays the domain name over a random background image with an inspirational quote.

## Features

- Single worker serves unlimited domains via wildcard routing
- Random background images stored in Workers KV (no external dependencies)
- Random quotes with author attribution
- Three style variants: minimalist (default), modern, playful
- Per-domain style configuration and enable/disable toggle
- CLI tools for image and content management
- Fully self-contained HTML responses (no extra asset requests besides Google Fonts)

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (installed as a project dependency)
- One or more domains added to your Cloudflare account (for production routing)

## Cloudflare Setup

Before deploying, complete these one-time steps in your Cloudflare account.

### 1. Create a Cloudflare API Token

1. Go to [Cloudflare Dashboard > My Profile > API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template (or create a custom token with `Workers Scripts:Edit` and `Workers KV Storage:Edit` permissions)
4. Save the token -- you will need it for both local CLI usage and GitHub Actions

### 2. Authenticate Wrangler locally

```bash
npx wrangler login
```

This opens a browser to authorize Wrangler with your Cloudflare account. Alternatively, set the token as an environment variable:

```bash
export CLOUDFLARE_API_TOKEN=your-token-here
```

### 3. Create KV namespaces

```bash
npx wrangler kv namespace create CONFIG
npx wrangler kv namespace create CONFIG --preview
npx wrangler kv namespace create IMAGES
npx wrangler kv namespace create IMAGES --preview
```

Each command outputs a namespace ID. Copy these into your `.env` file (see next section).

### 4. Add your domains (production)

Set the `WORKER_ROUTES` environment variable with a comma-separated list of `pattern:zone_name` pairs. Routes are injected into `wrangler.toml` at build time by `scripts/generate-config.js`.

In your `.env` file (for local deploys):

```
WORKER_ROUTES=*example.net/*:example.net,*anotherdomain.com/*:anotherdomain.com
```

Or as a GitHub Actions repository variable (see [Deploy via GitHub Actions](#option-b-deploy-via-github-actions)).

Each domain must be added to your Cloudflare account with DNS managed by Cloudflare. The wildcard pattern ensures the worker handles all paths and subdomains. When `WORKER_ROUTES` is empty or unset, no routes are added (useful for local dev).

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your KV namespace IDs from the previous step:

```
CONFIG_KV_NAMESPACE_ID=<id from CONFIG>
CONFIG_KV_PREVIEW_NAMESPACE_ID=<id from CONFIG --preview>
IMAGES_KV_NAMESPACE_ID=<id from IMAGES>
IMAGES_KV_PREVIEW_NAMESPACE_ID=<id from IMAGES --preview>
```

The `npm run dev` and `npm run deploy` commands automatically generate `wrangler.toml` from these values.

### 3. Initialize default content

```bash
npm run setup
```

This populates KV with 15 default quotes and an empty image manifest.

### 4. Upload at least one image

```bash
mkdir -p images
# Place a JPEG file in the images/ directory, then:
npm run upload-image -- --file ./images/photo.jpg --id nature-001 --category nature --description "Sample photo"
```

### 5. Start the local dev server

```bash
npm run dev
```

Wrangler starts a local server (typically at `http://localhost:8787`). Open it in your browser to see the placeholder page. The page displays `localhost` as the domain name, a random quote, and the uploaded background image. Refresh to see different quotes.

> **Note:** Local dev uses the `preview_id` KV namespaces. Production deployments use the `id` namespaces.

## Deploying to Production

### Option A: Deploy manually

```bash
npm run deploy
```

This deploys the worker to your Cloudflare account using the routes configured in `wrangler.toml`.

### Option B: Deploy via GitHub Actions

The repository includes a workflow at `.github/workflows/deploy.yml` that automatically deploys on every push to `main`.

To set it up:

1. **Fork or push** this repository to GitHub
2. Go to **Settings > Secrets and variables > Actions** in your GitHub repo
3. Add the following **repository secrets** (Settings > Secrets and variables > Actions > Secrets):
   - `CLOUDFLARE_API_TOKEN` -- your API token
   - `CONFIG_KV_NAMESPACE_ID` -- CONFIG namespace ID
   - `CONFIG_KV_PREVIEW_NAMESPACE_ID` -- CONFIG preview namespace ID
   - `IMAGES_KV_NAMESPACE_ID` -- IMAGES namespace ID
   - `IMAGES_KV_PREVIEW_NAMESPACE_ID` -- IMAGES preview namespace ID
4. Add the following **repository variable** (Settings > Secrets and variables > Actions > Variables):
   - `WORKER_ROUTES` -- (optional) comma-separated route entries, e.g. `*example.net/*:example.net`

   > **Why a variable instead of a secret?** Route patterns are not sensitive data, and repository variables are visible and editable in the GitHub UI. This makes it easy to review and update domain routes without having to replace a hidden secret value each time.

5. Push to `main` -- the workflow generates `wrangler.toml` from secrets/variables and deploys

You can also trigger a deploy manually from the **Actions** tab using the "Run workflow" button.

## CLI Tools

| Command | Description |
|---------|-------------|
| `npm run setup` | Initialize default quotes and empty image manifest |
| `npm run upload-image` | Upload a single JPEG image to KV |
| `npm run upload-images` | Batch upload all JPEGs from a directory |
| `npm run set-style` | Set style variant for a specific domain |
| `npm run add-quote` | Add a quote to the collection |
| `npm run list-images` | List all images stored in the manifest |

### Examples

```bash
# Upload a single image
npm run upload-image -- --file ./images/mountain.jpg --id nature-001 --category nature --description "Misty mountain"

# Batch upload all JPEGs in a directory
npm run upload-images -- --dir ./images/nature --category nature

# Set a domain to use the playful style
npm run set-style -- --domain example.net --style playful

# Add a custom quote
npm run add-quote -- --text "Stay hungry, stay foolish." --author "Steve Jobs" --category inspirational
```

## Style Variants

- **minimalist** -- Clean serif headings, subtle overlay (default)
- **modern** -- Light sans-serif headings, gradient overlay
- **playful** -- Animated fade-in, vibrant saturation

## Domain Configuration

Each domain can be individually configured via KV:

```bash
# Set style
npm run set-style -- --domain example.net --style modern
```

To disable the placeholder for a domain (returns 204 No Content), update the KV entry directly:

```bash
npx wrangler kv key put --binding=CONFIG --remote --preview false "domain:example.net" '{"style":"minimalist","enabled":false}'
```

## Project Structure

```
Cloudflare-LandingPage/
├── src/
│   ├── index.ts              # Worker entry point
│   ├── handlers/
│   │   └── placeholder.ts    # Request handler
│   ├── templates/
│   │   ├── base.ts           # HTML template
│   │   └── styles/           # CSS per variant
│   ├── services/
│   │   ├── config.ts         # Domain config from KV
│   │   ├── images.ts         # Image operations
│   │   └── quotes.ts         # Quote operations
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── utils/
│       ├── random.ts         # Random selection
│       └── sanitize.ts       # HTML sanitization
├── scripts/                  # CLI tools
├── wrangler.template.toml    # Wrangler config template
├── package.json
└── tsconfig.json
```

## License

MIT
