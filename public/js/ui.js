// Мелкие помощники интерфейса. DOM строим через h(): текст всегда попадает как textContent,
// поэтому ничего из присланного сервером/ИИ не может стать разметкой.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v; // только для статических строк в коде
    else if (['value', 'checked', 'disabled', 'selected', 'readOnly', 'multiple', 'min', 'max', 'step', 'rows'].includes(k)) el[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  const add = (c) => {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(add);
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  };
  children.forEach(add);
  return el;
}

export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export function debounce(fn, ms) {
  let t;
  let args;
  const run = () => { t = null; fn(...args); };
  const w = (...a) => { args = a; clearTimeout(t); t = setTimeout(run, ms); };
  w.flush = () => { if (t) { clearTimeout(t); run(); } };
  w.cancel = () => { clearTimeout(t); t = null; };
  w.pending = () => !!t;
  return w;
}

export function throttle(fn, ms) {
  let last = 0;
  let t;
  let args;
  return (...a) => {
    args = a;
    const now = Date.now();
    const wait = ms - (now - last);
    clearTimeout(t);
    if (wait <= 0) { last = now; fn(...args); }
    else t = setTimeout(() => { last = Date.now(); fn(...args); }, wait);
  };
}

let toastTimer;
export function toast(text, ms = 2400) {
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), ms);
}

// ───────────── Иконки интерфейса ─────────────

const P = {
  ai: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3v4M17 5h4"/>',
  template: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2.2-.6-1.4.3-2.8 1.8-2.8H18a3 3 0 0 0 3-3C21 7 17 3 12 3z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>',
  type: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
  style: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  text: '<path d="M4 6h16M4 12h10M4 18h16"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 9"/>',
  contact: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  external: '<path d="M7 17 17 7M8 7h9v9"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.5 6.7C3.7 8.5 2 12 2 12s4 6 10 6a9.6 9.6 0 0 0 4-.9"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  tablet: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>',
  mobile: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  grip: '<circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/>',
  reset: '<path d="M4 4v6h6"/><path d="M5 14a8 8 0 1 0 2-7L4 10"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
};

export function icon(name, size = 18) {
  const span = document.createElement('span');
  span.className = 'i';
  span.style.width = span.style.height = `${size}px`;
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="${size}" height="${size}" aria-hidden="true">${P[name] ?? ''}</svg>`;
  return span;
}

// ───────────── Контролы ─────────────

/** Сегментированный переключатель. options: [[value, label, подсказка?], …] */
export function seg(options, value, onChange, { cls = '', title } = {}) {
  const root = h('div', { class: `seg ${cls}`, role: 'radiogroup', title });
  const render = (cur) => {
    root.replaceChildren(
      ...options.map(([v, label, tip]) =>
        h('button', {
          type: 'button', role: 'radio', title: tip, 'aria-checked': v === cur ? 'true' : 'false', class: v === cur ? 'on' : '',
          onClick: () => { render(v); onChange(v); },
        }, label),
      ),
    );
  };
  render(value);
  root.set = render;
  return root;
}

export function field(label, control, hint) {
  return h('div', { class: 'fld' },
    label ? h('label', { class: 'fld-l' }, label) : null,
    control,
    hint ? h('p', { class: 'fld-h' }, hint) : null,
  );
}

export function textInput({ value = '', placeholder = '', maxlength, type = 'text', onInput, multiline = false, rows = 3 }) {
  const el = multiline
    ? h('textarea', { rows, placeholder, maxlength })
    : h('input', { type, placeholder, maxlength });
  el.value = value ?? '';
  el.addEventListener('input', () => onInput?.(el.value));
  return el;
}

export function slider({ min, max, step = 1, value, onInput, format = (v) => v }) {
  const out = h('output', { class: 'sl-o' }, format(value));
  const input = h('input', { type: 'range', min, max, step, value });
  input.addEventListener('input', () => { out.textContent = format(+input.value); onInput(+input.value); });
  const wrap = h('div', { class: 'sl' }, input, out);
  wrap.set = (v) => { input.value = v; out.textContent = format(v); };
  return wrap;
}

export function switchRow(label, checked, onChange, hint) {
  const input = h('input', { type: 'checkbox', checked: !!checked });
  input.addEventListener('change', () => onChange(input.checked));
  return h('label', { class: 'sw' },
    h('span', { class: 'sw-t' }, label, hint ? h('small', null, hint) : null),
    input, h('i'),
  );
}

export function colorField(label, value, onInput) {
  const color = h('input', { type: 'color' });
  color.value = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000';
  const hex = h('input', { type: 'text', maxlength: 7, class: 'hex', spellcheck: 'false' });
  hex.value = color.value;
  color.addEventListener('input', () => { hex.value = color.value; onInput(color.value); });
  hex.addEventListener('input', () => {
    let v = hex.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-f]{6}$/i.test(v)) { color.value = v; onInput(v.toLowerCase()); }
  });
  const root = h('label', { class: 'col' }, h('span', null, label), color, hex);
  root.set = (v) => { if (/^#[0-9a-f]{6}$/i.test(v)) { color.value = v; hex.value = v; } };
  return root;
}

export function group(title, ...children) {
  return h('section', { class: 'grp' }, title ? h('h4', null, title) : null, ...children);
}

// ───────────── Цвет: контраст для подсказок ─────────────

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((s) => (s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
