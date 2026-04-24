import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../utils/theme';

export default function HomeScreen({ navigation, wordCount }) {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.purple} />
      <ScrollView contentContainerStyle={s.scroll} bounces={false}>

        <View style={s.hero}>
          <View style={s.logoRing}>
            <Text style={s.logoLetter}>E</Text>
          </View>
          <Text style={s.logoText}>
            eli<Text style={{ color: C.purple }}>as</Text>
          </Text>
          <Text style={s.logoSub}>командная игра в объяснения</Text>
        </View>

        <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={() => navigation.navigate('Setup')} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>▶  Новая игра</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={() => navigation.navigate('Words')} activeOpacity={0.85}>
          <Text style={s.btnSecondaryText}>☰  Словарь  <Text style={s.wordCount}>({wordCount} слов)</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={() => navigation.navigate('Rules')} activeOpacity={0.85}>
          <Text style={s.btnGhostText}>?  Правила</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  hero: { alignItems: 'center', paddingTop: 56, paddingBottom: 44 },
  logoRing: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: C.purple,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  logoLetter: { fontSize: 40, fontWeight: '700', color: '#fff' },
  logoText: { fontSize: 36, fontWeight: '700', color: '#111', letterSpacing: -1 },
  logoSub: { fontSize: 15, color: C.textSub, marginTop: 6 },
  btn: {
    width: '100%', paddingVertical: 17, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  btnPrimary: { backgroundColor: C.purple },
  btnPrimaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnSecondary: {
    backgroundColor: C.purpleLight,
    borderWidth: 1, borderColor: '#DDD9FC',
  },
  btnSecondaryText: { color: C.purpleDark, fontSize: 16, fontWeight: '600' },
  wordCount: { fontWeight: '400', opacity: 0.6 },
  btnGhost: {
    backgroundColor: '#F7F7F7',
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  btnGhostText: { color: '#444', fontSize: 16, fontWeight: '600' },
});
