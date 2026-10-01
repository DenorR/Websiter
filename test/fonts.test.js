import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FONTS, FONT_IDS, fontStack, publicFonts, resolveFontFile, fontFaceCss } from '../src/fonts.js';

test('каталог: 30 шрифтов, у каждого есть кириллица и файлы на диске', () => {
  assert.ok(FONT_IDS.length >= 30, `шрифтов: ${FONT_IDS.length}`);
  for (const f of Object.values(FONTS)) {
    assert.ok(f.label && f.stack.includes(f.stack.split(',')[0]), f.id);
    assert.ok(f.faces.length > 0, `${f.id}: нет начертаний`);
    assert.ok(f.faces.some((face) => /U\+0400/i.test(face.range)), `${f.id}: нет кириллического диапазона`);
    for (const face of f.faces) {
      assert.match(face.file, /\.woff2$/, `${f.id}: ${face.file}`);
      assert.ok(!/ext/.test(face.file) || /cyrillic-ext/.test(face.file) === false, `${f.id}: лишний subset ${face.file}`);
      assert.ok(fs.existsSync(resolveFontFile(f.id, face.file)), `${f.id}: файл ${face.file}`);
    }
  }
});

test('раздача шрифтов — только по белому списку (path traversal невозможен)', () => {
  const f = FONTS.inter;
  assert.ok(resolveFontFile('inter', f.faces[0].file));
  for (const [id, file] of [['inter', '../../package.json'], ['..', 'x'], ['inter', 'nope.woff2'], ['nope', f.faces[0].file], ['inter', '/etc/passwd'], ['inter', `${f.faces[0].file}/..`]]) {
    assert.equal(resolveFontFile(id, file), null, `${id}/${file}`);
  }
});

test('fontStack подставляет запасной шрифт для неизвестного id', () => {
  assert.equal(fontStack('inter'), FONTS.inter.stack);
  assert.equal(fontStack('нет-такого'), FONTS.inter.stack);
});

test('fontFaceCss: ссылки на свой домен, base64 для скачиваемого сайта, неизвестные пропускаются', () => {
  const link = fontFaceCss(['inter', 'нет-такого', 'inter']);
  assert.match(link, /@font-face\{font-family:'Inter Variable'/);
  assert.ok(link.includes('/fonts/inter/'));
  assert.ok(!link.includes('fonts.googleapis') && !link.includes('gstatic'), 'никаких внешних CDN');
  assert.equal((link.match(/font-family:'Inter Variable';font-style:normal/g) ?? []).length, FONTS.inter.faces.filter((x) => x.style === 'normal').length, 'дубли id не плодят правила');
  const inline = fontFaceCss(['inter'], { mode: 'inline', italic: false });
  assert.match(inline, /url\(data:font\/woff2;base64,/);
  assert.ok(!inline.includes('/fonts/'));
  assert.ok(!/font-style:italic/.test(inline));
  assert.equal(fontFaceCss([]), '');
});

test('publicFonts: данные для интерфейса без путей на диске', () => {
  const list = publicFonts();
  assert.equal(list.length, FONT_IDS.length);
  assert.ok(!JSON.stringify(list).includes('node_modules'));
  assert.ok(list.every((f) => f.id && f.label && f.stack && Array.isArray(f.roles)));
});
