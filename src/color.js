// Работа с цветом: контраст, смешивание, вывод всех токенов палитры из нескольких базовых цветов.

const HEX = /^#[0-9a-f]{6}$/i;

export function expandHex(value) {
  const v = String(value ?? '').trim();
  if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + [...v.slice(1)].map((c) => c + c).join('');
  return v;
}

export function validHex(value, fallback) {
  const v = expandHex(value);
  return HEX.test(v) ? v.toLowerCase() : fallback;
}

export const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const toHex = (rgb) =>
  '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');

export const luminance = (hex) => {
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
  // тянем к тому из полюсов, который контрастнее фону (на средне-серых это чёрный, а не белый)
  const target = contrast('#ffffff', bg) >= contrast('#000000', bg) ? '#ffffff' : '#000000';
  for (let t = 0.04; t <= 1; t += 0.04) {
    const c = mix(fg, target, t);
    if (contrast(c, bg) >= min) return c;
  }
  return target;
}

/** Цвет текста поверх заданного фона. */
export const onColor = (bg, light = '#ffffff', dark = '#111111') =>
  contrast(bg, light) >= contrast(bg, dark) ? light : dark;

/** Из списка кандидатов — цвет с наибольшим контрастом к фону. */
export const bestOn = (bg, candidates) => candidates.reduce((best, c) => (contrast(c, bg) > contrast(best, bg) ? c : best));

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function hslToHex([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
}

export function shiftHue(hex, deg) {
  const [h, s, l] = rgbToHsl(toRgb(hex));
  return hslToHex([(((h + deg) % 360) + 360) % 360, s, l]);
}

export function tint(hex, dl) {
  const [h, s, l] = rgbToHsl(toRgb(hex));
  return hslToHex([h, s, Math.min(1, Math.max(0, l + dl))]);
}

export const isDark = (hex) => luminance(hex) < 0.32;

/**
 * Палитра -> полный набор токенов.
 * На входе достаточно bg, text, accent. Остальное выводится и подгоняется под читаемость.
 */
export function deriveTokens(p, { band = 'text' } = {}) {
  const bg = validHex(p.bg, '#ffffff');
  const dark = isDark(bg);
  const text = ensureContrast(validHex(p.text, dark ? '#f2f2f2' : '#111111'), bg, 7);
  let accent = validHex(p.accent, '#2563eb');
  // Акцент не должен «растворяться» в фоне страницы (кнопки, плашки)
  if (contrast(accent, bg) < 2.2) accent = ensureContrast(accent, bg, 2.6);
  const accent2 = validHex(p.accent2, '') || shiftHue(accent, 28);

  const surface = validHex(p.surface, '') || (dark ? mix(bg, '#ffffff', 0.06) : mix(bg, '#ffffff', 0.62));
  const surface2 = validHex(p.surface2, '') || (dark ? mix(bg, '#ffffff', 0.035) : mix(bg, text, 0.045));
  const muted = validHex(p.muted, '') || ensureContrast(mix(text, bg, dark ? 0.36 : 0.4), bg, 4.5);
  const border = validHex(p.border, '') || mix(bg, text, dark ? 0.17 : 0.14);
  const accentFg = ensureContrast(accent, bg, 4.5);
  const accent2Fg = ensureContrast(accent2, bg, 4.5);

  // «Плашка» — инвертированный блок страницы (CTA, подвал, акцентные плитки)
  const bandBg = { text, accent, accent2, surface2 }[band] ?? text;

  const onBand = [bg, text].find((c) => contrast(c, bandBg) >= 7) ?? bestOn(bandBg, ['#ffffff', '#111111']);
  // Если плашка залита акцентом, акцент на ней не виден: выделения и кнопки переворачиваем
  const bandIsAccent = contrast(accent, bandBg) < 1.6;
  const bandEm = bandIsAccent ? onBand : ensureContrast(accent, bandBg, 4.5);
  const bandBtn = bandIsAccent ? onBand : accent;
  const bandBtnFg = bandIsAccent ? bandBg : onColor(accent);

  return {
    bandEm, bandBtn, bandBtnFg,
    bg, surface, surface2, text, muted, border,
    accent, accent2, accentFg, accent2Fg,
    onAccent: onColor(accent),
    onAccent2: onColor(accent2),
    band: bandBg,
    onBand,
    dark,
  };
}

/** Токены -> CSS-переменные. */
export function tokensToVars(t) {
  return (
    `--bg:${t.bg};--surface:${t.surface};--surface-2:${t.surface2};--text:${t.text};--muted:${t.muted};--border:${t.border};` +
    `--accent:${t.accent};--accent-2:${t.accent2};--accent-fg:${t.accentFg};--accent2-fg:${t.accent2Fg};` +
    `--on-accent:${t.onAccent};--on-accent2:${t.onAccent2};--band:${t.band};--on-band:${t.onBand};` +
    `--band-em:${t.bandEm};--band-btn:${t.bandBtn};--band-btn-fg:${t.bandBtnFg};` +
    `color-scheme:${t.dark ? 'dark' : 'light'};`
  );
}
