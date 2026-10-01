import { h, icon, group } from '../ui.js';
import { sectionName } from './shared.js';

const it = (title, text = '', meta = '', ic = 'check') => ({ icon: ic, title, text, meta });
const STUBS = {
  about: () => ({ type: 'about', navLabel: 'О нас', title: 'О нас', subtitle: '', text: 'Расскажите о себе в паре абзацев: кто вы, чем занимаетесь и почему вам можно доверять.', buttonLabel: '', items: [it('Первое преимущество'), it('Второе преимущество'), it('Третье преимущество')] }),
  features: () => ({ type: 'features', navLabel: 'Услуги', title: 'Чем мы *занимаемся*', subtitle: '', text: '', buttonLabel: '', items: [it('Первая услуга', 'Коротко опишите её.', '', 'star'), it('Вторая услуга', 'Коротко опишите её.', '', 'heart'), it('Третья услуга', 'Коротко опишите её.', '', 'zap')] }),
  process: () => ({ type: 'process', navLabel: 'Как работаем', title: 'Как мы *работаем*', subtitle: '', text: '', buttonLabel: '', items: [it('Заявка', 'Вы рассказываете о задаче.'), it('Работа', 'Мы делаем то, о чём договорились.'), it('Результат', 'Вы получаете готовое.')] }),
  pricing: () => ({ type: 'pricing', navLabel: 'Цены', title: 'Стоимость', subtitle: '', text: '', buttonLabel: '', items: [it('Базовый', 'Что входит\nЕщё пункт', '1 000 ₽'), it('Расширенный', 'Что входит\nЕщё пункт', '2 000 ₽')] }),
  faq: () => ({ type: 'faq', navLabel: 'Вопросы', title: 'Частые *вопросы*', subtitle: '', text: '', buttonLabel: '', items: [it('Первый вопрос?', 'Ответ на него.', '', 'message'), it('Второй вопрос?', 'Ответ на него.', '', 'message')] }),
  cta: () => ({ type: 'cta', navLabel: '', title: 'Готовы *начать*?', subtitle: '', text: 'Свяжитесь с нами — ответим на вопросы.', buttonLabel: 'Связаться', items: [] }),
  manifesto: () => ({ type: 'manifesto', navLabel: 'Подход', title: 'Наш подход', subtitle: '', text: 'Главная мысль вашего бизнеса — *одной фразой*.', buttonLabel: '', items: [] }),
  gallery: () => ({ type: 'gallery', navLabel: 'Галерея', title: 'Галерея', subtitle: '', text: '', buttonLabel: '', items: [] }),
};

export default function sections(ed) {
  const root = h('div', { class: 'tab' });
  const L = ed.config.layouts;

  const draw = () => {
    const tpl = ed.template;
    const secs = ed.content.sections;

    const globalSelect = (key) => {
      const def = tpl.layouts[key];
      const defLabel = L[key].options.find(([v]) => v === def)?.[1] ?? '';
      const sel = h('select', { class: 'mini-sel', 'aria-label': L[key].label }, h('option', { value: '' }, `Как в шаблоне (${defLabel})`),
        ...L[key].options.map(([v, label]) => h('option', { value: v }, label)));
      sel.value = ed.design.layouts?.[key] ?? '';
      sel.addEventListener('change', () => ed.commit((s) => {
        s.design.layouts = { ...s.design.layouts };
        if (sel.value) s.design.layouts[key] = sel.value; else delete s.design.layouts[key];
      }));
      return sel;
    };

    const sectionSelect = (sec) => {
      const opts = L[sec.type]?.options ?? [];
      if (opts.length < 2) return null;
      const def = ed.design.layouts?.[sec.type] ?? tpl.layouts[sec.type];
      const defLabel = opts.find(([v]) => v === def)?.[1] ?? '';
      const sel = h('select', { class: 'mini-sel', 'aria-label': 'Вариант вёрстки' }, h('option', { value: '' }, `Как в шаблоне (${defLabel})`), ...opts.map(([v, label]) => h('option', { value: v }, label)));
      sel.value = sec.layout ?? '';
      sel.addEventListener('change', () => ed.commit((s) => {
        const t = s.content.sections.find((x) => x.type === sec.type);
        if (sel.value) t.layout = sel.value; else delete t.layout;
      }));
      return sel;
    };

    const fixed = (title, key, sec) => h('div', { class: 'blk fixed' },
      h('div', { class: 'blk-h' }, h('span', { class: 'blk-t' }, title), h('button', { class: 'ib', title: 'Показать в предпросмотре', onClick: () => sec && ed.preview.focus(sec) }, icon('eye', 16))),
      globalSelect(key));

    const rows = secs.map((sec, i) => {
      const hidden = !!sec.hidden;
      return h('div', { class: `blk${hidden ? ' off' : ''}`, dataset: { type: sec.type } },
        h('div', { class: 'blk-h' },
          h('button', { class: 'blk-t link', title: 'Редактировать тексты', onClick: () => ed.emit('select', sec.type) }, sectionName(ed, sec.type)),
          h('div', { class: 'blk-a' },
            h('button', { class: 'ib', title: hidden ? 'Показать' : 'Скрыть', onClick: () => { ed.commit((s) => { const t = s.content.sections[i]; if (t.hidden) delete t.hidden; else t.hidden = true; }); draw(); } }, icon(hidden ? 'eyeoff' : 'eye', 16)),
            h('button', { class: 'ib', title: 'Выше', disabled: i === 0, onClick: () => { ed.commit((s) => { const a = s.content.sections; [a[i - 1], a[i]] = [a[i], a[i - 1]]; }); draw(); } }, icon('up', 16)),
            h('button', { class: 'ib', title: 'Ниже', disabled: i === secs.length - 1, onClick: () => { ed.commit((s) => { const a = s.content.sections; [a[i + 1], a[i]] = [a[i], a[i + 1]]; }); draw(); } }, icon('down', 16)),
            h('button', { class: 'ib danger', title: 'Удалить блок', onClick: () => { ed.commit((s) => { s.content.sections.splice(i, 1); }); draw(); } }, icon('trash', 16)),
          )),
        sectionSelect(sec));
    });

    const missing = ed.config.sectionTypes.filter((t) => !secs.some((s) => s.type === t));
    const add = missing.length
      ? group('Добавить блок', h('div', { class: 'chips sm' }, ...missing.map((t) =>
          h('button', { class: 'chip', onClick: () => {
            ed.commit((s) => {
              const a = s.content.sections;
              const at = t === 'manifesto' ? Math.min(1, a.length) : a.findIndex((x) => x.type === 'cta');
              a.splice(at === -1 ? a.length : at, 0, STUBS[t]());
            });
            draw();
            ed.emit('select', t);
          } }, icon('plus', 13), sectionName(ed, t)))))
      : null;

    root.replaceChildren(...[
      h('p', { class: 'fld-h' }, 'Меняйте порядок, скрывайте блоки и выбирайте для каждого свой вариант вёрстки. Нажмите на название блока — откроются его тексты.'),
      fixed('Шапка', 'nav', null),
      fixed('Первый экран', 'hero', 'hero'),
      ...rows,
      fixed('Контакты', 'contact', 'contact'),
      fixed('Подвал', 'footer', null),
      add,
    ].filter(Boolean));
  };
  draw();
  return root;
}
