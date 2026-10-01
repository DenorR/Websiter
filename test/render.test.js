import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSite, esc } from '../src/render/index.js';
import { THEMES, THEME_IDS, contrast, ensureContrast } from '../src/render/themes.js';
import { mockGenerate, DEMO_INPUT } from '../src/mock.js';

const content = mockGenerate(DEMO_INPUT);
const contact = { phone: DEMO_INPUT.phone, email: DEMO_INPUT.email, address: DEMO_INPUT.address, hours: DEMO_INPUT.hours };

test('каждая тема рендерит полную страницу', () => {
  assert.equal(THEME_IDS.length, 6);
  for (const themeId of THEME_IDS) {
    const html = renderSite({ content, contact, themeId });
    assert.match(html, /^<!doctype html>/i, themeId);
    assert.match(html, new RegExp(`data-theme="${themeId}"`));
    assert.ok(html.includes(esc(content.hero.headline)), themeId);
    assert.ok(html.includes('id="contact"'), themeId);
    assert.ok(html.includes('tel:+79001234567'), themeId);
    assert.ok(html.includes('data-mailto="hello@zerno.example"'), themeId);
    // каждая секция из контента есть на странице
    for (const s of content.sections) assert.ok(html.includes(`id="s-${s.type}"`), `${themeId}/${s.type}`);
  }
});

test('весь текст экранируется: вредоносный контент не попадает в разметку', () => {
  const evil = '<img src=x onerror=alert(1)><script>alert(2)</script>"\'';
  const bad = structuredClone(content);
  bad.brand.name = evil;
  bad.brand.tagline = evil;
  bad.seo.title = evil;
  bad.seo.description = evil;
  bad.hero.headline = evil;
  bad.hero.subheadline = evil;
  bad.hero.eyebrow = evil;
  bad.hero.primaryCta = evil;
  bad.hero.highlights[0].title = evil;
  for (const s of bad.sections) {
    s.title = evil; s.navLabel = evil; s.subtitle = evil; s.text = evil; s.buttonLabel = evil;
    for (const it of s.items) { it.title = evil; it.text = evil; it.meta = evil; }
  }
  bad.contact.title = evil;
  bad.contact.subtitle = evil;
  bad.contact.buttonLabel = evil;
  bad.labels.phone = evil;
  const badContact = { phone: evil, email: 'x"onmouseover="alert(3)@a.b', address: evil, hours: evil };

  for (const themeId of THEME_IDS) {
    const html = renderSite({ content: bad, contact: badContact, themeId, accent: '#123456;}</style><script>alert(4)</script>' });
    assert.ok(!html.includes('<img src=x'), `${themeId}: сырой <img>`);
    assert.ok(!html.includes('<script>alert'), `${themeId}: сырой <script>`);
    assert.ok(!/ onmouseover=/.test(html), `${themeId}: атрибут-инъекция`);
    assert.ok(!html.includes('alert(4)'), `${themeId}: инъекция через цвет`);
    // единственный <script> на странице — наш собственный
    assert.equal((html.match(/<script/g) ?? []).length, 1, themeId);
  }
});

test('esc экранирует спецсимволы и null', () => {
  assert.equal(esc(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  assert.equal(esc(null), '');
  assert.equal(esc(undefined), '');
});

test('цвет клиента переопределяет цвет ИИ, кривой — игнорируется', () => {
  const a = renderSite({ content, contact, themeId: 'minimal', accent: '#ff0000' });
  assert.ok(a.includes('--accent:#ff0000'));
  const b = renderSite({ content, contact, themeId: 'minimal', accent: 'red' });
  assert.ok(b.includes(`--accent:${content.brand.accent}`));
});

test('акцент всегда читаем на фоне темы', () => {
  for (const theme of Object.values(THEMES)) {
    for (const color of ['#ffff00', '#000000', '#7c5cff', '#ffffff', '#102030']) {
      const fg = ensureContrast(color, theme.vars.bg, 4.2);
      assert.ok(contrast(fg, theme.vars.bg) >= 4.2 - 0.01, `${theme.id} ${color} -> ${fg}`);
    }
  }
});

test('без email показывается кнопка звонка, без контактов — только текст', () => {
  const phoneOnly = renderSite({ content, contact: { phone: '+7 111 222-33-44' }, themeId: 'minimal' });
  assert.ok(!phoneOnly.includes('<form'));
  assert.ok(phoneOnly.includes('href="tel:+71112223344"'));
  const none = renderSite({ content, contact: {}, themeId: 'minimal' });
  assert.ok(!none.includes('<form'));
  assert.ok(!none.includes('tel:'));
  assert.ok(none.includes('contact-grid single'));
});

test('неизвестная тема — запасной вариант, а не падение', () => {
  const html = renderSite({ content, contact, themeId: 'nope' });
  assert.match(html, /data-theme="minimal"/);
});
