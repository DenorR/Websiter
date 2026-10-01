export default {
  id: 'terminal', name: 'Терминал', tagline: 'Моноширинный, технический, честный',
  best: 'Разработка, IT-агентства, кибербезопасность, крипто, devtools',
  categories: ['startup', 'creative'], brandable: false, sample: 'dev',
  palettes: [
    { id: 'matrix', name: 'Матрица', bg: '#07090a', text: '#d7f5e3', accent: '#3dff8b', accent2: '#00b8d9' },
    { id: 'amber', name: 'Янтарь', bg: '#0c0a07', text: '#f3e6c8', accent: '#ffb000', accent2: '#ff6a3d' },
    { id: 'ice', name: 'Лёд', bg: '#0a0e14', text: '#dbe7f3', accent: '#5ac8fa', accent2: '#ff7ab6' },
    { id: 'paper', name: 'Бумага', bg: '#f3f1ea', text: '#161616', accent: '#d6336c', accent2: '#1c7ed6' },
  ],
  fonts: { heading: 'jetbrains-mono', body: 'inter', kicker: 'jetbrains-mono' },
  type: { h1: 'clamp(2rem, 5.2vw, 4.6rem)', h2: 'clamp(1.6rem, 3.4vw, 2.8rem)', h3: '1.08rem', weight: 700, track: '-0.05em', leading: 1.1, case: 'none', fs: 17, em: { style: 'normal', weight: 700, color: 'accent' } },
  shape: { radius: 0, buttonShape: 'square', buttonStyle: 'solid', cards: 'line', mediaShape: 'rect' },
  deco: { head: 'left', kicker: true, icons: 'numeral', density: 'normal', width: 'normal', alt: false, ticker: true, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'bar', hero: 'editorial', features: 'columns', about: 'split', process: 'timeline', pricing: 'table', faq: 'grid', cta: 'big', manifesto: 'statement', gallery: 'grid', contact: 'big', footer: 'simple' },
  art: 'grid', band: 'surface2',
  css: `
.brand::before{content:">_";color:var(--accent-fg);margin-right:.55em;font-weight:700}
.hero-ed h1::after{content:"";display:inline-block;width:.42em;height:.82em;background:var(--accent);vertical-align:-.06em;margin-left:.18em;animation:blink 1.1s steps(2,start) infinite}
@keyframes blink{to{visibility:hidden}}
@media(prefers-reduced-motion:reduce){.hero-ed h1::after{animation:none}}
.kicker,.eyebrow,.hero-ed .hero-meta{text-transform:none;letter-spacing:0;font-size:.8rem}
.kicker i::before{content:"["}.kicker i::after{content:"]";width:auto;height:auto;background:none;margin:0;opacity:1}
.f-cols .n::before{content:"["}.f-cols .n::after{content:"]"}
.ticker{font-family:var(--font-kicker);font-size:.95rem;font-weight:500;text-transform:uppercase;letter-spacing:.1em;background:var(--surface-2);color:var(--text)}
.btn{font-family:var(--font-kicker);font-weight:600;font-size:.88rem}
.faq-grid .qa h3::before{content:"? ";color:var(--accent-fg)}
.cardlike{border-style:dashed}
`,
};
