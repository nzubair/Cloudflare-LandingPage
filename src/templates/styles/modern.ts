export function getModernCSS(): string {
  return `
    .background { filter: brightness(0.75) saturate(0.9); }
    .overlay { background: linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%); }
    .domain { font-family: 'Inter', sans-serif; font-weight: 300; letter-spacing: 0.1em; }
    .quote p { font-size: clamp(1.125rem, 2.5vw, 1.5rem); }
  `;
}
