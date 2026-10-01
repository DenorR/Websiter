import { h, icon, group, colorField, contrast } from '../ui.js';

const KEYS = [['bg', 'Фон'], ['text', 'Текст'], ['accent', 'Акцент'], ['accent2', 'Доп. цвет'], ['surface', 'Карточки']];

export default function colors(ed) {
  const tpl = ed.template;
  const brand = ed.content.brand;
  const current = () => ed.site.tokens ?? {};

  const presets = [
    { id: 'ai', name: 'Цвета ИИ', bg: tpl.palettes[0].bg, text: tpl.palettes[0].text, accent: brand.accent, accent2: brand.accent2 },
    ...tpl.palettes,
  ];
  const activeId = () => {
    const p = ed.design.palette;
    if (p === 'auto') return tpl.brandable ? 'ai' : tpl.palettes[0].id;
    return p;
  };

  const grid = h('div', { class: 'pal-grid' });
  const drawPresets = () => {
    grid.replaceChildren(...presets.map((p) =>
      h('button', { class: `pal${activeId() === p.id ? ' on' : ''}`, title: p.name, onClick: () => {
        ed.commit((s) => { s.design.palette = p.id; s.design.colors = {}; });
        drawPresets(); syncPickers();
      } },
        h('span', { class: 'pal-sw' }, ...[p.bg, p.text, p.accent, p.accent2 ?? p.accent].map((c) => h('i', { style: { background: c } }))),
        h('b', null, p.name))));
  };
  drawPresets();

  // Свои цвета
  const pickers = {};
  const hint = h('div', { class: 'ctr' });
  const setColor = (key, value) => {
    const t = current();
    ed.commit((s) => {
      const base = s.design.palette === 'custom' ? s.design.colors : Object.fromEntries(KEYS.map(([k]) => [k, t[k]]));
      s.design.palette = 'custom';
      s.design.colors = { ...base, [key]: value };
    }, { coalesce: `color:${key}` });
    drawPresets();
  };
  const pickerRow = h('div', { class: 'cols' }, ...KEYS.map(([key, label]) => {
    pickers[key] = colorField(label, current()[key] ?? '#000000', (v) => setColor(key, v));
    return pickers[key];
  }));

  function syncPickers() {
    const t = current();
    for (const [k] of KEYS) pickers[k].set(t[k] ?? '#000000');
    drawHint();
  }
  function drawHint() {
    const t = current();
    if (!t.bg) return;
    const check = (label, a, b, min) => {
      const r = contrast(a, b);
      return h('div', { class: `ctr-i ${r >= min ? 'ok' : 'warn'}` }, h('span', null, r >= min ? '✓' : '!'), h('b', null, `${r.toFixed(1)}:1`), label);
    };
    hint.replaceChildren(
      check('текст на фоне', t.text, t.bg, 4.5),
      check('акцент на фоне', t.accent, t.bg, 3),
    );
  }
  ed.onTab('tokens', () => { syncPickers(); });
  ed.onTab('sync', () => {});
  drawHint();

  return h('div', { class: 'tab' },
    group('Палитра', h('p', { class: 'fld-h' }, 'Готовые сочетания для этого шаблона. «Цвета ИИ» — подобраны под ваш бизнес.'), grid),
    group('Свои цвета', pickerRow, hint,
      h('button', { class: 'btn btn-line btn-sm', onClick: () => { ed.commit((s) => { s.design.palette = 'auto'; s.design.colors = {}; }, { external: true }); } }, icon('reset', 15), 'Вернуть цвета шаблона')),
  );
}
