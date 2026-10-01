import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validHex, expandHex, contrast, ensureContrast, mix, deriveTokens, tokensToVars, onColor, isDark } from '../src/color.js';
import { TEMPLATES } from '../src/templates/index.js';

test('validHex принимает #rgb и #rrggbb, остальное заменяет', () => {
  assert.equal(validHex('#ABC', '#000000'), '#aabbcc');
  assert.equal(validHex('#123456', '#000000'), '#123456');
  assert.equal(validHex('blue', '#000000'), '#000000');
  assert.equal(validHex('#12345', '#000000'), '#000000');
  assert.equal(validHex(undefined, '#111111'), '#111111');
  assert.equal(validHex('#123456;}</style>', '#000000'), '#000000');
  assert.equal(expandHex('#0f0'), '#00ff00');
});

test('contrast: чёрный на белом = 21, одинаковые цвета = 1', () => {
  assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 0.01);
  assert.ok(Math.abs(contrast('#777777', '#777777') - 1) < 0.001);
  assert.equal(contrast('#123456', '#fedcba'), contrast('#fedcba', '#123456'));
});

test('ensureContrast доводит цвет до читаемого, в том числе на средне-сером фоне', () => {
  for (const bg of ['#ffffff', '#000000', '#777777', '#808080', '#999999', '#2563eb', '#ffcc00']) {
    for (const fg of ['#ffff00', '#000000', '#7c5cff', '#ffffff', '#102030', '#888888']) {
      const out = ensureContrast(fg, bg, 4.5);
      assert.ok(contrast(out, bg) >= 4.4, `${fg} на ${bg} -> ${out} (${contrast(out, bg).toFixed(2)})`);
    }
  }
});

test('mix и onColor', () => {
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(onColor('#000000'), '#ffffff');
  assert.equal(onColor('#ffffff'), '#111111');
  assert.equal(isDark('#0d0c0a'), true);
  assert.equal(isDark('#f4eee2'), false);
});

function assertReadable(t, label) {
  assert.ok(contrast(t.text, t.bg) >= 4.4, `${label}: текст на фоне ${contrast(t.text, t.bg).toFixed(2)}`);
  assert.ok(contrast(t.muted, t.bg) >= 4.4, `${label}: второстепенный текст ${contrast(t.muted, t.bg).toFixed(2)}`);
  assert.ok(contrast(t.accentFg, t.bg) >= 4.4, `${label}: акцент-текст на фоне ${contrast(t.accentFg, t.bg).toFixed(2)}`);
  assert.ok(contrast(t.onAccent, t.accent) >= 4.3, `${label}: текст на кнопке ${contrast(t.onAccent, t.accent).toFixed(2)}`);
  assert.ok(contrast(t.onBand, t.band) >= 4.3, `${label}: текст на плашке ${contrast(t.onBand, t.band).toFixed(2)}`);
  assert.ok(contrast(t.bandBtnFg, t.bandBtn) >= 4.3, `${label}: кнопка на плашке ${contrast(t.bandBtnFg, t.bandBtn).toFixed(2)}`);
  assert.ok(contrast(t.bandEm, t.band) >= 4.3, `${label}: выделение на плашке ${contrast(t.bandEm, t.band).toFixed(2)}`);
}

test('все палитры всех шаблонов читаемы (текст, кнопки, плашки)', () => {
  for (const tpl of Object.values(TEMPLATES)) {
    for (const p of tpl.palettes) assertReadable(deriveTokens(p, { band: tpl.band }), `${tpl.id}/${p.id}`);
  }
});

test('любые цвета пользователя дают читаемые токены', () => {
  const cols = ['#000000', '#ffffff', '#777777', '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#7c5cff', '#102030', '#fafafa'];
  for (const bg of cols) {
    for (const text of cols) {
      for (const accent of cols) {
        for (const band of ['text', 'accent', 'accent2', 'surface2']) {
          assertReadable(deriveTokens({ bg, text, accent, accent2: '#abcdef' }, { band }), `${bg}/${text}/${accent}/${band}`);
        }
      }
    }
  }
});

test('deriveTokens: мусорные цвета заменяются, токены — только валидные hex', () => {
  const t = deriveTokens({ bg: 'red; x', text: '<script>', accent: 'nope', accent2: '' });
  for (const k of ['bg', 'surface', 'surface2', 'text', 'muted', 'border', 'accent', 'accent2', 'band', 'onBand']) {
    assert.match(t[k], /^#[0-9a-f]{6}$/, k);
  }
  const vars = tokensToVars(t);
  assert.ok(!/[<>"'`]/.test(vars), 'в CSS-переменных нет опасных символов');
  assert.match(vars, /color-scheme:(light|dark);$/);
});
