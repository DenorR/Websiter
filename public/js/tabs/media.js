import { h, icon, group, switchRow, toast } from '../ui.js';

function drop({ label, hint, multiple = false, onFiles }) {
  const input = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif', multiple, hidden: true });
  const box = h('div', { class: 'drop', tabindex: 0, role: 'button' }, icon('upload', 20), h('b', null, label), h('small', null, hint));
  const pick = (files) => { const list = [...files]; if (list.length) onFiles(list); };
  box.addEventListener('click', () => input.click());
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('change', () => { pick(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => box.addEventListener(ev, (e) => { e.preventDefault(); box.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => box.addEventListener(ev, (e) => { e.preventDefault(); box.classList.remove('over'); }));
  box.addEventListener('drop', (e) => pick(e.dataTransfer.files));
  return h('div', null, box, input);
}

export default function media(ed) {
  const root = h('div', { class: 'tab' });
  let busy = false;

  const upload = async (slot, files) => {
    if (busy) return;
    busy = true;
    root.classList.add('busy');
    try {
      for (const f of files) await ed.upload(slot, f);
      toast(files.length > 1 ? 'Фото загружены' : 'Фото загружено');
    } catch (err) { toast(err.message); }
    finally { busy = false; root.classList.remove('busy'); draw(); }
  };

  const single = (slot, title, hint, noun) => {
    const url = ed.media[slot];
    return group(title,
      url
        ? h('div', { class: 'ph' }, h('img', { src: url, alt: '' }),
            h('div', { class: 'ph-a' },
              h('button', { class: 'btn btn-line btn-sm', onClick: () => { ed.commit((s) => { s.media[slot] = null; }); draw(); } }, icon('close', 14), 'Убрать')))
        : null,
      drop({ label: url ? `Заменить ${noun}` : `Загрузить ${noun}`, hint, onFiles: (files) => upload(slot, files.slice(0, 1)) }));
  };

  const draw = () => {
    const logoBlock = single('logo', 'Логотип', 'PNG с прозрачным фоном — лучше всего', 'логотип');
    const logoMode = ed.media.logo
      ? switchRow('Название рядом с логотипом', ed.media.logoMode !== 'logo', (on) => ed.commit((s) => { s.media.logoMode = on ? 'both' : 'logo'; }), 'Выключите, если название уже есть в логотипе')
      : null;

    const gallery = ed.media.gallery;
    const galleryBlock = group(`Галерея (${gallery.length} / ${ed.config.limits.gallery})`,
      gallery.length
        ? h('div', { class: 'gal' }, ...gallery.map((url, i) =>
            h('div', { class: 'gal-i' }, h('img', { src: url, alt: '' }),
              h('div', { class: 'gal-a' },
                h('button', { class: 'ib', title: 'Левее', disabled: i === 0, onClick: () => { ed.commit((s) => { const a = s.media.gallery; [a[i - 1], a[i]] = [a[i], a[i - 1]]; }); draw(); } }, icon('back', 14)),
                h('button', { class: 'ib danger', title: 'Убрать', onClick: () => { ed.commit((s) => { s.media.gallery.splice(i, 1); }); draw(); } }, icon('close', 14))))))
        : null,
      gallery.length < ed.config.limits.gallery
        ? drop({ label: 'Добавить фото', hint: 'Можно выбрать сразу несколько', multiple: true, onFiles: (files) => upload('gallery', files.slice(0, ed.config.limits.gallery - gallery.length)) })
        : null,
      h('p', { class: 'fld-h' }, 'Блок «Галерея» появится на сайте автоматически. Скрыть его можно во вкладке «Блоки».'));

    root.replaceChildren(...[
      h('p', { class: 'fld-h' }, 'Фото уменьшаются в браузере перед загрузкой. Принимаются JPG, PNG, WebP и GIF до 6 МБ.'),
      logoBlock, logoMode,
      single('hero', 'Фото первого экрана', 'Заменит рисованную графику', 'фото'),
      single('about', 'Фото для блока «О нас»', 'Показывается, если у блока выбран вариант «С изображением»', 'фото'),
      galleryBlock,
    ].filter(Boolean));
  };
  draw();
  ed.onTab('sync', draw);
  return root;
}
