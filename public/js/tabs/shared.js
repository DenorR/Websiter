import { h, icon } from '../ui.js';

/** Оформление «как в шаблоне»: все переопределения сброшены. */
export function pristineDesign(ed, templateId) {
  const d = { template: templateId, palette: 'auto', colors: {}, fonts: {}, layouts: {}, radius: null, art: 'auto' };
  for (const key of Object.keys(ed.config.styleOptions)) d[key] = 'auto';
  return d;
}

export function applyTemplate(ed, id) {
  if (ed.design.template === id) return;
  ed.commit((s) => {
    s.design = pristineDesign(ed, id);
    for (const sec of s.content.sections) delete sec.layout; // свои варианты вёрстки привязаны к старому шаблону
  }, { external: true });
}

/** Живая миниатюра шаблона: настоящая страница шириной 1280px, уменьшенная под ширину карточки. */
export function thumb(templateId, { ratio = '16 / 11', lazy = true } = {}) {
  const frame = h('iframe', { src: `/demo/${templateId}`, tabindex: '-1', sandbox: 'allow-scripts', title: '', 'aria-hidden': 'true', loading: lazy ? 'lazy' : 'eager' });
  const box = h('div', { class: 'thumb', style: { aspectRatio: ratio } }, frame);
  new ResizeObserver(([e]) => { frame.style.transform = `scale(${e.contentRect.width / 1280})`; }).observe(box);
  return box;
}

/** Кнопка с текущей иконкой, по клику — сетка всех доступных иконок. */
export function iconPicker(ed, value, onPick) {
  const svg = (name, size) => {
    const span = h('span', { class: 'i' });
    span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ed.config.icons[name] ?? ''}</svg>`;
    return span;
  };
  let pop = null;
  const btn = h('button', { type: 'button', class: 'icon-pick', title: 'Выбрать иконку' }, svg(value, 18));
  const close = () => { pop?.remove(); pop = null; document.removeEventListener('pointerdown', away, true); };
  const away = (e) => { if (pop && !pop.contains(e.target) && !btn.contains(e.target)) close(); };
  btn.addEventListener('click', () => {
    if (pop) return close();
    pop = h('div', { class: 'icon-pop' }, ...Object.keys(ed.config.icons).map((name) =>
      h('button', { type: 'button', title: name, class: name === value ? 'on' : '', onClick: () => { value = name; btn.replaceChildren(svg(name, 18)); onPick(name); close(); } }, svg(name, 20)),
    ));
    btn.after(pop);
    document.addEventListener('pointerdown', away, true);
  });
  return btn;
}

export const sectionName = (ed, type) => ed.config.sectionLabels[type] ?? type;

export function empty(text) {
  return h('p', { class: 'empty' }, text);
}

export { icon };
