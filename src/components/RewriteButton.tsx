import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, shadow } from '@/constants/theme';
import type { RewriteButtonProps } from '@/types';

export function RewriteButton({ onPress, loading, disabled }: RewriteButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.88}
      accessible
      accessibilityLabel={loading ? 'Rewriting…' : 'Rewrite message'}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.label}>Rewriting…</Text>
        </View>
      ) : (
        <View style={styles.row}>
          <Ionicons name="sparkles" size={18} color={C.onPrimary} />
          <Text style={styles.label}>Rewrite</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: R.full,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.ghost,
    shadowColor: C.primary,
    shadowOpacity: 0.28,
  },
  buttonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: C.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
