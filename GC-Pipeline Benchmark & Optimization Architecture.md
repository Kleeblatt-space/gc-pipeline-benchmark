
# design.md: GC-Pipeline Benchmark & Optimization Architecture

**Repository:** `tilesmith/gc-pipeline-benchmark`  
**Version:** 1.0.0  
**Status:** Draft for Implementation  
**Linked to:** `MONETARISIERUNG_4_SAEULEN.md` (Säule 3: Benchmark & Publisher Zertifizierung)

---

## 1. Core Philosophy: The Dual Optimization Problem

The GC Pipeline serves two distinct, interdependent purposes:
1. **Scoring (Evaluation):** Accurately measuring the technical quality of a tile (Gate: Production/Review/Reject).
2. **Processing (Optimization):** Actively improving raw tiles to make them game-engine ready.

**The Paradox:** We cannot optimize the Pipeline (B) without an accurate Scoring model (A) to measure improvement. However, Scoring model (A) trained on raw, flawed images may not accurately score *pipeline-optimized* images.  
**The Solution:** Iterative Co-Training (A → B → A → B) until convergence.

---

## 2. Optimization Target A: Scoring Accuracy

**Goal:** Maximize the accuracy of the Gate classification (Production ≥92, Review 78-91, Reject <78) against a known Ground Truth.

### Parameters to Tune (~18)
- **6 Softmax Raw Weights (z_1 ... z_6):** Unconstrained floats, transformed via `w_i = e^(z_i) / sum(e^(z_j))` to guarantee `w_i > 0` and `sum(w_i) = 1`.
- **~12 Internal Metric Thresholds:** e.g., `seam.band_width_px`, `border.brightness_threshold`, `artifact.confidence`.

### Loss Function: Asymmetric Margin Loss
We penalize False Positives (FP: bad tile passes as Production) much harder than False Negatives (FN: good tile lands in Review), protecting API customer trust (Säule 2).

```typescript
// TypeScript Example: Asymmetric Loss for Runner A
function calculateScoringLoss(predictedScore: number, groundTruthGate: 'Production' | 'Review' | 'Reject'): number {
  let margin = 0;

  if (groundTruthGate === 'Production') margin = predictedScore - 92;
  else if (groundTruthGate === 'Review') margin = Math.min(predictedScore - 78, 92 - predictedScore);
  else margin = 78 - predictedScore;

  if (margin >= 0) return 0; // Correct classification, no loss (or small margin push)

  // Asymmetric Penalty: FP (α=3) is punished 3x harder than FN (β=1)
  const isFP = (groundTruthGate === 'Reject' && predictedScore >= 92) || 
               (groundTruthGate === 'Review' && predictedScore >= 92);
  
  const alpha = 3.0; // FP Penalty
  const beta = 1.0;  // FN Penalty
  const p = 2;       // Quadratic penalty for large deviations

  return (isFP ? alpha : beta) * Math.pow(Math.abs(margin), p);
}
```

---

## 3. Optimization Target B: Pipeline Improvement

**Goal:** Maximize the quality delta (ΔScore) of tiles after passing through the 6-step pipeline, without introducing new artifacts.

### Parameters to Tune (~70)
Grouped into: `crop`, `seamless`, `inpaint`, `variation`, `atlas`, `export`.  
*Plus:* The **Step Order** (Permutation of the 6 steps).

### The Dependency Graph
The optimizer must respect mathematical relationships between parameters to avoid invalid states:
```typescript
const DEPENDENCY_GRAPH = [
  { source: "crop.margin_px", target: "seamless.blend_band_width", relation: "linear", formula: "max(8, margin * 2)" },
  { source: "variation.edge_lock_px", target: "seam_score", relation: "threshold", formula: "if lock < 2: seam_penalty = 10" }
];
```

