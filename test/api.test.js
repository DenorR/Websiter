import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { startApp, readSse, post, patch, createSite, VALID_INPUT, PNG_1X1, fakeAnthropic, sendTextStream } from './helpers.js';
import { TEMPLATE_IDS } from '../src/templates/index.js';
import { mockGenerate, DEMO_INPUT } from '../src/mock.js';

let app;
before(async () => {
  app = await startApp();
});
after(() => app.close());

const generate = async (body) => {
  const res = await post(`${app.url}/api/generate`, body);
  return { res, events: res.headers.get('content-type')?.includes('event-stream') ? await readSse(res) : null };
};
const upload = (id, slot, body, type = 'image/png') =>
  fetch(`${app.url}/api/sites/${id}/media/${slot}`, { method: 'POST', headers: { 'Content-Type': type }, body });
const getSite = async (id) => (await fetch(`${app.url}/api/sites/${id}`)).json();

// ───────────── Каталог и настройки ─────────────

test('GET /api/config отдаёт режим, 18 дизайнов и всё для редактора', async () => {
  const cfg = await (await fetch(`${app.url}/api/config`)).json();
  assert.equal(cfg.mode, 'demo');
  assert.equal(cfg.templates.length, 18);
  assert.deepEqual(cfg.templates.map((t) => t.id), TEMPLATE_IDS);
  assert.ok(cfg.categories.length >= 8 && cfg.fonts.length >= 30);
  assert.ok(cfg.layouts.hero.options.length >= 6);
  assert.ok(cfg.styleOptions.cards && cfg.styleOptions.radius === undefined);
  assert.ok(cfg.art.length === 10 && Object.keys(cfg.icons).length > 30);
  assert.ok(cfg.sectionTypes.includes('gallery') && cfg.sectionLabels.faq);
  assert.ok(cfg.limits.gallery === 12 && cfg.limits.upload > 1_000_000);
  assert.ok(!JSON.stringify(cfg).includes('@font-face'), 'внутренности шаблонов не утекают');
});

test('шрифты раздаются со своего домена: CSS, файлы с CORS, traversal невозможен', async () => {
  const css = await fetch(`${app.url}/fonts/css?ids=inter,unbounded,нет-такого`);
  assert.equal(css.status, 200);
  assert.match(css.headers.get('content-type'), /text\/css/);
  const text = await css.text();
  assert.ok(text.includes("'Inter Variable'") && text.includes("'Unbounded Variable'"));
  const file = text.match(/url\((\/fonts\/inter\/[^)]+\.woff2)\)/)[1];
  const font = await fetch(`${app.url}${file}`);
  assert.equal(font.status, 200);
  assert.equal(font.headers.get('content-type'), 'font/woff2');
  assert.equal(font.headers.get('access-control-allow-origin'), '*');
  assert.match(font.headers.get('cache-control'), /immutable/);
  assert.ok((await font.arrayBuffer()).byteLength > 1000);
  for (const bad of ['/fonts/inter/nope.woff2', '/fonts/nope/x.woff2', '/fonts/inter/..%2f..%2fpackage.json', '/fonts/..%2f/x']) {
    assert.equal((await fetch(`${app.url}${bad}`)).status, 404, bad);
  }
  assert.equal(await (await fetch(`${app.url}/fonts/css?ids=`)).text(), '');
});

test('графика для редактора: SVG по стилю, неизвестный стиль — 404', async () => {
  const ok = await fetch(`${app.url}/api/art/contour?seed=abc&initial=Ж`);
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get('content-type'), /image\/svg\+xml/);
  assert.match(await ok.text(), /^<svg/);
  assert.equal((await fetch(`${app.url}/api/art/nope`)).status, 404);
});

