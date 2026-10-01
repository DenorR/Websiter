export default {
  id: 'consult', name: 'Консалт', tagline: 'Солидно, вдумчиво, с серифами',
  best: 'Юристы, бухгалтеры, финансы, страхование, B2B-услуги',
  categories: ['services'], brandable: true, sample: 'law',
  palettes: [
    { id: 'corporate', name: 'Корпоративный', bg: '#f5f6f8', text: '#0e1b32', accent: '#1f3a6d', accent2: '#b48a3c' },
    { id: 'bordeaux', name: 'Бордо', bg: '#f7f4f1', text: '#231012', accent: '#7a1f2b', accent2: '#b48a3c' },
    { id: 'emerald', name: 'Изумруд', bg: '#f3f6f4', text: '#0c1f19', accent: '#146b4f', accent2: '#b8913f' },
    { id: 'steel', name: 'Сталь', bg: '#eef1f4', text: '#101820', accent: '#2f4b66', accent2: '#e07a3a' },
  ],
  fonts: { heading: 'source-serif-4', body: 'golos-text' },
  type: { h1: 'clamp(2.4rem, 5.4vw, 4.6rem)', h2: 'clamp(1.9rem, 3.8vw, 3.1rem)', h3: '1.3rem', weight: 600, track: '-0.02em', leading: 1.06, case: 'none', fs: 17, em: { style: 'italic', weight: 500, color: 'accent' } },
  shape: { radius: 4, buttonShape: 'soft', buttonStyle: 'solid', cards: 'line', mediaShape: 'rect' },
  deco: { head: 'left', kicker: true, icons: 'line', density: 'normal', width: 'normal', alt: true, ticker: false, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'bar', hero: 'split', features: 'columns', about: 'split', process: 'timeline', pricing: 'table', faq: 'split', cta: 'band', manifesto: 'statement', gallery: 'grid', contact: 'split', footer: 'simple' },
  art: 'mono', band: 'text',
  css: `
.hero-split .media{aspect-ratio:1;background:var(--surface)}
.hero-split .media{border:1px solid var(--border)}
.f-cols .col{border-top:3px solid var(--accent)}
.f-cols h3{font-size:1.45rem}
.nav{border-bottom:1px solid var(--text)}
.kicker{font-size:.72rem}
.btn{font-weight:600}
.pr-table .price{color:var(--accent-fg)}
.cta-band{border-radius:var(--radius)}
.ab-text p:first-child{font-family:var(--font-head);font-size:1.45em;line-height:1.4}
`,
};