### Loss Function: Delta-Based Multi-Objective Loss
```typescript
// TypeScript Example: Asymmetric Loss for Runner B
function calculatePipelineLoss(scoreBefore: number, scoreAfter: number, artifactDelta: number, constraintViolations: number): number {
  const delta = scoreAfter - scoreBefore;
  
  // 1. Reward improvement (negative loss)
  const improvementLoss = -delta;
  
  // 2. EXTREME penalty for degradation (α=10)
  const degradationPenalty = 10.0 * Math.max(0, -delta);
  
  // 3. Penalty for new artifacts introduced by pipeline
  const artifactPenalty = 5.0 * Math.max(0, -artifactDelta);
  
  // 4. Hard constraint penalty (invalid parameter combos or step order)
  const constraintPenalty = constraintViolations * 100.0;

  return improvementLoss + degradationPenalty + artifactPenalty + constraintPenalty;
}
```

---

## 4. The Delta Matrix

The core metric for Pipeline success. Evaluated per tile:

| Tile ID | Score_Before | Score_After | ΔScore | Pipeline_Success | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| T_001 | 60 (Reject) | 93 (Prod) | +33 | ✅ Perfect | Watermark removed, seam fixed |
| T_002 | 95 (Prod) | 94 (Prod) | -1 | ⚠️ Acceptable | Minor fidelity loss, still Prod |
| T_003 | 70 (Review) | 65 (Reject) | -5 | ❌ Failure | Inpainting introduced blur |
| T_004 | 85 (Review) | 92 (Prod) | +7 | ✅ Good | Pattern broken up successfully |

**Rule:** A pipeline configuration is only valid if the rate of ❌ Failures is < 5%.

---

## 5. Permutation Optimization (The "Challenge")

With 6 steps, there are 6! = 720 possible orders. We use a **Genetic Algorithm (GA)** or **Simulated Annealing (SA)** to find the optimal order, respecting hard constraints.

**Hard Constraints:**
- `export` MUST be last.
- `atlas` MUST be after `variation`.
- `crop` MUST be before `seamless` (to avoid baking borders into seams).

**GA Fitness Function:**
`Fitness = - (Average ΔScore across 50 tiles) + (Constraint Penalty * 1000)`

---

## 6. Runner Architectures

### 🏃 Runner A: Scoring Optimizer
- **Input:** 50 Ground Truth Tiles + `ground-truth.json`.
- **Engine:** Optuna (Python) or custom TS optimizer.
- **Tuned:** 6 Softmax weights + 12 metric thresholds.
- **Output:** `config/scoring-params.json` (Initial baseline).

### 🏃 Runner B: Pipeline Optimizer
- **Input:** 50 Raw Tiles + Current Scoring Params (from A).
- **Engine:** Genetic Algorithm (e.g., `deap` in Python or `geneticalgorithm` in JS).
- **Tuned:** ~70 pipeline parameters + Step Order permutation.
- **Output:** `config/pipeline-params.json` + `optimal_step_order.json` + `delta-matrix.json`.

---

## 7. Iterative Co-Training Strategy (7-Day Plan)

We cannot train B with a dumb A, and A trained on raw data might misjudge optimized data.

- **Day 1-2: Baseline A0.** Train Runner A on raw Ground Truth. Achieve >85% Gate Accuracy.
- **Day 3-4: Pipeline B0.** Run Runner B using A0 as the "ruler". Optimize the ~70 params and step order to maximize ΔScore.
- **Day 5: Scoring A1.** Re-train Runner A, but this time include the *pipeline-optimized* tiles in the training mix to calibrate the scoring for "post-processed" reality.
- **Day 6: Pipeline B1.** Fine-tune Runner B using the new, more accurate A1 ruler.
- **Day 7: Convergence Check.** If ΔScore and Accuracy stabilize, freeze parameters into `config/tunable.json` (Stufe 3: Geschlossen).

---

## 8. Ground Truth: Synthetic Error Injection

We do not rely on "finding" flawed images. We synthetically inject known flaws into 10 perfect CC0 base tiles (from Kenney.nl / LoSpec) to create 60 benchmark tiles.

