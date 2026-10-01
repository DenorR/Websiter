export default {
  id: 'clinic', name: 'Клиника', tagline: 'Спокойно, чисто, внушает доверие',
  best: 'Стоматологии, клиники, психологи, ветеринары, wellness',
  categories: ['health', 'services'], brandable: true, sample: 'dental',
  palettes: [
    { id: 'mint', name: 'Мята', bg: '#f2faf8', text: '#0f2a2a', accent: '#0f9d8a', accent2: '#6ac9b6' },
    { id: 'sky', name: 'Небо', bg: '#f3f8fe', text: '#0b2447', accent: '#1f6fe5', accent2: '#5cc8ff' },
    { id: 'lavender', name: 'Лаванда', bg: '#f7f5fc', text: '#251a3d', accent: '#7c5cd6', accent2: '#e07aa8' },
    { id: 'white', name: 'Белый', bg: '#ffffff', text: '#0f1b2d', accent: '#00a68c', accent2: '#ffb347' },
  ],
  fonts: { heading: 'manrope', body: 'manrope' },
  type: { h1: 'clamp(2.3rem, 5.2vw, 4.4rem)', h2: 'clamp(1.9rem, 3.8vw, 3.1rem)', h3: '1.15rem', weight: 700, track: '-0.035em', leading: 1.05, case: 'none', fs: 17, em: { style: 'normal', weight: 700, color: 'accent' } },
  shape: { radius: 20, buttonShape: 'pill', buttonStyle: 'solid', cards: 'line', mediaShape: 'rect' },
  deco: { head: 'left', kicker: false, icons: 'badge', density: 'normal', width: 'normal', alt: true, ticker: false, grain: false, motion: 'soft', brandDot: false },
  layouts: { nav: 'bar', hero: 'split', features: 'cards', about: 'media', process: 'timeline', pricing: 'cards', faq: 'accordion', cta: 'band', manifesto: 'statement', gallery: 'grid', contact: 'split', footer: 'simple' },
  art: 'waves', band: 'accent',
  css: `
.hero-split .media{aspect-ratio:1/1.05;border-radius:calc(var(--radius) * 2)}
.hero-split{background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 7%,var(--bg)),var(--bg))}
.hl-row{grid-template-columns:repeat(3,1fr)}
.hl{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem 1.2rem}
.hl-row{border-top:0;padding-top:0}
.f-grid .card{border-radius:calc(var(--radius) * 1.3)}
.ab-media .media{border-radius:calc(var(--radius) * 2)}
.cta-band{border-radius:calc(var(--radius) * 1.8)}
.nav-cta{box-shadow:0 8px 20px -10px var(--accent)}
`,
};
