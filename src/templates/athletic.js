export default {
  id: 'athletic', name: 'Энергия', tagline: 'Скорость, контраст, курсив',
  best: 'Фитнес-клубы, секции, единоборства, туры, спортивные бренды',
  categories: ['sport', 'events'], brandable: false, sample: 'gym',
  palettes: [
    { id: 'lime', name: 'Лайм', bg: '#0a0a0a', text: '#ffffff', accent: '#c6ff00', accent2: '#ff3d00' },
    { id: 'fire', name: 'Огонь', bg: '#101010', text: '#ffffff', accent: '#ff5722', accent2: '#ffc107' },
    { id: 'electric', name: 'Электрик', bg: '#0b1020', text: '#ffffff', accent: '#00e5ff', accent2: '#ff2d95' },
    { id: 'clean', name: 'Светлый', bg: '#ffffff', text: '#0a0a0a', accent: '#ff3d00', accent2: '#0a0a0a' },
  ],
  fonts: { heading: 'roboto-condensed', body: 'inter' },
  type: { h1: 'clamp(3rem, 9vw, 8.2rem)', h2: 'clamp(2.2rem, 5.4vw, 4.6rem)', h3: '1.35rem', weight: 800, track: '-0.01em', leading: 0.9, case: 'uppercase', fs: 17, em: { style: 'normal', weight: 800, color: 'accent' } },
  shape: { radius: 0, buttonShape: 'square', buttonStyle: 'solid', cards: 'fill', mediaShape: 'rect', btnCase: 'uppercase', btnTrack: '0.06em' },
  deco: { head: 'left', kicker: true, icons: 'numeral', density: 'normal', width: 'normal', alt: false, ticker: true, grain: false, motion: 'rich', brandDot: false },
  layouts: { nav: 'bar', hero: 'fullbleed', features: 'bento', about: 'statement', process: 'numbers', pricing: 'cards', faq: 'accordion', cta: 'band', manifesto: 'statement', gallery: 'mosaic', contact: 'split', footer: 'big' },
  art: 'stripes', band: 'accent',
  css: `
h1,h2,.ticker,.f-bento h3,.cta-band h2{font-style:italic}
.btn{font-weight:800}
.hero-full .hero-bg .art{opacity:.95;width:min(64%,980px)}
.hero-full h1{max-width:8.5em;font-size:calc(var(--h1) * var(--h-scale))}
.ticker{background:var(--accent);color:var(--on-accent);border:0}
.ticker span::after{background:var(--on-accent)}
.kicker{color:var(--accent-fg)}
.f-bento .tile:nth-child(1){background:var(--accent);color:var(--on-accent)}
.f-bento .tile:nth-child(3){background:var(--surface);color:var(--text)}
.p-num .big{-webkit-text-stroke:2px var(--accent-fg);font-style:italic}
.ab-state .big{font-style:italic}
.cta-band{border-radius:0;clip-path:polygon(0 0,100% 0,100% 82%,96% 100%,0 100%)}
.cta-band{background:var(--accent);color:var(--on-accent)}
.cta-band .btn-primary{background:var(--text)!important;color:var(--bg)!important;border-color:var(--text)!important}
.cta-band em{color:var(--on-accent);text-decoration:underline;text-decoration-thickness:.08em;text-underline-offset:.1em}
`,
};
