import { ROUNDS_PER_MATCH } from './scoring';
import { pairRatioRange } from './tiers';
import type { Card, Pair } from './types';

export type Rng = () => number;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function ratio(a: Card, b: Card): number {
  const hi = Math.max(a.priceCents, b.priceCents);
  const lo = Math.min(a.priceCents, b.priceCents);
  return hi / lo;
}

/**
 * Builds a match's pairs from one game's cards. Every pair's price gap fits the rating's
 * difficulty band, no card repeats, and the "higher/lower" prompt is random.
 * Falls back to the widest-gap pairs left if the pool can't fill the band.
 */
export function buildPairs(cards: Card[], rating: number, rng: Rng = Math.random): Pair[] {
  const { min, max } = pairRatioRange(rating);
  const pool = shuffle(
    cards.filter((c) => c.priceCents > 0),
    rng,
  );
  const used = new Set<string>();
  const pairs: Pair[] = [];

  const take = (accept: (r: number) => boolean) => {
    for (const a of pool) {
      if (pairs.length >= ROUNDS_PER_MATCH) return;
      if (used.has(a.id)) continue;
      const b = pool.find((c) => !used.has(c.id) && c.id !== a.id && accept(ratio(a, c)));
      if (!b) continue;
      used.add(a.id);
      used.add(b.id);
      const [left, right] = rng() < 0.5 ? [a, b] : [b, a];
      pairs.push({ left, right, prompt: rng() < 0.5 ? 'higher' : 'lower' });
    }
  };

  take((r) => r >= min && r <= max);
  // Never pair two cards at the same price: the answer would be a coin flip.
  take((r) => r > 1.05);
  return pairs;
}
