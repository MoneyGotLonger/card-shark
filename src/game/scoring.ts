import type { Answer, Pair, RoundResult } from './types';

export const ROUNDS_PER_MATCH = 6;
export const ROUND_TIME_MS = 10_000;
export const CORRECT_POINTS = 100;
export const MAX_SPEED_BONUS = 50;

export function correctSide(pair: Pair): 'left' | 'right' {
  const leftHigher = pair.left.priceCents > pair.right.priceCents;
  if (pair.prompt === 'higher') return leftHigher ? 'left' : 'right';
  return leftHigher ? 'right' : 'left';
}

/** Correct answers earn 100 points plus a speed bonus that shrinks linearly to 0 at the time limit. */
export function scoreRound(pair: Pair, answer: Answer): RoundResult {
  const correct = answer.pick !== null && answer.pick === correctSide(pair);
  if (!correct) return { pair, answer, correct, points: 0 };
  const elapsed = Math.min(Math.max(answer.elapsedMs, 0), ROUND_TIME_MS);
  const bonus = Math.round(MAX_SPEED_BONUS * (1 - elapsed / ROUND_TIME_MS));
  return { pair, answer, correct, points: CORRECT_POINTS + bonus };
}

export type MatchTotals = { points: number; correct: number; totalMs: number };

export function totals(results: RoundResult[]): MatchTotals {
  return results.reduce(
    (acc, r) => ({
      points: acc.points + r.points,
      correct: acc.correct + (r.correct ? 1 : 0),
      totalMs: acc.totalMs + Math.min(r.answer.elapsedMs, ROUND_TIME_MS),
    }),
    { points: 0, correct: 0, totalMs: 0 },
  );
}

/** Higher points wins; a tie goes to the faster total answer time. */
export function winner(a: MatchTotals, b: MatchTotals): 'a' | 'b' | 'draw' {
  if (a.points !== b.points) return a.points > b.points ? 'a' : 'b';
  if (a.totalMs !== b.totalMs) return a.totalMs < b.totalMs ? 'a' : 'b';
  return 'draw';
}
