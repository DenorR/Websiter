// Модель сайта: контент + оформление + медиа + контакты.
// Здесь же «разрешение» настроек: шаблон + пользовательские переопределения -> готовые CSS-переменные.

import { TEMPLATES, DEFAULT_TEMPLATE } from './templates/index.js';
import { FONTS, fontStack, fontFaceCss } from './fonts.js';
import { ART_IDS } from './art.js';
import { validHex, deriveTokens, tokensToVars } from './color.js';
import { LAYOUT_KEYS, isLayout, STYLE_KEYS, isStyleValue } from './render/variants.js';

export const DEFAULT_DESIGN = Object.freeze({
  template: DEFAULT_TEMPLATE,
  palette: 'auto',
  colors: {},
  fonts: {},
  ...Object.fromEntries(STYLE_KEYS.map((k) => [k, 'auto'])),
  radius: null,
  art: 'auto',
  layouts: {},
});

const COLOR_KEYS = ['bg', 'text', 'accent', 'accent2', 'surface'];

/** Приводит любой ввод к валидному объекту оформления: лишнее отбрасывает, неверное сбрасывает в «как в шаблоне». */
export function cleanDesign(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const d = structuredClone(DEFAULT_DESIGN);
  if (TEMPLATES[src.template]) d.template = src.template;
  if (typeof src.palette === 'string' && /^[a-z0-9-]{1,30}$/.test(src.palette)) d.palette = src.palette;
  if (src.colors && typeof src.colors === 'object') {
    for (const k of COLOR_KEYS) {
      const v = validHex(src.colors[k], '');
      if (v) d.colors[k] = v;
    }
  }
  if (src.fonts && typeof src.fonts === 'object') {
    for (const k of ['heading', 'body', 'accent']) if (FONTS[src.fonts[k]]) d.fonts[k] = src.fonts[k];
  }
  for (const k of STYLE_KEYS) if (isStyleValue(k, src[k])) d[k] = src[k];
  if (Number.isFinite(src.radius)) d.radius = Math.min(48, Math.max(0, Math.round(src.radius)));
  if (src.art === 'none' || ART_IDS.includes(src.art)) d.art = src.art;
  if (src.layouts && typeof src.layouts === 'object') {
    for (const k of LAYOUT_KEYS) if (isLayout(k, src.layouts[k])) d.layouts[k] = src.layouts[k];
  }
  return d;
}

const EMPTY_CONTACT = { phone: '', email: '', address: '', hours: '', telegram: '', whatsapp: '', instagram: '', vk: '', primary: 'form' };
const EMPTY_MEDIA = { logo: null, hero: null, about: null, gallery: [], logoMode: 'both' };

// Старые сайты (первая версия конструктора) → новая модель
const LEGACY_TEMPLATE = { minimal: 'swiss', corporate: 'swiss', dark: 'vector', warm: 'swiss', bold: 'swiss', elegant: 'noir' };

// В разметку попадают только наши загрузки (/u/…): ни внешних адресов, ни javascript:, ни кавычек
const safeUrl = (u) => (typeof u === 'string' && /^\/u\/[A-Za-z0-9_./-]{1,120}$/.test(u) && !u.includes('..') ? u : null);

export function normalizeSite(site) {
  const input = site.input ?? {};
  const legacyDesign = site.design ?? {
    template: LEGACY_TEMPLATE[site.themeId] ?? DEFAULT_TEMPLATE,
    ...(site.accent ? { palette: 'custom', colors: { accent: site.accent } } : {}),
  };
  return {
    ...site,
    contact: {
      ...EMPTY_CONTACT,
      phone: input.phone ?? '', email: input.email ?? '', address: input.address ?? '', hours: input.hours ?? '',
      ...(site.contact ?? {}),
    },
    media: {
      ...EMPTY_MEDIA, ...(site.media ?? {}),
      logo: safeUrl(site.media?.logo), hero: safeUrl(site.media?.hero), about: safeUrl(site.media?.about),
      gallery: (Array.isArray(site.media?.gallery) ? site.media.gallery : []).map(safeUrl).filter(Boolean),
    },
    design: cleanDesign(legacyDesign),
  };
}

