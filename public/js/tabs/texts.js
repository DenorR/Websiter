import { h, icon, textInput, field, group } from '../ui.js';
import { iconPicker, sectionName } from './shared.js';

export default function texts(ed) {
  const root = h('div', { class: 'tab' });

  const bind = (label, key, get, set, { multiline = false, rows = 2, placeholder = '', hint, maxlength } = {}) =>
    field(label, textInput({ value: get(), multiline, rows, placeholder, maxlength, onInput: (v) => ed.commit((s) => set(s, v), { coalesce: key }) }), hint);

  const sec = (s, type) => s.content.sections.find((x) => x.type === type);

  // ─── Аккордеон ───
  const acc = (id, title, build, { note } = {}) => {
    const body = h('div', { class: 'acc-b' });
    const head = h('button', { class: 'acc-h', type: 'button' }, h('span', null, title, note ? h('small', null, note) : null), icon('chevron', 16));
    const box = h('section', { class: 'acc', dataset: { acc: id } }, head, body);
    const paint = () => {
      const open = ed.ui.open.has(id);
      box.classList.toggle('open', open);
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && !body.childElementCount) body.append(...[].concat(build(() => { body.replaceChildren(); paint(); })).filter(Boolean));
    };
    head.addEventListener('click', () => {
      if (ed.ui.open.has(id)) ed.ui.open.delete(id); else ed.ui.open.add(id);
      paint();
      if (ed.ui.open.has(id)) ed.preview.focus(id);
    });
    paint();
    return box;
  };

  // ─── Первый экран ───
  const hero = acc('hero', 'Первый экран', () => {
    const hl = [0, 1, 2].map((i) => {
      if (!ed.content.hero.highlights[i]) return null;
      return h('div', { class: 'item' },
        h('div', { class: 'item-h' }, iconPicker(ed, ed.content.hero.highlights[i].icon, (name) => ed.commit((s) => { s.content.hero.highlights[i].icon = name; })), h('b', null, `Преимущество ${i + 1}`)),
        bind('Заголовок', `hl${i}t`, () => ed.content.hero.highlights[i].title, (s, v) => { s.content.hero.highlights[i].title = v; }),
        bind('Описание', `hl${i}x`, () => ed.content.hero.highlights[i].text, (s, v) => { s.content.hero.highlights[i].text = v; }));
    });
    return [
      bind('Над заголовком', 'h.eyebrow', () => ed.content.hero.eyebrow, (s, v) => { s.content.hero.eyebrow = v; }),
      bind('Заголовок', 'h.headline', () => ed.content.hero.headline, (s, v) => { s.content.hero.headline = v; }, { multiline: true, rows: 3, hint: 'Выделите слова *звёздочками* — они станут акцентными.' }),
      bind('Подзаголовок', 'h.sub', () => ed.content.hero.subheadline, (s, v) => { s.content.hero.subheadline = v; }, { multiline: true, rows: 3 }),
      bind('Главная кнопка', 'h.cta', () => ed.content.hero.primaryCta, (s, v) => { s.content.hero.primaryCta = v; }, { maxlength: 36 }),
      bind('Вторая кнопка', 'h.cta2', () => ed.content.hero.secondaryCta, (s, v) => { s.content.hero.secondaryCta = v; }, { maxlength: 36, hint: 'Оставьте пустой, чтобы скрыть.' }),
      bind('Бегущая строка (через запятую)', 'h.kw', () => ed.content.hero.keywords.join(', '), (s, v) => { s.content.hero.keywords = v.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 8); }),
      ...hl,
    ];
  });

  // ─── Секции ───
  const ICONED = new Set(['features', 'about']);
  const itemsEditor = (type, redraw) => {
    const list = h('div', { class: 'items' });
    const labels = {
      faq: ['Вопрос', 'Ответ'], pricing: ['Название', 'Состав (каждый пункт с новой строки)'],
      features: ['Заголовок', 'Описание'], about: ['Преимущество', 'Пояснение (необязательно)'], process: ['Шаг', 'Описание'],
    }[type] ?? ['Заголовок', 'Описание'];
    const draw = () => {
      const items = sec(ed.site, type).items;
      list.replaceChildren(...items.map((item, i) =>
        h('div', { class: 'item' },
          h('div', { class: 'item-h' },
            ICONED.has(type) ? iconPicker(ed, item.icon, (name) => ed.commit((s) => { sec(s, type).items[i].icon = name; })) : h('span', { class: 'item-n' }, String(i + 1).padStart(2, '0')),
            h('span', { class: 'grow' }),
            h('button', { class: 'ib', title: 'Выше', disabled: i === 0, onClick: () => { ed.commit((s) => { const a = sec(s, type).items; [a[i - 1], a[i]] = [a[i], a[i - 1]]; }); draw(); } }, icon('up', 15)),
            h('button', { class: 'ib', title: 'Ниже', disabled: i === items.length - 1, onClick: () => { ed.commit((s) => { const a = sec(s, type).items; [a[i + 1], a[i]] = [a[i], a[i + 1]]; }); draw(); } }, icon('down', 15)),
            h('button', { class: 'ib danger', title: 'Удалить', onClick: () => { ed.commit((s) => { sec(s, type).items.splice(i, 1); }); draw(); } }, icon('close', 15))),
          bind(labels[0], `${type}${i}t`, () => sec(ed.site, type).items[i].title, (s, v) => { sec(s, type).items[i].title = v; }),
          bind(labels[1], `${type}${i}x`, () => sec(ed.site, type).items[i].text, (s, v) => { sec(s, type).items[i].text = v; }, { multiline: true, rows: type === 'pricing' ? 4 : 3 }),
          type === 'pricing' ? bind('Цена', `${type}${i}m`, () => sec(ed.site, type).items[i].meta, (s, v) => { sec(s, type).items[i].meta = v; }, { maxlength: 40 }) : null)));
      if (items.length < (type === 'faq' ? 10 : 8)) {
        list.append(h('button', { class: 'btn btn-line btn-sm', onClick: () => {
          ed.commit((s) => { sec(s, type).items.push({ icon: 'check', title: 'Новый пункт', text: '', meta: '' }); }); draw();
        } }, icon('plus', 15), 'Добавить пункт'));
      }
    };
    draw();
    return list;
  };

  const sectionAcc = (s) => {
    const type = s.type;
    const noTitle = type === 'manifesto';
    return acc(type, sectionName(ed, type), () => {
      const out = [
        bind('Название в меню', `${type}.nav`, () => sec(ed.site, type).navLabel, (st, v) => { sec(st, type).navLabel = v; }, { maxlength: 22 }),
      ];
      if (!noTitle) out.push(bind('Заголовок', `${type}.title`, () => sec(ed.site, type).title, (st, v) => { sec(st, type).title = v; }, { multiline: true, rows: 2, hint: 'Выделение: *слово*' }));
      if (!['cta', 'manifesto', 'gallery'].includes(type)) out.push(bind('Подзаголовок', `${type}.sub`, () => sec(ed.site, type).subtitle, (st, v) => { sec(st, type).subtitle = v; }, { multiline: true, rows: 2 }));
      if (['about', 'cta', 'manifesto'].includes(type)) {
        out.push(bind(type === 'about' ? 'Текст (абзацы — через пустую строку)' : type === 'cta' ? 'Текст под заголовком' : 'Фраза', `${type}.text`, () => sec(ed.site, type).text, (st, v) => { sec(st, type).text = v; }, { multiline: true, rows: type === 'about' ? 7 : 3, hint: type === 'manifesto' ? 'Выделение: *слово*' : undefined }));
      }
      if (type === 'cta') out.push(bind('Текст кнопки', 'cta.btn', () => sec(ed.site, type).buttonLabel, (st, v) => { sec(st, type).buttonLabel = v; }, { maxlength: 40 }));
      if (type === 'gallery') out.push(h('p', { class: 'fld-h' }, 'Фотографии загружаются во вкладке «Фото».'));
      if (!['cta', 'manifesto', 'gallery'].includes(type)) out.push(itemsEditor(type));
      return out;
    });
  };

  // ─── Контакты, бренд, подписи ───
  const brandAcc = acc('brand', 'Название и слоган', () => [
    bind('Название', 'b.name', () => ed.content.brand.name, (s, v) => { s.content.brand.name = v; }, { maxlength: 80 }),
    bind('Слоган', 'b.tag', () => ed.content.brand.tagline, (s, v) => { s.content.brand.tagline = v; }, { maxlength: 100 }),
  ]);
  const contactAcc = acc('contact', 'Блок «Контакты»', () => [
    bind('Название в меню', 'c.nav', () => ed.content.contact.navLabel, (s, v) => { s.content.contact.navLabel = v; }, { maxlength: 22 }),
    bind('Заголовок', 'c.title', () => ed.content.contact.title, (s, v) => { s.content.contact.title = v; }, { multiline: true, rows: 2 }),
    bind('Подзаголовок', 'c.sub', () => ed.content.contact.subtitle, (s, v) => { s.content.contact.subtitle = v; }, { multiline: true, rows: 2 }),
    bind('Текст кнопки формы', 'c.btn', () => ed.content.contact.buttonLabel, (s, v) => { s.content.contact.buttonLabel = v; }, { maxlength: 36 }),
  ]);
  const LABELS = [['phone', 'Подпись «Телефон»'], ['email', 'Подпись «Почта»'], ['address', 'Подпись «Адрес»'], ['hours', 'Подпись «Часы работы»'], ['formName', 'Поле «Имя»'], ['formMessage', 'Поле «Сообщение»'], ['menu', 'Слово «Меню»'], ['rights', 'Фраза в подвале']];
  const labelsAcc = acc('labels', 'Служебные подписи', () => LABELS.map(([k, l]) =>
    bind(l, `lab.${k}`, () => ed.content.labels[k], (s, v) => { s.content.labels[k] = v; }, { maxlength: 60 })));

  root.append(
    h('p', { class: 'fld-h' }, 'Все тексты сайта. Изменения видны сразу. Нажмите на любой блок в предпросмотре — откроются его тексты.'),
    hero,
    ...ed.content.sections.map(sectionAcc),
    contactAcc, brandAcc, labelsAcc,
  );
  return root;
}
