import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const photos = JSON.parse(readFileSync(new URL('../src/data/gallery.json', import.meta.url), 'utf8'));
const categories = ['weddings', 'cakes', 'cocktail', 'buffet'];

test('cada foto de la galería existe en disco', () => {
  for (const photo of photos) {
    assert.ok(existsSync(new URL(`../src/assets/gallery/${photo.file}`, import.meta.url)), photo.file);
  }
});

test('cada foto tiene categoría válida, medidas y textos alternativos en ES y EN', () => {
  for (const photo of photos) {
    assert.ok(categories.includes(photo.category), photo.id);
    assert.ok(photo.width > 0 && photo.height > 0, photo.id);
    assert.ok(photo.es.length > 8 && photo.en.length > 8, photo.id);
  }
});

test('los ids son únicos y cada categoría tiene fotos', () => {
  assert.equal(new Set(photos.map((p) => p.id)).size, photos.length);
  for (const category of categories) assert.ok(photos.some((p) => p.category === category), category);
});

test('hay entre 6 y 10 fotos destacadas para el inicio', () => {
  const featured = photos.filter((p) => p.featured).length;
  assert.ok(featured >= 6 && featured <= 10, `destacadas: ${featured}`);
});

test('las hojas de michis y objetos que usa el sitio existen', () => {
  const michis = ['pivi', 'mandarino', 'zombie'];
  const poses = ['sit', 'blink', 'meow', 'peek', 'sleep', 'swipe'];
  for (const michi of michis) {
    for (const pose of poses) {
      assert.ok(existsSync(new URL(`../src/assets/michis/${michi}-${pose}.webp`, import.meta.url)), `${michi}-${pose}`);
    }
  }
  for (const pose of ['crouch', 'pounce', 'walk', 'look-up']) {
    assert.ok(existsSync(new URL(`../src/assets/michis/pivi-${pose}.webp`, import.meta.url)), `pivi-${pose}`);
  }
});
