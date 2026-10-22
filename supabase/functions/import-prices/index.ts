// Nightly job: pulls Pokemon card prices from pokemontcg.io into cards + price_snapshots.
// Schedule with Supabase Cron. Needs POKEMONTCG_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from 'npm:@supabase/supabase-js@2';

const API = 'https://api.pokemontcg.io/v2/cards';
const PAGE_SIZE = 250;
const MAX_PAGES = 40; // ~10,000 cards
const MIN_PRICE_CENTS = 25; // skip bulk cards whose prices are mostly noise

type ApiCard = {
  id: string;
  name: string;
  number: string;
  set: { name: string };
  images?: { small?: string };
  tcgplayer?: { updatedAt?: string; prices?: Record<string, { market?: number | null }> };
};

/** Uses the highest TCGplayer market price across printings (normal, holofoil, ...). */
function marketCents(card: ApiCard): number | null {
  const prices = Object.values(card.tcgplayer?.prices ?? {})
    .map((p) => p.market)
    .filter((m): m is number => typeof m === 'number' && m > 0);
  return prices.length ? Math.round(Math.max(...prices) * 100) : null;
}

Deno.serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const headers = { 'X-Api-Key': Deno.env.get('POKEMONTCG_API_KEY') ?? '' };
  const today = new Date().toISOString().slice(0, 10);
  let imported = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const q = encodeURIComponent('tcgplayer.prices.holofoil.market:[1 TO *] OR tcgplayer.prices.normal.market:[1 TO *]');
    const url = `${API}?page=${page}&pageSize=${PAGE_SIZE}&q=${q}&orderBy=-set.releaseDate`;
    const res = await fetch(url, { headers });
    if (!res.ok) return new Response(`pokemontcg.io ${res.status} on page ${page}`, { status: 502 });
    const { data } = (await res.json()) as { data: ApiCard[] };
    if (!data.length) break;

    const priced = data
      .map((c) => ({ c, cents: marketCents(c) }))
      .filter((x): x is { c: ApiCard; cents: number } => x.cents !== null && x.cents >= MIN_PRICE_CENTS);

    const { error: cardErr } = await supabase.from('cards').upsert(
      priced.map(({ c }) => ({
        id: `pokemon:${c.id}`,
        game: 'pokemon',
        name: c.name,
        set_name: c.set.name,
        number: c.number,
        image_url: c.images?.small ?? null,
        updated_at: new Date().toISOString(),
      })),
    );
    if (cardErr) return new Response(cardErr.message, { status: 500 });

    const { error: priceErr } = await supabase.from('price_snapshots').upsert(
      priced.map(({ c, cents }) => ({
        card_id: `pokemon:${c.id}`,
        price_date: today,
        price_cents: cents,
        source: 'pokemontcg.io',
      })),
    );
    if (priceErr) return new Response(priceErr.message, { status: 500 });

    imported += priced.length;
    if (data.length < PAGE_SIZE) break;
  }

  return Response.json({ imported, price_date: today });
});
