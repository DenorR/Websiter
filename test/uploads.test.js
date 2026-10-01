import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { sniffImage, saveImage, readImage, deleteImage, FILE_RE } from '../src/uploads.js';
import { createStore } from '../src/store.js';
import { inlineImages } from '../src/export.js';
import { createRateLimiter } from '../src/ratelimit.js';
import { PNG_1X1, tmpDir } from './helpers.js';

test('тип картинки определяется по содержимому; SVG, HTML и мусор отклоняются', () => {
  assert.equal(sniffImage(PNG_1X1), 'png');
  assert.equal(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1])), 'jpg');
  assert.equal(sniffImage(Buffer.from('RIFF\x10\x00\x00\x00WEBPVP8 ', 'latin1')), 'webp');
  assert.equal(sniffImage(Buffer.from('GIF89a\x01\x00\x01\x00\x00\x00\x00;', 'latin1')), 'gif');
  for (const bad of [
    '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>',
    '<html><script>alert(1)</script></html>',
    'GIF89',
    '',
    'просто текст, не картинка вовсе',
  ]) assert.equal(sniffImage(Buffer.from(bad)), null, bad.slice(0, 20));
  assert.equal(sniffImage('строка'), null);
  assert.equal(sniffImage(null), null);
});

test('файлы сохраняются со случайными именами и читаются только по строгому шаблону', () => {
  const store = createStore(tmpDir());
  const site = store.create({ input: {}, content: {} });
  const a = saveImage(store, site.id, PNG_1X1, 'png');
  const b = saveImage(store, site.id, PNG_1X1, 'png');
  assert.match(a.file, FILE_RE);
  assert.notEqual(a.file, b.file);
  assert.equal(a.url, `/u/${site.id}/${a.file}`);
  assert.deepEqual(readImage(store, site.id, a.file), PNG_1X1);
  for (const name of ['../../sites/' + site.id + '.json', '..%2f', 'a.svg', 'x.png', a.file.toUpperCase(), `${a.file}/`, '']) {
    assert.equal(readImage(store, site.id, name), null, name);
  }
  deleteImage(store, site.id, a.file);
  assert.equal(readImage(store, site.id, a.file), null);
  deleteImage(store, site.id, '../../etc/passwd'); // молча игнорируется
  assert.ok(fs.existsSync(store.uploadsDir(site.id)));
});

test('хранилище: id проверяется, запись атомарна, чужие и битые файлы не читаются', () => {
  const dir = tmpDir();
  const store = createStore(dir);
  const site = store.create({ content: { a: 1 } });
  assert.match(site.id, /^[a-f0-9]{20}$/);
  assert.equal(store.get(site.id).content.a, 1);
  for (const id of ['../x', 'A'.repeat(20), '0'.repeat(19), '', undefined, null]) assert.equal(store.get(id), null, String(id));
  assert.equal(store.get('0'.repeat(20)), null);
  fs.writeFileSync(`${dir}/sites/${'1'.repeat(20)}.json`, '{битый json');
  assert.equal(store.get('1'.repeat(20)), null);
  const before = site.updatedAt;
  site.content.a = 2;
  store.save(site);
  assert.equal(store.get(site.id).content.a, 2);
  assert.ok(site.updatedAt >= before);
  assert.deepEqual(fs.readdirSync(`${dir}/sites`).filter((f) => f.endsWith('.tmp')), []);
});

test('скачиваемый сайт: картинки встраиваются в data-URI, чужие и отсутствующие — убираются', () => {
  const store = createStore(tmpDir());
  const site = store.create({});
  const img = saveImage(store, site.id, PNG_1X1, 'png');
  const html = `<img src="${img.url}"><img src="/u/${site.id}/${'0'.repeat(16)}.png"><img src="/u/${'f'.repeat(20)}/${img.file}">`;
  const out = inlineImages(html, store);
  assert.ok(out.includes(`data:image/png;base64,${PNG_1X1.toString('base64')}`));
  assert.ok(!out.includes('/u/'));
});

test('лимитер: скользящее окно, возврат попытки, лимит 0 = без ограничений', () => {
  const lim = createRateLimiter({ limit: 2, windowMs: 1000 });
  assert.ok(lim.take('a').ok && lim.take('a').ok);
  const third = lim.take('a');
  assert.equal(third.ok, false);
  assert.ok(third.retryAfterSec >= 1);
  assert.ok(lim.take('b').ok, 'другой ключ не затронут');
  lim.refund('a');
  assert.ok(lim.take('a').ok, 'после возврата попытка снова доступна');
  const off = createRateLimiter({ limit: 0 });
  for (let i = 0; i < 50; i++) assert.ok(off.take('x').ok);
});
