# Card Shark

Head-to-head trading card price game. Two players see the same 6 pairs of cards and pick which is worth more (or less). Highest score wins, and wins and losses move you up a ranked ladder.

Built with React Native (Expo) and Supabase.

## Status: prototype

- Single-player match against a labeled bot. Cards and prices come from Supabase (`card_deck`), falling back to an offline **sample** deck (placeholder prices) when Supabase isn't configured.
- Game rules in `src/game/`: scoring with speed bonus, tie-break on total time, pair difficulty by rank tier, rank-tuned bots.
- Supabase schema (`supabase/migrations`) and the nightly Pokemon price import (`supabase/functions/import-prices`).

## Supabase setup

With `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` set (and optionally `POKEMONTCG_API_KEY`):

```bash
scripts/setup-supabase.sh
```

It applies the migrations, deploys `import-prices`, schedules it nightly at 07:00 UTC with Supabase Cron, runs the first import, and prints the two `EXPO_PUBLIC_SUPABASE_*` values to put in `.env.local` (see `.env.example`).

## Run it

```bash
npm install
npm test          # game logic tests
npm run typecheck
npx expo start    # scan the QR code with Expo Go (SDK 57), or press w for web
```

## Next

1. Accounts, matchmaking, live 1v1 over Realtime, ghost runs, Glicko-2 ratings.
