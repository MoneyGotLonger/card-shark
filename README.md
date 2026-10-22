# Card Shark

Head-to-head trading card price game. Two players see the same 6 pairs of cards and pick which is worth more (or less). Highest score wins, and wins and losses move you up a ranked ladder.

Built with React Native (Expo) and Supabase.

## Status: prototype

- Single-player match against a labeled bot, using an offline **sample** deck (placeholder prices).
- Game rules in `src/game/`: scoring with speed bonus, tie-break on total time, pair difficulty by rank tier, rank-tuned bots.
- Supabase schema (`supabase/migrations`) and the nightly Pokemon price import (`supabase/functions/import-prices`), not yet deployed.

## Run it

```bash
npm install
npm test          # game logic tests
npm run typecheck
npx expo start    # scan the QR code with Expo Go, or press w for web
```

## Next

1. Create a Supabase project, apply the migration, deploy and schedule `import-prices`.
2. Load real prices into the app in place of the sample deck.
3. Accounts, matchmaking, live 1v1 over Realtime, ghost runs, Glicko-2 ratings.