// ───────────── Разрешение настроек ─────────────

const SIZE_PX = { sm: 16, md: 17, lg: 19 };
const H_SCALE = { sm: 0.82, md: 1, lg: 1.18 };
const WEIGHT = { light: 300, regular: 400, bold: 700, black: 850 };
const SEC_PAD = { compact: 'clamp(40px,5.5vw,64px)', normal: 'clamp(56px,8vw,104px)', airy: 'clamp(72px,10vw,136px)' };
const CONTAINER = { narrow: '980px', normal: '1180px', wide: '1360px' };

export function paletteBase(tpl, d, brand) {
  if (d.palette === 'custom') return { ...tpl.palettes[0], ...d.colors };
  let base;
  if (d.palette === 'ai' || (d.palette === 'auto' && tpl.brandable)) {
    base = { ...tpl.palettes[0], accent: brand.accent, accent2: brand.accent2 };
  } else {
    base = tpl.palettes.find((p) => p.id === d.palette) ?? tpl.palettes[0];
  }
  return { ...base, ...d.colors };
}

/** @returns объект со всем, что нужно рендереру */
export function resolveDesign(site) {
  const d = cleanDesign(site.design);
  const tpl = TEMPLATES[d.template];
  const brand = site.content.brand;
  const pick = (key, def) => (d[key] === 'auto' ? def : d[key]);

  const tokens = deriveTokens(paletteBase(tpl, d, brand), { band: tpl.band });

  const heading = d.fonts.heading ?? tpl.fonts.heading;
  const body = d.fonts.body ?? tpl.fonts.body;
  const accentFont = d.fonts.accent ?? tpl.fonts.accent ?? heading;
  const kickerFont = tpl.fonts.kicker ?? body;
  const fontIds = [...new Set([heading, body, accentFont, kickerFont])].filter((id) => FONTS[id]);

  const type = tpl.type;
  const weightKey = pick('headingWeight', null);
  const hf = FONTS[heading];
  let weight = weightKey ? WEIGHT[weightKey] : type.weight;
  if (hf) weight = Math.min(hf.weights[1], Math.max(hf.weights[0], weight));
  const caseVal = pick('headingCase', type.case === 'uppercase' ? 'upper' : 'normal');
  const sizeKey = pick('textSize', 'md');
  const hSize = pick('headingSize', 'md');
  const radius = d.radius ?? tpl.shape.radius;
  const btnShape = pick('buttonShape', tpl.shape.buttonShape);
  const em = type.em ?? {};
  const deco = tpl.deco;

  const vars = {
    '--font-head': fontStack(heading),
    '--font-body': fontStack(body),
    '--font-accent': fontStack(accentFont),
    '--font-kicker': fontStack(kickerFont),
    '--font-lead': deco.leadFont === 'head' ? fontStack(heading) : fontStack(body),
    '--fs': `${SIZE_PX[sizeKey] ?? 17}px`,
    '--h-scale': String(H_SCALE[hSize] ?? 1),
    '--h1': type.h1, '--h2': type.h2, '--h3': type.h3,
    '--h-weight': String(weight),
    '--h-track': type.track,
    '--h-leading': String(type.leading),
    '--h-case': caseVal === 'upper' ? 'uppercase' : 'none',
    '--em-style': em.style ?? 'italic',
    '--em-weight': String(em.weight ?? weight),
    '--em-color': em.color === 'inherit' ? 'inherit' : 'var(--accent-fg)',
    '--em-track': em.track ?? 'inherit',
    '--radius': `${radius}px`,
    '--radius-lg': `${Math.round(radius * 1.6)}px`,
    '--btn-radius': btnShape === 'pill' ? '999px' : btnShape === 'square' ? '0px' : `${Math.min(radius, 24)}px`,
    '--btn-track': tpl.shape.btnTrack ?? '0',
    '--btn-case': tpl.shape.btnCase ?? 'none',
    '--container': CONTAINER[pick('width', deco.width)] ?? CONTAINER.normal,
    '--sec-pad': SEC_PAD[pick('density', deco.density)] ?? SEC_PAD.normal,
  };

  const onOff = (v) => (v === true || v === 'on' ? 'on' : 'off');
  const attrs = {
    'data-tpl': tpl.id,
    'data-btn': pick('buttonStyle', tpl.shape.buttonStyle),
    'data-cards': pick('cards', tpl.shape.cards),
    'data-icons': pick('icons', deco.icons),
    'data-head': pick('head', deco.head),
    'data-kicker': onOff(pick('kicker', deco.kicker)),
    'data-media': pick('mediaShape', tpl.shape.mediaShape),
    'data-grain': onOff(pick('grain', deco.grain)),
    'data-motion': pick('motion', deco.motion),
    'data-ticker': onOff(pick('ticker', deco.ticker)),
  };

  const layouts = { ...tpl.layouts };
  for (const k of LAYOUT_KEYS) if (d.layouts[k]) layouts[k] = d.layouts[k];

  return {
    d, tpl, tokens, fontIds, vars, attrs, layouts,
    art: d.art === 'auto' ? tpl.art : d.art,
    flags: { alt: deco.alt, brandDot: deco.brandDot },
  };
}

