import fs from 'node:fs/promises';
import path from 'node:path';
import { countConstraintViolations } from './dependency-graph.js';
import { calculatePipelineLoss } from './loss-functions.js';

const order = ['crop', 'seamless', 'inpaint', 'variation', 'atlas', 'export'];
const violations = countConstraintViolations(order);
const scoreBefore = 80;
const scoreAfter = 89;
const artifactDelta = 0;
const loss = calculatePipelineLoss(scoreBefore, scoreAfter, artifactDelta, violations);
const result = { version: '0.1.0-baseline', step_order: order, parameters: { 'crop.margin_px': 8, 'seamless.blend_band_width': 16, 'variation.edge_lock_px': 4 }, objective: { score_before: scoreBefore, score_after: scoreAfter, delta: scoreAfter - scoreBefore, artifact_delta: artifactDelta, constraint_violations: violations, loss } };
await fs.mkdir(path.join(process.cwd(), 'config'), { recursive: true });
await fs.writeFile(path.join(process.cwd(), 'config/tunable-pipeline.json'), JSON.stringify(result, null, 2) + '\n');
console.log(`Pipeline candidate written with ${violations} constraint violations.`);
