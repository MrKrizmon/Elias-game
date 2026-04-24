import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Easing, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../utils/theme';
import { DEFAULT_WORDS } from '../data/words';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CIRC = 2 * Math.PI * 44;

export default function GameScreen({ route, navigation, customWords }) {
  const { teams: initTeams, time: roundTime, rounds: totalRounds, penalty } = route.params;

  const [phase, setPhase] = useState('turn-start'); // turn-start | playing | round-result | scoreboard | end
  const [teams, setTeams] = useState(initTeams);
  const [teamIdx, setTeamIdx] = useState(0);
  const [round, setRound] = useState(1);
  const [deck, setDeck] = useState(() => shuffle([...DEFAULT_WORDS, ...customWords]));
  const [deckIdx, setDeckIdx] = useState(0);
  const [guessed, setGuessed] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [timeLeft, setTimeLeft] = useState(roundTime);

  const timerRef = useRef(null);
  const animVal = useRef(new Animated.Value(0)).current;

  const currentTeam = teams[teamIdx];
  const currentWord = deck[deckIdx % deck.length];

  const endTurn = useCallback(() => {
    clearInterval(timerRef.current);
    setPhase('round-result');
  }, []);

  useEffect(() => {
    if (phase === 'playing') {
      setTimeLeft(roundTime);
      animVal.setValue(0);
      Animated.timing(animVal, {
        toValue: 1,
        duration: roundTime * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); endTurn(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, endTurn]);

  function beginTurn() {
    setGuessed([]);
    setSkipped([]);
    setTimeLeft(roundTime);
    setPhase('playing');
  }

  function advanceDeck() {
    const next = deckIdx + 1;
    if (next >= deck.length) {
      setDeck(shuffle([...DEFAULT_WORDS, ...customWords]));
      setDeckIdx(0);
    } else {
      setDeckIdx(next);
    }
  }

  function doGuess() {
    setGuessed(prev => [...prev, currentWord]);
    advanceDeck();
  }

  function doSkip() {
    setSkipped(prev => [...prev, currentWord]);
    advanceDeck();
  }

  function confirmRoundResult() {
    const pts = guessed.length - skipped.length * penalty;
    setTeams(prev => prev.map((t, i) => i === teamIdx ? { ...t, score: t.score + pts } : t));

    const nextTeamIdx = teamIdx + 1;
    if (nextTeamIdx >= teams.length) {
      // end of all teams this round
      setTeamIdx(0);
      setPhase('scoreboard');
    } else {
      setTeamIdx(nextTeamIdx);
      setPhase('turn-start');
    }
  }

  function continueFromScoreboard() {
    if (round >= totalRounds) {
      setPhase('end');
    } else {
      setRound(r => r + 1);
      setPhase('turn-start');
    }
  }

  const turnPts = guessed.length - skipped.length * penalty;
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // ── TURN START ──
  if (phase === 'turn-start') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <View style={s.turnCard}>
            <Text style={s.roundTag}>РАУНД {round} ИЗ {totalRounds}</Text>
            <Text style={s.turnTeamName}>{currentTeam.name}</Text>
            <Text style={s.turnHint}>Передайте телефон объясняющему</Text>
          </View>
          <View style={s.micCircle}>
            <Text style={{ fontSize: 32 }}>🎙</Text>
          </View>
          <TouchableOpacity style={s.bigBtn} onPress={beginTurn} activeOpacity={0.85}>
            <Text style={s.bigBtnTxt}>▶  Готов — поехали!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quitBtn} onPress={() => {
            Alert.alert('Выйти из игры?', 'Прогресс будет потерян.', [
              { text: 'Отмена', style: 'cancel' },
              { text: 'Выйти', style: 'destructive', onPress: () => navigation.navigate('Home') },
            ]);
          }}>
            <Text style={s.quitTxt}>Выйти из игры</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── PLAYING ──
  if (phase === 'playing') {
    const dashOffset = animVal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, CIRC],
    });
    const urgent = timeLeft <= 10;

    return (
      <SafeAreaView style={[s.safe, { backgroundColor: '#fff' }]}>
        <View style={s.playHeader}>
          <Text style={s.playInfo}>Раунд {round}/{totalRounds} · {currentTeam.name}</Text>
          <Text style={s.playPts}>{turnPts >= 0 ? '+' : ''}{turnPts} очков</Text>
        </View>

        {/* Timer */}
        <View style={s.timerWrap}>
          <View style={s.timerRing}>
            <Animated.View style={[s.timerArcBg]} />
            <Text style={[s.timerNum, urgent && { color: C.red }]}>{timeLeft}</Text>
          </View>
          {urgent && <Text style={{ color: C.red, fontWeight: '700', marginTop: 6, fontSize: 13 }}>Быстрее!</Text>}
        </View>

        {/* Word card */}
        <View style={[s.wordCard, urgent && { borderColor: C.red }]}>
          <Text style={s.wordMain}>{currentWord.w}</Text>
          <View style={s.catPill}><Text style={s.catPillTxt}>{currentWord.c}</Text></View>
        </View>

        {skipped.length > 0 && (
          <Text style={s.skipHint}>Пропущено {skipped.length} · −{skipped.length * penalty} очков</Text>
        )}

        {/* Actions */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.btnGuess} onPress={doGuess} activeOpacity={0.85}>
            <Text style={s.btnGuessTxt}>✓  Угадали!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSkip} onPress={doSkip} activeOpacity={0.85}>
            <Text style={s.btnSkipTxt}>Пропуск</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── ROUND RESULT ──
  if (phase === 'round-result') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.topbar2}>
          <Text style={s.topbar2Title}>Результат хода</Text>
          <Text style={s.topbar2Sub}>{currentTeam.name}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={s.statsRow}>
            <View style={[s.statBox, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[s.statNum, { color: '#166534' }]}>{guessed.length}</Text>
              <Text style={[s.statLbl, { color: '#16A34A' }]}>УГАДАНО</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: '#F7F7F7' }]}>
              <Text style={[s.statNum, { color: '#555' }]}>{skipped.length}</Text>
              <Text style={[s.statLbl, { color: '#999' }]}>ПРОПУЩЕНО</Text>
            </View>
            <View style={[s.statBox, { backgroundColor: C.purpleLight }]}>
              <Text style={[s.statNum, { color: C.purpleDark }]}>{turnPts >= 0 ? '+' : ''}{turnPts}</Text>
              <Text style={[s.statLbl, { color: C.purple }]}>ОЧКОВ</Text>
            </View>
          </View>

          <View style={s.logBox}>
            {guessed.map((w, i) => (
              <View style={s.logRow} key={'g' + i}>
                <Text style={s.logWordOk}>{w.w}</Text>
                <View style={s.badgeOk}><Text style={s.badgeOkTxt}>+1</Text></View>
              </View>
            ))}
            {skipped.map((w, i) => (
              <View style={s.logRow} key={'s' + i}>
                <Text style={s.logWordSk}>{w.w}</Text>
                <View style={s.badgeSk}><Text style={s.badgeSkTxt}>−{penalty}</Text></View>
              </View>
            ))}
            {guessed.length === 0 && skipped.length === 0 && (
              <Text style={{ textAlign: 'center', color: '#BBB', padding: 16, fontSize: 14 }}>Ни одного слова</Text>
            )}
          </View>

          <TouchableOpacity style={s.bigBtn} onPress={confirmRoundResult} activeOpacity={0.85}>
            <Text style={s.bigBtnTxt}>Следующий ход →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SCOREBOARD ──
  if (phase === 'scoreboard') {
    const isEnd = round >= totalRounds;
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.topbar2}>
          <Text style={s.topbar2Title}>Счёт</Text>
          <Text style={s.topbar2Sub}>{isEnd ? 'Финал' : `После раунда ${round}`}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={s.scoreTable}>
            <View style={[s.scoreRow, { marginBottom: 8 }]}>
              <Text style={s.scoreTh}>#</Text>
              <Text style={[s.scoreTh, { flex: 1 }]}>Команда</Text>
              <Text style={s.scoreTh}>Очки</Text>
            </View>
            {sortedTeams.map((t, i) => (
              <View style={[s.scoreRow, i === 0 && s.scoreRowLead]} key={t.name}>
                <Text style={[s.scoreTd, { color: '#BBB', width: 24 }]}>{i + 1}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[s.scoreDot, { backgroundColor: t.color }]} />
                  <Text style={[s.scoreTd, i === 0 && { color: C.purple }]}>{t.name}</Text>
                </View>
                <Text style={[s.scoreNum, i === 0 && { color: C.purple }]}>{t.score}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.bigBtn} onPress={continueFromScoreboard} activeOpacity={0.85}>
            <Text style={s.bigBtnTxt}>{isEnd ? 'Завершить игру →' : 'Продолжить →'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── END ──
  if (phase === 'end') {
    const winner = sortedTeams[0];
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 32 }}>
          <View style={s.winnerCard}>
            <Text style={{ fontSize: 52, textAlign: 'center', marginBottom: 12 }}>🏆</Text>
            <Text style={s.winnerTitle}>{winner.name} победила!</Text>
            <Text style={s.winnerSub}>{winner.score} очков · {totalRounds} раундов</Text>
          </View>
          <View style={s.scoreTable}>
            {sortedTeams.map((t, i) => (
              <View style={[s.scoreRow, i === 0 && s.scoreRowLead]} key={t.name}>
                <Text style={[s.scoreTd, { color: '#BBB', width: 24 }]}>{i + 1}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[s.scoreDot, { backgroundColor: t.color }]} />
                  <Text style={[s.scoreTd, i === 0 && { color: C.purple }]}>{t.name}</Text>
                </View>
                <Text style={[s.scoreNum, i === 0 && { color: C.purple }]}>{t.score}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.bigBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
            <Text style={s.bigBtnTxt}>Сыграть ещё раз</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.bigBtn, s.bigBtnSecondary, { marginTop: 10 }]}
            onPress={() => navigation.navigate('Setup')} activeOpacity={0.85}>
            <Text style={[s.bigBtnTxt, { color: C.purple }]}>Настроить новую игру</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  turnCard: {
    width: '100%', backgroundColor: C.purpleLight,
    borderRadius: 22, padding: 28, marginBottom: 28, alignItems: 'center',
  },
  roundTag: { fontSize: 12, fontWeight: '700', color: '#8884CC', letterSpacing: 0.5, marginBottom: 8 },
  turnTeamName: { fontSize: 30, fontWeight: '700', color: C.purpleDark, letterSpacing: -0.5 },
  turnHint: { fontSize: 14, color: C.purpleMid || '#8884CC', marginTop: 6 },
  micCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  bigBtn: {
    width: '100%', backgroundColor: C.purple,
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
  },
  bigBtnSecondary: { backgroundColor: C.purpleLight, borderWidth: 1, borderColor: '#DDD9FC' },
  bigBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  quitBtn: { marginTop: 16 },
  quitTxt: { fontSize: 14, color: '#BBB' },

  topbar2: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  topbar2Title: { fontSize: 18, fontWeight: '700', color: '#111' },
  topbar2Sub: { fontSize: 14, color: '#888' },

  playHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  playInfo: { fontSize: 13, color: '#888' },
  playPts: { fontSize: 14, fontWeight: '700', color: C.purple },
  timerWrap: { alignItems: 'center', marginBottom: 16 },
  timerRing: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#F7F7F7', borderWidth: 6, borderColor: '#EFEFEF',
    alignItems: 'center', justifyContent: 'center',
  },
  timerNum: { fontSize: 38, fontWeight: '700', color: '#111' },
  wordCard: {
    marginHorizontal: 20, borderRadius: 24,
    borderWidth: 2, borderColor: '#EEEEEE',
    paddingVertical: 40, paddingHorizontal: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  wordMain: { fontSize: 36, fontWeight: '700', color: '#111', letterSpacing: -1 },
  catPill: {
    marginTop: 12, backgroundColor: C.purpleLight,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
  },
  catPillTxt: { fontSize: 12, fontWeight: '600', color: C.purple },
  skipHint: { textAlign: 'center', fontSize: 13, color: '#BBB', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 4 },
  btnGuess: {
    flex: 2, backgroundColor: '#1D9E75',
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
  },
  btnGuessTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnSkip: {
    flex: 1, backgroundColor: '#F7F7F7',
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  btnSkipTxt: { color: '#666', fontSize: 16, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 30, fontWeight: '700' },
  statLbl: { fontSize: 10, fontWeight: '700', marginTop: 4, letterSpacing: 0.3 },
  logBox: {
    borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 14,
    overflow: 'hidden', marginBottom: 16,
  },
  logRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#F8F8F8',
  },
  logWordOk: { fontSize: 14, color: '#166534', fontWeight: '500' },
  logWordSk: { fontSize: 14, color: '#AAA', textDecorationLine: 'line-through' },
  badgeOk: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeOkTxt: { fontSize: 12, fontWeight: '700', color: '#166534' },
  badgeSk: { backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeSkTxt: { fontSize: 12, fontWeight: '700', color: '#AAA' },

  scoreTable: { marginBottom: 20 },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F4F4F4',
  },
  scoreRowLead: {},
  scoreTh: { fontSize: 11, fontWeight: '700', color: '#BBB', textTransform: 'uppercase', letterSpacing: 0.6 },
  scoreTd: { fontSize: 15, color: '#222' },
  scoreDot: { width: 11, height: 11, borderRadius: 6 },
  scoreNum: { fontSize: 20, fontWeight: '700', color: '#222' },

  winnerCard: {
    backgroundColor: C.purple, borderRadius: 24,
    padding: 32, marginBottom: 20,
  },
  winnerTitle: { fontSize: 26, fontWeight: '700', color: '#fff', textAlign: 'center', letterSpacing: -0.5 },
  winnerSub: { fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 6 },

  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
});
