import coreModule from '@tilefix/core';
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR_16 = path.join(__dirname, '../assets/base');
const BASE_DIR_HD = path.join(__dirname, '../assets/hd');

async function scoreImage(imagePath, label) {
  const buffer = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const imageData = { width: buffer.info.width, height: buffer.info.height, data: new Uint8ClampedArray(buffer.data) };
  const score = coreModule.evaluateQuality(imageData, imageData);
  const value = metric => metric?.score ?? metric;
  console.log(`\n${label}:`);
  console.log(`  Größe: ${buffer.info.width}x${buffer.info.height}`);
  console.log(`  overall: ${score.overall}`);
  console.log(`  seam: ${value(score.seam)}`);
  console.log(`  border: ${value(score.border)}`);
  console.log(`  artifact: ${value(score.artifact)}`);
  console.log(`  pattern: ${value(score.pattern)}`);
  console.log(`  fidelity: ${value(score.fidelity)}`);
  return score;
}

async function main() {
  console.log('🧪 Vollständiger Baseline-Test auf allen Tiles\n');
  const bases = (await fs.readdir(BASE_DIR_16)).filter(f => /^base-\d+\.png$/.test(f)).sort();
  const hd = (await fs.readdir(BASE_DIR_HD)).filter(f => f.endsWith('.png')).sort();
  console.log(`Pixel-Art-Tiles: ${bases.length}`);
  if (bases.length !== 10) throw new Error(`expected 10 Pixel-Art tiles, found ${bases.length}`);
  for (const file of bases) await scoreImage(path.join(BASE_DIR_16, file), file);
  console.log(`\nHD-Referenzen: ${hd.length}`);
  if (hd.length !== 10) throw new Error(`expected 10 HD reference tiles, found ${hd.length}`);
  for (const file of hd) {
    const input = path.join(BASE_DIR_HD, file);
    const before = await scoreImage(input, `${file} VOR Pipeline`);
    const downscaled = await sharp(input).ensureAlpha().resize(64, 64, { kernel: sharp.kernel.lanczos3 }).raw().toBuffer({ resolveWithObject: true });
    const data = { width: downscaled.info.width, height: downscaled.info.height, data: new Uint8ClampedArray(downscaled.data) };
    const after = coreModule.evaluateQuality(data, data);
    console.log(`  64x64 nach Downscale: overall=${after.overall}, seam=${after.seam?.score ?? after.seam}, border=${after.border?.score ?? after.border}, ΔScore=${after.overall - before.overall}`);
  }
  console.log(`\n✅ Vollständiger Lauf beendet: ${bases.length + hd.length} Dateien bewertet`);
  console.log('⚠️ Pipeline-Integration fehlt weiterhin; dieser Test misst nur Baseline und Downscale.');
}
main().catch(error => { console.error('❌ Fehler:', error); process.exit(1); });
