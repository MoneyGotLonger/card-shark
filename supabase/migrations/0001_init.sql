-- Card Shark core schema: cards, nightly price snapshots, players, matches.

create table cards (
  id text primary key,                -- provider id, e.g. 'pokemon:sv3pt5-205'
  game text not null check (game in ('pokemon', 'one-piece')),
  name text not null,
  set_name text not null,
  number text not null,
  image_url text,
  updated_at timestamptz not null default now()
);

-- One row per card per day. Matches always read the latest snapshot, so both players see
-- the same price and the game never calls a price API mid-match.
create table price_snapshots (
  card_id text not null references cards (id) on delete cascade,
  price_date date not null,
  price_cents integer not null check (price_cents > 0),
  source text not null,               -- 'pokemontcg.io', 'tcgpricelookup', ...
  primary key (card_id, price_date)
);

create view latest_prices as
select distinct on (card_id) card_id, price_date, price_cents, source
from price_snapshots
order by card_id, price_date desc;

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  -- Glicko-2 rating state.
  rating double precision not null default 1000,
  rating_deviation double precision not null default 350,
  volatility double precision not null default 0.06,
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now()
);

create type opponent_kind as enum ('live', 'ghost', 'bot');

create table matches (
  id uuid primary key default gen_random_uuid(),
  game text not null,
  player_a uuid not null references profiles (id) on delete cascade,
  player_b uuid references profiles (id) on delete set null, -- null for bots
  opponent_kind opponent_kind not null,
  ghost_of uuid references matches (id),                      -- recorded run being replayed
  status text not null default 'active' check (status in ('active', 'finished', 'abandoned')),
  winner uuid references profiles (id),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Prices are copied in at match creation so later snapshots can't change a result.
create table match_rounds (
  match_id uuid not null references matches (id) on delete cascade,
  round smallint not null check (round between 1 and 6),
  left_card text not null references cards (id),
  right_card text not null references cards (id),
  left_price_cents integer not null,
  right_price_cents integer not null,
  prompt text not null check (prompt in ('higher', 'lower')),
  primary key (match_id, round)
);

create table match_answers (
  match_id uuid not null,
  round smallint not null,
  player uuid,                        -- null = bot
  pick text check (pick in ('left', 'right')),
  elapsed_ms integer not null,
  points integer not null,
  primary key (match_id, round, player),
  foreign key (match_id, round) references match_rounds (match_id, round) on delete cascade
);

-- Clients read the public card catalog and their own data; all writes to matches and
-- answers go through Edge Functions using the service role, so scores can't be forged.
alter table cards enable row level security;
alter table price_snapshots enable row level security;
alter table profiles enable row level security;
alter table matches enable row level security;
alter table match_rounds enable row level security;
alter table match_answers enable row level security;

create policy "cards are public" on cards for select using (true);
create policy "profiles are public" on profiles for select using (true);
create policy "own profile name" on profiles for update using (auth.uid() = id);
create policy "own matches" on matches for select using (auth.uid() in (player_a, player_b));
create policy "rounds of own matches" on match_rounds for select using (
  exists (select 1 from matches m where m.id = match_id and auth.uid() in (m.player_a, m.player_b))
);
-- price_snapshots and match_answers have no client policies: prices are revealed by the
-- server only after both players answer.
