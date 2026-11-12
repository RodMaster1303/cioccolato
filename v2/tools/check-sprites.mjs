import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const CATS = ['pivi', 'mandarino', 'zombie'];
const POSES = ['sit', 'blink', 'look-left', 'look-right', 'look-up', 'meow', 'crouch', 'pounce', 'swipe', 'peek', 'sleep', 'walk'];
const OBJECTS = [
  'cake-rainbow', 'cake-strawberry', 'croissant', 'cupcake-green', 'cupcake-pink', 'cupcake-yellow',
  'donut', 'macaron-blue', 'macaron-pink', 'yarn-cyan', 'yarn-orange', 'yarn-pink',
];
const EXTRAS = ['trio-gatos', 'trio-postres', 'trio-completo', 'pivi-mark', 'real-pivi', 'real-mandarino', 'real-zombie'];

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

const referenced = new Set();
for (const file of walk(dist).filter((path) => path.endsWith('.html'))) {
  for (const match of readFileSync(file, 'utf8').matchAll(/_astro\/([a-z0-9-]+)\.[A-Za-z0-9_-]+\.webp/g)) referenced.add(match[1]);
}

const expected = [
  ...CATS.flatMap((cat) => POSES.map((pose) => `${cat}-${pose}`)),
  ...OBJECTS.map((name) => `obj-${name}`),
  ...EXTRAS,
];
const missing = expected.filter((name) => !referenced.has(name));

console.log(`${expected.length - missing.length}/${expected.length} imágenes de los michis y objetos se usan en alguna página`);
if (missing.length > 0) {
  console.error('Sin uso en ninguna página:', missing.join(', '));
  process.exit(1);
}
