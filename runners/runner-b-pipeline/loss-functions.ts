export function calculatePipelineLoss(scoreBefore: number, scoreAfter: number, artifactDelta: number, constraintViolations: number): number {
  const delta = scoreAfter - scoreBefore;
  return -delta + 10 * Math.max(0, -delta) + 5 * Math.max(0, -artifactDelta) + 100 * constraintViolations;
}
