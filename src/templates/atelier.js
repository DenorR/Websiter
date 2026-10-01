export default {
  id: 'atelier', name: 'Ателье', tagline: 'Нежно, воздушно, женственно',
  best: 'Салоны красоты, spa, маникюр, брови, флористы, студии',
  categories: ['beauty'], brandable: false, sample: 'salon',
  palettes: [
    { id: 'nude', name: 'Нюд', bg: '#f6ede7', text: '#3a2a26', accent: '#b5654a', accent2: '#d9a58f' },
    { id: 'powder', name: 'Пудра', bg: '#fbeff0', text: '#3b2230', accent: '#c25a7a', accent2: '#e9b7c3' },
    { id: 'sage', name: 'Шалфей', bg: '#eef0ea', text: '#26332a', accent: '#6b8f71', accent2: '#c9d5c0' },
    { id: 'graphite', name: 'Графит и золото', bg: '#1b1a1c', text: '#f4ece6', accent: '#d3a56f', accent2: '#8d6a46' },
  ],
  fonts: { heading: 'tenor-sans', body: 'jost', accent: 'cormorant' },
  type: { h1: 'clamp(2.5rem, 6.2vw, 5.4rem)', h2: 'clamp(2rem, 4.2vw, 3.4rem)', h3: '1.2rem', weight: 400, track: '0em', leading: 1.08, case: 'none', fs: 17, em: { style: 'italic', weight: 500, color: 'accent', track: '0' } },
  shape: { radius: 2, buttonShape: 'pill', buttonStyle: 'outline', cards: 'flat', mediaShape: 'arch', btnCase: 'uppercase', btnTrack: '0.14em' },
  deco: { head: 'center', kicker: true, icons: 'line', density: 'airy', width: 'normal', alt: true, ticker: false, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'center', hero: 'split', features: 'cards', about: 'media', process: 'numbers', pricing: 'menu', faq: 'accordion', cta: 'big', manifesto: 'statement', gallery: 'strip', contact: 'split', footer: 'center' },
  art: 'leaves', band: 'accent',
  css: `
.hero-split .media{aspect-ratio:3/4}
.hero-split h1 em,.sh h2 em,.cta-big h2 em{font-size:1.12em;line-height:.9}
.links a,.kicker,.eyebrow,.btn{letter-spacing:.14em;text-transform:uppercase;font-size:.74rem}
.brand{font-size:1.45rem;letter-spacing:.14em;text-transform:uppercase}
.f-grid .card{text-align:center;border-top:1px solid var(--border);padding-top:2.2rem}
.f-grid .card .ic{align-self:center;margin-inline:auto}
.f-grid .card h3{font-size:1.35rem}
.p-num .big{-webkit-text-stroke-width:1px;font-weight:400}
.sh .sub{font-family:var(--font-accent);font-style:italic;font-size:1.45em;color:var(--muted)}
.sec.alt{background:color-mix(in srgb,var(--accent2) 18%,var(--bg))}
`,
};
