import React, { useCallback, useEffect, useReducer, useRef, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InputBox } from '@/components/InputBox';
import { ToneSelector } from '@/components/ToneSelector';
import { RewriteButton } from '@/components/RewriteButton';
import { OutputCard } from '@/components/OutputCard';
import { PaywallModal } from '@/components/PaywallModal';
import { HistoryList } from '@/components/HistoryList';
import { Header } from '@/components/layout/Header';
import { BottomNav, type Tab } from '@/components/layout/BottomNav';

import { rewriteMessage, GrokNetworkError, GrokApiError } from '@/services/grokService';
import { GrokParseError } from '@/utils/jsonParser';
import {
  canRewriteFree,
  connectIAP,
  disconnectIAP,
  purchaseUnlimited,
  restorePurchases,
} from '@/services/purchaseService';
import {
  loadStorage,
  incrementRewriteCount,
  addToHistory,
  removeFromHistory,
  setPremium,
  setLastToneId,
} from '@/utils/storage';

import { DEFAULT_TONE_ID } from '@/constants/tones';
import { C, R } from '@/constants/theme';
import type { PurchaseState, RewriteResult, ToneId } from '@/types';

// ─── State Management ─────────────────────────────────────────────────────────

interface State {
  message: string;
  tone: ToneId;
  result: RewriteResult | null;
  isRewriting: boolean;
  error: string | null;
  rewriteCount: number;
  isPremium: boolean;
  history: RewriteResult[];
  storageLoaded: boolean;
  paywallVisible: boolean;
  purchaseState: PurchaseState;
  activeTab: Tab;
}

type Action =
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'SET_TONE'; payload: ToneId }
  | { type: 'STORAGE_LOADED'; payload: Pick<State, 'rewriteCount' | 'isPremium' | 'history'> & { tone: ToneId } }
  | { type: 'REWRITE_START' }
  | { type: 'REWRITE_SUCCESS'; payload: { result: RewriteResult; newCount: number } }
  | { type: 'REWRITE_ERROR'; payload: string }
  | { type: 'HISTORY_UPDATED'; payload: RewriteResult[] }
  | { type: 'SHOW_PAYWALL' }
  | { type: 'HIDE_PAYWALL' }
  | { type: 'PURCHASE_START' }
  | { type: 'PURCHASE_SUCCESS' }
  | { type: 'PURCHASE_ERROR' }
  | { type: 'SET_TAB'; payload: Tab }
  | { type: 'CLEAR_ERROR' };

