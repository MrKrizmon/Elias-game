import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../utils/theme';
import { DEFAULT_WORDS, CATEGORIES } from '../data/words';

const TABS = [
  { id: 'all', label: 'Все' },
  { id: 'mine', label: 'Мои' },
  { id: 'std', label: 'Стандартные' },
];

export default function WordsScreen({ navigation, customWords, setCustomWords }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [newWord, setNewWord] = useState('');
  const [newCat, setNewCat] = useState('Мои слова');
  const [catOpen, setCatOpen] = useState(false);

  const allWords = useMemo(() => [...DEFAULT_WORDS, ...customWords], [customWords]);

  const source = tab === 'all' ? allWords : tab === 'mine' ? customWords : DEFAULT_WORDS;
  const filtered = search.trim()
    ? source.filter(w =>
        w.w.toLowerCase().includes(search.toLowerCase()) ||
        w.c.toLowerCase().includes(search.toLowerCase()))
    : source;

  function addWord() {
    const val = newWord.trim();
    if (!val) return;
    if (allWords.find(w => w.w.toLowerCase() === val.toLowerCase())) {
      Alert.alert('Слово уже есть', `«${val}» уже в словаре.`);
      return;
    }
    setCustomWords(prev => [...prev, { w: val, c: newCat }]);
    setNewWord('');
  }

  function deleteWord(word) {
    Alert.alert('Удалить слово?', `«${word.w}» будет удалено.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => setCustomWords(prev => prev.filter(w => w.w !== word.w)) },
    ]);
  }

  const isCustom = (word) => customWords.some(m => m.w === word.w);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Словарь</Text>
        <View style={s.countBadge}>
          <Text style={s.countTxt}>{allWords.length}</Text>
        </View>
      </View>

      <View style={s.body}>
        {/* Tabs */}
        <View style={s.tabs}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.id} style={[s.tab, tab === t.id && s.tabOn]}
              onPress={() => setTab(t.id)} activeOpacity={0.7}>
              <Text style={[s.tabTxt, tab === t.id && s.tabTxtOn]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Поиск по словам и категориям..."
            placeholderTextColor="#BBB"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={s.clearBtn}>
              <Text style={{ color: '#AAA', fontSize: 16 }}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Add word */}
        <View style={s.addRow}>
          <TextInput
            style={s.addInput}
            placeholder="Новое слово..."
            placeholderTextColor="#BBB"
            value={newWord}
            onChangeText={setNewWord}
            onSubmitEditing={addWord}
            returnKeyType="done"
            maxLength={32}
          />
          <TouchableOpacity style={s.catBtn} onPress={() => setCatOpen(!catOpen)}>
            <Text style={s.catBtnTxt} numberOfLines={1}>{newCat.length > 8 ? newCat.slice(0, 7) + '…' : newCat}</Text>
            <Text style={{ color: C.textHint, fontSize: 10 }}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={addWord} activeOpacity={0.85}>
            <Text style={s.addBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Category picker dropdown */}
        {catOpen && (
          <View style={s.dropdown}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat} style={s.dropItem}
                onPress={() => { setNewCat(cat); setCatOpen(false); }}>
                <Text style={[s.dropItemTxt, newCat === cat && s.dropItemTxtOn]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Word chips */}
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.w + i}
          numColumns={2}
          columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={s.emptyTxt}>{search ? 'Ничего не найдено' : 'Добавьте первое слово выше'}</Text>
          }
          renderItem={({ item }) => {
            const custom = isCustom(item);
            return (
              <View style={[s.chip, custom && s.chipMine]}>
                <Text style={[s.chipWord, custom && s.chipWordMine]} numberOfLines={1}>{item.w}</Text>
                <Text style={[s.chipCat, custom && s.chipCatMine]} numberOfLines={1}>{item.c}</Text>
                {custom && (
                  <TouchableOpacity style={s.chipDel} onPress={() => deleteWord(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ color: C.purple, fontSize: 14, fontWeight: '700' }}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      </View>
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
  title: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1 },
  countBadge: {
    backgroundColor: C.purpleLight, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  countTxt: { fontSize: 13, fontWeight: '700', color: C.purple },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  tabs: {
    flexDirection: 'row', backgroundColor: C.purpleLight,
    borderRadius: 12, padding: 4, marginBottom: 14,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabOn: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: '#999' },
  tabTxtOn: { color: C.purple },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFAFA', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E8E8E8',
    paddingHorizontal: 12, marginBottom: 10,
  },
  searchIcon: { fontSize: 18, color: '#BBB', marginRight: 6 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#111' },
  clearBtn: { padding: 4 },
  addRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  addInput: {
    flex: 1, height: 44, backgroundColor: '#FAFAFA',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E8E8E8',
    paddingHorizontal: 12, fontSize: 14, color: '#111',
  },
  catBtn: {
    height: 44, backgroundColor: '#FAFAFA',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E8E8E8',
    paddingHorizontal: 10, flexDirection: 'row',
    alignItems: 'center', gap: 4, minWidth: 80,
  },
  catBtnTxt: { fontSize: 12, color: '#555', fontWeight: '500' },
  addBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center',
  },
  addBtnTxt: { color: '#fff', fontSize: 24, fontWeight: '400', lineHeight: 28 },
  dropdown: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E8E8E8',
    marginBottom: 8, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  dropItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropItemTxt: { fontSize: 14, color: '#444' },
  dropItemTxtOn: { color: C.purple, fontWeight: '700' },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: '#F4F4F4', borderRadius: 20,
    borderWidth: 1, borderColor: '#EBEBEB', gap: 4,
  },
  chipMine: { backgroundColor: C.purpleLight, borderColor: '#C7C4F5' },
  chipWord: { fontSize: 13, color: '#333', fontWeight: '500' },
  chipWordMine: { color: C.purpleDark },
  chipCat: { fontSize: 11, color: '#AAA' },
  chipCatMine: { color: C.purpleMid },
  chipDel: { marginLeft: 'auto' },
  emptyTxt: { textAlign: 'center', color: '#BBB', fontSize: 14, paddingTop: 32 },
});
