// Интерфейс конструктора: выбор дизайна → описание бизнеса → генерация → результат.
// Весь текст от сервера/ИИ вставляется только через esc() или textContent.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

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
};

const state = {
  mode: 'ai',
  themes: [],
  themeId: null,
  site: null,
  abort: null,
};

// ─────────────── Утилиты ───────────────

let toastTimer;
function toast(text) {
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2400);
}

function showError(el, text) {
  el.textContent = text;
  el.hidden = !text;
}

/** POST, ответ — Server-Sent Events. Вызывает onEvent(name, data) на каждое событие. */
async function streamPost(url, body, signal, onEvent) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    let message = 'Не удалось выполнить запрос';
    try {
      message = (await res.json()).error || message;
    } catch { /* тело не JSON */ }
    throw new Error(message);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let event = 'message';
      let data = '';
      for (const line of frame.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (data) onEvent(event, JSON.parse(data));
    }
  }
}

async function api(url, options) {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Ошибка запроса');
  return json;
}

// ─────────────── Панели и шаги ───────────────

function showPanel(name) {
  $$('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== name));
  const stepIndex = { design: 0, about: 1, work: 1, result: 2 }[name];
  $$('#stepper li').forEach((li, i) => {
    li.classList.toggle('current', i === stepIndex);
    li.classList.toggle('done', i < stepIndex);
    if (i === stepIndex) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
  $('#builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─────────────── Шаг 1: дизайны ───────────────

function renderThemes() {
  $('#themes').innerHTML = state.themes
    .map(
      (t) => `
    <label class="theme">
      <input type="radio" name="theme" value="${esc(t.id)}">
      <div class="thumb">
        <iframe src="/demo/${esc(t.id)}" loading="lazy" tabindex="-1" sandbox="allow-scripts" title="Пример: ${esc(t.name)}" aria-hidden="true"></iframe>
        <a class="theme-peek" href="/demo/${esc(t.id)}" target="_blank" rel="noopener">Смотреть целиком ↗</a>
      </div>
      <div class="theme-info">
        <div><b>${esc(t.name)}</b><small>${esc(t.tagline)}</small><small style="display:block;margin-top:2px">Подходит: ${esc(t.best)}</small></div>
        <span class="tick">${CHECK}</span>
      </div>
    </label>`,
    )
    .join('');

  // Превью — настоящая страница шириной 1280px, уменьшенная под ширину карточки.
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const iframe = $('iframe', e.target);
      iframe.style.transform = `scale(${e.contentRect.width / 1280})`;
    }
  });
  $$('#themes .thumb').forEach((el) => ro.observe(el));

  $$('#themes input').forEach((input) =>
    input.addEventListener('change', () => selectTheme(input.value)),
  );
}

function selectTheme(id) {
  state.themeId = id;
  const t = state.themes.find((x) => x.id === id);
  $('#to-about').disabled = false;
  $('#design-hint').textContent = `Выбрано: ${t.name}`;
  $(`#themes input[value="${id}"]`).checked = true;
  $('#chosen-design').innerHTML =
    `<span class="sw" style="background:${esc(t.accent)}"></span> Дизайн: <b>${esc(t.name)}</b> <button class="link" type="button" id="change-design">изменить</button>`;
  $('#change-design').addEventListener('click', () => showPanel('design'));
}

// ─────────────── Шаг 2: форма ───────────────

const form = $('#about-form');

function updateCount() {
  $('#desc-count').textContent = `${form.elements.description.value.length} / 2000`;
}

function readBusiness() {
  const v = Object.fromEntries(new FormData(form).entries());
  for (const k of Object.keys(v)) v[k] = String(v[k]).trim();
  return v;
}

function validateBusiness(b) {
  form.elements.name.classList.toggle('bad', !b.name);
  form.elements.description.classList.toggle('bad', b.description.length < 20);
  if (!b.name) return 'Укажите название бизнеса';
  if (b.description.length < 20) return 'Опишите бизнес подробнее — хотя бы пару предложений (от 20 символов)';
  return '';
}

$$('[data-example]').forEach((btn) =>
  btn.addEventListener('click', () => {
    const ex = EXAMPLES[btn.dataset.example];
    for (const [k, v] of Object.entries(ex)) form.elements[k].value = v;
    updateCount();
    showError($('#form-error'), '');
    form.elements.name.classList.remove('bad');
    form.elements.description.classList.remove('bad');
  }),
);

form.elements.description.addEventListener('input', updateCount);
$('#back-design').addEventListener('click', () => showPanel('design'));
$('#to-about').addEventListener('click', () => showPanel('about'));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const business = readBusiness();
  const problem = validateBusiness(business);
  showError($('#form-error'), problem);
  if (problem) return;
  generate(business);
});