test('демо-превью всех 18 дизайнов открываются, с жёсткой CSP; неизвестный — 404', async () => {
  for (const id of TEMPLATE_IDS) {
    const res = await fetch(`${app.url}/demo/${id}`);
    assert.equal(res.status, 200, id);
    assert.match(res.headers.get('content-security-policy'), /default-src 'none'/);
    assert.match(await res.text(), new RegExp(`data-tpl="${id}"`));
  }
  assert.equal((await fetch(`${app.url}/demo/nope`)).status, 404);
  const alt = await (await fetch(`${app.url}/demo/noir?palette=emerald`)).text();
  assert.notEqual(alt, await (await fetch(`${app.url}/demo/noir`)).text());
});

// ───────────── Создание сайта ─────────────

test('POST /api/generate: поток progress → done, сайт сохранён и открывается', async () => {
  const { res, events } = await generate({ templateId: 'noir', business: VALID_INPUT });
  assert.equal(res.status, 200);
  const names = events.map((e) => e.event);
  assert.ok(names.includes('progress'));
  assert.equal(names.at(-1), 'done');
  const site = events.at(-1).data.site;
  assert.match(site.id, /^[a-f0-9]{20}$/);
  assert.equal(site.design.template, 'noir');
  assert.equal(site.demo, true);
  assert.equal(site.content.brand.name, VALID_INPUT.name);
  assert.equal(site.contact.phone, VALID_INPUT.phone);
  assert.equal(site.contact.email, VALID_INPUT.email);
  assert.match(site.tokens.bg, /^#[0-9a-f]{6}$/);
  assert.deepEqual(site.media.gallery, []);
  assert.ok(site.content.recommendedTemplates.length >= 2);

  const page = await fetch(`${app.url}/s/${site.id}`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(page.headers.get('content-security-policy'), /default-src 'none'/);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'self'/);
  const html = await page.text();
  assert.match(html, /data-tpl="noir"/);
  assert.ok(html.includes('href="tel:+79000000000"'));
  assert.ok(!html.includes('parent.postMessage'), 'скрипта редактора нет на публичной странице');
  assert.ok((await (await fetch(`${app.url}/s/${site.id}?preview=1`)).text()).includes('parent.postMessage'));

  const got = await getSite(site.id);
  assert.equal(got.id, site.id);
  assert.equal(got.design.template, 'noir');
});

test('генерация принимает начальные настройки оформления и чистит их', async () => {
  const { events } = await generate({
    templateId: 'poster', business: VALID_INPUT,
    design: { palette: 'нет', cards: 'hard', template: 'swiss', colors: { accent: 'не-цвет' }, radius: 9999 },
  });
  const site = events.at(-1).data.site;
  assert.equal(site.design.template, 'poster', 'выбранный шаблон важнее того, что в design');
  assert.equal(site.design.cards, 'hard');
  assert.equal(site.design.radius, 48);
  assert.deepEqual(site.design.colors, {});
});

test('скачивание: один файл со встроенными шрифтами и картинками, имя безопасно', async () => {
  const site = await createSite(app, { templateId: 'bistro', business: { ...VALID_INPUT, name: 'Кофейня «Зерно» <b>' } });
  const up = await upload(site.id, 'hero', PNG_1X1);
  assert.equal(up.status, 200);
  const { url } = await up.json();

  const dl = await fetch(`${app.url}/s/${site.id}/download`);
  assert.equal(dl.status, 200);
  const cd = dl.headers.get('content-disposition');
  assert.match(cd, /^attachment; filename="[^"\r\n<>]*\.html"; filename\*=UTF-8''/);
  const html = await dl.text();
  assert.ok(html.includes('data:font/woff2;base64,'), 'шрифты встроены');
  assert.ok(html.includes(`data:image/png;base64,${PNG_1X1.toString('base64')}`), 'картинка встроена');
  assert.ok(!html.includes(url), 'ссылок на наш сервер не осталось');
  assert.ok(!html.includes('url(/fonts/'));
  assert.ok(html.length < 3_000_000);
});

test('валидация входа: 400 с понятным текстом', async () => {
  const bad = [
    [{ templateId: 'swiss', business: { name: '', description: 'x'.repeat(30) } }, /название/i],
    [{ templateId: 'swiss', business: { name: 'A', description: 'коротко' } }, /подробнее/i],
    [{ templateId: 'nope', business: VALID_INPUT }, /дизайн/i],
    [{ business: VALID_INPUT }, null],
    [{ templateId: 'swiss' }, null],
    [{}, null],
  ];
  for (const [body, re] of bad) {
    const res = await post(`${app.url}/api/generate`, body);
    assert.equal(res.status, 400, JSON.stringify(body).slice(0, 60));
    const json = await res.json();
    assert.ok(json.error);
    if (re) assert.match(json.error, re);
  }
});

test('битый JSON и огромное тело не роняют сервер', async () => {
  const broken = await fetch(`${app.url}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops' });
  assert.equal(broken.status, 400);
  const huge = await fetch(`${app.url}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: 'x'.repeat(600_000) }) });
  assert.equal(huge.status, 413);
  assert.equal((await fetch(`${app.url}/healthz`)).status, 200);
});

