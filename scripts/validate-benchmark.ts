import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataset = path.join(root, 'public/benchmark/dataset');
const truth = JSON.parse(await fs.readFile(path.join(root, 'public/benchmark/ground-truth.json'), 'utf8')) as { tiles: unknown[]; tile_count: number };
const files = (await fs.readdir(dataset)).filter((file) => file.endsWith('.png'));
const errors: string[] = [];
if (files.length !== 60) errors.push(`expected 60 PNG tiles, found ${files.length}`);
if (truth.tiles.length !== files.length) errors.push('ground truth count does not match dataset count');
for (const file of files) if (!/^tile-\d{2}-(perfect|border|watermark|pattern|broken_seam|blur)\.png$/.test(file)) errors.push(`invalid filename: ${file}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Benchmark valid: ${files.length} tiles and ${truth.tiles.length} ground-truth records.`);
