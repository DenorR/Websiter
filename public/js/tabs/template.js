import { h } from '../ui.js';
import { applyTemplate, thumb } from './shared.js';

export default function template(ed) {
  let cat = 'all';
  const grid = h('div', { class: 'tpl-grid' });
  const chips = h('div', { class: 'chips sm' });
  const rec = new Set(ed.content.recommendedTemplates ?? []);

  const draw = () => {
    chips.replaceChildren(...ed.config.categories.map(([id, label]) =>
      h('button', { class: `chip${id === cat ? ' on' : ''}`, onClick: () => { cat = id; draw(); } }, label)));
    const list = ed.config.templates
      .filter((t) => cat === 'all' || t.categories.includes(cat))
      .sort((a, b) => (rec.has(b.id) ? 1 : 0) - (rec.has(a.id) ? 1 : 0));
    grid.replaceChildren(...list.map((t) => {
      const p = t.palettes[0];
      return h('button', { class: `tpl${t.id === ed.design.template ? ' on' : ''}`, title: `Подходит: ${t.best}`, onClick: () => applyTemplate(ed, t.id) },
        thumb(t.id, { ratio: '4 / 3' }),
        h('span', { class: 'tpl-n' },
          h('span', { class: 'sw3' }, h('i', { style: { background: p.bg } }), h('i', { style: { background: p.text } }), h('i', { style: { background: p.accent } })),
          h('b', null, t.name), rec.has(t.id) ? h('em', null, 'ИИ') : null),
        h('small', null, t.tagline));
    }));
  };
  draw();

  return h('div', { class: 'tab' },
    h('p', { class: 'fld-h' }, 'Смена шаблона сбрасывает ручные настройки оформления, тексты и фото остаются. Всегда можно отменить.'),
    chips, grid);
}
