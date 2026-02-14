export function getPlayfulCSS(): string {
  return `
    .background { filter: brightness(0.8) saturate(1.1); }
    .domain { font-family: 'Playfair Display', serif; animation: fadeInUp 0.8s ease-out; }
    .quote { animation: fadeInUp 0.8s ease-out 0.2s both; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
}
