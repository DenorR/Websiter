import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp, readSse, post, VALID_INPUT } from './helpers.js';

let app;
before(async () => {
  app = await startApp();
});
after(() => app.close());

const generate = async (body) => {
  const res = await post(`${app.url}/api/generate`, body);
  return { res, events: res.headers.get('content-type')?.includes('event-stream') ? await readSse(res) : null };
};

test('GET /api/config отдаёт режим и 6 дизайнов', async () => {
  const cfg = await (await fetch(`${app.url}/api/config`)).json();
  assert.equal(cfg.mode, 'demo');
  assert.equal(cfg.themes.length, 6);
  assert.ok(cfg.themes.every((t) => t.id && t.name && t.accent));
  assert.ok(!JSON.stringify(cfg).includes('css'), 'внутренности тем не утекают');
});

test('POST /api/generate: поток progress → done, сайт сохранён и открывается', async () => {
  const { res, events } = await generate({ themeId: 'dark', business: VALID_INPUT });
  assert.equal(res.status, 200);
  const names = events.map((e) => e.event);
  assert.ok(names.includes('progress'));
  assert.equal(names.at(-1), 'done');
  const site = events.at(-1).data.site;
  assert.match(site.id, /^[a-f0-9]{20}$/);
  assert.equal(site.themeId, 'dark');
  assert.equal(site.demo, true);
  assert.equal(site.content.brand.name, VALID_INPUT.name);

  // страница сайта
  const page = await fetch(`${app.url}/s/${site.id}`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(page.headers.get('content-security-policy'), /default-src 'none'/);
  const html = await page.text();
  assert.match(html, /data-theme="dark"/);
  assert.ok(html.includes('tel:+79000000000'));

  // скачивание
  const dl = await fetch(`${app.url}/s/${site.id}/download`);
  assert.match(dl.headers.get('content-disposition'), /attachment; filename="[^"]*\.html"; filename\*=UTF-8''/);

  // чтение данных
  const got = await (await fetch(`${app.url}/api/sites/${site.id}`)).json();
  assert.equal(got.id, site.id);
});

test('PATCH меняет дизайн и цвет; кривые значения отклоняются', async () => {
  const { events } = await generate({ themeId: 'minimal', business: VALID_INPUT });
  const id = events.at(-1).data.site.id;
  const patch = (body) =>
    fetch(`${app.url}/api/sites/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  const r1 = await patch({ themeId: 'elegant', accent: '#AA0000' });
  assert.equal(r1.status, 200);
  const site = await r1.json();
  assert.equal(site.themeId, 'elegant');
  assert.equal(site.accent, '#aa0000');
  const html = await (await fetch(`${app.url}/s/${id}`)).text();
  assert.match(html, /data-theme="elegant"/);
  assert.ok(html.includes('--accent:#aa0000'));

  assert.equal((await patch({ themeId: 'nope' })).status, 400);
  assert.equal((await patch({ accent: 'red; background:url(x)' })).status, 400);
  assert.equal((await patch({ accent: '' })).status, 200); // сброс цвета
});

test('валидация входа: 400 с понятным текстом', async () => {
  const bad = [
    [{ themeId: 'minimal', business: { name: '', description: 'x'.repeat(30) } }, /название/i],
    [{ themeId: 'minimal', business: { name: 'A', description: 'коротко' } }, /подробнее/i],
    [{ themeId: 'nope', business: VALID_INPUT }, /дизайн/i],
    [{ business: VALID_INPUT }, null],
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
  const huge = await fetch(`${app.url}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: 'x'.repeat(100_000) }) });
  assert.equal(huge.status, 413);
  assert.equal((await fetch(`${app.url}/healthz`)).status, 200);
});

test('чужие и подделанные id не открываются (в т.ч. path traversal)', async () => {
  for (const id of ['0'.repeat(20), '../../etc/passwd', '..%2f..%2fpackage.json', 'A'.repeat(20), 'x']) {
    const r = await fetch(`${app.url}/s/${id}`);
    assert.equal(r.status, 404, id);
    const a = await fetch(`${app.url}/api/sites/${id}`);
    assert.equal(a.status, 404, id);
  }
});

test('демо-превью дизайнов доступны, неизвестный — 404', async () => {
  const ok = await fetch(`${app.url}/demo/warm`);
  assert.equal(ok.status, 200);
  assert.match(await ok.text(), /data-theme="warm"/);
  assert.equal((await fetch(`${app.url}/demo/nope`)).status, 404);
});