/** Содержимое <style id="ws-tokens">: шрифты + переменные. Его же шлём в живой предпросмотр. */
export function tokensCss(res, { fontMode = 'link' } = {}) {
  const vars = Object.entries(res.vars).map(([k, v]) => `${k}:${v}`).join(';');
  return `${fontFaceCss(res.fontIds, { mode: fontMode })}:root{${tokensToVars(res.tokens)}${vars}}`;
}

// ───────────── Контакты и медиа (ввод клиента из редактора) ─────────────

const str = (v, max) => String(v ?? '').trim().slice(0, max);

function handle(v, re, prefix) {
  const cleaned = str(v, 200)
    .replace(new RegExp(`^https?://(www\\.)?${prefix}/`, 'i'), '')
    .replace(/^@/, '')
    .replace(/\/+$/, '');
  return re.test(cleaned) ? cleaned : '';
}

export function cleanContact(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const email = str(src.email, 120);
  return {
    phone: str(src.phone, 40).replace(/[^\d+()\-\s.]/g, '').replace(/\s+/g, ' ').trim(),
    email: /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email) ? email : '',
    address: str(src.address, 160),
    hours: str(src.hours, 120),
    telegram: handle(src.telegram, /^[A-Za-z0-9_]{3,40}$/, 't\\.me'),
    whatsapp: str(src.whatsapp, 30).replace(/\D/g, '').match(/^\d{7,15}$/)?.[0] ?? '',
    instagram: handle(src.instagram, /^[A-Za-z0-9_.]{2,40}$/, 'instagram\\.com'),
    vk: handle(src.vk, /^[A-Za-z0-9_.]{2,40}$/, 'vk\\.com'),
    primary: ['form', 'phone', 'telegram', 'whatsapp'].includes(src.primary) ? src.primary : 'form',
  };
}

/** Клиент может ссылаться только на файлы, которые он сам загрузил на этот сайт. */
export function cleanMedia(raw, allowedUrls) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const ok = (u) => (typeof u === 'string' && allowedUrls.has(u) ? u : null);
  return {
    logo: ok(src.logo),
    hero: ok(src.hero),
    about: ok(src.about),
    gallery: (Array.isArray(src.gallery) ? src.gallery : []).filter((u) => allowedUrls.has(u)).slice(0, 12),
    logoMode: src.logoMode === 'logo' ? 'logo' : 'both',
  };
}
