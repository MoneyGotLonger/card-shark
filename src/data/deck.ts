import type { Card, CardGame } from '../game/types';
import { SAMPLE_CARDS } from './sampleCards';

export type Deck = { cards: Card[]; source: 'live' | 'sample' };

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const DECK_SIZE = 200;
// A match needs 12 distinct cards; ask for more so pairs can fit the rank's difficulty band.
const MIN_LIVE_CARDS = 24;

type DeckRow = {
  id: string;
  game: CardGame;
  name: string;
  set_name: string;
  number: string;
  image_url: string | null;
  price_cents: number;
  price_date: string;
};

export function toCard(row: DeckRow): Card {
  return {
    id: row.id,
    game: row.game,
    name: row.name,
    setName: row.set_name,
    number: row.number,
    imageUrl: row.image_url ?? undefined,
    priceCents: row.price_cents,
    priceDate: row.price_date,
  };
}

/**
 * Real cards with their latest nightly price, from Supabase's card_deck function. Falls back
 * to the offline sample deck when Supabase isn't configured, is unreachable, or has too few
 * priced cards, so the game always plays.
 */
export async function loadDeck(game: CardGame = 'pokemon'): Promise<Deck> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { cards: SAMPLE_CARDS, source: 'sample' };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/card_deck`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_game: game, p_limit: DECK_SIZE }),
    });
    if (!res.ok) throw new Error(`card_deck ${res.status}`);
    const cards = ((await res.json()) as DeckRow[]).map(toCard);
    if (cards.length < MIN_LIVE_CARDS) throw new Error(`only ${cards.length} priced cards`);
    return { cards, source: 'live' };
  } catch (err) {
    console.warn('Using sample deck:', err);
    return { cards: SAMPLE_CARDS, source: 'sample' };
  }
}