test('чужие и подделанные id не открываются (в т.ч. path traversal)', async () => {
  for (const id of ['0'.repeat(20), '../../etc/passwd', '..%2f..%2fpackage.json', 'A'.repeat(20), 'x']) {
    for (const url of [`/s/${id}`, `/s/${id}/download`, `/api/sites/${id}`]) {
      assert.equal((await fetch(`${app.url}${url}`)).status, 404, url);
    }
    assert.equal((await patch(`${app.url}/api/sites/${id}`, { design: {} })).status, 404, id);
    assert.equal((await upload(id, 'hero', PNG_1X1)).status, 404, id);
    assert.equal((await post(`${app.url}/api/sites/${id}/tokens`, {})).status, 404, id);
  }
});

// ───────────── Редактирование ─────────────

test('PATCH: дизайн, тексты и контакты сохраняются; кривые значения чистятся', async () => {
  const site = await createSite(app, { templateId: 'swiss' });
  const content = structuredClone(site.content);
  content.hero.headline = 'Новый *заголовок* от клиента';
  content.sections[0].hidden = true;
  content.sections[0].layout = 'tiles';

  const r = await patch(`${app.url}/api/sites/${site.id}`, {
    design: { template: 'vector', palette: 'custom', colors: { accent: '#AA0000', bg: 'не-цвет' }, fonts: { heading: 'unbounded', body: 'нет-такого' }, cards: 'hard', radius: 16, layouts: { hero: 'poster', cta: 'нет' } },
    content,
    contact: { phone: '+7 (999) 111-22-33<script>', email: 'a@b.co', telegram: 'https://t.me/zerno', primary: 'telegram' },
  });
  assert.equal(r.status, 200);
  const saved = await r.json();
  assert.equal(saved.design.template, 'vector');
  assert.deepEqual(saved.design.colors, { accent: '#aa0000' });
  assert.deepEqual(saved.design.fonts, { heading: 'unbounded' });
  assert.deepEqual(saved.design.layouts, { hero: 'poster' });
  assert.equal(saved.design.radius, 16);
  assert.equal(saved.content.hero.headline, 'Новый *заголовок* от клиента');
  assert.equal(saved.content.sections[0].hidden, true);
  assert.equal(saved.content.sections[0].layout, 'tiles');
  assert.equal(saved.contact.phone, '+7 (999) 111-22-33');
  assert.equal(saved.contact.telegram, 'zerno');
  assert.equal(saved.contact.primary, 'telegram');
  assert.equal(saved.tokens.accent.length, 7);

  // изменилось на диске и на живой странице
  const again = await getSite(site.id);
  assert.equal(again.design.template, 'vector');
  const html = await (await fetch(`${app.url}/s/${site.id}`)).text();
  assert.match(html, /data-tpl="vector"/);
  assert.ok(html.includes('Новый <em>заголовок</em> от клиента'));
  assert.ok(html.includes('--accent:#aa0000') || html.includes('--accent:#'));
  assert.ok(!html.includes('id="s-features"'), 'скрытый блок не показан');
  assert.ok(html.includes('https://t.me/zerno'));
});

