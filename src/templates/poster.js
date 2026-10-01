export default {
  id: 'poster', name: 'Плакат', tagline: 'Громко, ярко, с жёсткими тенями',
  best: 'Молодёжные бренды, ивенты, уличная мода, фестивали, студии',
  categories: ['creative', 'sport', 'events'], brandable: false, sample: 'streetwear',
  palettes: [
    { id: 'pop', name: 'Поп', bg: '#f6f0e4', text: '#111111', accent: '#ff4d2e', accent2: '#ffd400' },
    { id: 'electric', name: 'Электро', bg: '#ffe500', text: '#0a0a0a', accent: '#ff2d95', accent2: '#1b33ff' },
    { id: 'night', name: 'Ночь', bg: '#0a0a0a', text: '#ffffff', accent: '#d4ff00', accent2: '#ff4d2e' },
    { id: 'mint', name: 'Мята', bg: '#d9f5e5', text: '#06241a', accent: '#ff5a5f', accent2: '#ffd400' },
  ],
  fonts: { heading: 'unbounded', body: 'rubik' },
  type: { h1: 'clamp(2.1rem, 5.2vw, 4.6rem)', h2: 'clamp(1.7rem, 3.8vw, 3rem)', h3: '1.08rem', weight: 800, track: '-0.03em', leading: 1, case: 'uppercase', fs: 17, em: { style: 'normal', weight: 800, color: 'accent' } },
  shape: { radius: 6, buttonShape: 'square', buttonStyle: 'solid', cards: 'hard', mediaShape: 'rect', btnCase: 'uppercase', btnTrack: '0.02em' },
  deco: { head: 'left', kicker: true, icons: 'numeral', density: 'normal', width: 'normal', alt: true, ticker: true, grain: false, motion: 'rich', brandDot: false },
  layouts: { nav: 'bar', hero: 'poster', features: 'tiles', about: 'statement', process: 'cards', pricing: 'cards', faq: 'grid', cta: 'poster', manifesto: 'statement', gallery: 'mosaic', contact: 'split', footer: 'big' },
  art: 'stripes', band: 'text',
  css: `
.nav{border-bottom:3px solid var(--text);background:var(--bg)}
.brand{font-size:1.05rem;text-transform:uppercase}
.btn{border-width:3px;font-weight:800;font-size:.85rem;box-shadow:4px 4px 0 var(--text);transition:transform .12s,box-shadow .12s}
.btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--text)}
html[data-btn=solid] .btn-primary{border-color:var(--text)}
.btn-ghost{background:var(--surface);border-color:var(--text);color:var(--text)}
.nav-cta{box-shadow:3px 3px 0 var(--text)}
.ticker{border-block:3px solid var(--text);background:var(--accent-2);color:var(--on-accent2)}
.ticker span::after{background:var(--text)}
.sec.alt{border-block:3px solid var(--text)}
.sh h2,.mf p,.ab-state .big{text-transform:uppercase}
.ft{background:var(--text);color:var(--bg);border:0}
.ft strong,.ft-mega{color:var(--bg)}
.ft .ft-links a:hover{color:var(--accent)}
.ft-links a,.ft span{color:color-mix(in srgb,var(--bg) 70%,transparent)}
.kicker{background:var(--text);color:var(--bg);padding:.35em .8em}
.kicker i{color:var(--accent)}
.kicker i::after{display:none}
.plan .price{color:var(--text)}
.f-tiles .tile h3{font-size:calc(var(--h3) * 1.5 * var(--h-scale))}
`,
};
