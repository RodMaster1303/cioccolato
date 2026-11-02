import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildQuoteMessage, daysUntil } from '../src/lib/quote.ts';
import { whatsappLink, SITE } from '../src/data/site.ts';

const template = 'Hola\nEvento: {event}\nFecha: {date}\nPersonas: {guests}\nNombre: {name}\nMensaje: {message}';

test('whatsappLink sin mensaje apunta al número', () => {
  assert.equal(whatsappLink(), 'https://wa.me/59168023352');
  assert.equal(SITE.whatsappNumber, '59168023352');
});

test('whatsappLink codifica espacios, tildes y saltos de línea', () => {
  assert.equal(whatsappLink('hola mundo'), 'https://wa.me/59168023352?text=hola%20mundo');
  assert.ok(whatsappLink('Torta de cumpleaños\nñandú').includes('%0A'));
  assert.ok(whatsappLink('a&b=c').endsWith('a%26b%3Dc'));
});

test('buildQuoteMessage omite las líneas cuyos campos están vacíos', () => {
  const text = buildQuoteMessage(template, { event: 'Boda', date: '2026-12-20', guests: '120', name: '', message: '' });
  assert.equal(text, 'Hola\nEvento: Boda\nFecha: 2026-12-20\nPersonas: 120');
});

test('buildQuoteMessage incluye nombre y mensaje cuando existen', () => {
  const text = buildQuoteMessage(template, { event: 'Cumpleaños', date: '2026-12-01', guests: '30', name: 'Ana', message: 'Sin nueces' });
  assert.ok(text.includes('Nombre: Ana') && text.includes('Mensaje: Sin nueces'));
});

test('buildQuoteMessage limita el largo para no romper la URL', () => {
  const text = buildQuoteMessage(template, { event: 'x', date: 'y', guests: 'z', name: '', message: 'a'.repeat(5000) });
  assert.ok(text.length <= 1500);
});

test('daysUntil cuenta días de calendario', () => {
  const today = new Date(2026, 10, 2, 15, 30);
  assert.equal(daysUntil('2026-11-02', today), 0);
  assert.equal(daysUntil('2026-11-05', today), 3);
  assert.equal(daysUntil('2026-11-01', today), -1);
  assert.equal(daysUntil('', today), null);
  assert.equal(daysUntil('no-es-fecha', today), null);
});