test('PATCH меняет только присланные части и отвергает мусор', async () => {
  const site = await createSite(app, { templateId: 'swiss' });
  const r1 = await patch(`${app.url}/api/sites/${site.id}`, { design: { template: 'kids' } });
  const s1 = await r1.json();
  assert.equal(s1.design.template, 'kids');
  assert.equal(s1.content.brand.name, site.content.brand.name, 'контент не тронут');
  assert.equal(s1.contact.phone, site.contact.phone, 'контакты не тронуты');

  assert.equal((await patch(`${app.url}/api/sites/${site.id}`, { content: { brand: {} } })).status, 400);
  assert.equal((await patch(`${app.url}/api/sites/${site.id}`, { content: 'строка' })).status, 400);
  assert.equal((await getSite(site.id)).design.template, 'kids', 'после ошибки данные целы');
  // мусор в дизайне — не ошибка, а сброс к значениям по умолчанию
  const r2 = await patch(`${app.url}/api/sites/${site.id}`, { design: 'что угодно' });
  assert.equal(r2.status, 200);
  assert.equal((await r2.json()).design.template, 'swiss');
});

test('POST /tokens: токены черновика без сохранения', async () => {
  const site = await createSite(app, { templateId: 'swiss' });
  const r = await post(`${app.url}/api/sites/${site.id}/tokens`, { design: { template: 'noir', palette: 'emerald', cards: 'hard' } });
  assert.equal(r.status, 200);
  const t = await r.json();
  assert.equal(t.attrs['data-tpl'], 'noir');
  assert.equal(t.attrs['data-cards'], 'hard');
  assert.equal(t.tokens.dark, true);
  assert.ok(t.css.includes('--accent:'));
  assert.equal((await getSite(site.id)).design.template, 'swiss', 'на диск ничего не записано');
  assert.equal((await post(`${app.url}/api/sites/${site.id}/tokens`, { content: { brand: {} } })).status, 400);
});

// ───────────── Загрузка картинок ─────────────

