import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanDesign, cleanContact, cleanMedia, normalizeSite, resolveDesign, DEFAULT_DESIGN, tokensCss } from '../src/model.js';
import { sampleSite } from '../src/samples.js';
import { TEMPLATES } from '../src/templates/index.js';
import { contrast } from '../src/color.js';
import { FONTS } from '../src/fonts.js';

test('cleanDesign: мусор сбрасывается к значениям по умолчанию, лишнее отбрасывается', () => {
  assert.deepEqual(cleanDesign(null), DEFAULT_DESIGN);
  assert.deepEqual(cleanDesign('строка'), DEFAULT_DESIGN);
  const d = cleanDesign({
    template: 'нет-такого', palette: 'a b; c', colors: { bg: 'red', accent: '#F00', evil: '#000000' },
    fonts: { heading: 'inter', body: 'нет', accent: 123 }, textSize: 'huge', cards: 'hard', radius: 999,
    art: 'wat', layouts: { hero: 'poster', features: 'нет', nope: 'x' }, extra: { a: 1 },
  });
  assert.equal(d.template, DEFAULT_DESIGN.template);
  assert.equal(d.palette, 'auto');
  assert.deepEqual(d.colors, { accent: '#ff0000' });
  assert.deepEqual(d.fonts, { heading: 'inter' });
  assert.equal(d.textSize, 'auto');
  assert.equal(d.cards, 'hard');
  assert.equal(d.radius, 48, 'радиус ограничен');
  assert.equal(d.art, 'auto');
  assert.deepEqual(d.layouts, { hero: 'poster' });
  assert.ok(!('extra' in d));
});

test('cleanDesign: радиус округляется и не уходит в минус; null = как в шаблоне', () => {
  assert.equal(cleanDesign({ radius: -5 }).radius, 0);
  assert.equal(cleanDesign({ radius: 12.6 }).radius, 13);
  assert.equal(cleanDesign({ radius: '12' }).radius, null);
  assert.equal(cleanDesign({ art: 'none' }).art, 'none');
});

test('cleanContact: телефон, почта и соцсети приводятся к безопасному виду', () => {
  const c = cleanContact({
    phone: '+7 (900) 123-45-67 <b>', email: 'ok@example.com', address: ' ул. Мира, 1 ', hours: 'Пн–Пт',
    telegram: 'https://t.me/zerno_cafe/', whatsapp: '+7 900 123-45-67', instagram: '@zerno.cafe', vk: 'https://vk.com/zerno', primary: 'telegram',
  });
  assert.equal(c.phone, '+7 (900) 123-45-67');
  assert.equal(c.email, 'ok@example.com');
  assert.equal(c.address, 'ул. Мира, 1');
  assert.equal(c.telegram, 'zerno_cafe');
  assert.equal(c.whatsapp, '79001234567');
  assert.equal(c.instagram, 'zerno.cafe');
  assert.equal(c.vk, 'zerno');
  assert.equal(c.primary, 'telegram');

  const bad = cleanContact({ email: 'a"b@c.d', telegram: 'x', whatsapp: '12', instagram: 'javascript:alert(1)', vk: '<script>', primary: 'hack' });
  assert.equal(bad.email, '');
  assert.equal(bad.telegram, '');
  assert.equal(bad.whatsapp, '');
  assert.equal(bad.instagram, '');
  assert.equal(bad.vk, '');
  assert.equal(bad.primary, 'form');
  assert.equal(cleanContact(undefined).phone, '');
});

test('cleanMedia: можно ссылаться только на свои загруженные файлы', () => {
  const allowed = new Set(['/u/a/1.png', '/u/a/2.png', '/u/a/3.png']);
  const m = cleanMedia({
    logo: '/u/a/1.png', hero: 'https://evil.example/x.png', about: '/u/other/9.png',
    gallery: ['/u/a/2.png', 'javascript:alert(1)', '/u/a/3.png'], logoMode: 'logo',
  }, allowed);
  assert.equal(m.logo, '/u/a/1.png');
  assert.equal(m.hero, null);
  assert.equal(m.about, null);
  assert.deepEqual(m.gallery, ['/u/a/2.png', '/u/a/3.png']);
  assert.equal(m.logoMode, 'logo');
  assert.equal(cleanMedia({ logoMode: 'x' }, allowed).logoMode, 'both');
  const many = cleanMedia({ gallery: Array(30).fill('/u/a/1.png') }, allowed);
  assert.equal(many.gallery.length, 12, 'в галерее не больше 12 фото');
});

