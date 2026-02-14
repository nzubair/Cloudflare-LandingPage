# Product Requirements Document (PRD)
## Domain Placeholder Worker

**Version:** 1.0  
**Date:** February 2026  
**License:** MIT  

---

## 1. Executive Summary

Domain Placeholder Worker is a Cloudflare Worker application that serves as a generic, visually appealing placeholder page for parked or in-development domains. It dynamically displays the domain name with a random background image and inspirational/humorous quote, requiring minimal configuration to deploy across multiple domains.

---

## 2. Problem Statement

Domain owners managing multiple domains often need a quick, professional-looking placeholder page while a site is under development, parked, or transitioning. Current solutions require:
- Setting up individual hosting for each domain
- Creating and maintaining separate placeholder pages
- Managing multiple deployments

**Solution:** A single Cloudflare Worker that can serve unlimited domains with a visually appealing, randomized placeholder page that automatically displays the current domain name.

---

## 3. Goals

### In Scope
- Single worker deployment serving multiple domains
- Dynamic domain name display in `{domain}` format
- Random background images from a curated set (nature, abstract, cityscape)
- Random quotes with author attribution
- Multiple configurable visual styles (minimalist, modern, playful)
- Per-domain style configuration via KV
- Easy deployment via GitHub Actions or "Deploy to Cloudflare" button
- CLI tooling for image management
- Open-source friendly design

### Out of Scope (Non-Goals)
- Analytics (rely on Cloudflare dashboard)
- Contact forms or interactive elements
- HTTPS redirects (handled by Cloudflare)
- Caching configuration (handled by Cloudflare)
- Multi-account management (v1)
- Custom quote/image sets per domain (v1)

---

## 4. User Stories

### Domain Owner
- **US-1:** As a domain owner, I want to point my domain to a placeholder so visitors see a professional page instead of an error.
- **US-2:** As a domain owner, I want the placeholder to automatically display my domain name without manual configuration.
- **US-3:** As a domain owner, I want to choose a visual style that matches my brand aesthetic.
- **US-4:** As a domain owner, I want variety in the displayed content so repeat visitors see different quotes/images.

### Developer/Deployer
- **US-5:** As a developer, I want to deploy this worker to my Cloudflare account with minimal configuration.
- **US-6:** As a developer, I want to easily add new images to the rotation.
- **US-7:** As a developer, I want to configure domain-specific styles without redeploying the worker.
- **US-8:** As a developer, I want clear documentation for both automated and manual deployment.

---

## 5. Technical Requirements

### 5.1 Platform
- **Runtime:** Cloudflare Workers
- **Storage:** Cloudflare Workers KV
- **Language:** JavaScript/TypeScript
- **Build Tool:** Wrangler CLI

### 5.2 KV Namespaces
Two KV namespaces are required:

| Namespace | Purpose | Key Pattern | Value Type |
|-----------|---------|-------------|------------|
| `IMAGES` | Store background images | `image:{id}` | Binary (base64) |
| `CONFIG` | Store configuration | `domain:{domain}`, `quotes`, `image-manifest` | JSON |

### 5.3 Performance Requirements
- **Response Time:** < 100ms (excluding image load)
- **Availability:** 99.9% (Cloudflare SLA)
- **Image Size:** Optimized JPEGs, < 500KB each

### 5.4 Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Mobile responsive

---

## 6. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────────────────────────────┐    │
│  │   Incoming  │    │         Domain Placeholder          │    │
│  │   Request   │───▶│             Worker                  │    │
│  │ domain.net  │    │                                     │    │
│  └─────────────┘    │  1. Extract domain from request     │    │
│                     │  2. Lookup style config (KV)        │    │
│                     │  3. Select random image (KV)        │    │
│                     │  4. Select random quote (KV)        │    │
│                     │  5. Render HTML response            │    │
│                     └──────────────┬──────────────────────┘    │
│                                    │                            │
│                     ┌──────────────▼──────────────────────┐    │
│                     │          Workers KV                  │    │
│                     │  ┌─────────┐  ┌─────────────────┐   │    │
│                     │  │ IMAGES  │  │     CONFIG      │   │    │
│                     │  │  (bin)  │  │     (JSON)      │   │    │
│                     │  └─────────┘  └─────────────────┘   │    │
│                     └──────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow
1. Request arrives at Cloudflare edge for `*.domain.net/*`
2. Worker extracts hostname from request
3. Worker queries CONFIG KV for domain-specific style (fallback to default)
4. Worker queries CONFIG KV for image manifest and selects random image ID
5. Worker queries IMAGES KV for the selected image (base64)
6. Worker queries CONFIG KV for quotes array and selects random quote
7. Worker generates HTML with embedded image and returns response

