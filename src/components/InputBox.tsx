import React, { useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { C, R, shadow } from '@/constants/theme';
import type { InputBoxProps } from '@/types';

const MAX_CHARS = 2000;

export function InputBox({ value, onChange, disabled = false }: InputBoxProps) {
  const inputRef = useRef<TextInput>(null);
  const remaining = MAX_CHARS - value.length;
  const isNearLimit = remaining < 100;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      accessible={false}
      style={styles.container}
    >
      <TextInput
        ref={inputRef}
        style={[styles.input, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={(t) => onChange(t.slice(0, MAX_CHARS))}
        placeholder="Paste the message you're about to send…"
        placeholderTextColor={C.outline}
        multiline
        scrollEnabled
        maxLength={MAX_CHARS}
        editable={!disabled}
        returnKeyType="default"
        keyboardType="default"
        textAlignVertical="top"
        accessible
        accessibilityLabel="Message input"
        accessibilityHint="Type or paste the message you want to rewrite"
      />

      <View style={styles.footer}>
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChange('')}
            disabled={disabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible
            accessibilityLabel="Clear message"
            accessibilityRole="button"
          >
            <Text style={styles.clearBtn}>Clear</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.privacyHint}>Your privacy is protected</Text>
        <Text
          style={[styles.counter, isNearLimit && styles.counterWarning]}
          accessibilityLabel={`${remaining} characters remaining`}
        >
          {remaining}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: R.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  input: {
    minHeight: 160,
    maxHeight: 240,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 16,
    lineHeight: 24,
    color: C.onSurface,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 4,
    gap: 8,
  },
  clearBtn: {
    fontSize: 13,
    color: C.outline,
    fontWeight: '500',
  },
  privacyHint: {
    flex: 1,
    fontSize: 11,
    color: C.outlineVariant,
    textAlign: 'right',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  counter: {
    fontSize: 12,
    color: C.outlineVariant,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'right',
  },
  counterWarning: {
    color: '#d97706',
    fontWeight: '700',
  },
});
