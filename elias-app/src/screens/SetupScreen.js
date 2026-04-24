import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../utils/theme';
import { TEAM_COLORS } from '../data/words';

export default function SetupScreen({ navigation, onStartGame }) {
  const [teams, setTeams] = useState([{ name: 'Команда 1' }, { name: 'Команда 2' }]);
  const [time, setTime] = useState(60);
  const [rounds, setRounds] = useState(3);
  const [penalty, setPenalty] = useState(1);

  function updateName(i, val) {
    setTeams(prev => prev.map((t, idx) => idx === i ? { ...t, name: val } : t));
  }
  function addTeam() {
    if (teams.length < 6) setTeams(prev => [...prev, { name: `Команда ${prev.length + 1}` }]);
  }
  function removeTeam(i) {
    if (teams.length > 2) setTeams(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleStart() {
    const names = teams.map(t => t.name.trim()).filter(Boolean);
    if (names.length < 2) { Alert.alert('Нужно минимум 2 команды'); return; }
    onStartGame({ teams: names.map((n, i) => ({ name: n, score: 0, color: TEAM_COLORS[i % TEAM_COLORS.length] })), time, rounds, penalty });
  }

  const Stepper = ({ val, onMinus, onPlus, label, hint }) => (
    <View style={s.paramRow}>
      <View>
        <Text style={s.paramLabel}>{label}</Text>
        {hint ? <Text style={s.paramHint}>{hint}</Text> : null}
      </View>
      <View style={s.stepper}>
        <TouchableOpacity style={s.stepBtn} onPress={onMinus} activeOpacity={0.7}>
          <Text style={s.stepBtnTxt}>−</Text>
        </TouchableOpacity>
        <Text style={s.stepVal}>{val}</Text>
        <TouchableOpacity style={s.stepBtn} onPress={onPlus} activeOpacity={0.7}>
          <Text style={s.stepBtnTxt}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Настройки игры</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <Text style={s.sectionLabel}>Команды</Text>
        {teams.map((t, i) => (
          <View style={s.teamRow} key={i}>
            <View style={[s.teamDot, { backgroundColor: TEAM_COLORS[i % TEAM_COLORS.length] }]} />
            <TextInput
              style={s.teamInput}
              value={t.name}
              onChangeText={v => updateName(i, v)}
              placeholder={`Команда ${i + 1}`}
              placeholderTextColor="#BBB"
              maxLength={20}
            />
            {teams.length > 2 && (
              <TouchableOpacity style={s.removeBtn} onPress={() => removeTeam(i)}>
                <Text style={s.removeTxt}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {teams.length < 6 && (
          <TouchableOpacity style={s.addTeamBtn} onPress={addTeam} activeOpacity={0.7}>
            <Text style={s.addTeamTxt}>+  Добавить команду</Text>
          </TouchableOpacity>
        )}

        <Text style={s.sectionLabel}>Параметры</Text>
        <Stepper label="Время раунда" hint="секунд" val={time}
          onMinus={() => setTime(v => Math.max(20, v - 10))}
          onPlus={() => setTime(v => Math.min(180, v + 10))} />
        <Stepper label="Раундов" hint="количество" val={rounds}
          onMinus={() => setRounds(v => Math.max(1, v - 1))}
          onPlus={() => setRounds(v => Math.min(10, v + 1))} />
        <Stepper label="Штраф за пропуск" hint="очков" val={penalty}
          onMinus={() => setPenalty(v => Math.max(0, v - 1))}
          onPlus={() => setPenalty(v => Math.min(2, v + 1))} />

        <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={s.startBtnTxt}>▶  Начать игру!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E8E8E8',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 26, color: '#555', lineHeight: 30 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  scroll: { padding: 20, paddingTop: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    color: '#AAA', textTransform: 'uppercase', marginTop: 20, marginBottom: 10,
  },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  teamDot: { width: 12, height: 12, borderRadius: 6, flexShrink: 0 },
  teamInput: {
    flex: 1, height: 46, backgroundColor: '#FAFAFA',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E8E8E8',
    paddingHorizontal: 14, fontSize: 15, color: '#111',
  },
  removeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E8E8E8',
    alignItems: 'center', justifyContent: 'center',
  },
  removeTxt: { fontSize: 18, color: '#AAA', lineHeight: 20 },
  addTeamBtn: {
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E8E8E8', borderStyle: 'dashed',
    alignItems: 'center', marginBottom: 4,
  },
  addTeamTxt: { fontSize: 15, color: '#888', fontWeight: '600' },
  paramRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F4F4F4',
  },
  paramLabel: { fontSize: 15, color: '#222', fontWeight: '500' },
  paramHint: { fontSize: 12, color: '#AAA', marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, borderColor: '#E0E0E0', backgroundColor: '#F8F8F8',
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnTxt: { fontSize: 20, color: '#333', lineHeight: 24 },
  stepVal: { fontSize: 18, fontWeight: '700', color: '#111', minWidth: 34, textAlign: 'center' },
  startBtn: {
    backgroundColor: C.purple, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', marginTop: 28,
  },
  startBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
