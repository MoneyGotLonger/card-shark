export type CardGame = 'pokemon' | 'one-piece';

export type Card = {
  id: string;
  game: CardGame;
  name: string;
  setName: string;
  number: string;
  imageUrl?: string;
  /** Market price in US cents, from the nightly snapshot. */
  priceCents: number;
  priceDate: string;
};

export type Prompt = 'higher' | 'lower';

export type Pair = {
  left: Card;
  right: Card;
  prompt: Prompt;
};

export type Answer = {
  /** Which side the player picked, or null if time ran out. */
  pick: 'left' | 'right' | null;
  elapsedMs: number;
};

export type RoundResult = {
  pair: Pair;
  answer: Answer;
  correct: boolean;
  points: number;
};
