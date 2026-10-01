// Каталог шрифтов. Все файлы лежат в npm-пакетах @fontsource и раздаются нашим сервером,
// а не Google: быстрее, работает в регионах, где Google Fonts недоступен, и не отдаёт
// данные посетителей третьим лицам. В страницу попадают только подмножества cyrillic и latin.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, Menlo, Consolas, monospace";
const HAND = "'Comic Sans MS', cursive";
const FALLBACK = { sans: SANS, display: SANS, serif: SERIF, mono: MONO, script: HAND };

// v = variable-пакет (одна файл-ось wght), s = статичный (перечисляем начертания)
// roles: для чего шрифт годится — heading / body
const DEFS = [
  // Гротески
  ['inter', 'Inter', 'v', 'sans', 'Универсальный, нейтральный', ['heading', 'body']],
  ['inter-tight', 'Inter Tight', 'v', 'sans', 'Плотный Inter для крупных заголовков', ['heading', 'body']],
  ['manrope', 'Manrope', 'v', 'sans', 'Современный, тёплый', ['heading', 'body']],
  ['onest', 'Onest', 'v', 'sans', 'Аккуратный, дружелюбный', ['heading', 'body']],
  ['golos-text', 'Golos Text', 'v', 'sans', 'Строгий, читаемый', ['heading', 'body']],
  ['geologica', 'Geologica', 'v', 'sans', 'Геометричный, технологичный', ['heading', 'body']],
  ['montserrat', 'Montserrat', 'v', 'sans', 'Классический геометрический', ['heading', 'body']],
  ['raleway', 'Raleway', 'v', 'sans', 'Изящный, лёгкий', ['heading', 'body']],
  ['jost', 'Jost', 'v', 'sans', 'Футура-подобный, элегантный', ['heading', 'body']],
  ['rubik', 'Rubik', 'v', 'sans', 'Мягкие углы, дружелюбный', ['heading', 'body']],
  ['nunito', 'Nunito', 'v', 'sans', 'Округлый, уютный', ['heading', 'body']],
  ['tenor-sans', 'Tenor Sans', 's', 'sans', 'Гуманистический, изысканный', ['heading', 'body'], [400]],
  // Акцидентные
  ['unbounded', 'Unbounded', 'v', 'display', 'Широкий, дерзкий', ['heading']],
  ['oswald', 'Oswald', 'v', 'display', 'Узкий плакатный', ['heading']],
  ['roboto-condensed', 'Roboto Condensed', 'v', 'display', 'Узкий, спортивный', ['heading', 'body']],
  ['exo-2', 'Exo 2', 'v', 'display', 'Техно, футуристичный', ['heading']],
  ['comfortaa', 'Comfortaa', 'v', 'display', 'Округлый, игривый', ['heading']],
  ['russo-one', 'Russo One', 's', 'display', 'Тяжёлый индустриальный', ['heading'], [400]],
  // Антиквы
  ['playfair-display', 'Playfair Display', 'v', 'serif', 'Контрастная классика', ['heading']],
  ['cormorant', 'Cormorant', 'v', 'serif', 'Тонкий, утончённый', ['heading']],
  ['eb-garamond', 'EB Garamond', 'v', 'serif', 'Книжный гарамон', ['heading', 'body']],
  ['literata', 'Literata', 'v', 'serif', 'Редакционный, читаемый', ['heading', 'body']],
  ['lora', 'Lora', 'v', 'serif', 'Тёплая антиква', ['heading', 'body']],
  ['source-serif-4', 'Source Serif', 'v', 'serif', 'Деловая антиква', ['heading', 'body']],
  ['prata', 'Prata', 's', 'serif', 'Модный глянцевый дидон', ['heading'], [400]],
  ['yeseva-one', 'Yeseva One', 's', 'serif', 'Декоративная, парфюмерная', ['heading'], [400]],
  // Моно
  ['jetbrains-mono', 'JetBrains Mono', 'v', 'mono', 'Для разработчиков', ['heading', 'body']],
  ['ibm-plex-mono', 'IBM Plex Mono', 's', 'mono', 'Технический, спокойный', ['heading', 'body'], [400, 500, 600]],
  // Рукописные
  ['caveat', 'Caveat', 'v', 'script', 'Живой почерк', ['heading']],
  ['marck-script', 'Marck Script', 's', 'script', 'Каллиграфия', ['heading'], [400]],
];

