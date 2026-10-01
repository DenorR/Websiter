export default {
  id: 'bistro', name: 'Бистро', tagline: 'Тепло, аппетитно, с арками',
  best: 'Кафе, рестораны, пекарни, бары, кондитерские, доставка еды',
  categories: ['food'], brandable: false, sample: 'bistro',
  palettes: [
    { id: 'tomato', name: 'Томат', bg: '#f5ead8', text: '#2a1d14', accent: '#b8321f', accent2: '#e0a33a' },
    { id: 'olive', name: 'Оливка', bg: '#eef0df', text: '#1f2a14', accent: '#5b7a1f', accent2: '#d98a2b' },
    { id: 'cream', name: 'Сливки', bg: '#fff8ec', text: '#3a1d12', accent: '#d9822b', accent2: '#6b8e4e' },
    { id: 'aubergine', name: 'Баклажан', bg: '#2a1233', text: '#f6e8f0', accent: '#ff9e5e', accent2: '#c85fa0' },
  ],
  fonts: { heading: 'yeseva-one', body: 'onest', accent: 'yeseva-one' },
  type: { h1: 'clamp(2.6rem, 6.4vw, 5.6rem)', h2: 'clamp(2rem, 4.2vw, 3.5rem)', h3: '1.3rem', weight: 400, track: '-0.01em', leading: 1.04, case: 'none', fs: 17, em: { style: 'normal', weight: 400, color: 'accent' } },
  shape: { radius: 22, buttonShape: 'pill', buttonStyle: 'solid', cards: 'line', mediaShape: 'arch' },
  deco: { head: 'center', kicker: false, icons: 'line', density: 'normal', width: 'normal', alt: true, ticker: false, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'center', hero: 'split', features: 'cards', about: 'media', process: 'cards', pricing: 'menu', faq: 'accordion', cta: 'band', manifesto: 'statement', gallery: 'mosaic', contact: 'split', footer: 'simple' },
  art: 'arches', band: 'accent',
  css: `
.brand{font-size:1.6rem}
.hero-split .media{aspect-ratio:3/4}
.hero-split h1{max-width:9em}
.f-grid .card{text-align:center;border-radius:calc(var(--radius) * 1.4)}
.f-grid .card .ic{align-self:center;margin-inline:auto}
.p-cards li{text-align:center}.p-cards .step-n{margin-inline:auto}
.pr-menu{counter-reset:none}
.m-dots{border-bottom-style:dotted;border-bottom-width:3px}
.m-price{font-size:1.3rem}
.cta-band{border-radius:calc(var(--radius) * 1.6)}
.hl-row{border-top:2px dotted var(--border)}
.sh .sub{font-size:1.15em}
`,
};