const initialState: State = {
  message: '',
  tone: DEFAULT_TONE_ID,
  result: null,
  isRewriting: false,
  error: null,
  rewriteCount: 0,
  isPremium: false,
  history: [],
  storageLoaded: false,
  paywallVisible: false,
  purchaseState: 'idle',
  activeTab: 'rewrite',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MESSAGE':
      return { ...state, message: action.payload, error: null };
    case 'SET_TONE':
      setLastToneId(action.payload);
      return { ...state, tone: action.payload };
    case 'STORAGE_LOADED':
      return { ...state, ...action.payload, storageLoaded: true };
    case 'REWRITE_START':
      return { ...state, isRewriting: true, error: null, result: null };
    case 'REWRITE_SUCCESS':
      return {
        ...state,
        isRewriting: false,
        result: action.payload.result,
        rewriteCount: action.payload.newCount,
      };
    case 'REWRITE_ERROR':
      return { ...state, isRewriting: false, error: action.payload };
    case 'HISTORY_UPDATED':
      return { ...state, history: action.payload };
    case 'SHOW_PAYWALL':
      return { ...state, paywallVisible: true, purchaseState: 'idle' };
    case 'HIDE_PAYWALL':
      return { ...state, paywallVisible: false, purchaseState: 'idle' };
    case 'PURCHASE_START':
      return { ...state, purchaseState: 'loading' };
    case 'PURCHASE_SUCCESS':
      return { ...state, isPremium: true, paywallVisible: false, purchaseState: 'success' };
    case 'PURCHASE_ERROR':
      return { ...state, purchaseState: 'error' };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [state, dispatch] = useReducer(reducer, initialState);
  const scrollRef = useRef<ScrollView>(null);

  // ... items removed ...

  useEffect(() => {
    (async () => {
      const storage = await loadStorage();
      dispatch({
        type: 'STORAGE_LOADED',
        payload: {
          rewriteCount: storage.rewriteCount,
          isPremium: storage.isPremium,
          history: storage.history,
          tone: storage.lastToneId,
        },
      });
    })();
    connectIAP();
    return () => { disconnectIAP(); };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRewrite = useCallback(async () => {
    const trimmed = state.message.trim();
    if (!trimmed) return;

    if (!canRewriteFree(state.rewriteCount, state.isPremium)) {
      dispatch({ type: 'SHOW_PAYWALL' });
      return;
    }

    dispatch({ type: 'REWRITE_START' });
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await rewriteMessage(trimmed, state.tone);
      const newCount = await incrementRewriteCount(state.rewriteCount);
      dispatch({ type: 'REWRITE_SUCCESS', payload: { result, newCount } });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      let msg = 'Something went wrong. Please try again.';
      if (err instanceof GrokNetworkError) {
        msg = err.message.includes('timed out')
          ? 'Request timed out. Check your connection and try again.'
          : 'Network error. Check your connection and try again.';
      } else if (err instanceof GrokApiError) {
        msg = err.status === 401 ? 'Invalid API key.' : `API error ${err.status}.`;
      }
      dispatch({ type: 'REWRITE_ERROR', payload: msg });
      if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [state.message, state.tone, state.rewriteCount, state.isPremium]);

  const handlePurchase = useCallback(async () => {
    dispatch({ type: 'PURCHASE_START' });
    const result = await purchaseUnlimited();
    if (result.success) dispatch({ type: 'PURCHASE_SUCCESS' });
    else if (result.cancelled) dispatch({ type: 'HIDE_PAYWALL' });
    else dispatch({ type: 'PURCHASE_ERROR' });
  }, []);

  const handleRestore = useCallback(async () => {
    dispatch({ type: 'PURCHASE_START' });
    const restored = await restorePurchases();
    if (restored) {
      await setPremium(true);
      dispatch({ type: 'PURCHASE_SUCCESS' });
      Alert.alert('Restored!');
    } else {
      dispatch({ type: 'PURCHASE_ERROR' });
      Alert.alert('Nothing to restore');
    }
  }, []);

  const handleNavTab = useCallback((tab: Tab) => {
    if (Platform.OS === 'ios') Haptics.selectionAsync();
    if (tab === 'premium') {
      if (state.isPremium) Alert.alert('You\'re Unlimited ✨');
      else dispatch({ type: 'SHOW_PAYWALL' });
      return;
    }
    dispatch({ type: 'SET_TAB', payload: tab });
  }, [state.isPremium]);

  const handleSelectHistory = useCallback((res: RewriteResult) => {
    dispatch({ type: 'SET_MESSAGE', payload: res.original });
    dispatch({ type: 'SET_TONE', payload: res.tone });
    dispatch({ type: 'SET_TAB', payload: 'rewrite' });
  }, []);

  const handleDeleteHistory = useCallback(async (id: string) => {
    const updated = await removeFromHistory(id, state.history);
    dispatch({ type: 'HISTORY_UPDATED', payload: updated });
  }, [state.history]);

  // ── Render ────────────────────────────────────────────────────────────────

  const canRewrite = state.message.trim().length > 0 && !state.isRewriting;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Robust Vertical Stack */}
      <Header
        rewriteCount={state.rewriteCount}
        isPremium={state.isPremium}
        onUpgrade={() => dispatch({ type: 'SHOW_PAYWALL' })}
      />

      <View style={styles.flex}>
        {state.activeTab === 'rewrite' ? (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.hero}>
                <Text style={styles.heroHeadline}>
                  Turn friction into{'\n'}
                  <Text style={styles.heroAccent}>connection.</Text>
                </Text>
                <Text style={styles.heroSub}>
                  Pause. Breathe. Let's find a softer way to say it.
                </Text>
              </View>

              <InputBox
                value={state.message}
                onChange={(text) => dispatch({ type: 'SET_MESSAGE', payload: text })}
                disabled={state.isRewriting}
              />

              <ToneSelector
                selected={state.tone}
                onSelect={(t) => dispatch({ type: 'SET_TONE', payload: t })}
                disabled={state.isRewriting}
              />

              <RewriteButton
                onPress={handleRewrite}
                loading={state.isRewriting}
                disabled={!canRewrite}
              />

              {state.error && (
                <TouchableOpacity onPress={() => dispatch({ type: 'CLEAR_ERROR' })}>
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠️  {state.error}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {state.result && (
                <OutputCard
                  result={state.result}
                  onSaveToHistory={() => addToHistory(state.result!, state.history).then(u => dispatch({ type: 'HISTORY_UPDATED', payload: u }))}
                />
              )}
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <HistoryList
            history={state.history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            contentContainerStyle={{ paddingVertical: 20 }}
          />
        )}
      </View>

      <BottomNav
        activeTab={state.activeTab}
        onTabChange={handleNavTab}
        isPremium={state.isPremium}
      />

      <PaywallModal
        visible={state.paywallVisible}
        onClose={() => dispatch({ type: 'HIDE_PAYWALL' })}
        onPurchase={handlePurchase}
        onRestore={handleRestore}
        purchaseState={state.purchaseState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  flex: {
    flex: 1,
  },
  orb1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${C.primary}08`,
  },
  orb2: {
    position: 'absolute',
    bottom: 50,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: `${C.secondary}05`,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  hero: {
    gap: 8,
    marginVertical: 10,
  },
  heroHeadline: {
    fontSize: 40,
    fontWeight: '800',
    color: C.onBackground,
    lineHeight: 46,
    letterSpacing: -1,
  },
  heroAccent: {
    color: C.primary,
    fontStyle: 'italic',
  },
  heroSub: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    lineHeight: 24,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: R.md,
    padding: 14,
    borderWidth: 1,
    borderColor: `${C.error}20`,
  },
  errorText: {
    fontSize: 14,
    color: C.error,
  },
});
