import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  language: 'app.language',
  auth: 'app.auth',
  results: 'app.results',
};

export async function setLanguage(langCode) {
  await AsyncStorage.setItem(KEYS.language, langCode);
}

export async function getLanguage() {
  return AsyncStorage.getItem(KEYS.language);
}

export async function setAuthedOrSkipped(value) {
  await AsyncStorage.setItem(KEYS.auth, JSON.stringify({ value, ts: Date.now() }));
}

export async function isAuthedOrSkipped() {
  const raw = await AsyncStorage.getItem(KEYS.auth);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.value);
  } catch {
    return false;
  }
}

export async function clearAuth() {
  await AsyncStorage.removeItem(KEYS.auth);
}

export async function saveResult(result) {
  const raw = await AsyncStorage.getItem(KEYS.results);
  const list = raw ? JSON.parse(raw) : [];
  list.unshift(result);
  await AsyncStorage.setItem(KEYS.results, JSON.stringify(list));
}

export async function loadResults() {
  const raw = await AsyncStorage.getItem(KEYS.results);
  return raw ? JSON.parse(raw) : [];
}

export function getBadgeForScore(score) {
  if (score > 20) return { label: 'Gold', emoji: '🥇', color: '#F59E0B' };
  if (score >= 10) return { label: 'Silver', emoji: '🥈', color: '#9CA3AF' };
  return { label: 'Bronze', emoji: '🥉', color: '#CD7F32' };
}


