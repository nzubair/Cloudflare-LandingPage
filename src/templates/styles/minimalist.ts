export function getMinimalistCSS(): string {
  return `
    .background { filter: brightness(0.7) saturate(0.8); }
    .overlay { background: rgba(0, 0, 0, 0.1); }
    .domain { font-family: 'Playfair Display', serif; font-weight: 700; }
    .quote p, .quote cite { font-family: 'Inter', sans-serif; }
  `;
}
