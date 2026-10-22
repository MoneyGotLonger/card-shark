import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { totals, winner } from '../game/scoring';
import type { RoundResult } from '../game/types';
import { colors } from '../theme';

type Props = {
  mine: RoundResult[];
  theirs: RoundResult[];
  onPlayAgain: () => void;
};

const dollars = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function ResultsScreen({ mine, theirs, onPlayAgain }: Props) {
  const me = totals(mine);
  const them = totals(theirs);
  const result = winner(me, them);
  const headline = result === 'a' ? 'You win!' : result === 'b' ? 'Bot wins' : 'Draw';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.headline}>{headline}</Text>
      <View style={styles.scoreRow}>
        <Score label="You" points={me.points} correct={me.correct} />
        <Score label="Bot" points={them.points} correct={them.correct} />
      </View>
      {mine.map((r, i) => {
        const { left, right, prompt } = r.pair;
        return (
          <View key={i} style={styles.roundRow}>
            <Text style={[styles.mark, { color: r.correct ? colors.good : colors.bad }]}>{r.correct ? '✓' : '✗'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.roundText}>
                {left.name} {dollars(left.priceCents)} vs {right.name} {dollars(right.priceCents)}
              </Text>
              <Text style={styles.roundSub}>
                Asked: worth {prompt === 'higher' ? 'more' : 'less'} · +{r.points} pts
              </Text>
            </View>
          </View>
        );
      })}
      <Text style={styles.priceDate}>Prices as of {mine[0]?.pair.left.priceDate}</Text>
      <Pressable style={styles.button} onPress={onPlayAgain}>
        <Text style={styles.buttonText}>Play again</Text>
      </Pressable>
    </ScrollView>
  );
}

function Score({ label, points, correct }: { label: string; points: number; correct: number }) {
  return (
    <View style={styles.score}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scorePoints}>{points}</Text>
      <Text style={styles.scoreLabel}>{correct}/6 correct</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: colors.bg },
  container: { padding: 20, paddingTop: 60 },
  headline: { color: colors.text, fontSize: 36, fontWeight: '800', textAlign: 'center' },
  scoreRow: { flexDirection: 'row', gap: 12, marginVertical: 24 },
  score: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center' },
  scoreLabel: { color: colors.muted, fontSize: 14 },
  scorePoints: { color: colors.text, fontSize: 40, fontWeight: '800' },
  roundRow: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border },
  mark: { fontSize: 22, fontWeight: '800', width: 24 },
  roundText: { color: colors.text, fontSize: 15 },
  roundSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  priceDate: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 16 },
  button: { backgroundColor: colors.accent, borderRadius: 14, padding: 16, marginTop: 24, alignItems: 'center' },
  buttonText: { color: colors.bg, fontSize: 18, fontWeight: '800' },
});