---

## 7. Data Models

### 7.1 Domain Configuration
```json
// Key: domain:example.net
{
  "style": "minimalist",
  "enabled": true
}
```

### 7.2 Image Manifest
```json
// Key: image-manifest
{
  "images": [
    {
      "id": "nature-001",
      "category": "nature",
      "description": "Misty mountain forest"
    },
    {
      "id": "abstract-001", 
      "category": "abstract",
      "description": "Geometric patterns"
    },
    {
      "id": "city-001",
      "category": "cityscape",
      "description": "Night skyline"
    }
  ]
}
```

### 7.3 Quotes
```json
// Key: quotes
{
  "quotes": [
    {
      "text": "The only way to do great work is to love what you do.",
      "author": "Steve Jobs",
      "category": "inspirational"
    },
    {
      "text": "I'm not superstitious, but I am a little stitious.",
      "author": "Michael Scott",
      "category": "humorous"
    }
  ]
}
```

### 7.4 Image Storage
```
// Key: image:nature-001
// Value: base64 encoded JPEG binary data
```

---

## 8. UI/UX Design

### 8.1 Layout Specification

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              [Full-bleed background image]                 │
│                   (1920x1080, muted)                       │
│                                                            │
│                                                            │
│                                                            │
│                      domain.net                            │
│                   ─────────────────                        │
│               "Quote text goes here..."                    │
│                     — Author Name                          │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 8.2 Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Domain | Serif (Playfair Display) | 4-6rem | 700 | #FFFFFF |
| Quote | Sans-serif (Inter) | 1.25rem | 400 | #FFFFFF (90% opacity) |
| Author | Sans-serif (Inter) | 1rem | 400 | #FFFFFF (70% opacity) |

### 8.3 Visual Effects
- Background image: `filter: brightness(0.7) saturate(0.8)`
- Text shadow: `0 2px 4px rgba(0,0,0,0.3)`
- Centered both vertically and horizontally
- Responsive scaling for mobile

---

## 9. Style Variations

### 9.1 Minimalist (Default)
- Clean, muted background
- Simple centered text
- Subtle text shadows
- Serif font for domain
- High contrast white text

### 9.2 Modern
- Slightly brighter images
- Sans-serif throughout
- Thin font weights
- Subtle gradient overlay
- Larger quote text

### 9.3 Playful
- More saturated backgrounds
- Rounded, friendly typography
- Slight text animation on load
- Warmer color temperature
- Decorative elements (optional)

---

## 10. Content

### 10.1 Initial Quote Set (15 quotes)

**Inspirational:**
1. "The only way to do great work is to love what you do." — Steve Jobs
2. "In the middle of difficulty lies opportunity." — Albert Einstein
3. "The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt
4. "Everything you can imagine is real." — Pablo Picasso
5. "The best time to plant a tree was 20 years ago. The second best time is now." — Chinese Proverb

**Humorous:**
6. "I'm not superstitious, but I am a little stitious." — Michael Scott
7. "I used to think I was indecisive, but now I'm not so sure." — Unknown
8. "The road to success is always under construction." — Lily Tomlin
9. "I am so clever that sometimes I don't understand a single word of what I am saying." — Oscar Wilde
10. "Behind every great man is a woman rolling her eyes." — Jim Carrey

**Informational/Thoughtful:**
11. "Simplicity is the ultimate sophistication." — Leonardo da Vinci
12. "The only constant in life is change." — Heraclitus
13. "Not all those who wander are lost." — J.R.R. Tolkien
14. "What we think, we become." — Buddha
15. "The journey of a thousand miles begins with a single step." — Lao Tzu

