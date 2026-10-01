import { h, icon, group, seg, slider, switchRow } from '../ui.js';

export default function style(ed) {
  const tpl = ed.template;
  const so = ed.config.styleOptions;
  const opt = (k) => [['auto', 'Авто'], ...so[k]];
  const set = (k, v) => ed.commit((s) => { s.design[k] = v; }, { coalesce: `style:${k}` });
  const row = (label, k, { wrap = false, hint } = {}) =>
    h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, label), seg(opt(k), ed.design[k], (v) => set(k, v), { cls: wrap ? 'wrap' : '' }), hint ? h('p', { class: 'fld-h' }, hint) : null);

  const radiusLabel = (v) => (v === null ? 'как в шаблоне' : `${v} px`);
  const radius = slider({ min: 0, max: 40, value: ed.design.radius ?? 12, format: radiusLabel,
    onInput: (v) => ed.commit((s) => { s.design.radius = v; }, { coalesce: 'radius' }) });
  if (ed.design.radius === null) radius.querySelector('output').textContent = radiusLabel(null);

  // Графика
  const artWrap = h('div', { class: 'art-grid' });
  const artCurrent = () => (ed.design.art === 'auto' ? tpl.art : ed.design.art);
  const seed = ed.site.id;
  const initial = [...ed.content.brand.name.replace(/\*/g, '')][0] ?? 'A';
  const vars = () => {
    const t = ed.site.tokens ?? {};
    return `--accent:${t.accent};--accent-2:${t.accent2};--text:${t.text};--bg:${t.bg};--surface:${t.surface};--surface-2:${t.surface2};--border:${t.border};--muted:${t.muted};--font-head:serif;background:${t.bg}`;
  };
  const drawArt = () => {
    artWrap.replaceChildren(
      ...ed.config.art.map((a) => {
        const cell = h('button', { class: `art-c${artCurrent() === a.id && !ed.media.hero ? ' on' : ''}`, title: a.label, onClick: () => { ed.commit((s) => { s.design.art = a.id; }); drawArt(); } }, h('span', { class: 'art-v', style: vars() }), h('b', null, a.label));
        fetch(`/api/art/${a.id}?seed=${encodeURIComponent(`${seed}:hero`)}&initial=${encodeURIComponent(initial)}`).then((r) => r.text()).then((svg) => { cell.firstChild.innerHTML = svg; });
        return cell;
      }),
      h('button', { class: `art-c${ed.design.art === 'none' ? ' on' : ''}`, onClick: () => { ed.commit((s) => { s.design.art = 'none'; }); drawArt(); } }, h('span', { class: 'art-v none' }, 'Нет'), h('b', null, 'Без графики')),
    );
  };
  drawArt();
  ed.onTab('tokens', () => artWrap.querySelectorAll('.art-v').forEach((el) => el.setAttribute('style', vars())));

  return h('div', { class: 'tab' },
    group('Форма',
      h('div', { class: 'fld' }, h('label', { class: 'fld-l' }, 'Скругление углов'), radius,
        h('button', { class: 'btn btn-line btn-sm', onClick: () => { ed.commit((s) => { s.design.radius = null; }, { external: true }); } }, icon('reset', 15), 'Как в шаблоне')),
      row('Форма картинок', 'mediaShape'),
    ),
    group('Кнопки',
      row('Стиль', 'buttonStyle'),
      row('Форма', 'buttonShape'),
    ),
    group('Карточки и блоки',
      row('Карточки', 'cards', { wrap: true }),
      row('Отступы между блоками', 'density'),
      row('Ширина содержимого', 'width'),
    ),
    group('Заголовки и значки',
      row('Заголовки блоков', 'head', { wrap: true }),
      row('Подпись над заголовком («01 — Услуги»)', 'kicker'),
      row('Значки в карточках', 'icons', { wrap: true }),
    ),
    group('Графика', h('p', { class: 'fld-h' }, 'Рисуется под ваши цвета. Загрузите фото во вкладке «Фото» — оно заменит графику.'), artWrap),
    group('Эффекты',
      row('Зерно (плёночная текстура)', 'grain'),
      row('Анимация появления', 'motion', { wrap: true }),
      row('Бегущая строка под первым экраном', 'ticker'),
    ),
  );
}
