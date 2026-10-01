import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, TEMPLATE_IDS, CATEGORIES, DEFAULT_TEMPLATE, publicTemplates } from '../src/templates/index.js';
import { FONTS } from '../src/fonts.js';
import { ART_IDS } from '../src/art.js';
import { isLayout, LAYOUT_KEYS, STYLE_KEYS, isStyleValue } from '../src/render/variants.js';
import { SAMPLES, sampleSite } from '../src/samples.js';
import { sanitizeStoredContent } from '../src/schema.js';

test('в каталоге 18 разных шаблонов, у каждого полный набор данных', () => {
  assert.equal(TEMPLATE_IDS.length, 18);
  assert.equal(new Set(TEMPLATE_IDS).size, 18);
  assert.ok(TEMPLATES[DEFAULT_TEMPLATE]);
  const cats = new Set(CATEGORIES.map(([id]) => id));
  for (const t of Object.values(TEMPLATES)) {
    assert.match(t.id, /^[a-z0-9-]+$/);
    for (const k of ['name', 'tagline', 'best', 'sample']) assert.ok(t[k] && typeof t[k] === 'string', `${t.id}.${k}`);
    assert.ok(t.categories.length > 0 && t.categories.every((c) => cats.has(c)), `${t.id}: категории`);
    assert.ok(t.palettes.length >= 3, `${t.id}: минимум 3 палитры`);
    assert.equal(new Set(t.palettes.map((p) => p.id)).size, t.palettes.length, `${t.id}: id палитр уникальны`);
    for (const p of t.palettes) for (const k of ['bg', 'text', 'accent', 'accent2']) assert.match(p[k], /^#[0-9a-f]{6}$/, `${t.id}/${p.id}.${k}`);
    assert.ok(SAMPLES[t.sample], `${t.id}: пример «${t.sample}» существует`);
  }
});

test('шрифты, графика, варианты вёрстки и стиль шаблона — из допустимых значений', () => {
  for (const t of Object.values(TEMPLATES)) {
    for (const [role, id] of Object.entries(t.fonts)) assert.ok(FONTS[id], `${t.id}: шрифт ${role}=${id}`);
    assert.ok(t.art === 'none' || ART_IDS.includes(t.art), `${t.id}: графика ${t.art}`);
    for (const key of LAYOUT_KEYS) assert.ok(isLayout(key, t.layouts[key]), `${t.id}: ${key}=${t.layouts[key]}`);
    assert.ok(['text', 'accent', 'accent2', 'surface2'].includes(t.band), `${t.id}: band`);
    for (const k of ['buttonShape', 'buttonStyle', 'cards', 'mediaShape']) assert.ok(isStyleValue(k, t.shape[k]), `${t.id}: shape.${k}=${t.shape[k]}`);
    for (const k of ['head', 'icons', 'density', 'width', 'motion']) assert.ok(isStyleValue(k, t.deco[k]), `${t.id}: deco.${k}=${t.deco[k]}`);
  }
});

test('шаблоны действительно различаются: разная вёрстка первого экрана, шрифты и палитры', () => {
  const heroes = new Set(TEMPLATE_IDS.map((id) => TEMPLATES[id].layouts.hero));
  assert.ok(heroes.size >= 5, `вариантов hero: ${heroes.size}`);
  const headFonts = new Set(TEMPLATE_IDS.map((id) => TEMPLATES[id].fonts.heading));
  assert.ok(headFonts.size >= 12, `разных шрифтов заголовков: ${headFonts.size}`);
  const accents = new Set(TEMPLATE_IDS.map((id) => TEMPLATES[id].palettes[0].accent));
  assert.ok(accents.size >= 14, `разных акцентов: ${accents.size}`);
  const sig = new Set(TEMPLATE_IDS.map((id) => JSON.stringify([TEMPLATES[id].layouts, TEMPLATES[id].fonts])));
  assert.equal(sig.size, 18, 'нет двух шаблонов с одинаковой вёрсткой и шрифтами');
});

test('publicTemplates не отдаёт внутренности (CSS) и содержит всё нужное интерфейсу', () => {
  const list = publicTemplates();
  assert.equal(list.length, 18);
  for (const t of list) {
    assert.ok(t.id && t.name && t.tagline && t.best && t.palettes.length >= 3);
    assert.equal(typeof t.dark, 'boolean');
    assert.ok(!('css' in t) && !('type' in t) && !('shape' in t));
  }
  assert.ok(!JSON.stringify(list).includes('@font-face'));
});

test('все 18 примеров содержимого валидны и не противоречат правилу «без выдуманных отзывов»', () => {
  assert.ok(Object.keys(SAMPLES).length >= 18);
  for (const key of Object.keys(SAMPLES)) {
    const site = sampleSite(key);
    assert.doesNotThrow(() => sanitizeStoredContent(site.content), key);
    assert.equal(site.content.hero.highlights.length, 3, key);
    assert.ok(!site.content.sections.some((s) => s.type === 'testimonials'), key);
  }
});

test('значения стиля: auto допустим всегда, мусор — никогда', () => {
  for (const k of STYLE_KEYS) {
    assert.ok(isStyleValue(k, 'auto'));
    assert.ok(!isStyleValue(k, 'nope'));
    assert.ok(!isStyleValue(k, undefined));
  }
});
