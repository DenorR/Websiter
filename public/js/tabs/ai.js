import { h, icon, toast } from '../ui.js';
import { streamPost } from '../net.js';
import { applyTemplate } from './shared.js';

const IDEAS = ['Сделай тексты короче и энергичнее', 'Сделай тон более деловым и строгим', 'Добавь больше вопросов в FAQ', 'Напиши более тёплые, человечные тексты'];

export default function ai(ed) {
  const a = ed.content.analysis;
  const row = (t, v) => (v ? h('div', null, h('dt', null, t), h('dd', null, v)) : null);

  const card = h('div', { class: 'card ai-card' },
    h('h4', null, icon('ai', 16), 'Что ИИ понял о бизнесе'),
    h('dl', { class: 'an' },
      row('Тип бизнеса', a.businessType), row('Аудитория', a.audience), row('Позиционирование', a.positioning), row('Тон сайта', a.tone),
      a.strengths?.length ? h('div', null, h('dt', null, 'Сильные стороны'), h('dd', { class: 'tags' }, ...a.strengths.map((s) => h('span', null, s)))) : null,
    ),
  );

  const recIds = (ed.content.recommendedTemplates ?? []).filter((id) => ed.config.templates.some((t) => t.id === id));
  const rec = recIds.length
    ? h('div', { class: 'card' },
        h('h4', null, 'ИИ рекомендует дизайн'),
        h('p', { class: 'fld-h' }, 'Подобраны под ваш тип бизнеса. Нажмите, чтобы применить — текст не изменится.'),
        h('div', { class: 'recs' }, ...recIds.map((id) => {
          const t = ed.config.templates.find((x) => x.id === id);
          const p = t.palettes[0];
          return h('button', { class: `rec${ed.design.template === id ? ' on' : ''}`, onClick: () => applyTemplate(ed, id) },
            h('span', { class: 'sw3' }, h('i', { style: { background: p.bg } }), h('i', { style: { background: p.text } }), h('i', { style: { background: p.accent } })),
            h('b', null, t.name), h('small', null, t.tagline));
        })),
      )
    : null;

  // Правка словами
  const text = h('textarea', { rows: 3, maxlength: 600, placeholder: 'Например: сделай тон строже, добавь вопрос про оплату, сократи тексты' });
  const err = h('p', { class: 'form-error', hidden: true });
  const btn = h('button', { class: 'btn btn-ink btn-block', type: 'submit' }, icon('ai', 16), 'Применить правку');
  const bar = h('div', { class: 'mini-bar', hidden: true }, h('i'));
  const form = h('form', { class: 'card', onSubmit: async (e) => {
    e.preventDefault();
    const instruction = text.value.trim();
    if (instruction.length < 3) { err.textContent = 'Опишите, что изменить'; err.hidden = false; return; }
    err.hidden = true; btn.disabled = true; bar.hidden = false; bar.firstChild.style.width = '5%';
    let site = null; let failure = null;
    try {
      await streamPost(`/api/sites/${ed.site.id}/revise`, { instruction }, undefined, (event, data) => {
        if (event === 'progress') bar.firstChild.style.width = `${data.percent}%`;
        else if (event === 'done') site = data.site;
        else if (event === 'error') failure = data.message;
      });
      if (failure) throw new Error(failure);
      if (!site) throw new Error('Сервер не вернул результат');
      ed.adopt(site);
      text.value = '';
      toast('Правки применены. Их можно отменить кнопкой ↶');
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
    finally { btn.disabled = false; bar.hidden = true; }
  } },
    h('h4', null, 'Попросить ИИ изменить тексты'),
    h('p', { class: 'fld-h' }, 'Опишите словами — ИИ перепишет сайт, сохранив ваши цвета, шрифты и фото.'),
    text,
    h('div', { class: 'chips sm' }, ...IDEAS.map((i) => h('button', { type: 'button', class: 'chip', onClick: () => { text.value = i; text.focus(); } }, i))),
    err, bar, btn,
  );

  return h('div', { class: 'tab' }, card, rec, form);
}
