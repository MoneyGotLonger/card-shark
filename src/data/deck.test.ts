import { describe, expect, it } from 'vitest';
import { loadDeck, toCard } from './deck';
import { SAMPLE_CARDS } from './sampleCards';

describe('deck', () => {
  it('maps card_deck rows to cards', () => {
    expect(
      toCard({
        id: 'pokemon:sv3pt5-205',
        game: 'pokemon',
        name: 'Mew ex',
        set_name: '151',
        number: '205',
        image_url: null,
        price_cents: 2400,
        price_date: '2026-10-22',
      }),
    ).toEqual({
      id: 'pokemon:sv3pt5-205',
      game: 'pokemon',
      name: 'Mew ex',
      setName: '151',
      number: '205',
      imageUrl: undefined,
      priceCents: 2400,
      priceDate: '2026-10-22',
    });
  });

  it('uses the sample deck when Supabase is not configured', async () => {
    expect(await loadDeck()).toEqual({ cards: SAMPLE_CARDS, source: 'sample' });
  });
});
