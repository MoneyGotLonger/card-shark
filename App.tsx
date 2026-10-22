import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SAMPLE_CARDS } from './src/data/sampleCards';
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
  const startMatch = () => setScreen({ name: 'match', pairs: buildPairs(SAMPLE_CARDS, PLAYER_RATING) });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {screen.name === 'home' && (
        <View style={styles.home}>
          <Text style={styles.title}>Card Shark</Text>
          <Text style={styles.tagline}>Know the market. Beat your rival.</Text>
          <Text style={styles.rank}>Rank: {tierFor(PLAYER_RATING)}</Text>
          <Pressable style={styles.button} onPress={startMatch}>
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>
          <Text style={styles.banner}>Prototype · sample prices, not real market data</Text>
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
  buttonText: { color: colors.bg, fontSize: 20, fontWeight: '800' },
  banner: { color: colors.muted, fontSize: 12, position: 'absolute', bottom: 40 },
});
