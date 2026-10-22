import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { botAnswer } from '../game/bot';
import { ROUND_TIME_MS, scoreRound } from '../game/scoring';
import type { Pair, RoundResult } from '../game/types';
import { colors } from '../theme';

type Props = {
  pairs: Pair[];
  opponentRating: number;
  onDone: (mine: RoundResult[], theirs: RoundResult[]) => void;
};

export function MatchScreen({ pairs, opponentRating, onDone }: Props) {
  const [round, setRound] = useState(0);
  const [remaining, setRemaining] = useState(ROUND_TIME_MS);
  const startedAt = useRef(Date.now());
  const mine = useRef<RoundResult[]>([]);
  const theirs = useRef<RoundResult[]>([]);
  const pair = pairs[round];

  const answer = (pick: 'left' | 'right' | null) => {
    // Ignore a second tap (or the timer) once this round is answered.
    if (mine.current.length > round) return;
    const elapsedMs = Math.min(Date.now() - startedAt.current, ROUND_TIME_MS);
    mine.current.push(scoreRound(pair, { pick, elapsedMs }));
    theirs.current.push(scoreRound(pair, botAnswer(pair, opponentRating)));
    if (round + 1 >= pairs.length) {
      onDone(mine.current, theirs.current);
      return;
    }
    startedAt.current = Date.now();
    setRemaining(ROUND_TIME_MS);
    setRound(round + 1);
  };

  useEffect(() => {
    const id = setInterval(() => {
      const left = ROUND_TIME_MS - (Date.now() - startedAt.current);
      if (left <= 0) {
        clearInterval(id);
        answer(null);
      } else {
        setRemaining(left);
      }
    }, 100);
    return () => clearInterval(id);
    // Restart the timer each round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  return (
    <View style={styles.container}>
      <Text style={styles.round}>
        Round {round + 1} of {pairs.length}
      </Text>
      <View style={styles.timerTrack}>
        <View style={[styles.timerFill, { width: `${(remaining / ROUND_TIME_MS) * 100}%` }]} />
      </View>
      <Text style={styles.prompt}>
        Which is worth <Text style={styles.promptWord}>{pair.prompt === 'higher' ? 'MORE' : 'LESS'}</Text>?
      </Text>
      <View style={styles.cards}>
        {(['left', 'right'] as const).map((side) => {
          const c = pair[side];
          return (
            <Pressable key={side} style={styles.card} onPress={() => answer(side)}>
              <Text style={styles.cardName}>{c.name}</Text>
              <Text style={styles.cardSet}>{c.setName}</Text>
              <Text style={styles.cardSet}>#{c.number}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.opponent}>Opponent: Bot · scores revealed after round {pairs.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: colors.bg },
  round: { color: colors.muted, fontSize: 16, textAlign: 'center' },
  timerTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surface, marginVertical: 16, overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: colors.accent },
  prompt: { color: colors.text, fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  promptWord: { color: colors.accent, fontWeight: '800' },
  cards: { flexDirection: 'row', gap: 12, flex: 1, maxHeight: 320 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardName: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  cardSet: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  opponent: { color: colors.muted, textAlign: 'center', marginTop: 24 },
});