### 10.2 Image Categories
- **Nature:** Mountains, forests, oceans, landscapes (muted tones)
- **Abstract:** Geometric patterns, gradients, textures
- **Cityscape:** Skylines, architecture, urban scenes (evening/night preferred)

### 10.3 Image Requirements
- Resolution: 1920×1080 pixels
- Format: JPEG (optimized)
- Max file size: 500KB
- Color profile: sRGB
- Composition: Avoid busy center areas (text overlay zone)

---

## 11. Deployment

### 11.1 Prerequisites
- Cloudflare account with Workers enabled
- Node.js 20+ installed
- Wrangler CLI installed (`npm install -g wrangler`)
- GitHub account (for CI/CD)

### 11.2 Quick Deploy Options

**Option A: Deploy to Cloudflare Button**
- One-click deployment from GitHub README
- Guided setup through Cloudflare dashboard
- Automatic KV namespace creation

**Option B: GitHub Actions CI/CD**
- Fork repository
- Add `CLOUDFLARE_API_TOKEN` secret
- Push to trigger deployment

**Option C: Manual Wrangler Deploy**
```bash
git clone <repo>
cd domain-placeholder-worker
npm install
wrangler kv:namespace create IMAGES
wrangler kv:namespace create CONFIG
npm run setup  # Initialize default quotes and manifest
npm run deploy
```

### 11.3 Route Configuration
Configure wildcard routes in `wrangler.toml`:
```toml
routes = [
  { pattern = "*example.net/*", zone_name = "example.net" },
  { pattern = "*another-domain.com/*", zone_name = "another-domain.com" }
]
```

---

## 12. CLI Tooling

### 12.1 Image Upload CLI
```bash
# Upload single image
npm run upload-image -- --file ./images/mountain.jpg --id nature-001 --category nature

# Upload all images in directory
npm run upload-images -- --dir ./images

# List all images
npm run list-images
```

### 12.2 Configuration CLI
```bash
# Set domain style
npm run set-style -- --domain example.net --style playful

# View current configuration
npm run show-config -- --domain example.net

# Add a quote
npm run add-quote -- --text "Quote here" --author "Author" --category inspirational
```

---

## 13. Future Considerations (v2+)

- **Custom content per domain:** Allow domains to specify their own quote/image sets
- **Scheduling:** Different content based on time of day
- **A/B testing:** Multiple style variants per domain
- **Custom messages:** Override the quote with a custom message per domain
- **Multi-language support:** Localized quotes based on visitor location
- **Coming soon mode:** Countdown timer variant
- **Email capture:** Optional newsletter signup (with privacy considerations)

---

## 14. Success Metrics

- Successful deployment across 5+ domains
- < 100ms average response time
- Zero configuration errors after initial setup
- Positive feedback from open-source community (stars, forks)

---

## 15. Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Setup | Day 1 | Project structure, wrangler config |
| Core Worker | Days 2-3 | Main worker logic, HTML generation |
| KV Integration | Day 4 | Image/config storage and retrieval |
| Styling | Day 5 | Three style variations |
| CLI Tools | Day 6 | Image upload and config management |
| Documentation | Day 7 | README, deployment guide |
| CI/CD | Day 8 | GitHub Actions, deploy button |
| Testing | Days 9-10 | Cross-browser, multiple domains |

---

## Appendix A: Reference Design

The reference design shows:
- Full-bleed muted nature background (forest/mountain scene)
- Centered white text
- Domain name displayed prominently
- Quote in smaller text below
- Clean, minimal aesthetic with no other UI elements

## Appendix B: Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Image Storage | Workers KV | No external dependencies, binary support, edge-cached |
| Config Storage | Workers KV | Same namespace simplicity, JSON support |
| Styling | Inline CSS | Single response, no additional requests |
| Fonts | Google Fonts | Wide browser support, professional typography |
| Build | esbuild (via Wrangler) | Fast, native Wrangler support |
