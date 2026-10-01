// Лендинг и пошаговый мастер: дизайн → описание бизнеса → сборка → редактор.
import { $, $$, h, icon, toast } from './ui.js';
import { api, streamPost } from './net.js';
import { mountEditor } from './editor.js';
import { thumb } from './tabs/shared.js';

const EXAMPLES = {
  coffee: {
    name: 'Кофейня «Зерно»', city: 'Казань', goal: 'info', tone: 'friendly',
    description: 'Небольшая кофейня рядом с метро. Сами обжариваем зерно, каждое утро печём круассаны и чизкейки. Есть кофе с собой, завтраки до 12:00 и уютный зал на 20 мест. К нам заходят студенты, фрилансеры и те, кто спешит на работу.',
  },
  barber: {
    name: 'Барбершоп «Борода»', city: 'Екатеринбург', goal: 'bookings', tone: 'bold',
    description: 'Мужской барбершоп на 4 кресла. Стрижки, моделирование бороды, королевское бритьё, камуфляж седины. Работаем по записи, у мастеров опыт больше 5 лет. Атмосфера без суеты: можно выпить кофе и посмотреть футбол.',
  },
  lawyer: {
    name: 'Юрист Анна Соколова', city: 'Санкт-Петербург', goal: 'leads', tone: 'business',
    description: 'Помогаю предпринимателям и частным лицам: регистрация ООО и ИП, договоры, споры с контрагентами, трудовые вопросы. Первая консультация — 30 минут бесплатно. Работаю удалённо по всей России и очно в Петербурге.',
  },
  yoga: {
    name: 'Студия йоги «Дыхание»', city: 'Новосибирск', goal: 'bookings', tone: 'friendly',
    description: 'Небольшая студия йоги и пилатеса. Группы для новичков и продолжающих, утренние и вечерние занятия, индивидуальные занятия с тренером. Занятия по абонементу, первое пробное — 500 ₽. Коврики и пледы даём, в зале тёплые полы.',
  },
  saas: {
    name: 'Orbit', city: '', goal: 'leads', tone: 'business',
    description: 'Сервис продуктовой аналитики для небольших команд. Подключается одним скриптом, строит воронки и когорты без SQL, показывает, на каком шаге пользователи уходят. Есть бесплатный тариф для небольших проектов.',
  },
  repair: {
    name: 'СтройМастер', city: 'Москва', goal: 'leads', tone: 'business',
    description: 'Ремонт квартир под ключ: косметический и капитальный, электрика, сантехника, отделка. Работаем по договору, смету согласуем до начала работ и присылаем фотоотчёт каждый день. Своя бригада, без субподрядчиков.',
  },
};

const state = { config: null, templateId: null, category: 'all', abort: null, editor: null };

// ─────────────── Панели и шаги ───────────────

