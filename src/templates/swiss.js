export default {
  id: 'swiss',
  name: 'Швейцарский',
  tagline: 'Сетка, типографика, воздух',
  best: 'Консалтинг, студии, агентства, эксперты',
  categories: ['services', 'creative', 'startup'],
  brandable: true,
  sample: 'consulting',
  palettes: [
    { id: 'paper', name: 'Бумага', bg: '#f1efe9', text: '#0f0f0e', accent: '#ff3b1f', accent2: '#0f0f0e' },
    { id: 'cobalt', name: 'Кобальт', bg: '#ffffff', text: '#0a0a0a', accent: '#1d3bff', accent2: '#ff3b1f' },
    { id: 'graphite', name: 'Графит', bg: '#141414', text: '#efeee9', accent: '#d6ff3a', accent2: '#ff7a45' },
    { id: 'forest', name: 'Хвоя', bg: '#eceee6', text: '#0e1a12', accent: '#1f6f43', accent2: '#e0a526' },
  ],
  fonts: { heading: 'inter-tight', body: 'inter' },
  type: { h1: 'clamp(2.7rem, 8vw, 7.4rem)', h2: 'clamp(2rem, 4.8vw, 4rem)', h3: '1.2rem', weight: 600, track: '-0.045em', leading: 0.96, case: 'none', fs: 17, em: { style: 'normal', weight: 600, color: 'accent' } },
  shape: { radius: 0, buttonShape: 'square', buttonStyle: 'solid', cards: 'line', mediaShape: 'rect' },
  deco: { head: 'index', kicker: true, icons: 'numeral', density: 'normal', width: 'normal', alt: false, ticker: false, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'bar', hero: 'editorial', features: 'rows', about: 'split', process: 'numbers', pricing: 'table', faq: 'split', cta: 'big', manifesto: 'statement', gallery: 'mosaic', contact: 'big', footer: 'big' },
  art: 'dots',
  band: 'text',
  css: `
.brand::before{content:"";width:.62em;height:.62em;background:var(--accent);display:inline-block}
.btn{border-radius:0}
.hero-ed h1 em{font-style:normal}
`,
};
