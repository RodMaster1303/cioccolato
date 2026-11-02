import type { ImageMetadata } from 'astro';

const sprites = import.meta.glob<ImageMetadata>('../assets/michis/*.webp', { eager: true, import: 'default' });
const reals = import.meta.glob<ImageMetadata>('../assets/michis/real-*.jpg', { eager: true, import: 'default' });
const cats = import.meta.glob<ImageMetadata>('../assets/cats/*.webp', { eager: true, import: 'default' });
const photos = import.meta.glob<ImageMetadata>('../assets/gallery/*.{jpg,jpeg}', { eager: true, import: 'default' });

export function sprite(name: string): ImageMetadata {
  const found = sprites[`../assets/michis/${name}.webp`];
  if (!found) throw new Error(`Sprite no encontrado: ${name}`);
  return found;
}

export function catPose(name: string): ImageMetadata {
  const found = cats[`../assets/cats/${name}.webp`];
  if (!found) throw new Error(`Pose no encontrada: ${name}`);
  return found;
}

export function photo(file: string): ImageMetadata {
  const found = photos[`../assets/gallery/${file}`];
  if (!found) throw new Error(`Foto no encontrada: ${file}`);
  return found;
}

export function realPhoto(michi: string): ImageMetadata {
  const found = reals[`../assets/michis/real-${michi}.jpg`];
  if (!found) throw new Error(`Foto real no encontrada: ${michi}`);
  return found;
}
