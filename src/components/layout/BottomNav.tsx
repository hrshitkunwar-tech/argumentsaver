import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, R } from '@/constants/theme';

export type Tab = 'rewrite' | 'history' | 'premium';

interface NavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isPremium: boolean;
}

const NAV_TABS: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'rewrite',  label: 'Refine',  icon: 'chatbubble-ellipses-outline' },
  { id: 'history',  label: 'History', icon: 'time-outline' },
  { id: 'premium',  label: 'Premium', icon: 'sparkles-outline' },
];

export function BottomNav({ activeTab, onTabChange, isPremium }: NavProps) {
  const insets = useSafeAreaInsets();
  const activeNavTab = activeTab === 'history' ? 'history' : 'rewrite';

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 12 }]}>
      <BlurView intensity={80} tint="light" style={styles.blur}>
        <View style={styles.content}>
          {NAV_TABS.map((tab) => {
            const isActive =
              (tab.id === 'premium' && false) || // Premium tap handles itself elsewhere
              (tab.id !== 'premium' && activeNavTab === tab.id);

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => onTabChange(tab.id)}
                activeOpacity={0.75}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={20} 
                  color={isActive ? C.onPrimary : C.onSurface} 
                  style={{ opacity: isActive ? 1 : 0.6 }}
                />
                <Text style={[styles.label, isActive && styles.labelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
  },
  blur: {
    borderTopWidth: 1,
    borderTopColor: `${C.outlineVariant}20`,
  },
  content: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4, // insets handles the rest
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: R.full,
    gap: 2,
    opacity: 0.6,
  },
  tabActive: {
    backgroundColor: C.primary,
    opacity: 1,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: C.onSurface,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: C.onPrimary,
  },
});