const pkgDir = (pkg) => path.dirname(require.resolve(`${pkg}/package.json`));

const SUBSET_RE = /-(cyrillic-ext|cyrillic|latin-ext|latin|vietnamese|greek-ext|greek|math|symbols|hebrew)-/;
const subsetOf = (file) => file.match(SUBSET_RE)?.[1];

function parseFaces(css) {
  return css
    .split('@font-face')
    .slice(1)
    .map((block) => {
      const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
      const style = block.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal';
      const weight = block.match(/font-weight:\s*([^;]+);/)?.[1].trim() ?? '400';
      const file = block.match(/url\(\.\/files\/([^)]+\.woff2)\)/)?.[1];
      const range = block.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
      return { family, style, weight, file, range };
    })
    // нужны только кириллица и латиница (без -ext и прочих подмножеств)
    .filter((f) => f.file && ['cyrillic', 'latin'].includes(subsetOf(f.file)));
}

/** Собираем каталог один раз при старте. */
function build() {
  const catalog = {};
  for (const [id, label, kind, type, note, roles, weights] of DEFS) {
    const pkg = kind === 'v' ? `@fontsource-variable/${id}` : `@fontsource/${id}`;
    const dir = pkgDir(pkg);
    const cssFiles = kind === 'v' ? ['wght.css', 'wght-italic.css'] : (weights ?? [400]).flatMap((w) => [`${w}.css`]);
    const faces = [];
    for (const name of cssFiles) {
      const full = path.join(dir, name);
      if (!fs.existsSync(full)) continue;
      faces.push(...parseFaces(fs.readFileSync(full, 'utf8')).map((f) => ({ ...f, dir })));
    }
    if (!faces.length) {
      console.warn(`[fonts] ${id}: нет кириллических/латинских начертаний — пропускаю`);
      continue;
    }
    const family = faces[0].family;
    const range = kind === 'v' ? [100, 900] : [Math.min(...(weights ?? [400])), Math.max(...(weights ?? [400]))];
    catalog[id] = {
      id, label, note, roles, kind: type, family, faces,
      hasItalic: faces.some((f) => f.style === 'italic'),
      stack: `'${family}', ${FALLBACK[type]}`,
      variable: kind === 'v',
      weights: range,
    };
  }
  return catalog;
}

export const FONTS = build();
export const FONT_IDS = Object.keys(FONTS);

export function fontStack(id, fallbackId = 'inter') {
  return (FONTS[id] ?? FONTS[fallbackId]).stack;
}

/** Каталог для интерфейса (без путей к файлам). */
export function publicFonts() {
  return Object.values(FONTS).map((f) => ({
    id: f.id, label: f.label, note: f.note, roles: f.roles, kind: f.kind, stack: f.stack, variable: f.variable, weights: f.weights,
  }));
}

// Белый список файлов для раздачи: /fonts/<fontId>/<file>
const FILE_INDEX = new Map();
for (const f of Object.values(FONTS)) {
  for (const face of f.faces) FILE_INDEX.set(`${f.id}/${face.file}`, path.join(face.dir, 'files', face.file));
}

export function resolveFontFile(fontId, file) {
  return FILE_INDEX.get(`${fontId}/${file}`) ?? null;
}

/**
 * CSS @font-face для списка шрифтов.
 * mode 'link'  — ссылки на /fonts/... (живая страница, кэшируется браузером)
 * mode 'inline' — base64 прямо в CSS (скачиваемый сайт одним файлом)
 */
export function fontFaceCss(ids, { mode = 'link', italic = true } = {}) {
  const seen = new Set();
  let out = '';
  for (const id of ids) {
    const font = FONTS[id];
    if (!font || seen.has(id)) continue;
    seen.add(id);
    for (const face of font.faces) {
      if (face.style === 'italic' && !italic) continue;
      let url;
      if (mode === 'inline') {
        const data = fs.readFileSync(path.join(face.dir, 'files', face.file));
        url = `data:font/woff2;base64,${data.toString('base64')}`;
      } else {
        url = `/fonts/${id}/${face.file}`;
      }
      out += `@font-face{font-family:'${face.family}';font-style:${face.style};font-weight:${face.weight};font-display:swap;src:url(${url}) format('woff2');unicode-range:${face.range}}\n`;
    }
  }
  return out;
}