test('normalizeSite: сайты первой версии (themeId + accent) переезжают на новую модель', () => {
  const base = sampleSite('consulting');
  const old = { id: 'x', content: base.content, input: { phone: '+7 111', email: 'a@b.co' }, themeId: 'elegant', accent: '#aa0000' };
  const n = normalizeSite(old);
  assert.ok(TEMPLATES[n.design.template]);
  assert.equal(n.design.palette, 'custom');
  assert.equal(n.design.colors.accent, '#aa0000');
  assert.equal(n.contact.phone, '+7 111');
  assert.deepEqual(n.media.gallery, []);
  assert.equal(n.media.logo, null);
  // уже новые сайты не трогаем
  const fresh = normalizeSite({ ...base, design: { template: 'noir' } });
  assert.equal(fresh.design.template, 'noir');
});

test('resolveDesign: «цвета ИИ» берутся у брендируемых шаблонов, свои цвета перекрывают палитру', () => {
  const site = sampleSite('startup');
  site.content.brand.accent = '#e11d48';
  site.content.brand.accent2 = '#fb923c';
  const brandable = Object.values(TEMPLATES).find((t) => t.brandable);
  const plain = Object.values(TEMPLATES).find((t) => !t.brandable);
  assert.ok(brandable && plain);

  assert.equal(resolveDesign({ ...site, design: { template: brandable.id, palette: 'auto' } }).tokens.accent, '#e11d48');
  assert.equal(resolveDesign({ ...site, design: { template: plain.id, palette: 'auto' } }).tokens.accent, plain.palettes[0].accent);
  assert.equal(resolveDesign({ ...site, design: { template: plain.id, palette: 'ai' } }).tokens.accent, '#e11d48');
  assert.equal(resolveDesign({ ...site, design: { template: plain.id, palette: plain.palettes[1].id } }).tokens.accent, plain.palettes[1].accent);

  const custom = resolveDesign({ ...site, design: { template: plain.id, palette: 'custom', colors: { bg: '#101010', text: '#f0f0f0', accent: '#00ff88' } } });
  assert.equal(custom.tokens.bg, '#101010');
  assert.equal(custom.tokens.accent, '#00ff88');
  assert.ok(custom.tokens.dark);
  assert.ok(contrast(custom.tokens.text, custom.tokens.bg) >= 7);
});

test('resolveDesign: шрифты, размеры и стиль превращаются в переменные и атрибуты', () => {
  const site = sampleSite('startup');
  const base = resolveDesign({ ...site, design: { template: 'swiss' } });
  const custom = resolveDesign({
    ...site,
    design: { template: 'swiss', fonts: { heading: 'unbounded', body: 'literata' }, cards: 'hard', icons: 'badge', radius: 22, headingCase: 'upper', textSize: 'lg', density: 'airy' },
  });
  assert.notEqual(JSON.stringify(base.vars), JSON.stringify(custom.vars));
  assert.ok(custom.fontIds.includes('unbounded') && custom.fontIds.includes('literata'));
  assert.equal(custom.vars['--radius'], '22px');
  assert.equal(custom.vars['--h-case'], 'uppercase');
  assert.equal(custom.vars['--fs'], '19px');
  assert.match(custom.vars['--font-head'], /Unbounded/);
  assert.match(custom.vars['--font-body'], /Literata/);
  assert.equal(base.vars['--sec-pad'] === custom.vars['--sec-pad'], false);
  assert.equal(custom.attrs['data-cards'], 'hard');
  assert.equal(custom.attrs['data-icons'], 'badge');
  const css = tokensCss(custom);
  assert.ok(css.includes('@font-face') && css.includes(':root{'));
  assert.ok(css.includes("font-family:'Unbounded Variable'"));
  assert.ok(!css.includes('fonts.googleapis'));
});

test('resolveDesign: размер заголовка и вес ограничены возможностями шрифта', () => {
  const site = sampleSite('startup');
  const light = resolveDesign({ ...site, design: { template: 'swiss', fonts: { heading: 'prata' }, headingWeight: 'black' } });
  assert.equal(light.vars['--h-weight'], '400', 'у Prata одно начертание 400');
  const heavy = resolveDesign({ ...site, design: { template: 'swiss', fonts: { heading: 'inter' }, headingWeight: 'black' } });
  assert.equal(heavy.vars['--h-weight'], String(Math.min(FONTS.inter.weights[1], 850)));
});