test('загрузка: картинка привязывается к месту и отдаётся безопасно', async () => {
  const site = await createSite(app);
  for (const slot of ['logo', 'hero', 'about']) {
    const r = await upload(site.id, slot, PNG_1X1);
    assert.equal(r.status, 200, slot);
    const json = await r.json();
    assert.match(json.url, new RegExp(`^/u/${site.id}/[a-f0-9]{16}\\.png$`));
    assert.equal(json.site.media[slot], json.url);
  }
  const media = (await getSite(site.id)).media;
  const img = await fetch(`${app.url}${media.hero}`);
  assert.equal(img.status, 200);
  assert.equal(img.headers.get('content-type'), 'image/png');
  assert.match(img.headers.get('content-security-policy'), /sandbox/);
  assert.equal(img.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(Buffer.from(await img.arrayBuffer()), PNG_1X1);

  const html = await (await fetch(`${app.url}/s/${site.id}`)).text();
  assert.ok(html.includes(`src="${media.hero}"`));
  assert.ok(html.includes(`src="${media.logo}"`));
});

test('загрузка: SVG, HTML, мусор и неизвестное место отклоняются', async () => {
  const site = await createSite(app);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>';
  assert.equal((await upload(site.id, 'hero', svg, 'image/svg+xml')).status, 415);
  assert.equal((await upload(site.id, 'hero', '<html><script>alert(1)</script></html>', 'image/png')).status, 415, 'тип из заголовка не доверяем');
  assert.equal((await upload(site.id, 'hero', Buffer.alloc(0))).status, 415);
  assert.equal((await upload(site.id, 'hero', Buffer.from('просто текст, не картинка'), 'image/png')).status, 415);
  assert.equal((await upload(site.id, 'banner', PNG_1X1)).status, 400);
  assert.equal((await getSite(site.id)).media.hero, null);
});

test('загрузка: слишком большой файл — 413', async () => {
  const site = await createSite(app);
  const big = Buffer.concat([PNG_1X1, Buffer.alloc(6 * 1024 * 1024)]);
  assert.equal((await upload(site.id, 'hero', big)).status, 413);
  assert.equal((await fetch(`${app.url}/healthz`)).status, 200);
});

test('галерея: фото добавляют блок «Галерея» автоматически, не больше 12', async () => {
  const site = await createSite(app);
  assert.ok(!site.content.sections.some((s) => s.type === 'gallery'));
  for (let i = 0; i < 12; i++) assert.equal((await upload(site.id, 'gallery', PNG_1X1)).status, 200, `фото ${i + 1}`);
  const full = await getSite(site.id);
  assert.equal(full.media.gallery.length, 12);
  assert.equal(new Set(full.media.gallery).size, 12);
  const types = full.content.sections.map((s) => s.type);
  assert.equal(types.filter((t) => t === 'gallery').length, 1);
  assert.ok(types.indexOf('gallery') < types.indexOf('cta'), 'галерея перед призывом');
  assert.equal((await upload(site.id, 'gallery', PNG_1X1)).status, 400, '13-е фото не принимается');
  const html = await (await fetch(`${app.url}/s/${site.id}`)).text();
  assert.equal((html.match(/id="s-gallery"/g) ?? []).length, 1);
  assert.equal(full.media.gallery.filter((u) => html.includes(`src="${u}"`)).length, 12);
});

test('ссылаться на чужие файлы через PATCH нельзя; свои — можно переставлять и убирать', async () => {
  const site = await createSite(app);
  const a = (await (await upload(site.id, 'gallery', PNG_1X1)).json()).url;
  const b = (await (await upload(site.id, 'gallery', PNG_1X1)).json()).url;
  const other = await createSite(app);
  const foreign = (await (await upload(other.id, 'hero', PNG_1X1)).json()).url;

  const r = await patch(`${app.url}/api/sites/${site.id}`, { media: { gallery: [b, a, foreign, 'https://evil.example/x.png'], hero: foreign, logo: 'javascript:alert(1)', logoMode: 'logo' } });
  assert.equal(r.status, 200);
  const media = (await r.json()).media;
  assert.deepEqual(media.gallery, [b, a]);
  assert.equal(media.hero, null);
  assert.equal(media.logo, null);
  assert.equal(media.logoMode, 'logo');
});

test('старые файлы вытесняются, когда загрузок слишком много, но используемые не удаляются', async () => {
  const site = await createSite(app);
  let first;
  for (let i = 0; i < 30; i++) {
    const r = await upload(site.id, 'logo', PNG_1X1);
    assert.equal(r.status, 200, `загрузка ${i + 1}`);
    first ??= (await r.json()).url;
  }
  const media = (await getSite(site.id)).media;
  assert.notEqual(media.logo, first);
  assert.equal((await fetch(`${app.url}${media.logo}`)).status, 200, 'текущий логотип на месте');
  assert.equal((await fetch(`${app.url}${first}`)).status, 404, 'самый старый неиспользуемый файл удалён');
  const files = fs.readdirSync(path.join(app.config.dataDir, 'uploads', site.id));
  assert.ok(files.length <= 24, `файлов: ${files.length}`);
});

test('чужие файлы не читаются по подложным путям', async () => {
  const site = await createSite(app);
  const url = (await (await upload(site.id, 'hero', PNG_1X1)).json()).url;
  const file = url.split('/').pop();
  for (const bad of [`/u/${site.id}/..%2f..%2fsites%2f${site.id}.json`, `/u/${site.id}/${file}.svg`, `/u/${'0'.repeat(20)}/${file}`, `/u/../${file}`, `/u/${site.id}/${file.toUpperCase()}`]) {
    assert.equal((await fetch(`${app.url}${bad}`)).status, 404, bad);
  }
});

// ───────────── Совместимость, правки ИИ, лимиты ─────────────

test('сайт, созданный первой версией (themeId + accent), открывается и редактируется', async () => {
  const content = mockGenerate(DEMO_INPUT);
  const id = 'a'.repeat(20);
  fs.writeFileSync(path.join(app.config.dataDir, 'sites', `${id}.json`), JSON.stringify({
    id, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z',
    input: DEMO_INPUT, content, themeId: 'dark', accent: '#ff6600', demo: true, revisions: 0,
  }));
  const site = await getSite(id);
  assert.ok(TEMPLATE_IDS.includes(site.design.template));
  assert.equal(site.design.colors.accent, '#ff6600');
  assert.equal(site.contact.phone, DEMO_INPUT.phone);
  const html = await (await fetch(`${app.url}/s/${id}`)).text();
  assert.ok(html.includes('--accent:#ff6600'));
  const r = await patch(`${app.url}/api/sites/${id}`, { design: { template: 'noir' } });
  assert.equal((await r.json()).design.template, 'noir');
});

test('правка в демо-режиме честно сообщает, что нужен ИИ', async () => {
  const site = await createSite(app);
  const ev = await readSse(await post(`${app.url}/api/sites/${site.id}/revise`, { instruction: 'сделай строже' }));
  assert.equal(ev.at(-1).event, 'error');
  assert.equal(ev.at(-1).data.code, 'demo_mode');
  assert.equal((await post(`${app.url}/api/sites/${site.id}/revise`, { instruction: 'a' })).status, 400);
  assert.equal((await post(`${app.url}/api/sites/${'0'.repeat(20)}/revise`, { instruction: 'сделай строже' })).status, 404);
});

test('главная страница и статика отдаются, с CSP и без x-powered-by', async () => {
  const res = await fetch(`${app.url}/`);
  assert.equal(res.status, 200);
  assert.ok(!res.headers.get('x-powered-by'));
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  const html = await res.text();
  assert.ok(!/https?:\/\/(?!localhost)[a-z0-9.-]+\.[a-z]{2,}/i.test(html.replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '')), 'в интерфейсе нет внешних ресурсов');
  for (const file of ['/styles.css', '/editor.css', '/js/app.js', '/js/editor.js', '/js/ui.js', '/js/net.js', '/js/tabs/index.js']) {
    assert.equal((await fetch(`${app.url}${file}`)).status, 200, file);
  }
  assert.equal((await fetch(`${app.url}/src/app.js`)).status, 404, 'исходники сервера не отдаются');
  assert.equal((await fetch(`${app.url}/package.json`)).status, 404);
  assert.equal((await fetch(`${app.url}/.env`)).status, 404);
});

