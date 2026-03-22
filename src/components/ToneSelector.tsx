import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TONES } from '@/constants/tones';
import { C, R } from '@/constants/theme';
import type { ToneId, ToneSelectorProps } from '@/types';

export function ToneSelector({ selected, onSelect, disabled = false }: ToneSelectorProps) {
  return (
    <View accessible accessibilityLabel="Tone selector" accessibilityRole="radiogroup">
      <Text style={styles.eyebrow}>Choose your tone</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {TONES.map((tone) => {
          const isSelected = tone.id === selected;
          return (
            <TouchableOpacity
              key={tone.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => !disabled && onSelect(tone.id as ToneId)}
              disabled={disabled}
              activeOpacity={0.75}
              accessible
              accessibilityLabel={`${tone.label} tone: ${tone.description}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled }}
            >
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                {tone.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: C.onSurface,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  scroll: {
    paddingHorizontal: 2,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: R.full,
    backgroundColor: C.surfaceContainerHigh,
  },
  chipSelected: {
    backgroundColor: C.primary,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
  chipLabelSelected: {
    color: C.onPrimary,
  },
});
