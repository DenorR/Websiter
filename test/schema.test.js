import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { BusinessInput, SiteContent, normalizeContent, sanitizeStoredContent, validHex, AI_SECTION_TYPES } from '../src/schema.js';
import { mockGenerate, DEMO_INPUT } from '../src/mock.js';
import { TEMPLATE_IDS } from '../src/templates/index.js';

test('схема контента превращается в JSON Schema для structured outputs', () => {
  const fmt = zodOutputFormat(SiteContent);
  assert.equal(fmt.type, 'json_schema');
  // Zod выносит повторяющиеся куски в $defs — разворачиваем ссылки для проверки.
  const deref = (node) => (node?.$ref ? fmt.schema.$defs[node.$ref.split('/').pop()] : node);
  const props = fmt.schema.properties;
  for (const key of ['analysis', 'recommendedTemplates', 'brand', 'seo', 'hero', 'sections', 'contact', 'labels']) assert.ok(props[key], key);
  assert.ok(deref(props.hero).properties.keywords, 'бегущая строка');
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
  assert.equal(validHex('blue', '#000000'), '#000000');
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
  raw.sections.push({ type: 'gallery', navLabel: 'Галерея', title: 'Фото', subtitle: '', text: '', buttonLabel: '', items: [] });
  const out = normalizeContent(raw);
  assert.equal(out.hero.highlights[0].icon, 'sparkles');
  assert.equal(out.sections[0].items[0].icon, 'sparkles');
  assert.ok(!out.sections.some((s) => s.type === 'testimonials'), 'выдуманный тип отброшен');
  assert.ok(!out.sections.some((s) => s.type === 'gallery'), 'галерею ИИ не пишет — её наполняет клиент');
});

test('normalizeContent: рекомендованные шаблоны — только существующие, без повторов, максимум 3', () => {
  const raw = structuredClone(mockGenerate(DEMO_INPUT));
  raw.recommendedTemplates = ['noir', 'нет-такого', 'noir', 'poster', 'swiss', 'vector'];
  const out = normalizeContent(raw);
  assert.deepEqual(out.recommendedTemplates, ['noir', 'poster', 'swiss']);
  raw.recommendedTemplates = [];
  assert.ok(Array.isArray(normalizeContent(raw).recommendedTemplates));
  assert.ok(normalizeContent(raw).recommendedTemplates.every((id) => TEMPLATE_IDS.includes(id)));
});

test('normalizeContent: бегущая строка — короткие уникальные слова, максимум 8', () => {
  const raw = structuredClone(mockGenerate(DEMO_INPUT));
  raw.hero.keywords = ['Кофе', 'кофе', '  Десерты  ', '', 'Очень-очень длинная фраза, которая явно не должна попасть в бегущую строку целиком', 'a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const kw = normalizeContent(raw).hero.keywords;
  assert.ok(kw.length <= 8);
  assert.equal(new Set(kw.map((k) => k.toLowerCase())).size, kw.length);
  assert.ok(kw.every((k) => k === k.trim() && k.length > 0 && k.length <= 28), JSON.stringify(kw));
});

test('manifesto — допустимый тип секции без карточек', () => {
  assert.ok(AI_SECTION_TYPES.includes('manifesto'));
  const raw = structuredClone(mockGenerate(DEMO_INPUT));
  raw.sections = raw.sections.filter((s) => s.type !== 'manifesto');
  raw.sections.splice(1, 0, { type: 'manifesto', navLabel: '', title: 'Подход', subtitle: '', text: 'Мы верим, что кофе — это *разговор*.', buttonLabel: '', items: [] });
  const out = normalizeContent(raw);
  const m = out.sections.find((s) => s.type === 'manifesto');
  assert.ok(m && m.text.includes('разговор'));
});

test('sanitizeStoredContent: правки клиента не теряют пустые блоки, но чистят данные', () => {
  const content = mockGenerate(DEMO_INPUT);
  // клиент стёр всё в блоке — блок остаётся (иначе он исчезал бы прямо во время набора)
  const edited = structuredClone(content);
  edited.sections[0].items = [];
  edited.sections[0].title = '';
  edited.sections[0].hidden = true;
  edited.sections[0].layout = 'tiles';
  edited.sections.push({ type: 'gallery', navLabel: 'Фото', title: 'Галерея', subtitle: '', text: '', buttonLabel: '', items: [] });
  edited.sections.push({ ...edited.sections[1] }); // дубль типа
  edited.hero.highlights.push({ icon: 'star', title: 'Четвёртый', text: '' });
  edited.brand.accent = 'javascript:alert(1)';
  const out = sanitizeStoredContent(edited);
  assert.equal(out.sections[0].items.length, 0);
  assert.equal(out.sections[0].hidden, true);
  assert.equal(out.sections[0].layout, 'tiles');
  assert.ok(out.sections.some((s) => s.type === 'gallery'));
  const types = out.sections.map((s) => s.type);
  assert.equal(new Set(types).size, types.length);
  assert.equal(out.hero.highlights.length, 3);
  assert.match(out.brand.accent, /^#[0-9a-f]{6}$/);
});

test('sanitizeStoredContent отвергает структуру, не похожую на сайт', () => {
  assert.throws(() => sanitizeStoredContent({}));
  assert.throws(() => sanitizeStoredContent(null));
  assert.throws(() => sanitizeStoredContent('x'));
  const content = mockGenerate(DEMO_INPUT);
  content.sections = Array.from({ length: 30 }, () => content.sections[0]);
  assert.throws(() => sanitizeStoredContent(content));
});
