import { correctSide, ROUND_TIME_MS } from './scoring';
import type { Rng } from './pairs';
import type { Answer, Pair } from './types';

/** Bot accuracy grows with rating: ~55% at 900 up to ~85% at 1900+. */
export function botAccuracy(rating: number): number {
  const t = Math.min(Math.max((rating - 900) / 1000, 0), 1);
  return 0.55 + 0.3 * t;
}

/**
 * A bot's answer for one pair. Bots are a launch-week fallback when no live player or recorded
 * ghost run is available, and are always labeled as bots in the UI.
 */
export function botAnswer(pair: Pair, rating: number, rng: Rng = Math.random): Answer {
  const right = correctSide(pair);
  const wrong = right === 'left' ? 'right' : 'left';
  const pick = rng() < botAccuracy(rating) ? right : wrong;
  // Answers land between 2.5s and 8s, a little faster at higher ratings.
  const speedup = botAccuracy(rating) - 0.55;
  const elapsedMs = Math.round(2500 + rng() * (5500 - speedup * 6000));
  return { pick, elapsedMs: Math.min(elapsedMs, ROUND_TIME_MS) };
}
