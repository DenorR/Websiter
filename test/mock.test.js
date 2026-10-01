import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPack, mockGenerate, DEMO_INPUT } from '../src/mock.js';
import { SiteContent } from '../src/schema.js';

const cases = [
  ['Барбершоп «Борода»', 'Мужской барбершоп на 4 кресла. Стрижки, борода. Можно выпить кофе и посмотреть футбол.', 'beauty'],
  ['Кофейня «Зерно»', 'Небольшая кофейня. Печём десерты.', 'food'],
  ['Юрист Анна', 'Регистрация ООО и ИП, договоры, споры, трудовые вопросы.', 'legal'],
  ['Студия йоги «Дыхание»', 'Группы для новичков и продолжающих, пилатес.', 'fitness'],
  ['СтройМастер', 'Ремонт квартир под ключ, отделка, электрика и сантехника.', 'repair'],
  ['Pixel', 'Разработка сайтов и мобильных приложений, маркетинг.', 'it'],
  ['Астра', 'Мы делаем что-то уникальное для людей, очень стараемся.', 'generic'],
];

for (const [name, description, expected] of cases) {
  test(`ниша: ${name} → ${expected}`, () => {
    assert.equal(detectPack({ name, description }).key, expected);
  });
}

test('демо-генератор отдаёт контент, валидный по схеме ИИ', () => {
  for (const goal of ['leads', 'bookings', 'sales', 'info']) {
    const out = mockGenerate({ ...DEMO_INPUT, goal });
    assert.doesNotThrow(() => SiteContent.parse(out), goal);
    assert.equal(out.sections.at(-1).type, 'cta');
    assert.ok(out.hero.highlights.length === 3);
  }
});

test('демо-генератор не выдумывает цены и отзывы', () => {
  const out = mockGenerate(DEMO_INPUT);
  assert.ok(!out.sections.some((s) => s.type === 'pricing'));
  assert.ok(!JSON.stringify(out).match(/отзыв|клиентов|лет опыта|\d+\s?%/i));
});
