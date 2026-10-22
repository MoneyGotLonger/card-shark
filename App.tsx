import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { type Deck, loadDeck } from './src/data/deck';
import { buildPairs } from './src/game/pairs';
import { tierFor } from './src/game/tiers';
import type { Pair, RoundResult } from './src/game/types';
import { MatchScreen } from './src/screens/MatchScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { colors } from './src/theme';

// Prototype: no accounts yet, so every player starts at the Common rating.
const PLAYER_RATING = 1000;

type Screen =
  | { name: 'home' }
  | { name: 'match'; pairs: Pair[] }
  | { name: 'results'; mine: RoundResult[]; theirs: RoundResult[] };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [deck, setDeck] = useState<Deck | null>(null);
  useEffect(() => {
    loadDeck().then(setDeck);
  }, []);

  // Reload in the background after each match so the next one draws fresh cards.
  const startMatch = () => {
    if (!deck) return;
    setScreen({ name: 'match', pairs: buildPairs(deck.cards, PLAYER_RATING) });
    if (deck.source === 'live') loadDeck().then(setDeck);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {screen.name === 'home' && (
        <View style={styles.home}>
          <Text style={styles.title}>Card Shark</Text>
          <Text style={styles.tagline}>Know the market. Beat your rival.</Text>
          <Text style={styles.rank}>Rank: {tierFor(PLAYER_RATING)}</Text>
          <Pressable style={[styles.button, !deck && styles.buttonDisabled]} onPress={startMatch} disabled={!deck}>
            {deck ? <Text style={styles.buttonText}>Play</Text> : <ActivityIndicator color={colors.bg} />}
          </Pressable>
          {deck?.source === 'sample' && <Text style={styles.banner}>Prototype · sample prices, not real market data</Text>}
          {deck?.source === 'live' && <Text style={styles.banner}>TCGplayer market prices via pokemontcg.io</Text>}
        </View>
      )}
      {screen.name === 'match' && (
        <MatchScreen
          pairs={screen.pairs}
          opponentRating={PLAYER_RATING}
          onDone={(mine, theirs) => setScreen({ name: 'results', mine, theirs })}
        />
      )}
      {screen.name === 'results' && <ResultsScreen mine={screen.mine} theirs={screen.theirs} onPlayAgain={startMatch} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  home: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: colors.text, fontSize: 48, fontWeight: '900' },
  tagline: { color: colors.muted, fontSize: 16, marginTop: 8 },
  rank: { color: colors.accent, fontSize: 18, fontWeight: '700', marginTop: 32 },
  button: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 64, marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.bg, fontSize: 20, fontWeight: '800' },
  banner: { color: colors.muted, fontSize: 12, position: 'absolute', bottom: 40 },
});
