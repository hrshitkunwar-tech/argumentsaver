import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R } from '@/constants/theme';
import { freeRewritesRemaining } from '@/services/purchaseService';
import { CONFIG } from '@/constants/config';

interface FreeCounterProps {
  count: number;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function FreeCounter({ count, isPremium, onUpgrade }: FreeCounterProps) {
  if (isPremium) {
    return (
      <View style={styles.premiumBadge}>
        <Ionicons name="sparkles" size={14} color={C.onSecondaryContainer} style={{ marginRight: 6 }} />
        <Text style={styles.premiumText}>Unlimited</Text>
      </View>
    );
  }

  const remaining = freeRewritesRemaining(count);
  const allUsed = remaining === 0;

  return (
    <TouchableOpacity
      style={[styles.container, allUsed && styles.containerEmpty]}
      onPress={onUpgrade}
      activeOpacity={0.75}
      accessible
      accessibilityLabel={
        allUsed
          ? 'No free rewrites left. Tap to unlock unlimited.'
          : `${remaining} free rewrites remaining. Tap to upgrade.`
      }
      accessibilityRole="button"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {allUsed && (
          <Ionicons name="lock-closed" size={14} color="#b45309" style={{ marginRight: 6 }} />
        )}
        <Text style={[styles.text, allUsed && styles.textEmpty]}>
          {allUsed ? 'Upgrade' : `${remaining} / ${CONFIG.freeRewriteLimit} free`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.full,
    backgroundColor: C.primaryContainer,
  },
  containerEmpty: {
    backgroundColor: '#fef3c7',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: C.onPrimaryContainer,
    letterSpacing: 0.2,
  },
  textEmpty: {
    color: '#b45309',
  },
  premiumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.full,
    backgroundColor: C.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.onSecondaryContainer,
  },
});
