import { StyleVariant } from "../../types";
import { getMinimalistCSS } from "./minimalist";
import { getModernCSS } from "./modern";
import { getPlayfulCSS } from "./playful";

export function getBaseCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow: hidden; }

    .background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      z-index: -2;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
      font-size: clamp(2rem, 8vw, 5rem);
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.5);
      margin-bottom: 1.5rem;
    }

    .quote {
      max-width: 600px;
      background: rgba(0, 0, 0, 0.35);
      padding: 1.5rem 2rem;
      border-radius: 0.5rem;
    }

    .quote p {
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      font-weight: 400;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }

    .quote cite {
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      font-style: normal;
      opacity: 0.85;
      display: block;
      text-align: right;
      font-style: italic;
    }

    .github-badge {
      display: inline-block;
      margin-top: 1.5rem;
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .github-badge:hover {
      color: rgba(255, 255, 255, 0.85);
    }

    .github-badge:focus,
    .github-badge:focus-visible {
      color: rgba(255, 255, 255, 0.85);
      outline: 2px solid #ffffff;
      outline-offset: 4px;
      border-radius: 2px;
    }

    .photo-credit {
      position: fixed;
      bottom: 0.75rem;
      right: 0.75rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(0, 0, 0, 0.4);
      padding: 0.25rem 0.6rem;
      border-radius: 1rem;
      z-index: 10;
    }

    .photo-credit a {
      color: rgba(255, 255, 255, 0.85);
      text-decoration: underline;
      text-decoration-color: rgba(255, 255, 255, 0.4);
    }

    .photo-credit a:hover {
      color: #ffffff;
      text-decoration-color: rgba(255, 255, 255, 0.7);
    }
    
    p.sub {
      font-size: 0.85rem;
      font-style: italic;
      margin-bottom: 12px;
  `;
}

export function getStyleCSS(style: StyleVariant): string {
  switch (style) {
    case "modern":
      return getModernCSS();
    case "playful":
      return getPlayfulCSS();
    case "minimalist":
    default:
      return getMinimalistCSS();
  }
}
