import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'elias_custom_words';

export async function loadCustomWords() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCustomWords(words) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(words));
  } catch {}
}
