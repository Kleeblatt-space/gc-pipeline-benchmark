import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
const root=path.dirname(fileURLToPath(import.meta.url));
const dataset=path.join(root,'../public/benchmark/dataset');
const truthFile=path.join(root,'../public/benchmark/ground-truth.json');
const expected=['16x16','64x64']; let count=0;
for(const dirName of expected){
  const dir=path.join(dataset,dirName); if(!await fs.pathExists(dir)) throw new Error(`missing ${dirName}`);
  const files=(await fs.readdir(dir)).filter(f=>f.endsWith('.png'));
  if(files.length!==60) throw new Error(`${dirName}: expected 60, found ${files.length}`);
  for(const file of files){ if(!/^[a-z0-9-]+_(perfect|border|watermark|pattern|broken_seam|blur)\.png$/.test(file)) throw new Error(`bad filename ${dirName}/${file}`); count++; }
}
if(!await fs.pathExists(truthFile)) throw new Error('ground-truth.json missing');
const truth=await fs.readJson(truthFile); const keys=Object.keys(truth);
if(keys.length!==count) throw new Error(`ground truth expected ${count}, found ${keys.length}`);
for(const key of keys){ if(!key.startsWith('16x16/')&&!key.startsWith('64x64/')) throw new Error(`invalid truth key ${key}`); if(!truth[key].expected_gate) throw new Error(`missing gate ${key}`); }
console.log(`Benchmark v2 valid: ${count} tiles and ${keys.length} ground-truth records.`);
