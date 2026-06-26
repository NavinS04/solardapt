// Rule-based lead scoring (BUILD_SPEC §8). Configurable weights → score + grade.
import type { Market } from './validators';

export interface ScoreInput {
  jobsPerMonth?: number | null;
  market?: Market | null;
  source?: string | null;
}

export const SCORE_WEIGHTS = {
  jobsPerMonth: { perJob: 2, cap: 40 },
  market: { UK: 15, USA: 15, AUSTRALIA: 12, MIDDLE_EAST: 10 } as Record<Market, number>,
  source: { meta: 20, referral: 10, organic: 8, other: 5 } as Record<string, number>,
};

export function scoreLead(input: ScoreInput): { score: number; grade: 'A' | 'B' | 'C' | 'D' } {
  let score = 0;

  if (input.jobsPerMonth && input.jobsPerMonth > 0) {
    score += Math.min(input.jobsPerMonth * SCORE_WEIGHTS.jobsPerMonth.perJob, SCORE_WEIGHTS.jobsPerMonth.cap);
  }
  if (input.market) score += SCORE_WEIGHTS.market[input.market] ?? 0;
  if (input.source) {
    const key = input.source.toLowerCase().includes('meta') ? 'meta' : input.source.toLowerCase();
    score += SCORE_WEIGHTS.source[key] ?? SCORE_WEIGHTS.source.other ?? 0;
  }

  const grade = score >= 60 ? 'A' : score >= 40 ? 'B' : score >= 20 ? 'C' : 'D';
  return { score, grade };
}
