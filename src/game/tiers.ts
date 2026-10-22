export type Tier = 'Common' | 'Uncommon' | 'Rare' | 'Holo Rare' | 'Ultra Rare' | 'Secret Rare';

const TIERS: { tier: Tier; min: number }[] = [
  { tier: 'Secret Rare', min: 1900 },
  { tier: 'Ultra Rare', min: 1700 },
  { tier: 'Holo Rare', min: 1500 },
  { tier: 'Rare', min: 1300 },
  { tier: 'Uncommon', min: 1100 },
  { tier: 'Common', min: -Infinity },
];

export function tierFor(rating: number): Tier {
  return TIERS.find((t) => rating >= t.min)!.tier;
}

/**
 * How close in price the two cards of a pair may be, as max/min ratio.
 * Low ranks get easy pairs (one card worth 3x+ the other); top ranks get pairs within ~15%.
 */
export function pairRatioRange(rating: number): { min: number; max: number } {
  switch (tierFor(rating)) {
    case 'Common':
      return { min: 3, max: 50 };
    case 'Uncommon':
      return { min: 2, max: 6 };
    case 'Rare':
      return { min: 1.5, max: 3 };
    case 'Holo Rare':
      return { min: 1.3, max: 2 };
    case 'Ultra Rare':
      return { min: 1.2, max: 1.5 };
    case 'Secret Rare':
      return { min: 1.1, max: 1.3 };
  }
}
