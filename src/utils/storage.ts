import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppStorage, RewriteResult, ToneId } from '@/types';

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  rewriteCount: '@as:rewrite_count',
  isPremium: '@as:is_premium',
  history: '@as:history',
  lastToneId: '@as:last_tone_id',
  onboardingCompleted: '@as:onboarding_completed',
} as const;

const MAX_HISTORY = 50;

// ─── Defaults ────────────────────────────────────────────────────────────────

import { DEFAULT_TONE_ID } from '@/constants/tones';

const DEFAULT_STORAGE: AppStorage = {
  rewriteCount: 0,
  isPremium: false,
  history: [],
  lastToneId: DEFAULT_TONE_ID,
  onboardingCompleted: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Load all app state at once (single read pass for cold start). */
export async function loadStorage(): Promise<AppStorage> {
  try {
    const [countRaw, premiumRaw, historyRaw, toneRaw, onboardRaw] = await AsyncStorage.multiGet([
      KEYS.rewriteCount,
      KEYS.isPremium,
      KEYS.history,
      KEYS.lastToneId,
      KEYS.onboardingCompleted,
    ]);

    return {
      rewriteCount: safeJsonParse<number>(countRaw[1], DEFAULT_STORAGE.rewriteCount),
      isPremium: safeJsonParse<boolean>(premiumRaw[1], DEFAULT_STORAGE.isPremium),
      history: safeJsonParse<RewriteResult[]>(historyRaw[1], DEFAULT_STORAGE.history),
      lastToneId: safeJsonParse<ToneId>(toneRaw[1], DEFAULT_STORAGE.lastToneId),
      onboardingCompleted: safeJsonParse<boolean>(onboardRaw[1], DEFAULT_STORAGE.onboardingCompleted),
    };
  } catch {
    return DEFAULT_STORAGE;
  }
}

/** Increment the rewrite counter and return the new count. */
export async function incrementRewriteCount(current: number): Promise<number> {
  const next = current + 1;
  await AsyncStorage.setItem(KEYS.rewriteCount, JSON.stringify(next));
  return next;
}

/** Store the last used tone ID. */
export async function setLastToneId(tone: ToneId): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastToneId, JSON.stringify(tone));
}

/** Unlock premium — set once after successful IAP. */
export async function setPremium(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.isPremium, JSON.stringify(value));
}

/** Prepend a new rewrite result to history, trimming to MAX_HISTORY. */
export async function addToHistory(
  result: RewriteResult,
  current: RewriteResult[]
): Promise<RewriteResult[]> {
  const updated = [result, ...current].slice(0, MAX_HISTORY);
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(updated));
  return updated;
}

/** Remove a single history item by id. */
export async function removeFromHistory(
  id: string,
  current: RewriteResult[]
): Promise<RewriteResult[]> {
  const updated = current.filter((r) => r.id !== id);
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(updated));
  return updated;
}

/** Set onboarding as completed. */
export async function setOnboardingCompleted(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboardingCompleted, JSON.stringify(value));
}

/** Clear all history. */
export async function clearHistory(): Promise<void> {
  await AsyncStorage.setItem(KEYS.history, JSON.stringify([]));
}

/** Full reset (for testing / debug only). */
export async function resetStorage(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
