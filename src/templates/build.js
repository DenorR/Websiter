export default {
  id: 'build', name: 'Мастер', tagline: 'Крепко, по делу, с опасной полосой',
  best: 'Ремонт, стройка, логистика, автосервисы, производство',
  categories: ['realty', 'services'], brandable: false, sample: 'repair',
  palettes: [
    { id: 'concrete', name: 'Бетон', bg: '#e9e8e4', text: '#1a1a1a', accent: '#ff6a00', accent2: '#1a1a1a' },
    { id: 'steel', name: 'Сталь', bg: '#eceff2', text: '#111827', accent: '#f5b800', accent2: '#111827' },
    { id: 'workshop', name: 'Цех', bg: '#151515', text: '#f3f3f3', accent: '#ffb400', accent2: '#ff6a00' },
    { id: 'green', name: 'Зелёный', bg: '#eef1ea', text: '#11200f', accent: '#3b8f2a', accent2: '#f5b800' },
  ],
  fonts: { heading: 'oswald', body: 'golos-text' },
  type: { h1: 'clamp(2.8rem, 7.2vw, 6.2rem)', h2: 'clamp(2rem, 4.8vw, 4rem)', h3: '1.4rem', weight: 700, track: '0em', leading: 0.98, case: 'uppercase', fs: 17, em: { style: 'normal', weight: 700, color: 'accent' } },
  shape: { radius: 2, buttonShape: 'square', buttonStyle: 'solid', cards: 'fill', mediaShape: 'rect', btnCase: 'uppercase', btnTrack: '0.06em' },
  deco: { head: 'left', kicker: true, icons: 'numeral', density: 'normal', width: 'normal', alt: true, ticker: true, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'bar', hero: 'split', features: 'bento', about: 'split', process: 'numbers', pricing: 'table', faq: 'grid', cta: 'band', manifesto: 'statement', gallery: 'mosaic', contact: 'split', footer: 'big' },
  art: 'blocks', band: 'text',
  css: `
.hero::after{content:"";position:absolute;left:0;right:0;bottom:0;height:14px;background:repeating-linear-gradient(-45deg,var(--text) 0 14px,var(--accent) 14px 28px)}
.hero{padding-bottom:clamp(56px,8vw,104px)}
.hero-split .media{aspect-ratio:1;border-radius:var(--radius)}
.ticker{background:var(--accent);color:var(--on-accent);border:0}
.ticker span::after{background:var(--on-accent)}
.f-bento .tile:nth-child(1){background:var(--text);color:var(--bg)}
.f-bento .tile:nth-child(1) .ic-num{color:var(--accent)}
.f-bento .tile:nth-child(3){background:var(--accent);color:var(--on-accent)}
.f-bento .tile:nth-child(3) .ic-num,.f-bento .tile:nth-child(3) .ic-svg{color:inherit}
.f-bento .tile{border-radius:var(--radius)}
.p-num .big{-webkit-text-stroke:1.5px var(--text);color:transparent}
.p-num li{border-top:6px solid var(--text)}
.btn{font-weight:700}
.cta-band{border-radius:var(--radius);background:var(--text);color:var(--bg)}
.nav{border-bottom:4px solid var(--text);background:var(--bg)}
.kicker i{color:var(--accent-fg)}
`,
};
