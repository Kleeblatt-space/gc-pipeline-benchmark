export const DEPENDENCY_GRAPH = [
  { source: 'crop.margin_px', target: 'seamless.blend_band_width', relation: 'linear', formula: 'max(8, margin * 2)' },
  { source: 'variation.edge_lock_px', target: 'seam_score', relation: 'threshold', formula: 'if lock < 2: seam_penalty = 10' },
] as const;

export const STEP_ORDER_CONSTRAINTS = [
  ['export', 'last'], ['variation', 'atlas'], ['crop', 'seamless'],
] as const;

export function countConstraintViolations(order: string[]): number {
  const pos = new Map(order.map((step, index) => [step, index]));
  return Number(pos.get('export') !== order.length - 1) + Number((pos.get('variation') ?? 0) > (pos.get('atlas') ?? 0)) + Number((pos.get('crop') ?? 0) > (pos.get('seamless') ?? 0));
}
