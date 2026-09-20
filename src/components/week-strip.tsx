import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/tokens';
import type { WeekDay } from '@/src/types/today';

export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <View accessibilityLabel="Progresso da semana" style={styles.row}>
      {days.map((day) => (
        <View key={day.label} style={styles.day}>
          <Text style={[styles.label, day.state === 'current' && styles.currentLabel]}>
            {day.label}
          </Text>
          <View
            style={[
              styles.dot,
              day.state === 'complete' && styles.complete,
              day.state === 'partial' && styles.partial,
              day.state === 'current' && styles.current,
            ]}>
            {day.state === 'complete' ? <Text style={styles.check}>✓</Text> : null}
            {day.state === 'partial' ? <View style={styles.innerDot} /> : null}
            {day.state === 'current' ? <View style={styles.currentInner} /> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 18,
  },
  day: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  currentLabel: {
    color: colors.ink,
  },
  dot: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  complete: {
    backgroundColor: colors.teal,
  },
  partial: {
    backgroundColor: colors.surfaceMuted,
  },
  current: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  check: {
    color: colors.surface,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8EA0BB',
  },
  currentInner: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
});
