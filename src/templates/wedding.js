export default {
  id: 'wedding', name: 'Свадьба', tagline: 'Романтично, с каллиграфией',
  best: 'Свадебные агентства, флористы, фотографы, декор, банкеты',
  categories: ['events', 'beauty'], brandable: false, sample: 'wedding',
  palettes: [
    { id: 'powder', name: 'Пудра и золото', bg: '#fbf3ee', text: '#3d2a2a', accent: '#b9895b', accent2: '#d9b8a4' },
    { id: 'sage', name: 'Шалфей', bg: '#f2f4ee', text: '#2c3a2e', accent: '#7d9a6e', accent2: '#d8c3a5' },
    { id: 'burgundy', name: 'Бордо', bg: '#fbf1f1', text: '#3b1620', accent: '#8c2f45', accent2: '#d4a373' },
    { id: 'midnight', name: 'Полночь', bg: '#121526', text: '#f1e9dc', accent: '#d8b36a', accent2: '#8aa1d6' },
  ],
  fonts: { heading: 'prata', body: 'jost', accent: 'marck-script' },
  type: { h1: 'clamp(2.5rem, 6.2vw, 5.4rem)', h2: 'clamp(2rem, 4.2vw, 3.5rem)', h3: '1.35rem', weight: 400, track: '-0.01em', leading: 1.1, case: 'none', fs: 17, em: { style: 'normal', weight: 400, color: 'accent' } },
  shape: { radius: 6, buttonShape: 'pill', buttonStyle: 'outline', cards: 'flat', mediaShape: 'arch', btnCase: 'uppercase', btnTrack: '0.14em' },
  deco: { head: 'center', kicker: true, icons: 'line', density: 'airy', width: 'normal', alt: true, ticker: false, grain: true, motion: 'soft', brandDot: false },
  layouts: { nav: 'center', hero: 'split', features: 'columns', about: 'media', process: 'timeline', pricing: 'menu', faq: 'accordion', cta: 'big', manifesto: 'statement', gallery: 'strip', contact: 'split', footer: 'center' },
  art: 'leaves', band: 'accent',
  css: `
em{font-size:1.18em;line-height:.8}
.hero-split .media{aspect-ratio:3/4}
.brand{font-size:1.7rem}
.links a,.btn,.kicker,.eyebrow{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase}
.f-cols .col{border-top:1px solid var(--accent)}
.f-cols .n{font-family:var(--font-accent);font-size:2rem;letter-spacing:0;margin-bottom:1rem}
.sh h2::after{content:"";display:block;width:56px;height:1px;background:var(--accent);margin:1.2rem auto 0}
html[data-head=left] .sh h2::after{margin-left:0}
.sec.alt{background:color-mix(in srgb,var(--accent2) 16%,var(--bg))}
`,
};
