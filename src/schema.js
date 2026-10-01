import { z } from 'zod';
import { ICON_NAMES } from './render/icons.js';

export const SECTION_TYPES = ['about', 'features', 'process', 'pricing', 'faq', 'cta'];
export const GOALS = ['leads', 'bookings', 'sales', 'info'];
export const TONES = ['auto', 'friendly', 'business', 'premium', 'bold'];
export const LANGUAGES = ['auto', 'ru', 'en', 'uk', 'de', 'es', 'fr'];

// ───────────────────────── Ввод клиента ─────────────────────────

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .default('');

export const BusinessInput = z.object({
  name: z.string().trim().min(1, 'Укажите название').max(80),
  description: z.string().trim().min(20, 'Опишите бизнес подробнее (хотя бы пара предложений)').max(2000),
  city: optionalText(80),
  goal: z.enum(GOALS).optional().default('leads'),
  tone: z.enum(TONES).optional().default('auto'),
  language: z.enum(LANGUAGES).optional().default('auto'),
  phone: optionalText(40),
  email: z.union([z.literal(''), z.string().trim().email().max(120)]).optional().default(''),
  address: optionalText(160),
  hours: optionalText(120),
});

// ───────────────────── Контент сайта (его пишет ИИ) ─────────────────────
// Все поля обязательные: «нет значения» = пустая строка / пустой массив.
// Так схему легче гарантировать через structured outputs.

const Item = z.object({
  icon: z.enum(ICON_NAMES).describe('Иконка, подходящая по смыслу'),
  title: z.string().describe('Короткий заголовок (2–6 слов); в FAQ — вопрос'),
  text: z.string().describe('Описание 1–2 предложения; в FAQ — ответ; в pricing — состав тарифа, пункты через \\n'),
  meta: z.string().describe('Только для pricing: цена, ровно как указал клиент. Иначе пустая строка'),
});

const Section = z.object({
  type: z.enum(SECTION_TYPES),
  navLabel: z.string().describe('Короткое название для меню, 1–2 слова'),
  title: z.string().describe('Заголовок секции'),
  subtitle: z.string().describe('Подзаголовок одним предложением или пустая строка'),
  text: z.string().describe('Для about — 1–3 абзаца через \\n\\n; для cta — призыв; иначе пустая строка'),
  buttonLabel: z.string().describe('Только для cta: текст кнопки. Иначе пустая строка'),
  items: z.array(Item).describe('Карточки секции. Для about — 3–4 коротких факта-плюса'),
});

export const SiteContent = z.object({
  analysis: z
    .object({
      businessType: z.string().describe('Какой это бизнес, 3–8 слов'),
      audience: z.string().describe('Кто целевая аудитория, 1 предложение'),
      positioning: z.string().describe('Чем бизнес может выделяться, 1 предложение'),
      tone: z.string().describe('Выбранный тон общения, 2–5 слов'),
      strengths: z.array(z.string()).describe('3–5 сильных сторон, которые стоит подчеркнуть'),
    })
    .describe('Анализ бизнеса — его увидит клиент'),
  brand: z.object({
    name: z.string(),
    tagline: z.string().describe('Слоган до 8 слов'),
    language: z.string().describe('Код языка сайта: ru, en, uk, de, es, fr'),
    accent: z.string().describe('Основной фирменный цвет, hex вида #1a73e8 — подходит бизнесу и читается на белом'),
    accent2: z.string().describe('Дополнительный цвет для градиента, hex, гармонирует с accent'),
  }),
  seo: z.object({
    title: z.string().describe('<title>, до 60 символов'),
    description: z.string().describe('meta description, до 155 символов'),
  }),
  hero: z.object({
    eyebrow: z.string().describe('Короткая строка над заголовком (категория/город) или пустая'),
    headline: z.string().describe('Главный заголовок: выгода для клиента, до 12 слов'),
    subheadline: z.string().describe('1–2 предложения, раскрывающие заголовок'),
    primaryCta: z.string().describe('Текст главной кнопки, 1–3 слова'),
    secondaryCta: z.string().describe('Текст второй кнопки (ведёт к первой секции) или пустая строка'),
    highlights: z
      .array(
        z.object({
          icon: z.enum(ICON_NAMES),
          title: z.string().describe('2–4 слова'),
          text: z.string().describe('До 8 слов'),
        }),
      )
      .describe('Ровно 3 ключевых преимущества для первого экрана'),
  }),
  sections: z.array(Section).describe('Секции в порядке показа; 4–6 штук'),
  contact: z.object({
    navLabel: z.string().describe('Пункт меню, 1–2 слова (например «Контакты»)'),
    title: z.string(),
    subtitle: z.string(),
    buttonLabel: z.string().describe('Текст кнопки формы'),
  }),
  labels: z
    .object({
      phone: z.string(),
      email: z.string(),
      address: z.string(),
      hours: z.string(),
      formName: z.string().describe('Подпись поля «Ваше имя»'),
      formMessage: z.string().describe('Подпись поля «Сообщение»'),
      menu: z.string().describe('Слово «Меню» для мобильной навигации'),
      rights: z.string().describe('Фраза вида «Все права защищены»'),
    })
    .describe('Служебные подписи интерфейса на языке сайта'),
});

