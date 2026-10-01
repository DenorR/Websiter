export default {
  id: 'noir',
  name: 'Нуар',
  tagline: 'Тёмная роскошь, золото, тишина',
  best: 'Барбершопы, рестораны, ювелирка, отели, премиум-услуги',
  categories: ['food', 'beauty', 'realty'],
  brandable: false,
  sample: 'barber',
  palettes: [
    { id: 'noir', name: 'Нуар', bg: '#0d0c0a', text: '#efe7d6', accent: '#c9a45c', accent2: '#8a6b2e' },
    { id: 'emerald', name: 'Изумруд', bg: '#0a1411', text: '#e6efe8', accent: '#b9a46a', accent2: '#4f8f74' },
    { id: 'bordeaux', name: 'Бордо', bg: '#150b0d', text: '#f0e4df', accent: '#d4a373', accent2: '#a4323f' },
    { id: 'ivory', name: 'Слоновая кость', bg: '#f4eee2', text: '#1a1713', accent: '#8a6a2a', accent2: '#3b2f1a' },
  ],
  fonts: { heading: 'cormorant', body: 'jost', accent: 'cormorant' },
  type: { h1: 'clamp(3rem, 8.4vw, 8rem)', h2: 'clamp(2.2rem, 5vw, 4.4rem)', h3: '1.5rem', weight: 500, track: '-0.01em', leading: 0.98, case: 'none', fs: 17, em: { style: 'italic', weight: 500, color: 'accent' } },
  shape: { radius: 0, buttonShape: 'square', buttonStyle: 'outline', cards: 'line', mediaShape: 'rect', btnCase: 'uppercase', btnTrack: '0.16em' },
  deco: { head: 'center', kicker: true, icons: 'numeral', density: 'airy', width: 'normal', alt: false, ticker: false, grain: true, motion: 'soft', brandDot: false },
  layouts: { nav: 'center', hero: 'fullbleed', features: 'columns', about: 'media', process: 'timeline', pricing: 'menu', faq: 'accordion', cta: 'big', manifesto: 'statement', gallery: 'strip', contact: 'split', footer: 'center' },
  art: 'contour',
  band: 'surface2',
  css: `
.links a,.btn,.kicker,.eyebrow{text-transform:uppercase;letter-spacing:.16em;font-size:.76rem}
.btn{font-weight:500;padding:1.15em 2em}
.brand{font-size:1.7rem;font-weight:500;letter-spacing:.02em}
.hero-full::after{content:"";position:absolute;inset:clamp(14px,2vw,28px);border:1px solid color-mix(in srgb,var(--accent) 50%,transparent);pointer-events:none}
.hero-full h1{max-width:9em}
.hero-full .hero-bg .art{width:min(60%,900px)}
.hero-full .container{padding-left:clamp(10px,2vw,28px)}
.hl strong{font-family:var(--font-head);font-size:1.25rem;font-weight:500;text-transform:none;letter-spacing:0}
.f-cols .col{border-top:1px solid var(--accent)}
.f-cols h3{font-size:1.7rem}
.sh .kicker{justify-content:center}
.pr-menu h3{font-size:1.6rem}
.faq-acc summary{font-size:1.6rem}
`,
};
