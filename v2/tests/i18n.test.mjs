import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const es = JSON.parse(readFileSync(new URL('../src/i18n/es.json', import.meta.url), 'utf8'));
const en = JSON.parse(readFileSync(new URL('../src/i18n/en.json', import.meta.url), 'utf8'));
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('ES y EN tienen exactamente las mismas claves', () => {
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
});

test('ninguna cadena queda vacía', () => {
  for (const [lang, dict] of [['es', es], ['en', en]]) {
    const empty = Object.entries(dict).filter(([, value]) => value.trim() === '').map(([key]) => key);
    assert.deepEqual(empty, [], `${lang}: vacías ${empty.join(', ')}`);
  }
});

test('los marcadores {x} coinciden entre ES y EN', () => {
  for (const key of Object.keys(es)) {
    assert.deepEqual(placeholders(es[key]), placeholders(en[key]), key);
  }
});

test('las plantillas de cotización usan los cinco campos', () => {
  for (const dict of [es, en]) {
    assert.deepEqual(placeholders(dict.quote_template), ['event', 'date', 'guests', 'message', 'name'].sort());
  }
});
