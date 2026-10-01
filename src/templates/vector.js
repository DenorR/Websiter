export default {
  id: 'vector',
  name: 'Вектор',
  tagline: 'Чисто, быстро, продуктово',
  best: 'SaaS, приложения, стартапы, цифровые сервисы',
  categories: ['startup', 'services'],
  brandable: true,
  sample: 'saas',
  palettes: [
    { id: 'electro', name: 'Электро', bg: '#fafbff', text: '#0a0f2c', accent: '#3b4bff', accent2: '#00c2a8' },
    { id: 'lime', name: 'Лайм', bg: '#0b0c10', text: '#f2f4f8', accent: '#c6ff3d', accent2: '#6f7bff' },
    { id: 'mono', name: 'Моно', bg: '#ffffff', text: '#0b0b0c', accent: '#0b0b0c', accent2: '#ff5a1f' },
    { id: 'peach', name: 'Персик', bg: '#fbf6f0', text: '#1c1917', accent: '#f4511e', accent2: '#2a6df4' },
  ],
  fonts: { heading: 'geologica', body: 'inter', kicker: 'jetbrains-mono' },
  type: { h1: 'clamp(2.6rem, 6.6vw, 5.6rem)', h2: 'clamp(1.9rem, 4vw, 3.3rem)', h3: '1.18rem', weight: 600, track: '-0.04em', leading: 1.02, case: 'none', fs: 17, em: { style: 'normal', weight: 600, color: 'accent' } },
  shape: { radius: 14, buttonShape: 'soft', buttonStyle: 'solid', cards: 'line', mediaShape: 'rect' },
  deco: { head: 'left', kicker: true, icons: 'line', density: 'normal', width: 'normal', alt: false, ticker: false, grain: false, motion: 'soft', brandDot: true },
  layouts: { nav: 'pill', hero: 'stack', features: 'bento', about: 'split', process: 'cards', pricing: 'cards', faq: 'split', cta: 'band', manifesto: 'statement', gallery: 'grid', contact: 'split', footer: 'simple' },
  art: 'grid',
  band: 'text',
  css: `
.hero-stack{background:radial-gradient(60% 50% at 50% 0%,color-mix(in srgb,var(--accent) 10%,transparent),transparent 70%)}
.hero-stack::before{content:"";position:absolute;inset:0;background-image:radial-gradient(color-mix(in srgb,var(--text) 18%,transparent) 1px,transparent 1.4px);background-size:24px 24px;-webkit-mask-image:linear-gradient(#000,transparent 78%);mask-image:linear-gradient(#000,transparent 78%);pointer-events:none}
.hero-stack .container{position:relative}
.kicker,.eyebrow{text-transform:none;letter-spacing:.02em;font-size:.82rem}
.kicker i::before{content:"["}.kicker i::after{content:"]";width:auto;height:auto;background:none;margin:0;opacity:1}
.board-body{background:var(--surface-2)}
.plan .price{font-size:clamp(2rem,3.4vw,2.8rem)}
`,
};