// ─────────────── Генерация ───────────────

const STAGES = ['analyzing', 'writing', 'building'];
let creepTimer;

function setStage(stage, percent) {
  const current = STAGES.indexOf(stage);
  $$('#stages li').forEach((li, i) => {
    li.classList.toggle('done', i < current || percent >= 100);
    li.classList.toggle('active', i === current && percent < 100);
  });
  $('#bar-fill').style.width = `${percent}%`;
  $('.bar').setAttribute('aria-valuenow', String(percent));
}

/** Пока модель «думает» и ещё не прислала текст, полоса слегка ползёт — чтобы было видно, что всё живо. */
function startCreep() {
  let pct = 5;
  clearInterval(creepTimer);
  creepTimer = setInterval(() => {
    const bar = parseFloat($('#bar-fill').style.width) || 0;
    if (bar <= pct && pct < 14) {
      pct += 1;
      $('#bar-fill').style.width = `${pct}%`;
    }
  }, 700);
}

async function generate(business) {
  showPanel('work');
  $('#work-title').textContent = 'ИИ собирает ваш сайт';
  setStage('analyzing', 5);
  startCreep();

  const controller = new AbortController();
  state.abort = controller;
  let site = null;
  let failure = null;

  try {
    await streamPost('/api/generate', { themeId: state.themeId, business }, controller.signal, (event, data) => {
      if (event === 'progress') setStage(data.stage, data.percent);
      else if (event === 'done') site = data.site;
      else if (event === 'error') failure = data.message;
    });
    if (failure) throw new Error(failure);
    if (!site) throw new Error('Сервер не вернул результат. Попробуйте ещё раз.');
    clearInterval(creepTimer);
    setStage('building', 100);
    await new Promise((r) => setTimeout(r, 450));
    openResult(site);
  } catch (err) {
    clearInterval(creepTimer);
    showPanel('about');
    if (err.name !== 'AbortError') showError($('#form-error'), err.message);
  } finally {
    state.abort = null;
  }
}

$('#cancel-work').addEventListener('click', () => state.abort?.abort());

// ─────────────── Шаг 3: результат ───────────────

const preview = $('#preview');
const busy = $('#preview-busy');

function setBusy(on, text) {
  busy.hidden = !on;
  if (text) $('#busy-text').textContent = text;
}

function reloadPreview() {
  setBusy(true, 'Обновляю…');
  preview.src = `/s/${state.site.id}?v=${Date.now()}`;
}
preview.addEventListener('load', () => setBusy(false));

function renderAnalysis(a) {
  const row = (t, v) => `<div><dt>${t}</dt><dd>${esc(v)}</dd></div>`;
  $('#analysis').innerHTML =
    row('Тип бизнеса', a.businessType) +
    row('Аудитория', a.audience) +
    row('Позиционирование', a.positioning) +
    row('Тон сайта', a.tone) +
    `<div><dt>Сильные стороны</dt><dd class="tags">${a.strengths.map((s) => `<span>${esc(s)}</span>`).join('')}</dd></div>`;
}