### Categories (10 tiles each):
1. **Perfect Seam:** Unmodified control group. (Expected: Production ≥92)
2. **1px Border:** +15/-15 L* brightness delta on the outermost pixel. (Expected: Reject <78)
3. **Watermark:** Synthetic "AI Generated" badge, 5-10% coverage, alpha 0.6. (Expected: Reject <78)
4. **Pattern Grid:** 32x32px patch duplicated 4x in a fixed grid. (Expected: Review 78-91)
5. **Broken Seam:** Image shifted horizontally by 3px or 5px (wrap-around). (Expected: Reject <78)
6. **Low Fidelity:** Downscaled to 50% and upscaled via bilinear interpolation. (Expected: Review 78-91)

### Injection Script Concept (`generate-benchmark.ts`)
```typescript
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

const BASE_DIR = path.join(__dirname, '../public/benchmark/dataset');
const BASE_ASSETS = path.join(__dirname, '../assets/base');

// Example: Injecting a 1px Dark Border
async function injectBorder(input: string, output: string, brightnessDelta: number) {
  const img = sharp(input);
  const { width, height } = await img.metadata();
  
  // Create 1px border buffer with specific brightness delta
  const borderColor = brightnessDelta > 0 
    ? { r: Math.min(255, 128 + brightnessDelta), g: 128, b: 128, alpha: 1 }
    : { r: Math.max(0, 128 + brightnessDelta), g: 128, b: 128, alpha: 1 };

  const border = await sharp({
    create: { width: width! + 2, height: height! + 2, channels: 4, background: borderColor }
  }).png().toBuffer();

  // Composite original image 1px inset
  await sharp(border)
    .composite([{ input: await img.toBuffer(), top: 1, left: 1 }])
    .toFile(output);
}

// (Similar async functions exist for: injectWatermark, injectPatternGrid, injectBrokenSeam, injectBlur)
```

---

## 9. Phase 3: The Itch.io Field Study #01

**Title:** *"Why '4.9 Stars' ≠ Production Ready: An Automated QC Benchmark of 50 Free Asset Packs"*

**Objective:** Prove real-world efficacy beyond synthetic tests, driving adoption for Säule 2 (API) and Säule 3 (Publisher Certification).

**Methodology:**
1. **Data Collection:** Download the top 50 "Free" / "CC0" texture packs from itch.io (e.g., Kenney, Czarek, etc.).
2. **Execution:** Run all tiles through the optimized GC Pipeline (using the frozen `tunable.json` from Day 7).
3. **Analysis:** 
   - Calculate average ΔScore (Before vs. After).
   - Measure the reduction in "Reject" tiles pre- vs. post-pipeline.
   - Identify the most common failure modes in "free" assets (e.g., "60% fail due to 1px borders").
4. **Output:** 
   - Publish `Field_Study_01.pdf` (CC BY 4.0 for text/data, no raw images to respect original creators).
   - Update `/benchmark` page with real-world stats.
   - Use as primary marketing material for Reddit (r/gamedev, r/godot) and itch.io Devlogs.

---

## 10. Next Immediate Actions

1. [ ] Create new GitHub repo `tilesmith/gc-pipeline-benchmark` and commit this `design.md`.
2. [ ] Download 10 base tiles from Kenney.nl to `assets/base/`.
3. [ ] Implement `scripts/generate-benchmark.ts` and generate the 60 synthetic tiles.
4. [ ] Implement `scripts/generate-ground-truth.ts` to create the `ground-truth.json`.
5. [ ] Build Runner A (Optuna script) and validate baseline accuracy.
```

**Tipp zum Speichern:**
1. Klicke oben rechts im Code-Block auf das **"Copy"**-Symbol.
2. Öffne einen Texteditor (z.B. Notepad, VS Code, TextEdit).
3. Füge den Text ein (`Strg+V` oder `Cmd+V`).
4. Speichere die Datei als `design.md` (für GitHub/Markdown-Ansicht) oder `design.txt`.

Sobald du das Repo angelegt hast, können wir direkt mit dem `generate-benchmark.ts` Script und den Kenney.nl Assets 