test('лимит запросов: после N генераций — 429 с Retry-After; ошибки лимит не съедают', async () => {
  const limited = await startApp({ RATE_LIMIT_PER_HOUR: '2' });
  try {
    for (let i = 0; i < 2; i++) {
      const res = await post(`${limited.url}/api/generate`, { templateId: 'swiss', business: VALID_INPUT });
      assert.equal(res.status, 200);
      await readSse(res);
    }
    const third = await post(`${limited.url}/api/generate`, { templateId: 'swiss', business: VALID_INPUT });
    assert.equal(third.status, 429);
    assert.ok(Number(third.headers.get('retry-after')) > 0);
    assert.match((await third.json()).error, /Слишком много/);
    // проверка ввода лимит не расходует
    assert.equal((await post(`${limited.url}/api/generate`, { templateId: 'nope', business: VALID_INPUT })).status, 400);
  } finally {
    await limited.close();
  }
});

test('режим ИИ: генерация и правка через API сохраняют ручные настройки, лимит правок на сайт', async () => {
  const first = mockGenerate(DEMO_INPUT);
  const edited = structuredClone(first);
  edited.hero.headline = 'Новый, более строгий заголовок';
  // «ИИ» в ответе правки не знает про скрытые блоки и раскладку клиента — сервер должен их вернуть
  edited.sections.forEach((s) => { delete s.hidden; delete s.layout; });

  let call = 0;
  const upstream = await fakeAnthropic((body, req, res) => sendTextStream(res, JSON.stringify(call++ === 0 ? first : edited)));
  process.env.ANTHROPIC_BASE_URL = upstream.url;
  const ai = await startApp({ ANTHROPIC_API_KEY: 'sk-ant-test', MAX_REVISIONS_PER_SITE: '1' });
  try {
    const cfg = await (await fetch(`${ai.url}/api/config`)).json();
    assert.equal(cfg.mode, 'ai');

    const gen = await readSse(await post(`${ai.url}/api/generate`, { templateId: 'atelier', business: VALID_INPUT }));
    assert.equal(gen.at(-1).event, 'done');
    const site = gen.at(-1).data.site;
    assert.equal(site.demo, false);
    assert.equal(site.content.hero.headline, first.hero.headline);
    assert.match(upstream.requests[0].body.messages[0].content, /visual_design name="Ателье"/);

    // клиент скрыл блок, выбрал раскладку и загрузил фото в галерею
    const content = structuredClone(site.content);
    content.sections.find((s) => s.type === 'faq').hidden = true;
    content.sections.find((s) => s.type === 'features').layout = 'rows';
    await fetch(`${ai.url}/api/sites/${site.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, design: { template: 'noir', cards: 'hard' } }) });
    await fetch(`${ai.url}/api/sites/${site.id}/media/gallery`, { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: PNG_1X1 });

    const rev = await readSse(await post(`${ai.url}/api/sites/${site.id}/revise`, { instruction: 'Сделай заголовок строже' }));
    assert.equal(rev.at(-1).event, 'done');
    const revised = rev.at(-1).data.site;
    assert.equal(revised.content.hero.headline, edited.hero.headline);
    assert.equal(revised.revisions, 1);
    assert.equal(revised.design.template, 'noir', 'дизайн сохранён');
    assert.equal(revised.design.cards, 'hard');
    assert.equal(revised.content.sections.find((s) => s.type === 'faq').hidden, true, 'скрытый блок остался скрытым');
    assert.equal(revised.content.sections.find((s) => s.type === 'features').layout, 'rows', 'выбранная раскладка осталась');
    assert.equal(revised.content.sections.filter((s) => s.type === 'gallery').length, 1, 'галерея не потерялась');
    assert.equal(revised.media.gallery.length, 1);

    const reread = await (await fetch(`${ai.url}/api/sites/${site.id}`)).json();
    assert.equal(reread.content.hero.headline, edited.hero.headline);

    // в запрос правки ушёл текущий сайт и актуальный дизайн
    const reviseReq = upstream.requests[1].body.messages[0].content;
    assert.match(reviseReq, /Сделай заголовок строже/);
    assert.match(reviseReq, /visual_design name="Нуар"/);

    const over = await post(`${ai.url}/api/sites/${site.id}/revise`, { instruction: 'ещё одна правка' });
    assert.equal(over.status, 429);
  } finally {
    await ai.close();
    await upstream.close();
  }
});

test('ошибка ИИ приходит клиенту как событие error и не расходует лимит', async () => {
  const upstream = await fakeAnthropic((body, req, res) => sendTextStream(res, '', { stopReason: 'refusal' }));
  process.env.ANTHROPIC_BASE_URL = upstream.url;
  const ai = await startApp({ ANTHROPIC_API_KEY: 'sk-ant-test', RATE_LIMIT_PER_HOUR: '1' });
  try {
    for (let i = 0; i < 3; i++) {
      const res = await post(`${ai.url}/api/generate`, { templateId: 'swiss', business: VALID_INPUT });
      assert.equal(res.status, 200, `попытка ${i + 1}: лимит не должен сработать после неудач`);
      const ev = await readSse(res);
      assert.equal(ev.at(-1).event, 'error');
      assert.equal(ev.at(-1).data.code, 'refusal');
    }
  } finally {
    await ai.close();
    await upstream.close();
  }
});
