import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR_16 = path.join(__dirname, '../assets/base');
const BASE_DIR_HD = path.join(__dirname, '../assets/hd');
const OUTPUT_DIR = path.join(__dirname, '../public/benchmark/dataset');
const categories = ['perfect', 'border', 'watermark', 'pattern', 'broken_seam', 'blur'];
const PARAMS = {
  '16x16': { border: { width: 1 }, watermark: { size: 4, opacity: 0.8 }, pattern: { patchSize: 4, copies: 2 }, brokenSeam: { offset: 2 }, blur: { downscaleTo: 8 } },
  '1024x1024': { border: { width: 16 }, watermark: { size: 64, opacity: 0.5 }, pattern: { patchSize: 64, copies: 4 }, brokenSeam: { offset: 32 }, blur: { downscaleTo: 256 } }
};

async function border(input, output, width) {
  const meta = await sharp(input).metadata();
  const overlay = Buffer.from(`<svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg"><rect x="${width/2}" y="${width/2}" width="${meta.width-width}" height="${meta.height-width}" fill="none" stroke="#d0d0d0" stroke-width="${width}"/></svg>`);
  await sharp(input).composite([{ input: overlay }]).png().toFile(output);
}
async function watermark(input, output, params) {
  const size = params.size;
  const badge = Buffer.from(`<svg width="${size}" height="${Math.ceil(size/2)}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="2" fill="white" fill-opacity="${params.opacity}"/><text x="${size/2}" y="${Math.ceil(size/3)}" text-anchor="middle" font-family="monospace" font-size="${Math.max(2,Math.floor(size/4))}" fill="black">AI</text></svg>`);
  await sharp(input).composite([{ input: badge, top: 5, left: 5 }]).png().toFile(output);
}
async function pattern(input, output, params) {
  const { width, height } = await sharp(input).metadata();
  const s = Math.min(params.patchSize, width, height);
  const patch = await sharp(input).extract({ left: Math.floor(width/2-s/2), top: Math.floor(height/2-s/2), width: s, height: s }).png().toBuffer();
  const step = Math.floor(width/3); const composites = [];
  for (let i=0; i<params.copies; i++) composites.push({ input: patch, top: Math.min(height-s, step+(i%2)*step), left: Math.min(width-s, step+Math.floor(i/2)*step) });
  await sharp(input).composite(composites).png().toFile(output);
}
async function brokenSeam(input, output, offset) {
  const { width, height } = await sharp(input).metadata();
  const left = await sharp(input).extract({ left: offset, top: 0, width: width-offset, height }).png().toBuffer();
  const right = await sharp(input).extract({ left: 0, top: 0, width: offset, height }).png().toBuffer();
  await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: left, left: 0, top: 0 }, { input: right, left: width-offset, top: 0 }]).png().toFile(output);
}
async function blur(input, output, to) { const meta=await sharp(input).metadata(); await sharp(input).resize(to,to,{kernel:sharp.kernel.bilinear}).resize(meta.width,meta.height,{kernel:sharp.kernel.bilinear}).png().toFile(output); }
async function processOne(input, outDir, base, kind, sourceSize) {
  const p=PARAMS[sourceSize]; const output=path.join(outDir, `${base}_${kind}.png`);
  if (kind==='perfect') await sharp(input).png().toFile(output);
  else if (kind==='border') await border(input, output, p.border.width);
  else if (kind==='watermark') await watermark(input, output, p.watermark);
  else if (kind==='pattern') await pattern(input, output, p.pattern);
  else if (kind==='broken_seam') await brokenSeam(input, output, p.brokenSeam.offset);
  else await blur(input, output, p.blur.downscaleTo);
  if (sourceSize==='1024x1024') { const tmp=output+'.tmp.png'; await sharp(output).resize(64,64,{kernel:sharp.kernel.lanczos3}).png().toFile(tmp); await fs.move(tmp, output, {overwrite:true}); }
}
async function generate() {
  await fs.remove(OUTPUT_DIR); await fs.ensureDir(OUTPUT_DIR);
  const sources=[['16x16',BASE_DIR_16,'16x16'],['1024x1024',BASE_DIR_HD,'64x64']]; let total=0;
  for (const [sourceSize, dir, outputSize] of sources) {
    const outDir=path.join(OUTPUT_DIR,outputSize); await fs.ensureDir(outDir);
    const files=(await fs.readdir(dir)).filter(f=>f.endsWith('.png')).sort();
    for (const file of files) for (const kind of categories) { await processOne(path.join(dir,file),outDir,path.basename(file,'.png'),kind,sourceSize); total++; }
    console.log(`✅ ${sourceSize}: ${files.length*categories.length} Tiles generiert (Output: ${outputSize})`);
  }
  console.log(`🎉 Fertig! Insgesamt ${total} Tiles in ${OUTPUT_DIR}`);
}
generate().catch(err=>{ console.error('❌ Fehler bei der Generierung:',err); process.exit(1); });
