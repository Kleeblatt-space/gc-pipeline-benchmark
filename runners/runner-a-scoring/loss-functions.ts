export type Gate = 'Production' | 'Review' | 'Reject';

export function gateForScore(score: number): Gate {
  return score >= 92 ? 'Production' : score >= 78 ? 'Review' : 'Reject';
}

export function calculateScoringLoss(predictedScore: number, groundTruthGate: Gate): number {
  const margin = groundTruthGate === 'Production' ? predictedScore - 92 : groundTruthGate === 'Review' ? Math.min(predictedScore - 78, 92 - predictedScore) : 78 - predictedScore;
  if (margin >= 0) return 0;
  const isFalsePositive = groundTruthGate !== 'Production' && predictedScore >= 92;
  return (isFalsePositive ? 3 : 1) * Math.abs(margin) ** 2;
}