function renderMiniThemes() {
  $('#mini-themes').innerHTML = state.themes
    .map(
      (t) => `
    <label class="mini">
      <input type="radio" name="mini-theme" value="${esc(t.id)}" ${t.id === state.site.themeId ? 'checked' : ''}>
      <div class="sw" style="background:linear-gradient(135deg,${esc(t.bg)} 50%,${esc(t.accent)} 50%)"></div>${esc(t.name)}
    </label>`,
    )
    .join('');
  $$('#mini-themes input').forEach((input) =>
    input.addEventListener('change', async () => {
      try {
        setBusy(true, 'Применяю дизайн…');
        state.site = await api(`/api/sites/${state.site.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themeId: input.value }),
        });
        reloadPreview();
      } catch (err) {
        setBusy(false);
        toast(err.message);
      }
    }),
  );
}

function syncAccent() {
  const site = state.site;
  $('#accent').value = site.accent || site.content.brand.accent;
  $('#accent-reset').hidden = !site.accent;
}

function openResult(site) {
  state.site = site;
  history.replaceState(null, '', `#/site/${site.id}`);
  renderAnalysis(site.content.analysis);
  renderMiniThemes();
  syncAccent();
  $('#preview-url').textContent = `${location.host}/s/${site.id}`;
  $('#open-site').href = `/s/${site.id}`;
  const dl = $('#download-site');
  dl.href = `/s/${site.id}/download`;
  dl.setAttribute('download', '');
  showError($('#revise-error'), '');
  showPanel('result');
  reloadPreview();
}

// Устройство предпросмотра
$$('.seg button').forEach((btn) =>
  btn.addEventListener('click', () => {
    $$('.seg button').forEach((b) => b.classList.toggle('on', b === btn));
    $('#preview-stage').dataset.device = btn.dataset.device;
  }),
);

// Фирменный цвет
let accentTimer;
$('#accent').addEventListener('input', (e) => {
  clearTimeout(accentTimer);
  accentTimer = setTimeout(() => patchAccent(e.target.value), 350);
});
$('#accent-reset').addEventListener('click', () => patchAccent(''));

async function patchAccent(accent) {
  try {
    state.site = await api(`/api/sites/${state.site.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accent }),
    });
    syncAccent();
    reloadPreview();
  } catch (err) {
    toast(err.message);
  }
}

// Правки через ИИ
$$('[data-revise]').forEach((chip) =>
  chip.addEventListener('click', () => {
    $('#revise-text').value = chip.dataset.revise;
    $('#revise-text').focus();
  }),
);

$('#revise-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const instruction = $('#revise-text').value.trim();
  const errorEl = $('#revise-error');
  if (instruction.length < 3) return showError(errorEl, 'Опишите, что изменить');
  showError(errorEl, '');

  const btn = $('#revise-btn');
  btn.disabled = true;
  setBusy(true, 'ИИ вносит правки…');
  let site = null;
  let failure = null;
  try {
    await streamPost(`/api/sites/${state.site.id}/revise`, { instruction }, undefined, (event, data) => {
      if (event === 'progress') $('#busy-text').textContent = `ИИ вносит правки… ${data.percent}%`;
      else if (event === 'done') site = data.site;
      else if (event === 'error') failure = data.message;
    });
    if (failure) throw new Error(failure);
    if (!site) throw new Error('Сервер не вернул результат. Попробуйте ещё раз.');
    state.site = site;
    renderAnalysis(site.content.analysis);
    syncAccent();
    $('#revise-text').value = '';
    reloadPreview();
    toast('Правки применены');
  } catch (err) {
    setBusy(false);
    showError(errorEl, err.message);
  } finally {
    btn.disabled = false;
  }
});

// Ссылка, новый сайт
$('#copy-link').addEventListener('click', async () => {
  const url = `${location.origin}/s/${state.site.id}`;
  try {
    await navigator.clipboard.writeText(url);
    toast('Ссылка скопирована');
  } catch {
    window.prompt('Скопируйте ссылку:', url);
  }
});

$('#new-site').addEventListener('click', () => {
  state.site = null;
  form.reset();
  updateCount();
  history.replaceState(null, '', location.pathname);
  showPanel('design');
});

// ─────────────── Запуск ───────────────

async function init() {
  $('#year').textContent = new Date().getFullYear();
  updateCount();

  let config;
  try {
    config = await api('/api/config');
  } catch {
    $('#themes').innerHTML = '<p class="form-error">Не удалось загрузить список дизайнов. Обновите страницу.</p>';
    return;
  }
  state.mode = config.mode;
  state.themes = config.themes;
  $('#demo-banner').hidden = config.mode !== 'demo';
  renderThemes();

  // Ссылка вида /#/site/<id> открывает готовый сайт.
  const m = location.hash.match(/^#\/site\/([a-f0-9]{20})$/);
  if (m) {
    try {
      openResult(await api(`/api/sites/${m[1]}`));
    } catch {
      toast('Сайт по этой ссылке не найден');
      history.replaceState(null, '', location.pathname);
    }
  }
}

init();
