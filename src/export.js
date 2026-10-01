import { readImage, FILE_RE, MIME } from './uploads.js';

const URL_RE = /\/u\/([a-f0-9]{20})\/([a-f0-9]{16}\.(?:jpg|png|webp|gif))/g;

/** Скачиваемый сайт — один файл: картинки превращаем в data-URI (шрифты уже встроены рендерером). */
export function inlineImages(html, store) {
  return html.replace(URL_RE, (match, siteId, file) => {
    if (!FILE_RE.test(file)) return '';
    const buf = readImage(store, siteId, file);
    if (!buf) return '';
    const ext = file.split('.').pop();
    return `data:${MIME[ext]};base64,${buf.toString('base64')}`;
  });
}
