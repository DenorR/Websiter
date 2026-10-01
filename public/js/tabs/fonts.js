import { h, icon, group, seg } from '../ui.js';

const PAIRS = [
  ['Строгий', 'inter-tight', 'inter'],
  ['Журнал', 'playfair-display', 'literata'],
  ['Люкс', 'cormorant', 'jost'],
  ['Техно', 'jetbrains-mono', 'inter'],
  ['Уютный', 'lora', 'nunito'],
  ['Плакат', 'unbounded', 'rubik'],
  ['Мягкий', 'manrope', 'manrope'],
  ['Деловой', 'source-serif-4', 'golos-text'],
  ['Узкий', 'oswald', 'golos-text'],
  ['Бутик', 'prata', 'jost'],
];

const KIND_TITLES = { sans: 'Гротески', display: 'Акцидентные', serif: 'Антиквы', mono: 'Моноширинные', script: 'Рукописные' };
let fontsLoaded = false;
const loadAllFonts = (ed) => {
  if (fontsLoaded) return;
  fontsLoaded = true;
  document.head.append(h('link', { rel: 'stylesheet', href: `/fonts/css?ids=${ed.config.fonts.map((f) => f.id).join(',')}` }));
};

function fontPicker(ed, role, value, onPick) {
  let pop = null;
  const font = (id) => ed.config.fonts.find((f) => f.id === id);
  const btn = h('button', { type: 'button', class: 'font-pick' });
  const paint = () => {
    const f = font(value);
    btn.replaceChildren(h('span', { style: { fontFamily: f?.stack } }, f?.label ?? '—'), icon('down', 16));
  };
  paint();
  const close = () => { pop?.remove(); pop = null; document.removeEventListener('pointerdown', away, true); };
  const away = (e) => { if (pop && !pop.contains(e.target) && !btn.contains(e.target)) close(); };
  btn.addEventListener('click', () => {
    if (pop) return close();
    loadAllFonts(ed);
    const fits = (f) => f.roles.includes(role === 'body' ? 'body' : 'heading');
    const kinds = ['sans', 'serif', 'display', 'mono', 'script'];
    pop = h('div', { class: 'font-pop' }, ...kinds.flatMap((k) => {
      const list = ed.config.fonts.filter((f) => f.kind === k && (role === 'body' ? fits(f) : true));
      if (!list.length) return [];
      return [h('div', { class: 'font-kind' }, KIND_TITLES[k]), ...list.map((f) =>
        h('button', { type: 'button', class: f.id === value ? 'on' : '', onClick: () => { value = f.id; paint(); onPick(f.id); close(); } },
          h('span', { style: { fontFamily: f.stack } }, f.label), h('small', null, f.note)))];
    }));
    btn.after(pop);
    document.addEventListener('pointerdown', away, true);
  });
  return btn;
}

export default function fonts(ed) {
  const tpl = ed.template;
  const get = (role) => ed.design.fonts[role] ?? tpl.fonts[role] ?? (role === 'accent' ? (ed.design.fonts.heading ?? tpl.fonts.heading) : tpl.fonts.body);
  const set = (role, id) => ed.commit((s) => { s.design.fonts = { ...s.design.fonts, [role]: id }; });
  const opt = (k) => [['auto', 'Как в шаблоне'], ...ed.config.styleOptions[k]];
  const style = (k, v) => ed.commit((s) => { s.design[k] = v; });

  const pairsEl = h('div', { class: 'chips sm' }, ...PAIRS.map(([name, hd, bd]) =>
    h('button', { class: 'chip', title: `${ed.config.fonts.find((f) => f.id === hd)?.label} + ${ed.config.fonts.find((f) => f.id === bd)?.label}`, onClick: () => {
      ed.commit((s) => { s.design.fonts = { heading: hd, body: bd }; }, { external: true });
    } }, name)));

  return h('div', { class: 'tab' },
    group('Готовые пары', pairsEl),
    group('Шрифты',
      h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, 'Заголовки'), fontPicker(ed, 'heading', get('heading'), (id) => set('heading', id))),
      h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, 'Основной текст'), fontPicker(ed, 'body', get('body'), (id) => set('body', id))),
      h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, 'Выделенные слова'), fontPicker(ed, 'accent', get('accent'), (id) => set('accent', id)),
        h('p', { class: 'fld-h' }, 'Слова в *звёздочках* в заголовках. Например, курсивная антиква или рукописный шрифт.')),
      h('button', { class: 'btn btn-line btn-sm', onClick: () => ed.commit((s) => { s.design.fonts = {}; }, { external: true }) }, icon('reset', 15), 'Шрифты шаблона'),
    ),
    group('Размеры',
      h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, 'Основной текст'), seg([['sm', 'Мелкий'], ['md', 'Обычный'], ['lg', 'Крупный']], ed.design.textSize === 'auto' ? 'md' : ed.design.textSize, (v) => style('textSize', v))),
      h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, 'Заголовки'), seg([['sm', 'Компактные'], ['md', 'Обычные'], ['lg', 'Крупные']], ed.design.headingSize === 'auto' ? 'md' : ed.design.headingSize, (v) => style('headingSize', v))),
    ),
    group('Начертание заголовков',
      h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, 'Регистр'), seg(opt('headingCase'), ed.design.headingCase, (v) => style('headingCase', v))),
      h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, 'Толщина'), seg(opt('headingWeight'), ed.design.headingWeight, (v) => style('headingWeight', v), { cls: 'wrap' })),
    ),
  );
}
