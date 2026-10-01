// Генеративная графика вместо стоковых фото и серых заглушек.
// Каждый стиль — детерминированная SVG-композиция (зависит от seed), цвета берутся из CSS-переменных
// страницы, поэтому графика мгновенно перекрашивается вместе с палитрой.

function rng(seedStr) {
  let h = 1779033703 ^ String(seedStr).length;
  for (const ch of String(seedStr)) {
    h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h ^= h >>> 16) >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const f = (n) => Math.round(n * 10) / 10;
const svg = (name, body, vb = '0 0 800 800') =>
  `<svg class="art art-${name}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${body}</svg>`;

// Палитра графики (CSS-переменные)
const C = {
  accent: 'var(--accent)', accent2: 'var(--accent-2)', text: 'var(--text)', bg: 'var(--bg)',
  surface: 'var(--surface)', surface2: 'var(--surface-2)', border: 'var(--border)', muted: 'var(--muted)',
};

// ───────── Баухаус: сетка геометрических плиток ─────────
function blocks(r) {
  const n = 4, s = 200;
  const fills = [C.accent, C.accent2, C.text, C.surface2, C.surface];
  const grid = [];
  let out = '';
  for (let y = 0; y < n; y++) {
    grid[y] = [];
    for (let x = 0; x < n; x++) {
      let ci;
      do ci = Math.floor(r() * fills.length);
      while ((x && grid[y][x - 1] === ci) || (y && grid[y - 1][x] === ci));
      grid[y][x] = ci;
      const col = fills[ci];
      const bgc = fills[(ci + 1 + Math.floor(r() * 3)) % fills.length];
      const X = x * s, Y = y * s;
      const kind = Math.floor(r() * 7);
      out += `<rect x="${X}" y="${Y}" width="${s}" height="${s}" fill="${bgc === col ? C.bg : bgc}"/>`;
      const rot = Math.floor(r() * 4);
      const t = `transform="rotate(${rot * 90} ${X + s / 2} ${Y + s / 2})"`;
      if (kind === 0) out += `<rect x="${X}" y="${Y}" width="${s}" height="${s}" fill="${col}"/>`;
      else if (kind === 1) out += `<circle cx="${X + s / 2}" cy="${Y + s / 2}" r="${s / 2 - 14}" fill="${col}"/>`;
      else if (kind === 2) out += `<path ${t} d="M${X} ${Y}h${s}A${s} ${s} 0 0 1 ${X} ${Y + s}z" fill="${col}"/>`;
      else if (kind === 3) out += `<path ${t} d="M${X} ${Y + s}A${s / 2} ${s / 2} 0 0 1 ${X + s} ${Y + s}z" fill="${col}"/>`;
      else if (kind === 4) out += `<path ${t} d="M${X} ${Y}L${X + s} ${Y + s}H${X}z" fill="${col}"/>`;
      else if (kind === 5) out += `<circle cx="${X + s / 2}" cy="${Y + s / 2}" r="${s / 2 - 34}" fill="none" stroke="${col}" stroke-width="34"/>`;
      else out += `<rect x="${X + 40}" y="${Y + 40}" width="${s - 80}" height="${s - 80}" fill="${col}"/>`;
    }
  }
  return svg('blocks', out);
}

// ───────── Арки (бохо-постер) ─────────
function arches(r) {
  const fills = [C.accent, C.accent2, C.text, C.surface2];
  let out = `<circle cx="${f(520 + r() * 120)}" cy="${f(210 + r() * 60)}" r="${f(110 + r() * 30)}" fill="${C.accent2}" opacity=".9"/>`;
  const n = 5, w = 128, gap = 22;
  const total = n * w + (n - 1) * gap;
  let x = (800 - total) / 2;
  const hs = Array.from({ length: n }, () => 280 + r() * 330);
  hs[Math.floor(r() * n)] = 640;
  for (let i = 0; i < n; i++) {
    const h = hs[i], base = 760, top = base - h, rr = w / 2;
    out += `<path d="M${f(x)} ${base}V${f(top + rr)}a${rr} ${rr} 0 0 1 ${w} 0V${base}z" fill="${fills[(i + Math.floor(r() * 2)) % fills.length]}"/>`;
    // внутренняя арка-линия
    if (r() > 0.45) out += `<path d="M${f(x + 20)} ${base}V${f(top + rr + 6)}a${rr - 20} ${rr - 20} 0 0 1 ${w - 40} 0V${base}" fill="none" stroke="${C.bg}" stroke-width="3" opacity=".55"/>`;
    x += w + gap;
  }
  out += `<rect x="0" y="760" width="800" height="40" fill="${C.text}"/>`;
  return svg('arches', out);
}

// ───────── Линии-волны ─────────
function lines(r) {
  const count = 34;
  const ph = r() * 6.28, f1 = 0.006 + r() * 0.004, f2 = 0.013 + r() * 0.006, amp = 70 + r() * 50;
  let out = '';
  for (let i = 0; i < count; i++) {
    const y0 = 90 + (i / (count - 1)) * 620;
    let d = '';
    for (let x = -20; x <= 820; x += 20) {
      const k = i / count;
      const y = y0 + Math.sin(x * f1 + ph + k * 2.4) * amp * (0.35 + k) + Math.sin(x * f2 + ph * 1.7 + k * 5) * amp * 0.28;
      d += `${x === -20 ? 'M' : 'L'}${x} ${f(y)}`;
    }
    const op = 0.25 + 0.75 * (i % 5 === 0 ? 1 : 0.5);
    out += `<path d="${d}" fill="none" stroke="${i % 7 === 0 ? C.accent2 : C.accent}" stroke-width="${i % 5 === 0 ? 2.4 : 1.4}" opacity="${f(op)}" stroke-linejoin="round"/>`;
  }
  return svg('lines', out);
}

// ───────── Контурные карты ─────────
function contour(r) {
  const cx = 360 + r() * 100, cy = 360 + r() * 100;
  const p1 = r() * 6.28, p2 = r() * 6.28, p3 = r() * 6.28;
  let out = '';
  const rings = 15;
  for (let k = rings; k >= 1; k--) {
    const R = k * 27 + 18;
    let d = '';
    for (let a = 0; a <= 64; a++) {
      const th = (a / 64) * Math.PI * 2;
      const wob = 1 + 0.12 * Math.sin(3 * th + p1 + k * 0.14) + 0.07 * Math.sin(5 * th + p2 - k * 0.1) + 0.04 * Math.sin(7 * th + p3);
      d += `${a ? 'L' : 'M'}${f(cx + Math.cos(th) * R * wob)} ${f(cy + Math.sin(th) * R * wob)}`;
    }
    d += 'Z';
    const fill = k === 3 ? C.accent : k === 6 ? C.accent2 : 'none';
    out += `<path d="${d}" fill="${fill}" fill-opacity="${k === 3 ? 1 : 0.9}" stroke="${C.text}" stroke-opacity="${f(0.16 + (k % 3 === 0 ? 0.3 : 0))}" stroke-width="${k % 3 === 0 ? 2 : 1.2}" stroke-linejoin="round"/>`;
  }
  return svg('contour', out);
}

// ───────── Растровые точки (halftone) ─────────
function dots(r) {
  const n = 22, step = 800 / n;
  const fx = r() > 0.5 ? 0.12 : 0.88, fy = r() > 0.5 ? 0.12 : 0.88;
  let out = '';
  const maxD = Math.hypot(0.9, 0.9);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const nx = (x + 0.5) / n, ny = (y + 0.5) / n;
      const d = Math.hypot(nx - fx, ny - fy) / maxD;
      const rad = (step / 2 - 1) * Math.max(0, 1 - d * 1.15) ** 1.15;
      if (rad < 0.8) continue;
      out += `<circle cx="${f(nx * 800)}" cy="${f(ny * 800)}" r="${f(rad)}" fill="${(x + y) % 11 === 0 ? C.accent2 : C.accent}"/>`;
    }
  }
  return svg('dots', out);
}