function showPanel(name) {
  $$('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== name));
  const idx = { design: 0, about: 1, work: 2 }[name];
  $$('#stepper li').forEach((li, i) => {
    li.classList.toggle('current', i === idx);
    li.classList.toggle('done', i < idx);
  });
  $('#builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────── Шаг 1: каталог дизайнов ───────────────

function renderCats() {
  $('#cats').replaceChildren(...state.config.categories.map(([id, label]) =>
    h('button', { class: `chip${id === state.category ? ' on' : ''}`, type: 'button', onClick: () => { state.category = id; renderCats(); renderThemes(); } }, label)));
}

function renderThemes() {
  const list = state.config.templates.filter((t) => state.category === 'all' || t.categories.includes(state.category));
  $('#themes').replaceChildren(...list.map((t) => {
    const p = t.palettes[0];
    const input = h('input', { type: 'radio', name: 'theme', value: t.id, checked: t.id === state.templateId });
    input.addEventListener('change', () => selectTemplate(t.id));
    return h('label', { class: 'theme' },
      input,
      h('div', { class: 'thumb-wrap', style: { position: 'relative' } },
        thumb(t.id),
        h('a', { class: 'theme-peek', href: `/demo/${t.id}`, target: '_blank', rel: 'noopener' }, 'Смотреть целиком ↗'),
        h('span', { class: 'theme-swatch', title: 'Палитры' }, ...t.palettes.map((pl) => h('i', { style: { background: pl.accent } })))),
      h('div', { class: 'theme-info' },
        h('div', null, h('b', null, t.name), h('small', null, t.tagline), h('small', { class: 'best' }, `Подходит: ${t.best}`)),
        h('span', { class: 'tick', html: '<svg class="ico" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>' })));
  }));
}

function selectTemplate(id) {
  state.templateId = id;
  const t = state.config.templates.find((x) => x.id === id);
  $('#to-about').disabled = false;
  $('#design-hint').textContent = `Выбрано: ${t.name} — ${t.tagline.toLowerCase()}`;
  $('#chosen-design').replaceChildren(
    h('span', null, 'Дизайн: ', h('b', null, t.name)),
    h('button', { class: 'link', type: 'button', onClick: () => showPanel('design') }, 'изменить'));
}

// ─────────────── Шаг 2: форма ───────────────

const form = $('#about-form');
const E = (name) => form.elements[name];
const updateCount = () => { $('#desc-count').textContent = `${E('description').value.length} / 2000`; };

function validate() {
  const b = Object.fromEntries(new FormData(form).entries());
  for (const k of Object.keys(b)) b[k] = String(b[k]).trim();
  E('name').classList.toggle('bad', !b.name);
  E('description').classList.toggle('bad', b.description.length < 20);
  const problem = !b.name ? 'Укажите название бизнеса' : b.description.length < 20 ? 'Опишите бизнес подробнее — хотя бы пару предложений (от 20 символов)' : '';
  const el = $('#form-error');
  el.textContent = problem;
  el.hidden = !problem;
  return problem ? null : b;
}

$$('[data-example]').forEach((btn) => btn.addEventListener('click', () => {
  const ex = EXAMPLES[btn.dataset.example];
  for (const [k, v] of Object.entries(ex)) E(k).value = v;
  updateCount();
  E('name').classList.remove('bad'); E('description').classList.remove('bad');
  $('#form-error').hidden = true;
}));
E('description').addEventListener('input', updateCount);
$('#back-design').addEventListener('click', () => showPanel('design'));
$('#to-about').addEventListener('click', () => showPanel('about'));
form.addEventListener('submit', (e) => { e.preventDefault(); const b = validate(); if (b) generate(b); });

// ─────────────── Шаг 3: сборка ───────────────

const STAGES = ['analyzing', 'writing', 'building'];
let creep;
function setStage(stage, percent) {
  const cur = STAGES.indexOf(stage);
  $$('#stages li').forEach((li, i) => {
    li.classList.toggle('done', i < cur || percent >= 100);
    li.classList.toggle('active', i === cur && percent < 100);
  });
  $('#bar-fill').style.width = `${percent}%`;
  $('.bar').setAttribute('aria-valuenow', String(percent));
}
function startCreep() {
  let pct = 5;
  clearInterval(creep);
  creep = setInterval(() => {
    const bar = parseFloat($('#bar-fill').style.width) || 0;
    if (bar <= pct && pct < 14) { pct += 1; $('#bar-fill').style.width = `${pct}%`; }
  }, 700);
}

async function generate(business) {
  showPanel('work');
  setStage('analyzing', 5);
  startCreep();
  const controller = new AbortController();
  state.abort = controller;
  let site = null; let failure = null;
  try {
    await streamPost('/api/generate', { templateId: state.templateId, business }, controller.signal, (event, data) => {
      if (event === 'progress') setStage(data.stage, data.percent);
      else if (event === 'done') site = data.site;
      else if (event === 'error') failure = data.message;
    });
    if (failure) throw new Error(failure);
    if (!site) throw new Error('Сервер не вернул результат. Попробуйте ещё раз.');
    clearInterval(creep);
    setStage('building', 100);
    await new Promise((r) => setTimeout(r, 450));
    openEditor(site);
  } catch (err) {
    clearInterval(creep);
    showPanel('about');
    if (err.name !== 'AbortError') { const el = $('#form-error'); el.textContent = err.message; el.hidden = false; }
  } finally { state.abort = null; }
}
$('#cancel-work').addEventListener('click', () => state.abort?.abort());

// ─────────────── Редактор ───────────────

function openEditor(site) {
  history.replaceState(null, '', `#/site/${site.id}`);
  $('#site-view').hidden = true;
  const view = $('#editor-view');
  view.hidden = false;
  document.body.classList.add('is-editor');
  window.scrollTo(0, 0);
  state.editor?.destroy();
  state.editor = mountEditor(view, state.config, site, { onExit: closeEditor });
}

function closeEditor() {
  state.editor?.destroy();
  state.editor = null;
  $('#editor-view').hidden = true;
  $('#editor-view').replaceChildren();
  $('#site-view').hidden = false;
  document.body.classList.remove('is-editor');
  history.replaceState(null, '', location.pathname);
  form.reset();
  updateCount();
  showPanel('design');
}

// ─────────────── Запуск ───────────────

async function init() {
  $('#year').textContent = new Date().getFullYear();
  updateCount();
  try {
    state.config = await api('/api/config');
  } catch {
    $('#themes').replaceChildren(h('p', { class: 'form-error' }, 'Не удалось загрузить каталог. Обновите страницу.'));
    return;
  }
  $('#demo-banner').hidden = state.config.mode !== 'demo';
  renderCats();
  renderThemes();

  const m = location.hash.match(/^#\/site\/([a-f0-9]{20})$/);
  if (m) {
    try { openEditor(await api(`/api/sites/${m[1]}`)); }
    catch { toast('Сайт по этой ссылке не найден'); history.replaceState(null, '', location.pathname); }
  }
}

init();
