export default {
  id: 'portfolio', name: 'Портфолио', tagline: 'Гигантская типографика и бегущая строка',
  best: 'Дизайн-студии, фотографы, агентства, музыканты, архитекторы',
  categories: ['creative', 'startup'], brandable: false, sample: 'studio',
  palettes: [
    { id: 'paper', name: 'Бумага', bg: '#fafafa', text: '#0a0a0a', accent: '#ff3d00', accent2: '#0a0a0a' },
    { id: 'noir', name: 'Нуар и лайм', bg: '#0a0a0a', text: '#f5f5f5', accent: '#d4ff00', accent2: '#7b2cff' },
    { id: 'violet', name: 'Фиолет', bg: '#f3efff', text: '#14082e', accent: '#7b2cff', accent2: '#ff3d81' },
    { id: 'sand', name: 'Песок', bg: '#efe9df', text: '#14110d', accent: '#1d3bff', accent2: '#ff7a45' },
  ],
  fonts: { heading: 'manrope', body: 'manrope' },
  type: { h1: 'clamp(3rem, 10.5vw, 10rem)', h2: 'clamp(2.4rem, 6.4vw, 5.6rem)', h3: '1.3rem', weight: 800, track: '-0.065em', leading: 0.9, case: 'none', fs: 17, em: { style: 'normal', weight: 800, color: 'accent' } },
  shape: { radius: 8, buttonShape: 'pill', buttonStyle: 'solid', cards: 'flat', mediaShape: 'rect' },
  deco: { head: 'split', kicker: true, icons: 'none', density: 'airy', width: 'wide', alt: false, ticker: true, grain: true, motion: 'rich', brandDot: true },
  layouts: { nav: 'menu', hero: 'center', features: 'rows', about: 'statement', process: 'numbers', pricing: 'table', faq: 'grid', cta: 'big', manifesto: 'statement', gallery: 'mosaic', contact: 'big', footer: 'big' },
  art: 'blocks', band: 'accent',
  css: `
.hero-center h1 em{color:transparent;-webkit-text-stroke:.025em var(--text)}
.hero-center{padding-bottom:clamp(28px,4vw,56px)}
.hero-center h1{max-width:10em}
.hero-center .band-media{aspect-ratio:21/8}
.hl-row{display:none}
.ticker{background:var(--accent);color:var(--on-accent);border:0;font-size:clamp(1.6rem,4vw,3.4rem);letter-spacing:-.04em}
.ticker span::after{background:var(--on-accent)}
.f-rows h3{font-size:calc(var(--h3) * 1.9 * var(--h-scale));letter-spacing:-.04em}
.f-rows li:hover{background:var(--accent);color:var(--on-accent);padding-left:clamp(14px,2vw,28px)}
.f-rows li:hover h3,.f-rows li:hover .go,.f-rows li:hover p,.f-rows li:hover .n{color:var(--on-accent)}
.mf p{font-size:calc(clamp(2.2rem,7vw,6.4rem) * var(--h-scale))}
.ab-state .big{letter-spacing:-.05em}
.p-num .big{-webkit-text-stroke:2px var(--text)}
.ct-mega{border-bottom-width:6px}
`,
};
