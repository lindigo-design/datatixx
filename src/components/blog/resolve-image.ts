/**
 * Зображення з тексту статті: Keystatic пише шлях «/src/assets/img/blog/файл.jpg».
 * Знаходимо файл серед src/assets/img (підвантажується лише потрібний) — Astro його оптимізує.
 */
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/img/**/*.{jpg,jpeg,png,webp}'
);

export async function resolveAssetImage(
  path: string
): Promise<ImageMetadata | undefined> {
  const key = path.startsWith('/') ? path : `/${path}`;
  return images[key] ? (await images[key]()).default : undefined;
}
