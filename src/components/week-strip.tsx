import { Text, View } from 'react-native';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
import type { WeekDay } from '@/src/types/today';
export function WeekStrip({ days }: { days: WeekDay[] }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return <View accessibilityLabel="Progresso da semana" style={styles.row}>
    {days.map(day => <View key={day.date ?? day.label} style={styles.day}>
      <Text style={styles.label}>{day.label}</Text>
      <View style={[styles.mark, day.state === 'complete' && styles.complete, day.state === 'current' && styles.current]}>
        <Text style={[styles.value, day.state === 'complete' && styles.completeText]}>
          {day.state === 'complete' ? '✓' : day.state === 'partial' ? '–' : day.state === 'current' ? '•' : '·'}
        </Text>
      </View>
      <View style={[styles.underline, day.state === 'current' && { backgroundColor: colors.orange }]} />
    </View>)}
  </View>;
}
const getStyles = (colors: Palette) => themedStyles({
  row: { flexDirection: 'row', gap: 6, marginTop: 16, marginBottom: 12 },
  day: { flex: 1, alignItems: 'center' },
  label: { fontSize: 9, fontWeight: '700', color: colors.muted, marginBottom: 8 },
  mark: { width: '100%', maxWidth: 52, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: 'transparent', borderRadius: 8 },
  complete: { backgroundColor: colors.primary },
  current: { borderColor: colors.orange, backgroundColor: colors.surface },
  value: { color: colors.muted, fontSize: 18, fontWeight: '600' },
  completeText: { color: colors.onAccent },
  underline: { width: 16, height: 2, marginTop: 6, backgroundColor: 'transparent' },
});
