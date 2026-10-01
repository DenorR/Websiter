// Дизайн-темы. Каждая тема — набор CSS-переменных + небольшой блок стилей,
// который отличает её по характеру. Структура HTML у всех тем общая, поэтому
// клиент может переключать дизайн мгновенно, без повторного обращения к ИИ.

import { validHex } from '../schema.js';

// ───────────── Работа с цветом ─────────────

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) =>
  '#' +
  rgb
    .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0'))
    .join('');

const luminance = (hex) => {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export const mix = (a, b, t) => {
  const [ra, rb] = [toRgb(a), toRgb(b)];
  return toHex(ra.map((v, i) => v + (rb[i] - v) * t));
};

/** Подмешивает чёрный/белый к цвету, пока он не станет читаемым на фоне. */
export function ensureContrast(fg, bg, min = 4.5) {
  if (contrast(fg, bg) >= min) return fg;
  const target = luminance(bg) > 0.5 ? '#000000' : '#ffffff';
  for (let t = 0.05; t <= 1; t += 0.05) {
    const c = mix(fg, target, t);
    if (contrast(c, bg) >= min) return c;
  }
  return target;
}

/** Цвет текста поверх заданного фона (белый или почти чёрный). */
export const onColor = (bg) => (contrast(bg, '#ffffff') >= contrast(bg, '#111111') ? '#ffffff' : '#111111');

function shiftHue(hex, deg) {
  let [r, g, b] = toRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = (((h * 60 + deg) % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255]);
}

// ───────────── Определения тем ─────────────

export const THEMES = {
  minimal: {
    id: 'minimal',
    name: 'Минимал',
    tagline: 'Чисто и воздушно',
    best: 'Консультанты, студии, сервисы',
    defaultAccent: '#2563eb',
    layout: 'center',
    fonts: ['Inter:wght@400;500;600;700;800'],
    vars: {
      bg: '#ffffff', surface: '#ffffff', surface2: '#f6f7f9', text: '#0f1318', muted: '#5a6472', border: '#e5e8ed',
      r: '14px', rLg: '24px', btnR: '999px', shadow: '0 1px 2px rgba(15,19,24,.04)',
      fontHead: "'Inter', system-ui, sans-serif", fontBody: "'Inter', system-ui, sans-serif",
      headWeight: 750, headTracking: '-0.03em',
    },
    css: `
      .hero{background:radial-gradient(70% 60% at 50% 0%,color-mix(in srgb,var(--accent) 14%,transparent),transparent 70%)}
      .card:hover,.plan:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--accent) 40%,var(--border))}
      .ico-wrap{background:var(--accent-soft)}
      .hero-visual .hl{border:1px solid var(--border)}
    `,
  },

  corporate: {
    id: 'corporate',
    name: 'Бизнес',
    tagline: 'Надёжно и строго',
    best: 'Компании, B2B, финансы, право',
    defaultAccent: '#1d4ed8',
    layout: 'split',
    fonts: ['Manrope:wght@400;500;600;700;800'],
    vars: {
      bg: '#f4f6fb', surface: '#ffffff', surface2: '#eaeef7', text: '#0e1a33', muted: '#52607a', border: '#dbe1ee',
      r: '10px', rLg: '16px', btnR: '8px', shadow: '0 6px 24px -10px rgba(14,26,51,.18)',
      fontHead: "'Manrope', system-ui, sans-serif", fontBody: "'Manrope', system-ui, sans-serif",
      headWeight: 800, headTracking: '-0.025em',
    },
    css: `
      .nav{background:#fff;border-bottom:1px solid var(--border)}
      .section-head h2{position:relative;padding-left:18px}
      .section-head h2::before{content:"";position:absolute;left:0;top:.12em;bottom:.12em;width:5px;border-radius:3px;background:linear-gradient(var(--accent),var(--accent-2))}
      .section-head{text-align:left;margin-inline:0}
      .card,.plan{box-shadow:var(--shadow)}
      .ico-wrap{background:var(--accent);color:var(--on-accent);border-radius:10px}
      .footer{background:#0b1630;color:#c5cee3;border:0}
      .footer .muted,.footer a{color:#9aa7c7}
      .hero{background:linear-gradient(180deg,#fff,var(--bg))}
    `,
  },

  dark: {
    id: 'dark',
    name: 'Тёмный',
    tagline: 'Современно и технологично',
    best: 'IT, digital, ночные заведения, гейминг',
    defaultAccent: '#7c5cff',
    layout: 'split',
    dark: true,
    fonts: ['Onest:wght@400;500;600;700;800'],
    vars: {
      bg: '#0a0c12', surface: '#131722', surface2: '#0f121b', text: '#eef1f8', muted: '#97a1b8', border: '#242a3a',
      r: '16px', rLg: '26px', btnR: '12px', shadow: '0 20px 40px -20px rgba(0,0,0,.7)',
      fontHead: "'Onest', system-ui, sans-serif", fontBody: "'Onest', system-ui, sans-serif",
      headWeight: 750, headTracking: '-0.03em',
    },
    css: `
      .nav{background:color-mix(in srgb,var(--bg) 78%,transparent)}
      .hero{background:
        radial-gradient(520px 320px at 85% 0%,color-mix(in srgb,var(--accent) 38%,transparent),transparent 70%),
        radial-gradient(420px 260px at 0% 100%,color-mix(in srgb,var(--accent-2) 26%,transparent),transparent 70%)}
      .btn-primary{box-shadow:0 8px 30px -8px color-mix(in srgb,var(--accent) 70%,transparent)}
      .card,.plan{background:linear-gradient(180deg,var(--surface),var(--surface2))}
      .card:hover,.plan:hover{border-color:color-mix(in srgb,var(--accent) 60%,var(--border));box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 40%,transparent),0 20px 50px -24px var(--accent)}
      .ico-wrap{background:color-mix(in srgb,var(--accent) 18%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 35%,transparent)}
      .hero-visual{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 55%,#000),color-mix(in srgb,var(--accent-2) 45%,#000))}
      .hero-visual .hl{background:color-mix(in srgb,var(--surface) 82%,transparent);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08)}
      .cta-band{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 50%,#000),color-mix(in srgb,var(--accent-2) 40%,#000));color:#fff}
      input,textarea{background:var(--surface2)}
    `,
  },

  warm: {
    id: 'warm',
    name: 'Тёплый',
    tagline: 'Уютно и по-домашнему',
    best: 'Кафе, пекарни, цветы, детские, студии',
    defaultAccent: '#c2410c',
    layout: 'split',
    fonts: ['Lora:wght@500;600;700', 'Nunito:wght@400;500;600;700;800'],
    vars: {
      bg: '#fbf5ea', surface: '#fffdf8', surface2: '#f3e9d6', text: '#2a1f16', muted: '#6e6051', border: '#e9dcc4',
      r: '22px', rLg: '34px', btnR: '999px', shadow: '0 10px 30px -16px rgba(80,50,20,.28)',
      fontHead: "'Lora', Georgia, serif", fontBody: "'Nunito', system-ui, sans-serif",
      headWeight: 600, headTracking: '-0.01em',
    },
    css: `
      .hero-visual{border-radius:999px 999px var(--rLg) var(--rLg);padding:150px 28px 40px}
      .hero-visual .hl{border-radius:18px}
      .card,.plan{box-shadow:var(--shadow)}
      .ico-wrap{background:var(--accent-soft);border-radius:50%}
      .section.alt{background:var(--surface2)}
      .btn{font-weight:700}
      .step-n{font-family:var(--font-head)}
    `,
  },

  bold: {
    id: 'bold',
    name: 'Яркий',
    tagline: 'Дерзко и заметно',
    best: 'Креатив, молодёжные бренды, ивенты, фитнес',
    defaultAccent: '#ff5a36',
    layout: 'split',
    fonts: ['Unbounded:wght@500;700;800', 'Rubik:wght@400;500;600;700'],
    vars: {
      bg: '#fffbef', surface: '#ffffff', surface2: '#ffefb3', text: '#14110d', muted: '#4a443a', border: '#14110d',
      r: '8px', rLg: '14px', btnR: '8px', shadow: '6px 6px 0 #14110d',
      fontHead: "'Unbounded', 'Rubik', system-ui, sans-serif", fontBody: "'Rubik', system-ui, sans-serif",
      headWeight: 700, headTracking: '-0.02em',
    },
    css: `
      h1{font-size:clamp(2rem,4.6vw,3.6rem)}
      h2{font-size:clamp(1.6rem,3.4vw,2.5rem)}
      .nav{border-bottom:3px solid var(--text);background:var(--bg)}
      .btn{border:3px solid var(--text);box-shadow:4px 4px 0 var(--text);font-weight:700;transition:transform .12s,box-shadow .12s}
      .btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--text)}
      .btn-ghost{background:#fff;color:var(--text)}
      .card,.plan,.hl,.faq details,.contact-form,.step{border:3px solid var(--text);box-shadow:var(--shadow)}
      .card,.plan,.step{transition:transform .12s,box-shadow .12s}
      .card:hover,.plan:hover{transform:translate(-3px,-3px);box-shadow:9px 9px 0 var(--text)}
      .ico-wrap{background:var(--accent);color:var(--on-accent);border:3px solid var(--text);border-radius:10px}
      .hero-visual{border:3px solid var(--text);box-shadow:var(--shadow);background:var(--accent)}
      .hero-visual .hl{box-shadow:4px 4px 0 var(--text)}
      .section.alt{background:var(--surface2);border-block:3px solid var(--text)}
      .cta-band{border:3px solid var(--text);box-shadow:var(--shadow);background:var(--accent);color:var(--on-accent)}
      .cta-band .btn-primary{background:#fff;color:var(--text)}
      .footer{border-top:3px solid var(--text);background:var(--text);color:#fff}
      .footer .muted,.footer a{color:#e8e1cf}
      input,textarea{border:3px solid var(--text)!important;border-radius:8px}
      .brand-mark{border:3px solid var(--text);border-radius:8px}
    `,
  },

  elegant: {
    id: 'elegant',
    name: 'Элегантный',
    tagline: 'Премиально и сдержанно',
    best: 'Салоны красоты, ателье, ювелирка, рестораны',
    defaultAccent: '#9a7b3f',
    layout: 'center',
    fonts: ['Cormorant+Garamond:wght@500;600;700', 'Jost:wght@300;400;500;600'],
    vars: {
      bg: '#f8f4ec', surface: '#fffdf8', surface2: '#efe8da', text: '#1d1a15', muted: '#6c6558', border: '#ddd3bf',
      r: '2px', rLg: '4px', btnR: '0px', shadow: 'none',
      fontHead: "'Cormorant Garamond', Georgia, serif", fontBody: "'Jost', system-ui, sans-serif",
      headWeight: 600, headTracking: '0',
    },
    css: `
      body{font-weight:400}
      h1{font-size:clamp(2.8rem,6.2vw,5.2rem);line-height:1.04}
      h2{font-size:clamp(2.1rem,4vw,3.1rem)}
      h3{font-size:1.45rem}
      .nav .links a{text-transform:uppercase;letter-spacing:.14em;font-size:.76rem}
      .brand{font-family:var(--font-head);font-size:1.5rem;letter-spacing:.02em}
      .btn{text-transform:uppercase;letter-spacing:.14em;font-size:.76rem;font-weight:500;padding:1rem 1.8rem}
      .btn-ghost{border-color:var(--text)}
      .eyebrow{text-transform:uppercase;letter-spacing:.24em;font-size:.72rem}
      .hero{background:linear-gradient(180deg,var(--surface2),var(--bg));border-bottom:1px solid var(--border)}
      .hero h1::after{content:"";display:block;width:64px;height:1px;background:var(--accent-fg);margin:28px auto 0}
      .section-head{text-align:center;margin-inline:auto}
      .section-head h2::after{content:"";display:block;width:48px;height:1px;background:var(--accent-fg);margin:18px auto 0}
      .card,.plan{border-color:var(--border)}
      .ico-wrap{background:transparent;border:1px solid var(--accent-fg);border-radius:50%;color:var(--accent-fg)}
      .section.alt{background:var(--surface2)}
      .hero-visual .hl{border:1px solid var(--border);background:var(--surface)}
      .footer{background:#1d1a15;color:#d9d0bd;border:0}
      .footer .muted,.footer a{color:#a89f8c}
    `,
  },
};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME = 'minimal';

export function publicThemes() {
  return Object.values(THEMES).map((t) => ({
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    best: t.best,
    accent: t.defaultAccent,
    dark: !!t.dark,
    bg: t.vars.bg,
  }));
}

export function fontLink(theme) {
  const families = theme.fonts.map((f) => `family=${f}`).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap&subset=cyrillic,latin`;
}

/** Блок :root с переменными для темы и конкретных фирменных цветов. */
export function rootVars(theme, accentRaw, accent2Raw) {
  const v = theme.vars;
  const accent = validHex(accentRaw, theme.defaultAccent);
  const accent2 = validHex(accent2Raw, '') || shiftHue(accent, 32);
  const accent2Final = accent2 === accent ? shiftHue(accent, 32) : accent2;
  const accentFg = ensureContrast(accent, v.bg, 4.2);
  return `:root{
    --bg:${v.bg};--surface:${v.surface};--surface-2:${v.surface2};--text:${v.text};--muted:${v.muted};--border:${v.border};
    --accent:${accent};--accent-2:${accent2Final};--on-accent:${onColor(accent)};--accent-fg:${accentFg};
    --accent-soft:color-mix(in srgb,var(--accent) 13%,var(--surface));
    --r:${v.r};--rLg:${v.rLg};--btn-r:${v.btnR};--shadow:${v.shadow};
    --font-head:${v.fontHead};--font-body:${v.fontBody};--head-weight:${v.headWeight};--head-tracking:${v.headTracking};
    color-scheme:${theme.dark ? 'dark' : 'light'};
  }`;
}

// ───────────── Общие стили для всех тем ─────────────

export const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
*{margin:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;scroll-padding-top:76px}
body{font-family:var(--font-body);background:var(--bg);color:var(--text);line-height:1.62;font-size:17px;-webkit-font-smoothing:antialiased;overflow-x:hidden}
svg{display:block}
a{color:inherit;text-decoration:none}
h1,h2,h3{font-family:var(--font-head);font-weight:var(--head-weight);letter-spacing:var(--head-tracking);line-height:1.12;text-wrap:balance}
h1{font-size:clamp(2.3rem,5.2vw,4rem)}
h2{font-size:clamp(1.8rem,3.6vw,2.7rem)}
h3{font-size:1.18rem;line-height:1.3}
p{text-wrap:pretty}
.container{width:min(1160px,100% - 40px);margin-inline:auto}
.muted{color:var(--muted)}

/* Навигация */
.nav{position:sticky;top:0;z-index:50;backdrop-filter:saturate(1.4) blur(14px);background:color-mix(in srgb,var(--bg) 82%,transparent);border-bottom:1px solid color-mix(in srgb,var(--border) 70%,transparent)}
.nav-inner{display:flex;align-items:center;gap:28px;height:68px}
.brand{display:flex;align-items:center;gap:10px;font-family:var(--font-head);font-weight:var(--head-weight);font-size:1.15rem;letter-spacing:var(--head-tracking);white-space:nowrap}
.brand-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:calc(var(--r) * .7);background:linear-gradient(135deg,var(--accent),var(--accent-2));color:var(--on-accent);font-size:1rem;font-weight:800}
.links{display:flex;gap:26px;margin-left:auto;font-size:.95rem;font-weight:500}
.links a{color:var(--muted);transition:color .15s}
.links a:hover{color:var(--text)}
.nav-cta{padding:.6rem 1.15rem;font-size:.92rem}
.burger{display:none;margin-left:auto;width:42px;height:42px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;place-items:center}

/* Кнопки */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.9rem 1.6rem;border-radius:var(--btn-r);font:inherit;font-weight:600;font-size:1rem;border:1px solid transparent;cursor:pointer;transition:transform .15s,box-shadow .15s,background .15s;line-height:1.2}
.btn-primary{background:var(--accent);color:var(--on-accent)}
.btn-primary:hover{transform:translateY(-1px);filter:brightness(1.06)}
.btn-ghost{border-color:var(--border);background:transparent;color:var(--text)}
.btn-ghost:hover{border-color:var(--text)}

/* Первый экран */
.hero{padding:clamp(56px,9vw,112px) 0 clamp(56px,8vw,96px);position:relative;overflow:hidden}
.hero-inner{display:grid;grid-template-columns:1.12fr .88fr;gap:clamp(32px,5vw,72px);align-items:center}
.eyebrow{display:inline-block;color:var(--accent-fg);font-weight:600;font-size:.88rem;letter-spacing:.02em;margin-bottom:18px}
.hero p.lead{font-size:clamp(1.05rem,1.6vw,1.22rem);color:var(--muted);margin-top:22px;max-width:56ch}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}
.hero-visual{position:relative;display:grid;gap:14px;align-content:center;padding:34px 28px;border-radius:var(--rLg);background:linear-gradient(135deg,var(--accent),var(--accent-2));min-height:340px;overflow:hidden}
.hero-visual::before,.hero-visual::after{content:"";position:absolute;border-radius:50%;background:rgba(255,255,255,.14);pointer-events:none}
.hero-visual::before{width:240px;height:240px;right:-70px;top:-80px}
.hero-visual::after{width:160px;height:160px;left:-50px;bottom:-60px}
.hl{position:relative;z-index:1;display:flex;align-items:center;gap:14px;background:var(--surface);color:var(--text);padding:15px 18px;border-radius:var(--r);box-shadow:0 12px 30px -14px rgba(0,0,0,.35)}
.hl:nth-child(2){margin-left:30px}
.hl:nth-child(3){margin-right:30px}
.hl strong{display:block;font-size:.98rem;line-height:1.3}
.hl span.t{display:block;font-size:.86rem;color:var(--muted);line-height:1.35;margin-top:2px}
.hl .ico-wrap{width:42px;height:42px;flex:none}
.hero[data-layout="center"] .hero-inner{grid-template-columns:1fr;text-align:center;justify-items:center}
.hero[data-layout="center"] h1{max-width:18ch}
.hero[data-layout="center"] p.lead{margin-inline:auto}
.hero[data-layout="center"] .hero-actions{justify-content:center}
.hero[data-layout="center"] .hero-visual{background:none;padding:0;min-height:0;margin-top:30px;grid-template-columns:repeat(3,1fr);width:100%;overflow:visible}
.hero[data-layout="center"] .hero-visual::before,.hero[data-layout="center"] .hero-visual::after{display:none}
.hero[data-layout="center"] .hl{margin:0!important;text-align:left;box-shadow:none;border:1px solid var(--border)}

/* Секции */
.section{padding:clamp(60px,8vw,104px) 0}
.section.alt{background:var(--surface-2)}
.section.s-cta{padding:clamp(8px,2vw,24px) 0}
.section-head{max-width:720px;margin-bottom:clamp(30px,4vw,52px)}
.section-head p{color:var(--muted);margin-top:14px;font-size:1.06rem}
.ico-wrap{display:grid;place-items:center;width:48px;height:48px;border-radius:calc(var(--r) * .8);color:var(--accent-fg);flex:none}

.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.cards[data-n="4"],.steps[data-n="4"]{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:28px;transition:transform .2s,border-color .2s,box-shadow .2s}
.card h3{margin:18px 0 8px}
.card p{color:var(--muted);font-size:.98rem}

.about{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(28px,5vw,64px);align-items:start}
.about-text p+p{margin-top:1em}
.about-text p{color:var(--muted);font-size:1.06rem}
.about-text p:first-child{color:var(--text);font-size:1.18rem}
.facts{display:grid;gap:14px}
.fact{display:flex;gap:16px;align-items:flex-start;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px}
.fact h3{font-size:1.02rem;margin-bottom:2px}
.fact p{color:var(--muted);font-size:.94rem}
.fact .ico-wrap{width:40px;height:40px}

.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;counter-reset:s}
.step{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:26px}
.step-n{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--accent);color:var(--on-accent);font-weight:800;margin-bottom:16px}
.step h3{margin-bottom:6px}
.step p{color:var(--muted);font-size:.96rem}

.plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;align-items:stretch}
.plan{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:30px;transition:transform .2s,border-color .2s}
.plan .price{font-family:var(--font-head);font-weight:var(--head-weight);font-size:1.9rem;letter-spacing:var(--head-tracking);color:var(--accent-fg);margin:10px 0 14px}
.plan ul{list-style:none;padding:0;display:grid;gap:9px;color:var(--muted);font-size:.96rem;margin-bottom:22px}
.plan li{display:flex;gap:10px;align-items:flex-start}
.plan li .ico{flex:none;margin-top:3px;color:var(--accent-fg)}
.plan .btn{margin-top:auto}

.faq{display:grid;gap:12px;max-width:820px}
.faq details{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:0 22px}
.faq summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:600;display:flex;justify-content:space-between;gap:16px;align-items:center}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-size:1.5rem;line-height:1;color:var(--accent-fg);transition:transform .2s;flex:none}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq details p{padding:0 0 20px;color:var(--muted)}

.cta-band{display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:var(--on-accent);border-radius:var(--rLg);padding:clamp(30px,5vw,56px)}
.cta-band h2{max-width:20ch}
.cta-band p{margin-top:10px;opacity:.9;max-width:52ch}
.cta-band .btn-primary{background:var(--on-accent);color:var(--accent)}

.contact-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(28px,5vw,64px);align-items:start}
.contact-grid.single{grid-template-columns:1fr;max-width:640px}
.contact-list{display:grid;gap:18px;margin-top:30px}
.contact-list a,.contact-list div{display:flex;gap:16px;align-items:center}
.contact-list .ico-wrap{width:44px;height:44px}
.contact-list small{display:block;color:var(--muted);font-size:.82rem}
.contact-list b{font-weight:600}
.contact-form{display:grid;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rLg);padding:clamp(22px,3vw,34px)}
.contact-form label{display:grid;gap:7px;font-size:.88rem;font-weight:600}
input,textarea{font:inherit;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:.85rem 1rem;width:100%;outline:none;transition:border-color .15s,box-shadow .15s}
textarea{min-height:120px;resize:vertical}
input:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent)}

.footer{border-top:1px solid var(--border);padding:34px 0;font-size:.92rem;background:var(--surface-2)}
.footer-inner{display:flex;flex-wrap:wrap;gap:12px 28px;justify-content:space-between;align-items:center}

/* Появление при прокрутке — только если JS работает */
.js .reveal{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s ease}
.js .reveal.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.js .reveal{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}

/* Адаптив */
@media (max-width:1000px){
  .cards[data-n="4"],.steps[data-n="4"]{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:900px){
  .hero-inner,.about,.contact-grid{grid-template-columns:1fr}
  .hero-visual{min-height:0}
  .hl:nth-child(2),.hl:nth-child(3){margin:0}
  .hero[data-layout="center"] .hero-visual{grid-template-columns:1fr}
}
@media (max-width:640px){
  .cards[data-n="4"],.steps[data-n="4"]{grid-template-columns:1fr}
}
@media (max-width:820px){
  body{font-size:16px}
  .burger{display:grid}
  .nav-cta{display:none}
  .links{display:none;position:absolute;left:0;right:0;top:68px;flex-direction:column;gap:0;margin:0;padding:8px 20px 18px;background:var(--bg);border-bottom:1px solid var(--border)}
  .nav.open .links{display:flex}
  .links a{padding:13px 0;font-size:1.02rem;border-bottom:1px solid var(--border)}
  .cta-band{flex-direction:column;align-items:flex-start}
}
`;
