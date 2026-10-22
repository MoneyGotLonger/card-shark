import { describe, expect, it } from 'vitest';
import { SAMPLE_CARDS } from '../data/sampleCards';
import { botAccuracy, botAnswer } from './bot';
import { buildPairs } from './pairs';
import { correctSide, ROUNDS_PER_MATCH, scoreRound, totals, winner } from './scoring';
import { tierFor } from './tiers';
import type { Card, Pair } from './types';

const card = (id: string, priceCents: number): Card => ({
  id,
  game: 'pokemon',
  name: id,
  setName: 'Test',
  number: '1',
  priceCents,
  priceDate: '2026-10-22',
});

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

const pair: Pair = { left: card('a', 500), right: card('b', 100), prompt: 'higher' };

describe('scoring', () => {
  it('finds the correct side for both prompts', () => {
    expect(correctSide(pair)).toBe('left');
    expect(correctSide({ ...pair, prompt: 'lower' })).toBe('right');
  });

  it('gives 150 for an instant correct answer and 100 at the buzzer', () => {
    expect(scoreRound(pair, { pick: 'left', elapsedMs: 0 }).points).toBe(150);
    expect(scoreRound(pair, { pick: 'left', elapsedMs: 10_000 }).points).toBe(100);
  });

  it('gives 0 for wrong or timed-out answers', () => {
    expect(scoreRound(pair, { pick: 'right', elapsedMs: 100 }).points).toBe(0);
    expect(scoreRound(pair, { pick: null, elapsedMs: 10_000 }).points).toBe(0);
  });

  it('breaks ties on points by total time', () => {
    expect(winner({ points: 300, correct: 3, totalMs: 9000 }, { points: 300, correct: 3, totalMs: 12000 })).toBe('a');
    expect(winner({ points: 200, correct: 2, totalMs: 1000 }, { points: 300, correct: 3, totalMs: 12000 })).toBe('b');
    expect(winner({ points: 0, correct: 0, totalMs: 60000 }, { points: 0, correct: 0, totalMs: 60000 })).toBe('draw');
  });

  it('sums results', () => {
    const r = [scoreRound(pair, { pick: 'left', elapsedMs: 5000 }), scoreRound(pair, { pick: 'right', elapsedMs: 2000 })];
    expect(totals(r)).toEqual({ points: 125, correct: 1, totalMs: 7000 });
  });
});

describe('pairs', () => {
  it('builds 6 pairs with no repeated card and no equal prices', () => {
    for (const rating of [900, 1200, 1400, 1600, 1800, 2000]) {
      const pairs = buildPairs(SAMPLE_CARDS, rating, seeded(rating));
      expect(pairs).toHaveLength(ROUNDS_PER_MATCH);
      const ids = pairs.flatMap((p) => [p.left.id, p.right.id]);
      expect(new Set(ids).size).toBe(ids.length);
      for (const p of pairs) expect(p.left.priceCents).not.toBe(p.right.priceCents);
    }
  });

  it('gives easy pairs at low ratings', () => {
    const pairs = buildPairs(SAMPLE_CARDS, 900, seeded(1));
    for (const p of pairs) {
      const hi = Math.max(p.left.priceCents, p.right.priceCents);
      const lo = Math.min(p.left.priceCents, p.right.priceCents);
      expect(hi / lo).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('tiers and bots', () => {
  it('maps ratings to tiers', () => {
    expect(tierFor(1000)).toBe('Common');
    expect(tierFor(1500)).toBe('Holo Rare');
    expect(tierFor(2100)).toBe('Secret Rare');
  });

  it('scales bot accuracy from 55% to 85%', () => {
    expect(botAccuracy(800)).toBeCloseTo(0.55);
    expect(botAccuracy(2500)).toBeCloseTo(0.85);
  });

  it('bots answer within the time limit and hit roughly their accuracy', () => {
    const rng = seeded(42);
    let right = 0;
    for (let i = 0; i < 2000; i++) {
      const a = botAnswer(pair, 1900, rng);
      expect(a.elapsedMs).toBeLessThanOrEqual(10_000);
      if (a.pick === 'left') right++;
    }
    expect(right / 2000).toBeGreaterThan(0.8);
    expect(right / 2000).toBeLessThan(0.9);
  });
});
