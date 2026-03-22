import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, shadow } from '@/constants/theme';
import type { PaywallModalProps } from '@/types';
import { CONFIG } from '@/constants/config';

const FEATURES = [
  {
    icon: 'infinite-outline',
    title: 'Unlimited Rewrites',
    desc: 'No daily limits. Refine your words until they perfectly reflect your heart.',
  },
  {
    icon: 'bulb-outline',
    title: 'Tone Intelligence',
    desc: 'Deep analysis of emotional subtext to prevent accidental escalations.',
  },
  {
    icon: 'heart-outline',
    title: 'Full History',
    desc: 'All rewrites preserved locally. Revisit and reflect on your progress.',
  },
  {
    icon: 'flash-outline',
    title: 'Priority Responses',
    desc: 'Faster AI responses, even during peak hours.',
  },
] as const;

export function PaywallModal({
  visible,
  onClose,
  onPurchase,
  onRestore,
  purchaseState,
}: PaywallModalProps) {
  const busy = purchaseState === 'loading';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Close */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          disabled={busy}
          accessible
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Ionicons name="close-outline" size={20} color={C.onSurfaceVariant} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Hero */}
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={40} color={C.primary} />
          </View>
          <Text style={styles.title}>Focus on Connection,{'\n'}Not Conflict.</Text>
          <Text style={styles.subtitle}>
            You've used your {CONFIG.freeRewriteLimit} free rewrites.{'\n'}
            Unlock unlimited access and keep the peace.
          </Text>

          {/* Feature bento grid */}
          <View style={styles.grid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <Ionicons name={f.icon} size={24} color={C.primary} style={{ marginBottom: 4 }} />
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* Pricing card */}
          <View style={styles.pricingCard}>
            <Text style={styles.pricingEyebrow}>One-Time Purchase</Text>
            <Text style={styles.pricingAmount}>$9.99</Text>
            <Text style={styles.pricingNote}>No subscription · No renewal</Text>

            <TouchableOpacity
              style={[styles.purchaseBtn, busy && styles.purchaseBtnBusy]}
              onPress={onPurchase}
              disabled={busy}
              activeOpacity={0.85}
              accessible
              accessibilityLabel="Unlock unlimited rewrites"
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: busy }}
            >
              {busy ? (
                <ActivityIndicator color={C.onPrimary} />
              ) : (
                <Text style={styles.purchaseBtnText}>Unlock Unlimited Access</Text>
              )}
            </TouchableOpacity>

            {purchaseState === 'error' && (
              <Text style={styles.errorMsg}>Something went wrong. Please try again.</Text>
            )}
          </View>

          {/* Footer */}
          <TouchableOpacity
            onPress={onRestore}
            disabled={busy}
            style={styles.restoreBtn}
            accessible
            accessibilityLabel="Restore previous purchases"
            accessibilityRole="button"
          >
            <Text style={styles.restoreBtnText}>Restore Purchases</Text>
          </TouchableOpacity>

          <View style={styles.legalRow}>
            <Text style={styles.legal}>Terms of Service</Text>
            <Text style={styles.legal}>  ·  </Text>
            <Text style={styles.legal}>Privacy Policy</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.surface,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.outlineVariant,
    alignSelf: 'center',
    marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 24,
    right: 20,
    width: 32,
    height: 32,
    backgroundColor: C.surfaceContainer,
    borderRadius: R.full,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },

  // Hero
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: R.full,
    backgroundColor: C.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: C.onSurface,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 37,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },

  // Feature grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
    alignSelf: 'stretch',
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: C.surfaceContainerLow,
    padding: 16,
    borderRadius: R.lg,
    gap: 6,
    ...shadow.card,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.onSurface,
    letterSpacing: -0.1,
  },
  featureDesc: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    lineHeight: 17,
  },

  // Pricing card
  pricingCard: {
    alignSelf: 'stretch',
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: R.xl,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    ...shadow.ghost,
    borderWidth: 1,
    borderColor: `${C.outlineVariant}20`,
  },
  pricingEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 44,
    fontWeight: '800',
    color: C.onSurface,
    letterSpacing: -1,
    marginBottom: 4,
  },
  pricingNote: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    marginBottom: 20,
  },
  purchaseBtn: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: R.full,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  purchaseBtnBusy: {
    opacity: 0.7,
  },
  purchaseBtnText: {
    color: C.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  errorMsg: {
    marginTop: 12,
    fontSize: 13,
    color: C.error,
    textAlign: 'center',
  },

  // Footer
  restoreBtn: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legal: {
    fontSize: 10,
    fontWeight: '700',
    color: C.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
