import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import type { RewriteResult } from '@/types';
import { TONES } from '@/constants/tones';
import { C, R, shadow } from '@/constants/theme';

interface HistoryListProps {
  history: RewriteResult[];
  onSelect: (result: RewriteResult) => void;
  onDelete: (id: string) => void;
  contentContainerStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

function formatDate(iso: string | number): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function HistoryItem({
  item,
  onSelect,
  onDelete,
}: {
  item: RewriteResult;
  onSelect: (r: RewriteResult) => void;
  onDelete: (id: string) => void;
}) {
  const tone = TONES.find((t) => t.id === item.tone);

  async function handleCopy() {
    await Clipboard.setStringAsync(item.rewrites[0] ?? '');
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function handleShare() {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(item.rewrites[0] ?? '', { dialogTitle: 'Share rewritten message' });
    }
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(item)}
      activeOpacity={0.78}
      accessible
      accessibilityLabel={`Rewrite from ${formatDate(String(item.createdAt))}, ${tone?.label} tone. Tap to edit.`}
      accessibilityRole="button"
    >
      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          <Text style={styles.metaDate}>{formatDate(String(item.createdAt))}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name={tone?.icon ?? 'chatbubble-outline'} size={12} color={C.onPrimaryContainer} style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>{tone?.label}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityLabel="Delete this history item"
          accessibilityRole="button"
          style={styles.deleteBtn}
        >
          <Ionicons name="close-circle-outline" size={18} color={C.outlineVariant} />
        </TouchableOpacity>
      </View>

      {/* Original block */}
      <View style={styles.originalBlock}>
        <Text style={styles.blockEyebrow}>Original Draft</Text>
        <Text style={styles.originalText} numberOfLines={2}>{item.original}</Text>
      </View>

      {/* Rewrite block */}
      <View style={styles.rewriteBlock}>
        <Text style={styles.blockEyebrowTeal}>Kindred Version</Text>
        <Text style={styles.rewriteText} numberOfLines={3}>{item.rewrites[0]}</Text>
      </View>

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleCopy}
          accessible
          accessibilityLabel="Copy rewrite"
          accessibilityRole="button"
        >
          <View style={styles.actionBtnContent}>
            <Ionicons name="copy-outline" size={14} color={C.primary} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Copy</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          accessible
          accessibilityLabel="Share rewrite"
          accessibilityRole="button"
        >
          <View style={styles.actionBtnContent}>
            <Ionicons name="share-outline" size={14} color={C.primary} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Share</Text>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="leaf-outline" size={40} color={C.primary} />
      </View>
      <Text style={styles.emptyTitle}>Your peace-keeping history</Text>
      <Text style={styles.emptySubtitle}>
        Rewritten messages will appear here, stored privately on your device.
      </Text>
    </View>
  );
}

export function HistoryList({ history, onSelect, onDelete, contentContainerStyle }: HistoryListProps) {
  return (
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <HistoryItem item={item} onSelect={onSelect} onDelete={onDelete} />
      )}
      ListEmptyComponent={<EmptyState />}
      contentContainerStyle={[
        history.length === 0 ? styles.emptyContainer : styles.list,
        contentContainerStyle
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        history.length > 0 ? (
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderEyebrow}>Preserved Peace</Text>
            <Text style={styles.listHeaderTitle}>Conversation History</Text>
            <Text style={styles.listHeaderSub}>Revisiting your journey toward mindful communication.</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
  },
  listHeader: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  listHeaderEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: C.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  listHeaderTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.onSurface,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  listHeaderSub: {
    fontSize: 15,
    color: C.onSurfaceVariant,
    lineHeight: 22,
  },

  // Card
  card: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: R.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 8,
  },
  metaLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDate: {
    fontSize: 11,
    fontWeight: '600',
    color: C.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: C.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.onPrimaryContainer,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  deleteBtn: {
    paddingLeft: 4,
  },
  deleteBtnText: {
    fontSize: 13,
    color: C.outlineVariant,
    fontWeight: '600',
  },

  // Original block
  originalBlock: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: `${C.error}35`,
    paddingLeft: 12,
  },
  blockEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: `${C.error}80`,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  originalText: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Rewrite block
  rewriteBlock: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surfaceContainerLowest,
    borderLeftWidth: 2,
    borderLeftColor: `${C.primary}50`,
    borderRadius: R.sm,
    padding: 12,
  },
  blockEyebrowTeal: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: C.primary,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  rewriteText: {
    fontSize: 14,
    color: C.onSurface,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.surfaceContainerHighest,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.onSurface,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
});
