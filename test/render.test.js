import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSite, renderTokens, esc } from '../src/render/index.js';
import { TEMPLATE_IDS, TEMPLATES } from '../src/templates/index.js';
import { LAYOUT_OPTIONS } from '../src/render/variants.js';
import { SAMPLES, sampleSite } from '../src/samples.js';
import { ART_IDS } from '../src/art.js';
import { FONT_IDS } from '../src/fonts.js';

const GALLERY = ['/u/a/1.png', '/u/a/2.png', '/u/a/3.png'];

/** Все атрибуты всех настоящих тегов (экранированный текст внутри значений тегом не считается). */
function tagAttributes(html) {
  const out = [];
  const tag = /<[a-z][a-z0-9-]*((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/gi;
  for (const m of html.matchAll(tag)) {
    for (const a of m[1].matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) out.push([a[1], a[2] ?? a[3] ?? a[4] ?? '']);
  }
  return out;
}

/** Сайт со всеми типами блоков, включая галерею */
function fullSite(overrides = {}) {
  const site = sampleSite('consulting', overrides);
  site.content.sections.push({ type: 'gallery', navLabel: 'Фото', title: 'Галерея', subtitle: '', text: '', buttonLabel: '', items: [] });
  site.media = { gallery: GALLERY, hero: null, about: null, logo: null, logoMode: 'both' };
  return site;
}

test('каждый шаблон рисует полную страницу на своём примере', () => {
  for (const id of TEMPLATE_IDS) {
    const tpl = TEMPLATES[id];
    const site = sampleSite(tpl.sample, { design: { template: id } });
    const html = renderSite(site);
    assert.match(html, /^<!doctype html>/i, id);
    assert.match(html, new RegExp(`<html lang="[a-z]{2}" [^>]*data-tpl="${id}"`), id);
    assert.ok(html.includes(esc(site.content.seo.title)), `${id}: title`);
    assert.ok(html.includes('id="contact"'), `${id}: контакты`);
    assert.ok(html.includes('<h1>'), `${id}: заголовок`);
    for (const s of site.content.sections) assert.ok(html.includes(`id="s-${s.type}"`), `${id}/${s.type}`);
    assert.ok(!/undefined|\[object|NaN/.test(html), `${id}: «${html.match(/.{20}(undefined|\[object|NaN).{20}/)?.[0]}»`);
    assert.ok(html.length > 20_000 && html.length < 400_000, `${id}: размер ${html.length}`);
  }
});

test('все 18 примеров рисуются во всех шаблонах без ошибок (18 × 18)', () => {
  for (const key of Object.keys(SAMPLES)) {
    for (const template of TEMPLATE_IDS) {
      const html = renderSite(sampleSite(key, { design: { template } }));
      assert.ok(html.includes('</html>'), `${key}/${template}`);
    }
  }
});

test('каждый вариант вёрстки каждого блока даёт свою разметку', () => {
  for (const [key, def] of Object.entries(LAYOUT_OPTIONS)) {
    const outs = def.options.map(([value]) => renderSite({ ...fullSite(), design: { template: 'swiss', layouts: { [key]: value } } }));
    assert.equal(new Set(outs).size, def.options.length, `${key}: варианты неотличимы`);
    for (const html of outs) assert.ok(html.includes('</html>'));
  }
});

test('выбранная раскладка действительно применяется и сбрасывается при смене шаблона', () => {
  const noir = renderSite({ ...fullSite(), design: { template: 'noir' } });
  const swiss = renderSite({ ...fullSite(), design: { template: 'swiss' } });
  assert.notEqual(noir, swiss);
  const forced = renderSite({ ...fullSite(), design: { template: 'noir', layouts: { hero: 'split' } } });
  assert.notEqual(forced, noir);
  // раскладка блока из контента важнее раскладки шаблона
  const site = fullSite({ design: { template: 'swiss' } });
  const base = renderSite(site);
  site.content.sections.find((s) => s.type === 'features').layout = 'tiles';
  assert.notEqual(renderSite(site), base);
  site.content.sections.find((s) => s.type === 'features').layout = 'нет-такой';
  assert.equal(renderSite(site), base, 'неизвестная раскладка игнорируется');
});

test('скрытые блоки не попадают ни на страницу, ни в меню', () => {
  const site = fullSite();
  const block = site.content.sections.find((s) => s.type === 'features');
  const shown = renderSite(site);
  assert.ok(shown.includes('id="s-features"') && shown.includes('href="#s-features"'));
  block.hidden = true;
  const hidden = renderSite(site);
  assert.ok(!hidden.includes('id="s-features"') && !hidden.includes('href="#s-features"'));
  assert.ok(hidden.includes('id="contact"') && hidden.includes('id="s-faq"'));
});

test('порядок блоков на странице = порядок в контенте', () => {
  const site = fullSite();
  site.content.sections.reverse();
  const html = renderSite(site);
  const order = site.content.sections.map((s) => html.indexOf(`id="s-${s.type}"`));
  assert.ok(order.every((n) => n > 0));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test('весь текст экранируется: вредоносный контент не попадает в разметку (во всех шаблонах)', () => {
  const evil = '<img src=x onerror=alert(1)>*<script>alert(2)</script>*"\'`${7*7}';
  const poison = (node, key = '') => {
    if (typeof node === 'string') return ['type', 'icon', 'layout', 'language', 'accent', 'accent2'].includes(key) ? node : evil;
    if (Array.isArray(node)) return node.map((n) => poison(n, key));
    if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, poison(v, k)]));
    return node;
  };
  const contact = {
    phone: evil, email: 'x"onmouseover="alert(3)@a.b', address: evil, hours: evil,
    telegram: 'x" onclick="alert(5)', whatsapp: evil, instagram: 'javascript:alert(6)', vk: '"><script>alert(7)</script>', primary: 'telegram',
  };
  for (const id of TEMPLATE_IDS) {
    const base = fullSite();
    const site = {
      ...base,
      content: poison(base.content),
      contact,
      media: { ...base.media, hero: '"><script>alert(8)</script>', logo: '" onerror="alert(9)', about: 'javascript:alert(10)', logoMode: 'both' },
      design: { template: id, palette: '"><script>alert(11)</script>', colors: { accent: '#123456;}</style><script>alert(12)</script>', bg: 'red' }, fonts: { heading: '</style><script>alert(13)</script>' }, art: 'x"y', radius: '1px;}</style>' },
    };
    for (const opts of [{}, { preview: true }, { inline: true }]) {
      const html = renderSite(site, opts);
      assert.ok(!html.includes('<img src=x'), `${id}: сырой <img>`);
      assert.ok(!/<script>alert/.test(html), `${id}: сырой <script>`);
      const markup = html.replace(/<script>[\s\S]*?<\/script>/, '').replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
      const attrs = tagAttributes(markup);
      assert.ok(!attrs.some(([name]) => /^on/i.test(name)), `${id}: обработчик событий в теге: ${attrs.find(([n]) => /^on/i.test(n))}`);
      assert.ok(!attrs.some(([name, value]) => /^(src|href|action)$/i.test(name) && /^\s*javascript:/i.test(value)), `${id}: javascript: в атрибуте`);
      assert.ok(!html.includes('javascript:alert(10)') && !html.includes('alert(9)'), `${id}: чужие адреса картинок отброшены`);
      // единственный <script> на странице — наш собственный
      assert.equal((html.match(/<script/g) ?? []).length, 1, `${id}: скриптов ${(html.match(/<script/g) ?? []).length}`);
      assert.equal((html.match(/<\/style>/g) ?? []).length, 2, `${id}: закрывающих </style>`);
    }
  }
});

test('esc экранирует спецсимволы и null', () => {
  assert.equal(esc(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  assert.equal(esc(null), '');
  assert.equal(esc(undefined), '');
});

test('*слово* в заголовках превращается в <em>, звёздочки без пары остаются текстом', () => {
  const site = fullSite({ design: { template: 'swiss' } });
  site.content.hero.headline = 'Делаем *дело* хорошо';
  const html = renderSite(site);
  assert.ok(html.includes('Делаем <em>дело</em> хорошо'));
  site.content.hero.headline = 'Цена от 5 * 3 рублей';
  const raw = renderSite(site);
  assert.ok(raw.includes('Цена от 5 * 3 рублей') && !raw.includes('<em>3'));
});

test('контакты: ссылки, форма и главная кнопка зависят от настроек', () => {
  const base = fullSite({ design: { template: 'swiss' } });
  const full = renderSite({ ...base, contact: { phone: '+7 (111) 222-33-44', email: 'hi@a.co', address: 'ул. Мира, 1', hours: 'Пн–Пт', telegram: 'zerno', whatsapp: '79001112233', instagram: 'zerno', vk: 'zerno', primary: 'form' } });
  assert.ok(full.includes('href="tel:+71112223344"'));
  assert.ok(full.includes('data-mailto="hi@a.co"') && full.includes('<form'));
  assert.ok(full.includes('https://t.me/zerno') && full.includes('https://wa.me/79001112233') && full.includes('https://instagram.com/zerno') && full.includes('https://vk.com/zerno'));
  assert.ok(full.includes('href="#contact"'));

  const tg = renderSite({ ...base, contact: { telegram: 'zerno', primary: 'telegram' } });
  assert.ok(tg.includes('class="btn btn-primary nav-cta" href="https://t.me/zerno"'));
  const phone = renderSite({ ...base, contact: { phone: '+7 111 222-33-44', primary: 'phone' } });
  assert.ok(phone.includes('class="btn btn-primary nav-cta" href="tel:+71112223344"'));
  // главный способ выбран, но данных нет — остаёмся на форме
  const fallback = renderSite({ ...base, contact: { primary: 'whatsapp' } });
  assert.ok(fallback.includes('class="btn btn-primary nav-cta" href="#contact"'));

  const none = renderSite({ ...base, contact: {} });
  assert.ok(!none.includes('<form') && !none.includes('href="tel:') && !none.includes('href="mailto:'));
  const phoneOnly = renderSite({ ...base, contact: { phone: '+7 111 222-33-44' } });
  assert.ok(!phoneOnly.includes('<form'));
});

test('изображения клиента: фото первого экрана заменяет графику, логотип — название, галерея — картинки', () => {
  const plain = renderSite({ ...fullSite(), design: { template: 'swiss' }, media: { gallery: [], hero: null, about: null, logo: null } });
  const withMedia = renderSite({ ...fullSite(), design: { template: 'swiss' }, media: { hero: '/u/a/hero.png', logo: '/u/a/logo.png', about: null, gallery: GALLERY, logoMode: 'both' } });
  assert.ok(!plain.includes('src="/u/a/hero.png"') && !plain.includes('id="s-gallery"'));
  assert.ok(withMedia.includes('src="/u/a/hero.png"'));
  assert.ok(withMedia.includes('src="/u/a/logo.png"'));
  for (const u of GALLERY) assert.ok(withMedia.includes(`src="${u}"`), u);
  assert.ok(withMedia.length < plain.length, 'фото вместо рисованной графики — страница легче');
  // только логотип — без названия рядом
  const logoOnly = renderSite({ ...fullSite(), design: { template: 'swiss' }, media: { logo: '/u/a/logo.png', hero: null, about: null, gallery: [], logoMode: 'logo' } });
  assert.ok(logoOnly.includes('src="/u/a/logo.png"'));
  assert.ok(logoOnly.length < renderSite({ ...fullSite(), design: { template: 'swiss' }, media: { logo: '/u/a/logo.png', hero: null, about: null, gallery: [], logoMode: 'both' } }).length);
});

test('настройки оформления попадают в токены и атрибуты страницы', () => {
  const site = fullSite({
    design: { template: 'swiss', palette: 'custom', colors: { bg: '#101010', text: '#f5f5f5', accent: '#00ff88' }, fonts: { heading: 'unbounded' }, cards: 'hard', icons: 'badge', radius: 20, textSize: 'lg' },
  });
  const html = renderSite(site);
  assert.match(html, /data-cards="hard"/);
  assert.match(html, /data-icons="badge"/);
  assert.match(html, /--accent:#00ff88/);
  assert.match(html, /--bg:#101010/);
  assert.match(html, /--radius:20px/);
  assert.match(html, /--fs:19px/);
  assert.match(html, /color-scheme:dark/);
  assert.match(html, /font-family:'Unbounded Variable'/);
  assert.ok(!/fonts\.googleapis|gstatic|cdn\./i.test(html), 'никаких внешних ресурсов');
});

test('renderTokens отдаёт те же токены, что и страница', () => {
  const site = fullSite({ design: { template: 'noir', palette: 'emerald' } });
  const { css, attrs, tokens } = renderTokens(site);
  assert.ok(renderSite(site).includes(css));
  assert.equal(attrs['data-tpl'], 'noir');
  assert.match(tokens.bg, /^#[0-9a-f]{6}$/);
  assert.equal(tokens.dark, true);
});

test('каждый шрифт и каждый стиль графики можно выбрать без поломки страницы', () => {
  for (const id of FONT_IDS) {
    const html = renderSite({ ...fullSite(), design: { template: 'swiss', fonts: { heading: id, body: id, accent: id } } });
    assert.ok(html.includes('@font-face'), id);
  }
  const seen = new Set();
  for (const art of [...ART_IDS, 'none']) {
    const html = renderSite({ ...fullSite(), design: { template: 'swiss', art } });
    seen.add(html);
  }
  assert.ok(seen.size >= 10, `разных страниц: ${seen.size}`);
});

test('предпросмотр добавляет скрипт редактора, обычная страница и скачиваемая — нет', () => {
  const site = fullSite();
  assert.ok(renderSite(site, { preview: true }).includes("parent.postMessage"));
  assert.ok(!renderSite(site).includes('parent.postMessage'));
  assert.ok(!renderSite(site, { inline: true }).includes('parent.postMessage'));
});

test('скачиваемая версия: шрифты встроены, ссылок на /fonts/ нет', () => {
  const live = renderSite(fullSite());
  const inline = renderSite(fullSite(), { inline: true });
  assert.ok(live.includes('/fonts/') && !live.includes('base64,AAEAAA') );
  assert.ok(inline.includes('data:font/woff2;base64,'));
  assert.ok(!inline.includes('url(/fonts/'));
});

test('неизвестный шаблон — запасной вариант, а не падение', () => {
  const html = renderSite({ ...fullSite(), design: { template: 'nope' } });
  assert.match(html, /data-tpl="swiss"/);
  assert.ok(renderSite({ ...fullSite(), design: undefined }).includes('</html>'));
});

test('страница без секций и без картинок всё равно собирается', () => {
  const site = fullSite({ design: { template: 'swiss' } });
  site.content.sections = [];
  site.content.hero.highlights = [];
  site.content.hero.keywords = [];
  const html = renderSite(site);
  assert.ok(html.includes('id="contact"') && html.includes('<h1>'));
});

test('адаптивность и доступность: viewport, lang, alt у картинок, aria у меню', () => {
  const html = renderSite(fullSite());
  assert.match(html, /<meta name="viewport" content="width=device-width,initial-scale=1">/);
  assert.match(html, /<html lang="ru"/);
  assert.match(html, /aria-expanded="false"/);
  assert.ok(!/<img(?![^>]*\balt=)[^>]*>/.test(html), 'у каждой картинки есть alt');
  assert.match(html, /@media\s*\(max-width/);
});