// ───────────────────────── Нормализация ─────────────────────────

const HEX = /^#[0-9a-f]{6}$/i;

export function expandHex(value) {
  const v = String(value ?? '').trim();
  if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + [...v.slice(1)].map((c) => c + c).join('');
  return v;
}

export function validHex(value, fallback) {
  const v = expandHex(value);
  return HEX.test(v) ? v.toLowerCase() : fallback;
}

const clip = (value, max) => {
  const s = String(value ?? '').replace(/[ \t]+\n/g, '\n').trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
};

/**
 * Хелпер SDK для structured outputs переносит `enum` в текст описания поля, а не в жёсткое
 * ограничение, поэтому модель теоретически может выдать неизвестную иконку или тип секции.
 * Вместо ошибки для клиента мягко чиним такие мелочи до строгой проверки схемой.
 */
function tolerate(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const fixIcon = (it) => (it && typeof it === 'object' && !ICON_NAMES.includes(it.icon) ? { ...it, icon: 'sparkles' } : it);
  const fixList = (list) => (Array.isArray(list) ? list.map(fixIcon) : list);
  return {
    ...raw,
    hero: raw.hero && typeof raw.hero === 'object' ? { ...raw.hero, highlights: fixList(raw.hero.highlights) } : raw.hero,
    sections: Array.isArray(raw.sections)
      ? raw.sections
          .filter((s) => s && typeof s === 'object' && SECTION_TYPES.includes(s.type))
          .map((s) => ({ ...s, items: fixList(s.items) }))
      : raw.sections,
  };
}

/**
 * Даже при гарантированной схеме смысл может «поплыть»: пустые секции,
 * слишком длинные тексты, кривой цвет. Приводим всё к безопасному виду.
 */
export function normalizeContent(raw, fallbackName = 'Мой бизнес') {
  const src = SiteContent.parse(tolerate(raw));

  const items = (list, max) =>
    list
      .map((it) => ({
        icon: ICON_NAMES.includes(it.icon) ? it.icon : 'sparkles',
        title: clip(it.title, 90),
        text: clip(it.text, 420),
        meta: clip(it.meta, 40),
      }))
      .filter((it) => it.title || it.text)
      .slice(0, max);

  const seen = new Set();
  const sections = src.sections
    .map((s) => ({
      type: s.type,
      navLabel: clip(s.navLabel || s.title, 22),
      title: clip(s.title, 100),
      subtitle: clip(s.subtitle, 220),
      text: clip(s.text, 1400),
      buttonLabel: clip(s.buttonLabel, 40),
      items: items(s.items, s.type === 'faq' ? 8 : 6),
    }))
    .filter((s) => {
      if (!s.title) return false;
      if (seen.has(s.type)) return false; // каждый тип секции — один раз
      seen.add(s.type);
      if (s.type === 'about') return s.text || s.items.length;
      if (s.type === 'cta') return true;
      return s.items.length > 0;
    })
    .slice(0, 6);

  const accent = validHex(src.brand.accent, '#2563eb');
  const accent2 = validHex(src.brand.accent2, accent);

  return {
    analysis: {
      businessType: clip(src.analysis.businessType, 80),
      audience: clip(src.analysis.audience, 220),
      positioning: clip(src.analysis.positioning, 220),
      tone: clip(src.analysis.tone, 50),
      strengths: src.analysis.strengths.map((s) => clip(s, 120)).filter(Boolean).slice(0, 5),
    },
    brand: {
      name: clip(src.brand.name || fallbackName, 80),
      tagline: clip(src.brand.tagline, 100),
      language: /^[a-z]{2}$/i.test(src.brand.language) ? src.brand.language.toLowerCase() : 'ru',
      accent,
      accent2,
    },
    seo: {
      title: clip(src.seo.title || src.brand.name, 70),
      description: clip(src.seo.description, 170),
    },
    hero: {
      eyebrow: clip(src.hero.eyebrow, 60),
      headline: clip(src.hero.headline, 140),
      subheadline: clip(src.hero.subheadline, 320),
      primaryCta: clip(src.hero.primaryCta || 'Связаться', 36),
      secondaryCta: clip(src.hero.secondaryCta, 36),
      highlights: src.hero.highlights
        .map((h) => ({
          icon: ICON_NAMES.includes(h.icon) ? h.icon : 'sparkles',
          title: clip(h.title, 50),
          text: clip(h.text, 80),
        }))
        .filter((h) => h.title)
        .slice(0, 3),
    },
    sections,
    contact: {
      navLabel: clip(src.contact.navLabel || src.contact.title, 22),
      title: clip(src.contact.title, 100),
      subtitle: clip(src.contact.subtitle, 220),
      buttonLabel: clip(src.contact.buttonLabel || 'Отправить', 36),
    },
    labels: Object.fromEntries(Object.entries(src.labels).map(([k, v]) => [k, clip(v, 60)])),
  };
}
