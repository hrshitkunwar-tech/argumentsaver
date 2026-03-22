import React, { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { C, R, shadow } from '@/constants/theme';
import type { OutputCardProps } from '@/types';
import { TONES } from '@/constants/tones';

export function OutputCard({ result, onSaveToHistory }: OutputCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const tone = TONES.find((t) => t.id === result.tone);
  const rewrites = result.rewrites;
  const activeRewrite = rewrites[activeIndex] ?? '';

  async function handleCopy() {
    await Clipboard.setStringAsync(activeRewrite);
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onSaveToHistory();
  }

  async function handleShare() {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing not available', 'Please copy the message instead.');
      return;
    }
    await Sharing.shareAsync(activeRewrite, { dialogTitle: 'Share rewritten message' });
  }

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Kindred Version</Text>
          <Text style={styles.heading}>A softer approach</Text>
          {tone && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name={tone.icon} size={14} color={C.onSurfaceVariant} style={{ marginRight: 6 }} />
              <Text style={styles.toneBadge}>
                {tone.label}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.copyCircle, copied && styles.copyCircleDone]}
          onPress={handleCopy}
          activeOpacity={0.75}
          accessible
          accessibilityLabel={copied ? 'Copied!' : 'Copy rewritten message'}
          accessibilityRole="button"
        >
          <Ionicons 
            name={copied ? 'checkmark-outline' : 'copy-outline'} 
            size={20} 
            color={C.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Rewritten text */}
      <View style={styles.quoteBlock}>
        <Text style={styles.rewriteText}>{activeRewrite}</Text>
      </View>

      {/* Version tabs */}
      {rewrites.length > 1 && (
        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>Version</Text>
          <View style={styles.tabs}>
            {rewrites.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveIndex(i)}
                style={[styles.tab, i === activeIndex && styles.tabActive]}
                accessible
                accessibilityLabel={`Version ${i + 1}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: i === activeIndex }}
              >
                <Text style={[styles.tabText, i === activeIndex && styles.tabTextActive]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Original draft */}
      <View style={styles.originalBlock}>
        <Text style={styles.originalEyebrow}>Original Draft</Text>
        <Text style={styles.originalText} numberOfLines={4}>
          {result.original}
        </Text>
      </View>

      {/* Share */}
      <TouchableOpacity
        style={styles.shareBtn}
        onPress={handleShare}
        activeOpacity={0.75}
        accessible
        accessibilityLabel="Share rewritten message"
        accessibilityRole="button"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="share-outline" size={16} color={C.onSurfaceVariant} style={{ marginRight: 8 }} />
          <Text style={styles.shareBtnText}>Share</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: R.lg,
    overflow: 'hidden',
    ...shadow.ghost,
    borderWidth: 1,
    borderColor: `${C.outlineVariant}18`,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: C.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: C.onSurface,
    letterSpacing: -0.3,
  },
  toneBadge: {
    marginTop: 4,
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: '500',
  },
  copyCircle: {
    width: 44,
    height: 44,
    borderRadius: R.full,
    backgroundColor: C.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyCircleDone: {
    backgroundColor: C.primaryContainer,
  },
  copyCircleIcon: {
    fontSize: 18,
    color: C.primary,
    fontWeight: '700',
  },
  quoteBlock: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: `${C.surfaceContainerLow}88`,
    borderLeftWidth: 3,
    borderLeftColor: `${C.primary}50`,
    borderRadius: R.sm,
    padding: 16,
  },
  rewriteText: {
    fontSize: 16,
    lineHeight: 25,
    color: C.onSurface,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  versionLabel: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    width: 28,
    height: 28,
    borderRadius: R.full,
    backgroundColor: C.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: C.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
  tabTextActive: {
    color: C.onPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: C.surfaceContainerHigh,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  originalBlock: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: `${C.error}35`,
    paddingLeft: 12,
  },
  originalEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: `${C.error}80`,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  originalText: {
    fontSize: 14,
    lineHeight: 20,
    color: C.onSurfaceVariant,
    fontStyle: 'italic',
  },
  shareBtn: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: R.md,
    backgroundColor: C.surfaceContainer,
    alignItems: 'center',
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
});
