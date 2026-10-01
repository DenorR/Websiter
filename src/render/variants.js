// Какие варианты вёрстки бывают у каждого блока. Рендерер и редактор берут отсюда
// и допустимые значения, и подписи для переключателей.

export const LAYOUT_OPTIONS = {
  nav: {
    label: 'Шапка',
    options: [['bar', 'Строка'], ['center', 'Логотип по центру'], ['pill', 'Капсула'], ['menu', 'Только меню']],
  },
  hero: {
    label: 'Первый экран',
    options: [
      ['split', 'Текст + изображение'], ['center', 'По центру'], ['editorial', 'Журнальный'],
      ['poster', 'Плакат'], ['fullbleed', 'Во весь экран'], ['stack', 'Продукт'],
    ],
  },
  features: {
    label: 'Услуги',
    options: [['cards', 'Карточки'], ['rows', 'Список-таблица'], ['bento', 'Мозаика'], ['columns', 'Колонки'], ['tiles', 'Плитки']],
  },
  about: {
    label: 'О нас',
    options: [['split', 'Текст + факты'], ['statement', 'Манифест'], ['media', 'С изображением']],
  },
  process: {
    label: 'Как работаем',
    options: [['numbers', 'Крупные цифры'], ['timeline', 'Таймлайн'], ['cards', 'Карточки']],
  },
  pricing: {
    label: 'Цены',
    options: [['cards', 'Тарифы'], ['menu', 'Прайс-лист'], ['table', 'Таблица']],
  },
  faq: {
    label: 'Вопросы',
    options: [['accordion', 'Аккордеон'], ['split', 'Заголовок слева'], ['grid', 'Сетка']],
  },
  cta: {
    label: 'Призыв',
    options: [['band', 'Плашка'], ['big', 'Крупный текст'], ['poster', 'Плакат']],
  },
  manifesto: {
    label: 'Манифест',
    options: [['statement', 'Крупная цитата']],
  },
  gallery: {
    label: 'Галерея',
    options: [['grid', 'Сетка'], ['strip', 'Лента'], ['mosaic', 'Мозаика']],
  },
  contact: {
    label: 'Контакты',
    options: [['split', 'Данные + форма'], ['big', 'Крупный контакт']],
  },
  footer: {
    label: 'Подвал',
    options: [['simple', 'Простой'], ['big', 'С крупным названием'], ['center', 'По центру']],
  },
};

export const LAYOUT_KEYS = Object.keys(LAYOUT_OPTIONS);

export const isLayout = (key, value) => !!LAYOUT_OPTIONS[key]?.options.some(([v]) => v === value);

/** Секции, которые может содержать сайт (контакты и подвал — служебные блоки). */
export const SECTION_TYPES = ['about', 'features', 'process', 'pricing', 'faq', 'cta', 'manifesto', 'gallery'];

export const SECTION_LABELS = {
  about: 'О нас', features: 'Услуги', process: 'Как работаем', pricing: 'Цены',
  faq: 'Вопросы', cta: 'Призыв', manifesto: 'Манифест', gallery: 'Галерея',
};

// Остальные настройки оформления: значение 'auto' = «как в шаблоне».
export const STYLE_OPTIONS = {
  textSize: [['sm', 'Мелкий'], ['md', 'Обычный'], ['lg', 'Крупный']],
  headingSize: [['sm', 'Компактные'], ['md', 'Обычные'], ['lg', 'Крупные']],
  headingCase: [['normal', 'Как написано'], ['upper', 'ЗАГЛАВНЫЕ']],
  headingWeight: [['light', 'Лёгкий'], ['regular', 'Обычный'], ['bold', 'Жирный'], ['black', 'Очень жирный']],
  buttonStyle: [['solid', 'Заливка'], ['outline', 'Контур'], ['underline', 'Подчёркивание']],
  buttonShape: [['square', 'Прямые'], ['soft', 'Скруглённые'], ['pill', 'Капсула']],
  cards: [['flat', 'Без рамки'], ['line', 'Рамка'], ['fill', 'Заливка'], ['shadow', 'Тень'], ['hard', 'Жёсткая тень']],
  density: [['compact', 'Плотно'], ['normal', 'Обычно'], ['airy', 'Просторно']],
  width: [['narrow', 'Узкая'], ['normal', 'Обычная'], ['wide', 'Широкая']],
  icons: [['none', 'Нет'], ['numeral', 'Цифры'], ['line', 'Линии'], ['badge', 'В плашках']],
  head: [['left', 'Слева'], ['center', 'По центру'], ['split', 'В две колонки'], ['index', 'С номером']],
  kicker: [['on', 'Показывать'], ['off', 'Скрыть']],
  mediaShape: [['rect', 'Прямоугольник'], ['arch', 'Арка'], ['round', 'Круг'], ['oval', 'Овал']],
  grain: [['on', 'Есть'], ['off', 'Нет']],
  motion: [['none', 'Без анимации'], ['soft', 'Лёгкая'], ['rich', 'Выразительная']],
  ticker: [['on', 'Бегущая строка'], ['off', 'Без неё']],
};

export const STYLE_KEYS = Object.keys(STYLE_OPTIONS);
export const isStyleValue = (key, value) => value === 'auto' || !!STYLE_OPTIONS[key]?.some(([v]) => v === value);
