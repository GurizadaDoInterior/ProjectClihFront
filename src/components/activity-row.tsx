import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, shadows } from '@/src/theme/tokens';
import type { AreaKey, DailyActivity } from '@/src/types/today';

const areaAppearance: Record<AreaKey, { background: string; color: string; symbol: string }> = {
  study: { background: colors.tealSoft, color: colors.teal, symbol: 'book' },
  health: { background: colors.blueSoft, color: colors.primary, symbol: 'directions_walk' },
  reading: { background: colors.violetSoft, color: colors.violet, symbol: 'menu_book' },
  sleep: { background: colors.orangeSoft, color: colors.orange, symbol: 'bedtime' },
};

export function ActivityRow({
  activity,
  onToggle,
}: {
  activity: DailyActivity;
  onToggle: () => void;
}) {
  const appearance = areaAppearance[activity.area];

  return (
    <Pressable
      accessibilityRole="checkbox"
      aria-checked={activity.completed}
      accessibilityState={{ checked: activity.completed, disabled: activity.completed }}
      disabled={activity.completed}
      accessibilityLabel={`${activity.title}, ${activity.target}`}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        activity.completed && styles.completedRow,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: appearance.background }]}>
        <SymbolView
          name={{
            ios: appearance.symbol as never,
            android: appearance.symbol as never,
            web: appearance.symbol as never,
          }}
          tintColor={activity.areaColor ?? appearance.color}
          size={25}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, activity.completed && styles.completedTitle]}>
          {activity.title}
        </Text>
        <Text style={styles.target}>
          {activity.areaName ? `${activity.areaName} · ` : ''}
          {activity.target}
        </Text>
      </View>
      <View style={[styles.toggle, activity.completed && styles.checked]}>
        {activity.completed ? <Text style={styles.check}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  completedRow: {
    borderColor: '#C4EFE7',
    backgroundColor: '#FBFFFE',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  completedTitle: {
    color: '#244A48',
  },
  target: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 14,
    lineHeight: 19,
  },
  toggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#B9C4D4',
  },
  checked: {
    borderColor: colors.teal,
    backgroundColor: colors.teal,
  },
  check: {
    color: colors.surface,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
  },
});
