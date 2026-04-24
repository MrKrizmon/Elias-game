import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../utils/theme';

const RULES = [
  { n: '1', title: 'Цель', text: 'Набрать больше очков, чем другие команды.' },
  { n: '2', title: 'Ход игры', text: 'Один игрок видит слово и объясняет его без однокоренных слов. Команда угадывает.' },
  { n: '3', title: 'Очки', text: '+1 за каждое угаданное слово, −1 за каждый пропуск (штраф настраивается).' },
  { n: '4', title: 'Нельзя', text: 'Говорить однокоренные слова, показывать жестами, называть часть слова.' },
  { n: '5', title: 'Победа', text: 'Команда с наибольшим счётом после всех раундов побеждает!' },
];

export default function RulesScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Правила</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        {RULES.map(r => (
          <View style={s.ruleItem} key={r.n}>
            <View style={s.ruleNum}><Text style={s.ruleNumTxt}>{r.n}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.ruleTitle}>{r.title}</Text>
              <Text style={s.ruleText}>{r.text}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={[s.btn, { marginTop: 16 }]} onPress={() => navigation.navigate('Setup')} activeOpacity={0.85}>
          <Text style={s.btnTxt}>Начать игру!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
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
  scroll: { padding: 24, paddingTop: 16 },
  ruleItem: { flexDirection: 'row', gap: 14, marginBottom: 20, alignItems: 'flex-start' },
  ruleNum: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center',
    marginTop: 2, flexShrink: 0,
  },
  ruleNumTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ruleTitle: { fontWeight: '700', color: '#111', fontSize: 15, marginBottom: 3 },
  ruleText: { fontSize: 14, color: C.textSub, lineHeight: 21 },
  btn: {
    backgroundColor: C.purple, borderRadius: 16,
    paddingVertical: 17, alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
