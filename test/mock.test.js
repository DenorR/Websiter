import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPack, mockGenerate, DEMO_INPUT } from '../src/mock.js';
import { SiteContent, sanitizeStoredContent } from '../src/schema.js';
import { TEMPLATE_IDS } from '../src/templates/index.js';
import { renderSite } from '../src/render/index.js';

const cases = [
  ['Барбершоп «Борода»', 'Мужской барбершоп на 4 кресла. Стрижки, борода. Можно выпить кофе и посмотреть футбол.', 'beauty'],
  ['Кофейня «Зерно»', 'Небольшая кофейня. Печём десерты.', 'food'],
  ['Юрист Анна', 'Регистрация ООО и ИП, договоры, споры, трудовые вопросы.', 'legal'],
  ['Студия йоги «Дыхание»', 'Группы для новичков и продолжающих, пилатес.', 'fitness'],
  ['СтройМастер', 'Ремонт квартир под ключ, отделка, электрика и сантехника.', 'repair'],
  ['Pixel', 'Разработка сайтов и мобильных приложений, маркетинг.', 'it'],
  ['Школа «Знайка»', 'Курсы английского языка, подготовка к экзаменам, репетитор.', 'education'],
  ['Цветочная лавка', 'Магазин букетов и подарков, доставка по городу.', 'shop'],
  ['АвтоДок', 'Автосервис: шиномонтаж, диагностика, детейлинг, мойка.', 'auto'],
  ['Клиника «Улыбка»', 'Стоматология для взрослых и детей, лечение и диагностика.', 'medical'],
  ['Агентство «Дом»', 'Недвижимость: покупка и аренда квартир, ипотека, новостройки.', 'realty'],
  ['Центр «Малыш»', 'Развивающие занятия для малышей, кружки, подготовка к школе. Приходите с детьми.', 'kids'],
  ['Свадьбы под ключ', 'Организуем свадьбы, праздники и банкеты, флорист и ведущий.', 'events'],
  ['Эко-ферма «Заречье»', 'Домики, отдых на природе, глэмпинг и фермерские продукты.', 'eco'],
  ['Фотограф Илья', 'Портфолио: свадебная и портретная фотосъёмка, видеограф.', 'creative'],
  ['Астра', 'Мы делаем что-то уникальное для людей, очень стараемся.', 'generic'],
];

for (const [name, description, expected] of cases) {
  test(`ниша: ${name} → ${expected}`, () => {
    assert.equal(detectPack({ name, description }).key, expected);
  });
}

test('название весит больше описания: барбершоп с кофе остаётся барбершопом', () => {
  const pack = detectPack({ name: 'Барбершоп «Борода»', description: 'Пока ждёте — кофе и чай для гостей. Кофе бесплатно.' });
  assert.equal(pack.key, 'beauty');
});

test('демо-генератор отдаёт контент, валидный по схеме ИИ, для любой цели и ниши', () => {
  for (const goal of ['leads', 'bookings', 'sales', 'info']) {
    for (const [name, description] of cases) {
      const out = mockGenerate({ ...DEMO_INPUT, name, description, goal });
      assert.doesNotThrow(() => SiteContent.parse(out), `${goal}/${name}`);
      assert.doesNotThrow(() => sanitizeStoredContent(out), `${goal}/${name}`);
      assert.equal(out.sections.at(-1).type, 'cta');
      assert.equal(out.hero.highlights.length, 3);
      assert.ok(out.hero.keywords.length >= 4, `${name}: бегущая строка`);
      assert.ok(out.sections.length >= 4 && out.sections.length <= 7);
    }
  }
});

test('демо-генератор рекомендует существующие дизайны, подходящие нише', () => {
  for (const [name, description] of cases) {
    const out = mockGenerate({ ...DEMO_INPUT, name, description });
    assert.ok(out.recommendedTemplates.length >= 2, name);
    assert.ok(out.recommendedTemplates.every((id) => TEMPLATE_IDS.includes(id)), `${name}: ${out.recommendedTemplates}`);
  }
  assert.ok(mockGenerate({ ...DEMO_INPUT, name: 'Кофейня', description: 'Небольшая кофейня. Печём десерты каждое утро.' }).recommendedTemplates.includes('bistro'));
  assert.ok(mockGenerate({ ...DEMO_INPUT, name: 'Pixel', description: 'Разработка сайтов и приложений для бизнеса.' }).recommendedTemplates.some((id) => ['vector', 'terminal', 'swiss'].includes(id)));
});

test('демо-генератор не выдумывает цены и отзывы', () => {
  for (const [name, description] of cases) {
    const out = mockGenerate({ ...DEMO_INPUT, name, description });
    assert.ok(!out.sections.some((s) => s.type === 'pricing'), name);
    assert.ok(!JSON.stringify(out).match(/отзыв|лет опыта|более \d|\d+\+? клиентов|\d+\s?%|₽|(?<![а-яё])руб/i), name);
  }
});

test('результат демо-генератора рендерится в любом из 18 шаблонов', () => {
  const content = mockGenerate(DEMO_INPUT);
  for (const template of TEMPLATE_IDS) {
    const html = renderSite({ id: 'x', content, design: { template }, contact: { phone: DEMO_INPUT.phone } });
    assert.match(html, /^<!doctype html>/i, template);
    for (const s of content.sections) assert.ok(html.includes(`id="s-${s.type}"`), `${template}/${s.type}`);
  }
});
