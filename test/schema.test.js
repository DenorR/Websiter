import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { BusinessInput, SiteContent, normalizeContent, validHex } from '../src/schema.js';
import { mockGenerate, DEMO_INPUT } from '../src/mock.js';

test('схема контента превращается в JSON Schema для structured outputs', () => {
  const fmt = zodOutputFormat(SiteContent);
  assert.equal(fmt.type, 'json_schema');
  // Zod выносит повторяющиеся куски в $defs — разворачиваем ссылки для проверки.
  const deref = (node) => (node?.$ref ? fmt.schema.$defs[node.$ref.split('/').pop()] : node);
  const props = fmt.schema.properties;
  for (const key of ['analysis', 'brand', 'seo', 'hero', 'sections', 'contact', 'labels']) assert.ok(props[key], key);
  // список допустимых иконок виден модели прямо в схеме (SDK кладёт enum в описание поля)
  const highlight = deref(deref(props.hero).properties.highlights.items);
  const iconField = JSON.stringify(deref(highlight.properties.icon));
  assert.ok(iconField.includes('coffee') && iconField.includes('sparkles'));
  // у объектов запрещены лишние поля, все поля обязательны
  assert.equal(deref(props.brand).additionalProperties, false);
  assert.deepEqual(deref(props.contact).required.sort(), ['buttonLabel', 'navLabel', 'subtitle', 'title']);
});

test('BusinessInput: валидация и значения по умолчанию', () => {
  const ok = BusinessInput.parse({ name: '  Кафе ', description: 'Небольшое кафе в центре города, готовим завтраки.' });
  assert.equal(ok.name, 'Кафе');
  assert.equal(ok.goal, 'leads');
  assert.equal(ok.tone, 'auto');
  assert.equal(ok.language, 'auto');
  assert.equal(ok.phone, '');
  assert.throws(() => BusinessInput.parse({ name: '', description: 'x'.repeat(30) }));
  assert.throws(() => BusinessInput.parse({ name: 'A', description: 'коротко' }));
  assert.throws(() => BusinessInput.parse({ name: 'A', description: 'x'.repeat(30), email: 'не-почта' }));
  assert.throws(() => BusinessInput.parse({ name: 'A', description: 'x'.repeat(30), goal: 'hack' }));
  assert.throws(() => BusinessInput.parse({ name: 'A', description: 'x'.repeat(2001) }));
});

test('validHex принимает #rgb и #rrggbb, остальное заменяет', () => {
  assert.equal(validHex('#ABC', '#000000'), '#aabbcc');
  assert.equal(validHex('#123456', '#000000'), '#123456');
  assert.equal(validHex('blue', '#000000'), '#000000');
  assert.equal(validHex('#12345', '#000000'), '#000000');
  assert.equal(validHex(undefined, '#111111'), '#111111');
});

test('normalizeContent чинит цвета, режет длину, убирает пустые и повторные секции', () => {
  const raw = structuredClone(mockGenerate(DEMO_INPUT));
  raw.brand.accent = 'ярко-синий';
  raw.brand.accent2 = '#0F0';
  raw.hero.headline = 'Я'.repeat(500);
  raw.sections.push({ ...raw.sections[0] }); // дубль типа
  raw.sections.push({ type: 'pricing', navLabel: '', title: 'Цены', subtitle: '', text: '', buttonLabel: '', items: [] }); // пустая
  const out = normalizeContent(raw);
  assert.equal(out.brand.accent, '#2563eb');
  assert.equal(out.brand.accent2, '#00ff00');
  assert.ok(out.hero.headline.length <= 140);
  assert.ok(out.hero.headline.endsWith('…'));
  const types = out.sections.map((s) => s.type);
  assert.equal(new Set(types).size, types.length, 'типы секций уникальны');
  assert.ok(!types.includes('pricing'), 'пустая секция удалена');
});

test('normalizeContent сохраняет абзацы (двойной перенос строки)', () => {
  const raw = structuredClone(mockGenerate(DEMO_INPUT));
  raw.sections.find((s) => s.type === 'about').text = 'Первый абзац.  \n\nВторой абзац.';
  const about = normalizeContent(raw).sections.find((s) => s.type === 'about');
  assert.equal(about.text, 'Первый абзац.\n\nВторой абзац.');
});

test('normalizeContent отвергает ответ, не соответствующий схеме', () => {
  assert.throws(() => normalizeContent({ brand: {} }));
  assert.throws(() => normalizeContent(null));
  const raw = structuredClone(mockGenerate(DEMO_INPUT));
  delete raw.hero.headline;
  assert.throws(() => normalizeContent(raw));
});

test('normalizeContent мягко чинит неизвестные иконки и типы секций', () => {
  const raw = structuredClone(mockGenerate(DEMO_INPUT));
  raw.hero.highlights[0].icon = 'несуществующая-иконка';
  raw.sections[0].items[0].icon = 'rocket';
  raw.sections.push({ type: 'testimonials', navLabel: 'Отзывы', title: 'Отзывы', subtitle: '', text: '', buttonLabel: '', items: [] });
  const out = normalizeContent(raw);
  assert.equal(out.hero.highlights[0].icon, 'sparkles');
  assert.equal(out.sections[0].items[0].icon, 'sparkles');
  assert.ok(!out.sections.some((s) => s.type === 'testimonials'));
});
