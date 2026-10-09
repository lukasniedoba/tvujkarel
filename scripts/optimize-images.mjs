import sharp from 'sharp';
import { resolve } from 'node:path';
const specifications = {
  hero: [480, 800],
  workspace: [480, 800],
  printer: [320],
  'step-call': [400],
  'step-plan': [400],
  'step-help': [400],
};
for (const [name, widths] of Object.entries(specifications)) {
  for (const width of widths) {
    await sharp(resolve('public/images', `${name}.webp`))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(resolve('public/images', `${name}-${width}.webp`));
  }
}
console.log('Responsive image variants generated. Original source assets preserved.');

for (const width of [480, 800, 1200]) {
  await sharp(resolve('public/images/hero.webp'))
    .resize({ width })
    .avif({ quality: 45, effort: 6 })
    .toFile(resolve('public/images', `hero-${width}.avif`));
}