// ───────── Диагональные полосы ─────────
function stripes(r) {
  const fills = [C.accent, C.text, C.accent2, C.surface2];
  let out = '';
  let x = -900;
  let i = 0;
  while (x < 1000) {
    const w = 50 + Math.floor(r() * 90);
    out += `<polygon points="${x},800 ${x + w},800 ${x + w + 800},0 ${x + 800},0" fill="${fills[i % fills.length]}"/>`;
    x += w + (r() > 0.6 ? 36 : 0);
    i++;
  }
  // солнце-круг
  out += `<circle cx="${f(560 + r() * 100)}" cy="${f(220 + r() * 80)}" r="${f(90 + r() * 40)}" fill="${C.bg}"/>`;
  return svg('stripes', out);
}

// ───────── Техническая сетка + график ─────────
function grid(r) {
  let out = '';
  const s = 50;
  for (let i = 0; i <= 800; i += s) {
    out += `<path d="M${i} 0V800M0 ${i}H800" stroke="${C.border}" stroke-width="${i % 200 === 0 ? 1.6 : 1}"/>`;
  }
  // выделенные ячейки
  for (let i = 0; i < 5; i++) {
    const gx = Math.floor(r() * 14) * s, gy = Math.floor(r() * 14) * s;
    out += `<rect x="${gx}" y="${gy}" width="${s * (1 + Math.floor(r() * 2))}" height="${s}" fill="${i % 2 ? C.accent2 : C.accent}" opacity="${f(0.2 + r() * 0.45)}"/>`;
  }
  // линия роста
  let y = 640;
  let d = '';
  const pts = [];
  for (let x = 50; x <= 750; x += 50) {
    y = Math.max(120, Math.min(700, y - 40 + (r() - 0.35) * 80));
    pts.push([x, y]);
    d += `${d ? 'L' : 'M'}${x} ${f(y)}`;
  }
  out += `<path d="${d}" fill="none" stroke="${C.accent}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
  pts.forEach(([px, py], i) => {
    out += `<circle cx="${px}" cy="${f(py)}" r="${i === pts.length - 1 ? 11 : 6}" fill="${i === pts.length - 1 ? C.accent : C.bg}" stroke="${C.accent}" stroke-width="3"/>`;
  });
  // прицелы на пересечениях
  for (let i = 0; i < 6; i++) {
    const cx = (1 + Math.floor(r() * 14)) * s, cy = (1 + Math.floor(r() * 14)) * s;
    out += `<path d="M${cx - 8} ${cy}h16M${cx} ${cy - 8}v16" stroke="${C.text}" stroke-width="2"/>`;
  }
  return svg('grid', out);
}

// ───────── Слоистые волны ─────────
function waves(r) {
  const layers = [
    [C.surface2, 0.9], [C.accent2, 0.35], [C.accent2, 0.7], [C.accent, 0.55], [C.accent, 1],
  ];
  let out = '';
  layers.forEach(([col, op], i) => {
    const base = 250 + i * 118;
    const A = 40 + r() * 40, fr = 0.006 + r() * 0.005, ph = r() * 6.28;
    let d = `M-20 800V${f(base)}`;
    for (let x = -20; x <= 820; x += 20) d += `L${x} ${f(base + Math.sin(x * fr + ph) * A + Math.sin(x * fr * 2.3 + ph * 2) * A * 0.35)}`;
    d += 'V800z';
    out += `<path d="${d}" fill="${col}" opacity="${op}"/>`;
  });
  out += `<circle cx="${f(560 + r() * 120)}" cy="${f(160 + r() * 50)}" r="70" fill="${C.accent}" opacity=".95"/>`;
  return svg('waves', out);
}

// ───────── Монограмма ─────────
function mono(r, { initial = 'A' } = {}) {
  const ch = String(initial).slice(0, 1).toUpperCase() || 'A';
  let out = `<circle cx="400" cy="400" r="330" fill="none" stroke="${C.border}" stroke-width="2"/>`;
  out += `<circle cx="400" cy="400" r="270" fill="none" stroke="${C.accent}" stroke-width="1.5" stroke-dasharray="3 9"/>`;
  out += `<text x="400" y="${f(400 + 150)}" text-anchor="middle" font-family="var(--font-head)" font-weight="500" font-size="470" fill="${C.accent}" style="letter-spacing:0">${ch.replace(/[<>&]/g, '')}</text>`;
  const a = r() * 6.28;
  out += `<circle cx="${f(400 + Math.cos(a) * 330)}" cy="${f(400 + Math.sin(a) * 330)}" r="14" fill="${C.accent2}"/>`;
  return svg('mono', out);
}

// ───────── Листья ─────────
function leaves(r) {
  let out = '';
  const cols = [C.accent, C.accent2, C.text, C.surface2];
  const n = 11;
  for (let i = 0; i < n; i++) {
    const ang = -90 + (i - (n - 1) / 2) * (150 / (n - 1)) + (r() - 0.5) * 8;
    const len = 330 + r() * 250, wid = 48 + r() * 36;
    const col = cols[Math.floor(r() * cols.length)];
    out += `<g transform="translate(400 760) rotate(${f(ang + 90)})"><path d="M0 0C${f(wid)} ${f(-len * 0.35)} ${f(wid * 0.6)} ${f(-len * 0.8)} 0 ${f(-len)}C${f(-wid * 0.6)} ${f(-len * 0.8)} ${f(-wid)} ${f(-len * 0.35)} 0 0z" fill="${col}" opacity="${f(0.55 + r() * 0.45)}"/><path d="M0 0V${f(-len * 0.92)}" stroke="${C.bg}" stroke-width="2.5" opacity=".6"/></g>`;
  }
  out += `<circle cx="400" cy="760" r="16" fill="${C.text}"/>`;
  return svg('leaves', out);
}

export const ART_STYLES = {
  blocks: { label: 'Геометрия', fn: blocks },
  arches: { label: 'Арки', fn: arches },
  lines: { label: 'Линии', fn: lines },
  contour: { label: 'Контуры', fn: contour },
  dots: { label: 'Растр', fn: dots },
  stripes: { label: 'Полосы', fn: stripes },
  grid: { label: 'Сетка', fn: grid },
  waves: { label: 'Волны', fn: waves },
  mono: { label: 'Монограмма', fn: mono },
  leaves: { label: 'Листья', fn: leaves },
};
export const ART_IDS = Object.keys(ART_STYLES);

/** SVG-композиция; seed делает её уникальной для каждого сайта. */
export function renderArt(style, seed, opts = {}) {
  const def = ART_STYLES[style];
  if (!def) return '';
  return def.fn(rng(`${style}:${seed}`), opts);
}
