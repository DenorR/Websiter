import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ART_STYLES, ART_IDS, renderArt } from '../src/art.js';

test('10 стилей графики рисуют SVG, зависящий от seed', () => {
  assert.equal(ART_IDS.length, 10);
  for (const id of ART_IDS) {
    const a = renderArt(id, 'one');
    assert.match(a, /^<svg[\s>]/, id);
    assert.ok(a.endsWith('</svg>'), id);
    assert.equal(renderArt(id, 'one'), a, `${id}: детерминированность`);
    assert.ok(ART_STYLES[id].label);
  }
  const different = ART_IDS.filter((id) => renderArt(id, 'one') !== renderArt(id, 'two'));
  assert.ok(different.length >= 8, `стилей, где seed меняет картинку: ${different.length}`);
});

test('графика не содержит скриптов и внешних ссылок, а инициал экранируется', () => {
  for (const id of ART_IDS) {
    const svg = renderArt(id, 'x', { initial: '<' });
    assert.ok(!/<script|onload=|href=["']?https?:|xlink:href|<image/i.test(svg), id);
    const textOnly = svg.replace(/<\/?[a-zA-Z][^>]*>/g, '');
    assert.ok(!textOnly.includes('<'), `${id}: неэкранированный символ в тексте`);
  }
});
