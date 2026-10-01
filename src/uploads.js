import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
export const MAX_FILES_PER_SITE = 24;
export const MAX_GALLERY = 12;
export const SLOTS = ['logo', 'hero', 'about', 'gallery'];

export const FILE_RE = /^[a-f0-9]{16}\.(jpg|png|webp|gif)$/;
export const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

/** Определяем тип по содержимому, а не по заголовку или имени: SVG и прочее отсекаем. */
export function sniffImage(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  const head = buf.subarray(0, 6).toString('latin1');
  if (head === 'GIF87a' || head === 'GIF89a') return 'gif';
  return null;
}

export const urlFor = (siteId, file) => `/u/${siteId}/${file}`;

/** Сохраняет картинку и возвращает запись {file, url, size}. */
export function saveImage(store, siteId, buf, ext) {
  const dir = store.uploadsDir(siteId);
  fs.mkdirSync(dir, { recursive: true });
  const name = `${crypto.randomBytes(8).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(dir, name), buf);
  return { file: name, url: urlFor(siteId, name), size: buf.length };
}

export function deleteImage(store, siteId, file) {
  if (!FILE_RE.test(file)) return;
  try {
    fs.unlinkSync(path.join(store.uploadsDir(siteId), file));
  } catch {
    /* уже удалён */
  }
}

export function readImage(store, siteId, file) {
  if (!FILE_RE.test(file)) return null;
  try {
    return fs.readFileSync(path.join(store.uploadsDir(siteId), file));
  } catch {
    return null;
  }
}
