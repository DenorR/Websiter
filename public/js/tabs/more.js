import { h, group, field, textInput, seg, toast } from '../ui.js';

const LANGS = [['ru', 'Русский'], ['en', 'English'], ['uk', 'Українська'], ['de', 'Deutsch'], ['es', 'Español'], ['fr', 'Français']];

export default function more(ed) {
  const sel = h('select', { 'aria-label': 'Язык страницы' }, ...LANGS.map(([v, l]) => h('option', { value: v }, l)));
  sel.value = ed.content.brand.language;
  sel.addEventListener('change', () => ed.commit((s) => { s.content.brand.language = sel.value; }));

  const link = `${location.origin}/s/${ed.site.id}`;
  return h('div', { class: 'tab' },
    group('Поисковики и ссылки',
      field('Заголовок страницы (title)', textInput({ value: ed.content.seo.title, maxlength: 70, onInput: (v) => ed.commit((s) => { s.content.seo.title = v; }, { coalesce: 'seo.t' }) }), 'Виден во вкладке браузера и в поиске.'),
      field('Описание страницы', textInput({ value: ed.content.seo.description, multiline: true, rows: 3, maxlength: 170, onInput: (v) => ed.commit((s) => { s.content.seo.description = v; }, { coalesce: 'seo.d' }) }), 'До 155 символов. Показывается в поиске и при отправке ссылки.'),
      field('Язык страницы', sel),
    ),
    group('Публикация',
      h('p', { class: 'fld-h' }, 'Ссылка на сайт работает, пока он хранится у нас. Скачайте HTML-файл — это готовый сайт одним файлом со шрифтами и фото, его можно загрузить на любой хостинг.'),
      h('div', { class: 'linkbox' }, h('code', null, link)),
      h('div', { class: 'row' },
        h('a', { class: 'btn btn-ink btn-sm', href: `/s/${ed.site.id}/download`, download: '' }, 'Скачать HTML'),
        h('button', { class: 'btn btn-line btn-sm', onClick: async () => { try { await navigator.clipboard.writeText(link); toast('Ссылка скопирована'); } catch { window.prompt('Скопируйте ссылку:', link); } } }, 'Копировать ссылку')),
    ),
    group('Подсказки',
      h('ul', { class: 'tips' },
        h('li', null, 'Ctrl+Z — отменить, Ctrl+Shift+Z — вернуть.'),
        h('li', null, 'Клик по блоку в предпросмотре открывает его тексты.'),
        h('li', null, 'Слова в *звёздочках* в заголовках становятся акцентными.')),
    ),
  );
}
