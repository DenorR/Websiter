import swiss from './swiss.js';
import noir from './noir.js';
import vector from './vector.js';
import terminal from './terminal.js';
import editorial from './editorial.js';
import poster from './poster.js';
import bistro from './bistro.js';
import clinic from './clinic.js';
import atelier from './atelier.js';
import athletic from './athletic.js';
import consult from './consult.js';
import build from './build.js';
import estate from './estate.js';
import kids from './kids.js';
import academy from './academy.js';
import portfolio from './portfolio.js';
import wedding from './wedding.js';
import eco from './eco.js';

export const CATEGORIES = [
  ['all', 'Все'],
  ['startup', 'Стартапы и IT'],
  ['services', 'Услуги и B2B'],
  ['food', 'Еда и рестораны'],
  ['beauty', 'Красота'],
  ['sport', 'Спорт'],
  ['health', 'Здоровье'],
  ['edu', 'Образование и дети'],
  ['realty', 'Недвижимость и стройка'],
  ['creative', 'Креатив и портфолио'],
  ['events', 'События и свадьбы'],
];

const LIST = [
  swiss, noir, vector, terminal, editorial, poster,
  bistro, clinic, atelier, athletic, consult, build,
  estate, kids, academy, portfolio, wedding, eco,
];

export const TEMPLATES = Object.fromEntries(LIST.map((t) => [t.id, t]));
export const TEMPLATE_IDS = LIST.map((t) => t.id);
export const DEFAULT_TEMPLATE = 'swiss';

export function publicTemplates() {
  return LIST.map((t) => ({
    id: t.id, name: t.name, tagline: t.tagline, best: t.best, categories: t.categories, brandable: t.brandable,
    palettes: t.palettes.map(({ id, name, bg, text, accent, accent2 }) => ({ id, name, bg, text, accent, accent2 })),
    fonts: t.fonts, art: t.art, layouts: t.layouts, dark: t.palettes[0].bg < '#777777',
  }));
}
