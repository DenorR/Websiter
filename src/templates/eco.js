export default {
  id: 'eco', name: 'Эко', tagline: 'Природно, органично, спокойно',
  best: 'Фермы, эко-товары, йога, туризм, натуральная косметика, кемпинги',
  categories: ['health', 'food'], brandable: false, sample: 'eco',
  palettes: [
    { id: 'forest', name: 'Лес', bg: '#f1efe4', text: '#1f2b1a', accent: '#3f6b2c', accent2: '#d98e32' },
    { id: 'clay', name: 'Глина', bg: '#f5ece3', text: '#3a2a1f', accent: '#b0623a', accent2: '#6b8e4e' },
    { id: 'sea', name: 'Море', bg: '#eaf3f2', text: '#10303a', accent: '#1b7f8c', accent2: '#e8a33d' },
    { id: 'moss', name: 'Мох ночью', bg: '#121a14', text: '#e7eddc', accent: '#9ccc65', accent2: '#e0a458' },
  ],
  fonts: { heading: 'lora', body: 'nunito' },
  type: { h1: 'clamp(2.4rem, 5.8vw, 5rem)', h2: 'clamp(1.9rem, 4vw, 3.3rem)', h3: '1.25rem', weight: 600, track: '-0.02em', leading: 1.08, case: 'none', fs: 18, em: { style: 'italic', weight: 500, color: 'accent' } },
  shape: { radius: 24, buttonShape: 'pill', buttonStyle: 'solid', cards: 'fill', mediaShape: 'oval' },
  deco: { head: 'left', kicker: true, icons: 'line', density: 'normal', width: 'normal', alt: true, ticker: false, grain: true, motion: 'soft', brandDot: false },
  layouts: { nav: 'bar', hero: 'split', features: 'cards', about: 'media', process: 'timeline', pricing: 'cards', faq: 'accordion', cta: 'band', manifesto: 'statement', gallery: 'mosaic', contact: 'split', footer: 'simple' },
  art: 'contour', band: 'accent',
  css: `
.hero-split .media{aspect-ratio:4/5}
.f-grid .card{border-radius:calc(var(--radius) * 1.2)}
.kicker i::after{background:var(--accent)}
.cta-band{border-radius:calc(var(--radius) * 1.6)}
.ab-media .media{aspect-ratio:1}
.nav-cta{box-shadow:none}
`,
};
