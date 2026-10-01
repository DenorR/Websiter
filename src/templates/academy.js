export default {
  id: 'academy', name: 'Академия', tagline: 'Понятно, структурно, с маркером',
  best: 'Онлайн-школы, репетиторы, курсы, тренинги, университеты',
  categories: ['edu', 'startup'], brandable: true, sample: 'courses',
  palettes: [
    { id: 'royal', name: 'Королевский', bg: '#f5f7ff', text: '#101a3a', accent: '#2b4bff', accent2: '#ffc933' },
    { id: 'forest', name: 'Лес', bg: '#f3f6ef', text: '#14271a', accent: '#1f7a4d', accent2: '#ffb84d' },
    { id: 'plum', name: 'Слива', bg: '#faf5fb', text: '#2a1233', accent: '#7a2e8e', accent2: '#ffcf5a' },
    { id: 'ink', name: 'Тушь', bg: '#ffffff', text: '#0b0f1a', accent: '#0b0f1a', accent2: '#ff7a45' },
  ],
  fonts: { heading: 'rubik', body: 'inter' },
  type: { h1: 'clamp(2.2rem, 4.5vw, 4rem)', h2: 'clamp(1.9rem, 3.8vw, 3.2rem)', h3: '1.18rem', weight: 700, track: '-0.03em', leading: 1.06, case: 'none', fs: 17, em: { style: 'normal', weight: 700, color: 'inherit' } },
  shape: { radius: 14, buttonShape: 'soft', buttonStyle: 'solid', cards: 'line', mediaShape: 'rect' },
  deco: { head: 'left', kicker: true, icons: 'badge', density: 'normal', width: 'normal', alt: true, ticker: false, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'bar', hero: 'split', features: 'cards', about: 'split', process: 'timeline', pricing: 'cards', faq: 'split', cta: 'band', manifesto: 'statement', gallery: 'grid', contact: 'split', footer: 'simple' },
  art: 'dots', band: 'text',
  css: `
em{background:linear-gradient(transparent 60%,color-mix(in srgb,var(--accent-2) 75%,transparent) 60%);padding:0 .08em;border-radius:2px}
.hero-split .media{aspect-ratio:1;background:var(--surface);border:1px solid var(--border)}
.f-grid .card:hover{border-color:var(--accent)}
.kicker{color:var(--accent-fg)}
.kicker i::after{display:none}
.plan .price{color:var(--text)}
.cta-band em{background:linear-gradient(transparent 60%,color-mix(in srgb,var(--accent-2) 80%,transparent) 60%);color:var(--on-band)}
.p-line .dot{background:var(--accent);color:var(--on-accent);border:0}
`,
};
