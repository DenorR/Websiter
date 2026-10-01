export default {
  id: 'editorial', name: 'Журнал', tagline: 'Глянец, антиква, буквицы',
  best: 'Эксперты, коучи, авторы, медиа, школы с характером',
  categories: ['creative', 'edu', 'services'], brandable: false, sample: 'magazine',
  palettes: [
    { id: 'newsprint', name: 'Газета', bg: '#f4eee1', text: '#1a1712', accent: '#b3261e', accent2: '#1a1712' },
    { id: 'ivory', name: 'Слоновая кость', bg: '#fbf8f1', text: '#14213d', accent: '#c8553d', accent2: '#14213d' },
    { id: 'night', name: 'Ночной выпуск', bg: '#101216', text: '#ece6d8', accent: '#e0b84e', accent2: '#c8553d' },
    { id: 'mono', name: 'Чёрное на белом', bg: '#ffffff', text: '#0d0d0d', accent: '#0d0d0d', accent2: '#6b6b6b' },
  ],
  fonts: { heading: 'playfair-display', body: 'literata', accent: 'playfair-display' },
  type: { h1: 'clamp(2.8rem, 7.2vw, 6.4rem)', h2: 'clamp(2rem, 4.4vw, 3.6rem)', h3: '1.3rem', weight: 600, track: '-0.025em', leading: 1.02, case: 'none', fs: 18, em: { style: 'italic', weight: 500, color: 'accent' } },
  shape: { radius: 0, buttonShape: 'square', buttonStyle: 'outline', cards: 'line', mediaShape: 'rect', btnCase: 'uppercase', btnTrack: '0.12em' },
  deco: { head: 'center', kicker: true, icons: 'numeral', density: 'normal', width: 'normal', alt: true, ticker: false, grain: true, motion: 'soft', brandDot: false, leadFont: 'head' },
  layouts: { nav: 'center', hero: 'center', features: 'columns', about: 'statement', process: 'timeline', pricing: 'menu', faq: 'accordion', cta: 'band', manifesto: 'statement', gallery: 'mosaic', contact: 'split', footer: 'center' },
  art: 'lines', band: 'text',
  css: `
.nav{border-bottom:3px double var(--text)}
.nav-center .brand{font-size:2rem;font-style:italic;font-weight:600}
.links a{font-size:.78rem;text-transform:uppercase;letter-spacing:.14em;font-weight:600}
.btn{font-size:.78rem;font-weight:600}
.hero-center{padding-top:clamp(40px,6vw,80px)}
.hero-center .eyebrow{display:block;border-block:1px solid var(--text);padding:.7rem 0;max-width:34rem;margin-inline:auto;text-align:center;color:var(--text)}
.hero-center h1{font-size:calc(var(--h1) * 1.08 * var(--h-scale));max-width:13em}
.hero-center .lead{font-family:var(--font-lead);font-style:italic;font-size:1.3em}
.ab-state .big::first-letter{float:left;font-size:4.8em;line-height:.78;padding:.05em .1em 0 0;color:var(--accent-fg);font-weight:600}
.sh .sub{font-style:italic;font-family:var(--font-head);font-size:1.25em}
.sec.alt{border-block:1px solid var(--border)}
.f-cols .n{font-family:var(--font-head);font-size:2.6rem;letter-spacing:0;font-weight:500;margin-bottom:1rem;line-height:1}
.f-cols .col{border-top:3px double var(--text)}
`,
};
