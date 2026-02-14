import { Quote, StyleVariant } from "../types";
import { sanitizeDomain } from "../utils/sanitize";
import { getBaseCSS, getStyleCSS } from "./styles";

export function generateHTML(
  domain: string,
  imageBase64: string,
  quote: Quote,
  style: StyleVariant
): string {
  const safeDomain = sanitizeDomain(domain);
  const safeText = sanitizeDomain(quote.text);
  const safeAuthor = sanitizeDomain(quote.author);

  const isValidBase64 = imageBase64 && /^[A-Za-z0-9+/=]+$/.test(imageBase64);
  const backgroundStyle = isValidBase64
    ? `background-image: url('data:image/jpeg;base64,${imageBase64}')`
    : `background-color: #1a1a2e`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeDomain}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
  <style>
    ${getBaseCSS()}
    ${getStyleCSS(style)}
  </style>
</head>
<body>
  <div class="background" style="${backgroundStyle}"></div>
  <div class="overlay"></div>
  <main class="content" aria-label="Placeholder page for ${safeDomain}">
    <h1 class="domain">${safeDomain}</h1>
    <blockquote class="quote">
      <p>&ldquo;${safeText}&rdquo;</p>
      <cite>&mdash; ${safeAuthor}</cite>
    </blockquote>
  </main>
  <a class="github-badge" href="https://github.com/nzubair/Cloudflare-LandingPage" target="_blank" rel="noopener noreferrer" aria-label="Fork on GitHub (opens in new tab)">Fork on GitHub</a>
</body>
</html>`;
}
