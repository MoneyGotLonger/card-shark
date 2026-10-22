-- Interim deck for the single-player prototype: the app fetches a random set of priced
-- cards so it can play against a bot offline. price_snapshots stays closed to clients; this
-- function exposes only the latest price per card. Live 1v1 matches will deal and score on
-- the server instead, so players never see prices before answering.
create function card_deck(p_game text default 'pokemon', p_limit integer default 200)
returns table (
  id text,
  game text,
  name text,
  set_name text,
  number text,
  image_url text,
  price_cents integer,
  price_date date
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.game, c.name, c.set_name, c.number, c.image_url, p.price_cents, p.price_date
  from cards c
  join latest_prices p on p.card_id = c.id
  where c.game = p_game and c.image_url is not null
  order by random()
  limit least(greatest(p_limit, 12), 500);
$$;

revoke all on function card_deck(text, integer) from public;
grant execute on function card_deck(text, integer) to anon, authenticated;
