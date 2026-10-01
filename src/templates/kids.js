export default {
  id: 'kids', name: 'Радуга', tagline: 'Весело, округло, цветасто',
  best: 'Детские центры, школы, игрушки, кружки, праздники',
  categories: ['edu', 'events'], brandable: true, sample: 'kids',
  palettes: [
    { id: 'rainbow', name: 'Радуга', bg: '#fff8e8', text: '#20202a', accent: '#ff5a5f', accent2: '#ffc233' },
    { id: 'mint', name: 'Мята', bg: '#e9fbf4', text: '#12302a', accent: '#12b886', accent2: '#ffd43b' },
    { id: 'sky', name: 'Небо', bg: '#eaf6ff', text: '#102a43', accent: '#2f80ed', accent2: '#ffb020' },
    { id: 'grape', name: 'Виноград', bg: '#f6efff', text: '#2b1747', accent: '#8b5cf6', accent2: '#ff7eb6' },
  ],
  fonts: { heading: 'nunito', body: 'nunito' },
  type: { h1: 'clamp(2.3rem, 5.8vw, 4.8rem)', h2: 'clamp(1.9rem, 4.2vw, 3.4rem)', h3: '1.2rem', weight: 900, track: '-0.025em', leading: 1.04, case: 'none', fs: 18, em: { style: 'normal', weight: 900, color: 'accent' } },
  shape: { radius: 28, buttonShape: 'pill', buttonStyle: 'solid', cards: 'shadow', mediaShape: 'round' },
  deco: { head: 'center', kicker: false, icons: 'badge', density: 'normal', width: 'normal', alt: true, ticker: true, grain: false, motion: 'rich', brandDot: true },
  layouts: { nav: 'pill', hero: 'split', features: 'cards', about: 'media', process: 'cards', pricing: 'cards', faq: 'accordion', cta: 'band', manifesto: 'statement', gallery: 'mosaic', contact: 'split', footer: 'simple' },
  art: 'blocks', band: 'accent',
  css: `
.hero-split .media{aspect-ratio:1}
.hero-split .hero-grid{align-items:center}
html[data-icons=badge] .f-grid .card:nth-child(3n+2) .ic{background:var(--accent-2);color:var(--on-accent2)}
html[data-icons=badge] .f-grid .card:nth-child(3n+2) .ic-svg{color:var(--on-accent2)}
html[data-icons=badge] .f-grid .card:nth-child(3n) .ic{background:var(--text);color:var(--bg)}
html[data-icons=badge] .f-grid .card:nth-child(3n) .ic-svg{color:var(--bg)}
.f-grid .card{transform:rotate(-.6deg)}.f-grid .card:nth-child(2n){transform:rotate(.6deg)}
.f-grid .card:hover{transform:translateY(-6px) rotate(0)}
.p-cards .step-n{background:var(--accent-2);color:var(--on-accent2)}
.ticker{background:var(--accent-2);color:var(--on-accent2);border:0;border-radius:0}
.ticker span::after{background:var(--accent);border-radius:50%;transform:none}
.cta-band{border-radius:calc(var(--radius) * 1.4)}
.btn{font-weight:800}
.hero-split .media{box-shadow:0 0 0 10px var(--accent-2)}
`,
};