test('правка в демо-режиме честно сообщает, что нужен ИИ', async () => {
  const { events } = await generate({ themeId: 'minimal', business: VALID_INPUT });
  const id = events.at(-1).data.site.id;
  const res = await post(`${app.url}/api/sites/${id}/revise`, { instruction: 'сделай строже' });
  const ev = await readSse(res);
  assert.equal(ev.at(-1).event, 'error');
  assert.equal(ev.at(-1).data.code, 'demo_mode');
  assert.equal((await post(`${app.url}/api/sites/${id}/revise`, { instruction: 'a' })).status, 400);
  assert.equal((await post(`${app.url}/api/sites/${'0'.repeat(20)}/revise`, { instruction: 'сделай строже' })).status, 404);
});

test('главная страница и статика отдаются, с CSP и без x-powered-by', async () => {
  const res = await fetch(`${app.url}/`);
  assert.equal(res.status, 200);
  assert.ok(!res.headers.get('x-powered-by'));
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await fetch(`${app.url}/app.js`)).status, 200);
  assert.equal((await fetch(`${app.url}/styles.css`)).status, 200);
});

test('лимит запросов: после N генераций — 429 с Retry-After; ошибки лимит не съедают', async () => {
  const limited = await startApp({ RATE_LIMIT_PER_HOUR: '2' });
  try {
    for (let i = 0; i < 2; i++) {
      const res = await post(`${limited.url}/api/generate`, { themeId: 'minimal', business: VALID_INPUT });
      assert.equal(res.status, 200);
      await readSse(res);
    }
    const third = await post(`${limited.url}/api/generate`, { themeId: 'minimal', business: VALID_INPUT });
    assert.equal(third.status, 429);
    assert.ok(Number(third.headers.get('retry-after')) > 0);
    assert.match((await third.json()).error, /Слишком много/);
  } finally {
    await limited.close();
  }
});

test('режим ИИ: генерация и правка через API, лимит правок на сайт', async () => {
  const { mockGenerate, DEMO_INPUT } = await import('../src/mock.js');
  const { fakeAnthropic, sendTextStream } = await import('./helpers.js');
  const first = mockGenerate(DEMO_INPUT);
  const edited = structuredClone(first);
  edited.hero.headline = 'Новый, более строгий заголовок';

  let call = 0;
  const upstream = await fakeAnthropic((body, req, res) => sendTextStream(res, JSON.stringify(call++ === 0 ? first : edited)));
  process.env.ANTHROPIC_BASE_URL = upstream.url;
  const ai = await startApp({ ANTHROPIC_API_KEY: 'sk-ant-test', MAX_REVISIONS_PER_SITE: '1' });
  try {
    const cfg = await (await fetch(`${ai.url}/api/config`)).json();
    assert.equal(cfg.mode, 'ai');

    const gen = await readSse(await post(`${ai.url}/api/generate`, { themeId: 'warm', business: VALID_INPUT }));
    assert.equal(gen.at(-1).event, 'done');
    const site = gen.at(-1).data.site;
    assert.equal(site.demo, false);
    assert.equal(site.content.hero.headline, first.hero.headline);

    const rev = await readSse(await post(`${ai.url}/api/sites/${site.id}/revise`, { instruction: 'Сделай заголовок строже' }));
    assert.equal(rev.at(-1).event, 'done');
    assert.equal(rev.at(-1).data.site.content.hero.headline, edited.hero.headline);
    assert.equal(rev.at(-1).data.site.revisions, 1);
    assert.equal(rev.at(-1).data.site.themeId, 'warm', 'дизайн сохранён');

    // сохранилось на диске
    const reread = await (await fetch(`${ai.url}/api/sites/${site.id}`)).json();
    assert.equal(reread.content.hero.headline, edited.hero.headline);

    // в запросе правки ушёл текущий сайт
    const reviseReq = upstream.requests[1].body.messages[0].content;
    assert.match(reviseReq, /Сделай заголовок строже/);

    // лимит правок на один сайт
    const over = await post(`${ai.url}/api/sites/${site.id}/revise`, { instruction: 'ещё одна правка' });
    assert.equal(over.status, 429);
  } finally {
    await ai.close();
    await upstream.close();
  }
});

test('ошибка ИИ приходит клиенту как событие error и не расходует лимит', async () => {
  const { fakeAnthropic, sendTextStream } = await import('./helpers.js');
  const upstream = await fakeAnthropic((body, req, res) => sendTextStream(res, '', { stopReason: 'refusal' }));
  process.env.ANTHROPIC_BASE_URL = upstream.url;
  const ai = await startApp({ ANTHROPIC_API_KEY: 'sk-ant-test', RATE_LIMIT_PER_HOUR: '1' });
  try {
    for (let i = 0; i < 3; i++) {
      const res = await post(`${ai.url}/api/generate`, { themeId: 'minimal', business: VALID_INPUT });
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
