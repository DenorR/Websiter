export default {
  id: 'estate', name: 'Резиденция', tagline: 'Пространство, свет, тишина',
  best: 'Недвижимость, архитекторы, интерьеры, отели, девелоперы',
  categories: ['realty', 'beauty'], brandable: false, sample: 'estate',
  palettes: [
    { id: 'stone', name: 'Камень', bg: '#efece6', text: '#1d1b18', accent: '#8c6f4e', accent2: '#1d1b18' },
    { id: 'white', name: 'Белый дом', bg: '#ffffff', text: '#121212', accent: '#1f4d3a', accent2: '#c8a97e' },
    { id: 'dark', name: 'Тёмная гостиная', bg: '#1a1a18', text: '#ebe6dc', accent: '#c8a97e', accent2: '#8c6f4e' },
    { id: 'graphite', name: 'Графит', bg: '#e8e8e6', text: '#161616', accent: '#3a4a5a', accent2: '#b08d57' },
  ],
  fonts: { heading: 'eb-garamond', body: 'inter' },
  type: { h1: 'clamp(3rem, 8vw, 7.2rem)', h2: 'clamp(2.2rem, 5vw, 4.2rem)', h3: '1.55rem', weight: 400, track: '-0.025em', leading: 0.98, case: 'none', fs: 17, em: { style: 'italic', weight: 400, color: 'accent' } },
  shape: { radius: 0, buttonShape: 'square', buttonStyle: 'outline', cards: 'flat', mediaShape: 'rect', btnCase: 'uppercase', btnTrack: '0.14em' },
  deco: { head: 'split', kicker: true, icons: 'numeral', density: 'airy', width: 'wide', alt: false, ticker: false, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'menu', hero: 'fullbleed', features: 'rows', about: 'media', process: 'numbers', pricing: 'table', faq: 'split', cta: 'big', manifesto: 'statement', gallery: 'strip', contact: 'big', footer: 'big' },
  art: 'lines', band: 'text',
  css: `
.brand{font-size:1.5rem;font-weight:400;letter-spacing:.02em}
.btn,.kicker,.eyebrow,.burger{letter-spacing:.14em;text-transform:uppercase;font-size:.74rem}
.hero-full h1{font-size:calc(var(--h1) * var(--h-scale));max-width:10em}
.f-rows h3{font-weight:400}
.p-num .big{-webkit-text-stroke:1px var(--accent-fg);font-weight:400}
.ab-media .media{aspect-ratio:3/4}
.ft-mega{font-weight:400;letter-spacing:-.03em}
.sh .sub{font-size:1.15em}
`,
};
