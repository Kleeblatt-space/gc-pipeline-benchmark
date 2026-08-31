import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const baseDir = path.join(root, 'assets/base');
const datasetDir = path.join(root, 'public/benchmark/dataset');
const size = 128;
const categories = ['perfect', 'border', 'watermark', 'pattern', 'broken_seam', 'blur'] as const;

async function ensureBaseTiles() {
  await fs.mkdir(baseDir, { recursive: true });
  const existing = (await fs.readdir(baseDir)).filter((name) => /\.(png|jpg|jpeg)$/i.test(name));
  if (existing.length >= 10) return existing.slice(0, 10).sort();
  const generated: string[] = [];
  for (let i = 0; i < 10; i++) {
    const hue = (i * 31) % 360;
    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="hsl(${hue},45%,42%)"/><path d="M0 ${size / 2}H${size}M${size / 2} 0V${size}" stroke="rgba(255,255,255,.16)" stroke-width="3"/><circle cx="32" cy="32" r="12" fill="rgba(255,255,255,.13)"/><circle cx="96" cy="96" r="18" fill="rgba(0,0,0,.12)"/></svg>`;
    const name = `base-${String(i + 1).padStart(2, '0')}.png`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(baseDir, name));
    generated.push(name);
  }
  return generated;
}

async function inject(input: Buffer, category: typeof categories[number]) {
  const image = sharp(input);
  if (category === 'perfect') return image.png().toBuffer();
  if (category === 'blur') return image.resize(64, 64).resize(size, size, { kernel: sharp.kernel.cubic }).png().toBuffer();
  if (category === 'broken_seam') return image.extract({ left: 3, top: 0, width: size - 3, height: size }).extend({ left: 3, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  if (category === 'border') {
    const border = await sharp({ create: { width: size, height: size, channels: 4, background: { r: 245, g: 245, b: 245, alpha: 1 } } }).png().toBuffer();
    return image.composite([{ input: border, blend: 'dest-in' }]).png().toBuffer();
  }
  if (category === 'watermark') {
    const mark = Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="48" width="100" height="30" rx="5" fill="rgba(255,255,255,.72)"/><text x="64" y="68" text-anchor="middle" font-size="11" fill="#333">AI GENERATED</text></svg>`);
    return image.composite([{ input: mark }]).png().toBuffer();
  }
  const grid = Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><path d="M0 32H128M0 64H128M0 96H128M32 0V128M64 0V128M96 0V128" stroke="rgba(0,0,0,.42)" stroke-width="2"/></svg>`);
  return image.composite([{ input: grid }]).png().toBuffer();
}

const bases = await ensureBaseTiles();
await fs.rm(datasetDir, { recursive: true, force: true });
await fs.mkdir(datasetDir, { recursive: true });
for (let i = 0; i < 10; i++) {
  const input = await fs.readFile(path.join(baseDir, bases[i]));
  for (const category of categories) {
    const filename = `tile-${String(i + 1).padStart(2, '0')}-${category}.png`;
    await fs.writeFile(path.join(datasetDir, filename), await inject(input, category));
  }
}
console.log(`Generated ${bases.length * categories.length} benchmark tiles in ${datasetDir}`);
