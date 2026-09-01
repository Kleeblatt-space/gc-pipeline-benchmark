import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const DATASET_DIR=path.join(__dirname,'../public/benchmark/dataset');
const OUTPUT_FILE=path.join(__dirname,'../public/benchmark/ground-truth.json');
const EXPECTATIONS={
  '16x16':{
    perfect:['Production',[95,98],[]],border:['Reject',[0,77],['1px_border']],watermark:['Reject',[0,77],['4x4_badge']],pattern:['Review',[78,91],['4x4_patch_duplicate']],broken_seam:['Reject',[0,77],['2px_offset']],blur:['Review',[78,91],['downscale_to_8px']]
  },
  '1024x1024':{
    perfect:['Production',[92,98],[]],border:['Reject',[0,77],['16px_border_on_1024']],watermark:['Reject',[0,77],['64px_badge_on_1024']],pattern:['Review',[78,91],['64px_patch_duplicate']],broken_seam:['Reject',[0,77],['32px_offset_on_1024']],blur:['Reject',[0,77],['double_downscale']]
  }
};
const baseline={ '16x16':{perfect:96.5}, '1024x1024':{perfect:95.5} };
const truth={};
for(const outputSize of ['16x16','64x64']){
  const dir=path.join(DATASET_DIR,outputSize); if(!await fs.pathExists(dir)) continue;
  for(const file of (await fs.readdir(dir)).filter(f=>f.endsWith('.png')).sort()){
    const category=file.match(/_(perfect|border|watermark|pattern|broken_seam|blur)\.png$/)?.[1];
    if(!category) throw new Error(`cannot classify ${file}`);
    const inputSize=outputSize==='16x16'?'16x16':'1024x1024'; const [gate,range,flaws]=EXPECTATIONS[inputSize][category];
    truth[`${outputSize}/${file}`]={input_size:inputSize,output_size:outputSize,score_size:outputSize,category,expected_gate:gate,expected_score_range:range,flaws,baseline_overall:baseline[inputSize]?.[category]??null,description:`${inputSize} ${category.replace('_',' ')} tile, scored on ${outputSize}`};
  }
}
await fs.writeJson(OUTPUT_FILE,truth,{spaces:2});
console.log(`Ground Truth gespeichert: ${Object.keys(truth).length} Einträge`);
