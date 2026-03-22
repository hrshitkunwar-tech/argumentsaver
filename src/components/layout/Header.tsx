import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FreeCounter } from '@/components/FreeCounter';
import { C, R, T } from '@/constants/theme';

interface HeaderProps {
  rewriteCount: number;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function Header({ rewriteCount, isPremium, onUpgrade }: HeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.wrapper, { paddingTop: insets.top || 12 }]}>
      <BlurView intensity={60} tint="light" style={styles.blur}>
        <View style={styles.content}>
          <View style={styles.left}>
            <Ionicons name="leaf" size={20} color={C.primary} style={{ marginRight: 6 }} />
            <Text style={styles.logoText}>ArgumentSaver</Text>
          </View>
          <FreeCounter
            count={rewriteCount}
            isPremium={isPremium}
            onUpgrade={onUpgrade}
          />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: C.background,
  },
  blur: {
    borderBottomWidth: 1,
    borderBottomColor: `${C.outlineVariant}20`,
  },
  content: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    ...T.headlineSM,
    color: C.onBackground,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
