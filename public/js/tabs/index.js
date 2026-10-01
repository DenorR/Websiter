import ai from './ai.js';
import template from './template.js';
import colors from './colors.js';
import fonts from './fonts.js';
import style from './style.js';
import sections from './sections.js';
import texts from './texts.js';
import media from './media.js';
import contact from './contact.js';
import more from './more.js';

export const TABS = [
  { id: 'ai', label: 'ИИ', icon: 'ai', title: 'ИИ-помощник', render: ai },
  { id: 'template', label: 'Дизайн', icon: 'template', title: 'Шаблон дизайна', render: template },
  { id: 'colors', label: 'Цвета', icon: 'palette', title: 'Цвета', render: colors },
  { id: 'fonts', label: 'Шрифты', icon: 'type', title: 'Шрифты и размеры', render: fonts },
  { id: 'style', label: 'Стиль', icon: 'style', title: 'Стиль и эффекты', render: style },
  { id: 'sections', label: 'Блоки', icon: 'layers', title: 'Блоки страницы', render: sections },
  { id: 'texts', label: 'Тексты', icon: 'text', title: 'Тексты', render: texts },
  { id: 'media', label: 'Фото', icon: 'image', title: 'Фото и логотип', render: media },
  { id: 'contact', label: 'Контакты', icon: 'contact', title: 'Контакты', render: contact },
  { id: 'more', label: 'Ещё', icon: 'settings', title: 'Настройки и публикация', render: more },
];
