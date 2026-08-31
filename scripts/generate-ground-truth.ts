import fs from 'node:fs/promises';
import path from 'node:path';

const datasetDir = path.join(process.cwd(), 'public/benchmark/dataset');
const output = path.join(process.cwd(), 'public/benchmark/ground-truth.json');
const files = (await fs.readdir(datasetDir)).filter((f) => f.endsWith('.png')).sort();
const gateByCategory: Record<string, string> = { perfect: 'Production', pattern: 'Review', blur: 'Review', border: 'Reject', watermark: 'Reject', broken_seam: 'Reject' };
const scoreRanges: Record<string, [number, number]> = { perfect: [92, 100], pattern: [78, 91.99], blur: [78, 91.99], border: [0, 77.99], watermark: [0, 77.99], broken_seam: [0, 77.99] };
const tiles = files.map((filename) => {
  const [, id, category] = filename.match(/^tile-(\d+)-(.+)\.png$/) ?? [];
  return { tile_id: `T_${id}`, filename, category, expected_gate: gateByCategory[category], expected_score_range: scoreRanges[category], injected_error: category === 'perfect' ? null : category };
});
await fs.writeFile(output, JSON.stringify({ benchmark_version: '0.1.0', generated_at: new Date().toISOString(), tile_count: tiles.length, tiles }, null, 2) + '\n');
console.log(`Wrote ground truth for ${tiles.length} tiles.`);
