import { Pressable, Text, View } from 'react-native';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
import type { DailyActivity } from '@/src/types/today';
export function ActivityRow({ activity, onToggle, disabled = false }: { activity: DailyActivity; onToggle: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const area = activity.areaName ?? ({ study: 'ESTUDO', health: 'SAÚDE', reading: 'LEITURA', sleep: 'SONO' }[activity.area]);
  return <Pressable accessibilityRole="checkbox" aria-checked={activity.completed}
    accessibilityState={{ checked: activity.completed, disabled }} disabled={disabled}
    accessibilityLabel={`${activity.title}, ${activity.target}. ${activity.completed ? 'Desfazer conclusão' : 'Confirmar conclusão'}`}
    onPress={onToggle} style={({ pressed }) => [styles.row, pressed && { opacity: 0.65 }]}>
    <View style={[styles.toggle, activity.completed && styles.checked]}>
      {activity.completed ? <Text style={styles.check}>✓</Text> : null}
    </View>
    <View style={styles.copy}>
      <Text style={styles.category}>{area.toUpperCase()}</Text>
      <Text style={[styles.title, activity.completed && styles.completedTitle]}>{activity.title}</Text>
      <Text style={styles.target}>{activity.target}</Text>
    </View>
    <Text style={[styles.status, activity.completed && { color: colors.orange }]}>{activity.completed ? 'FEITO' : 'A FAZER'}</Text>
  </Pressable>;
}
const getStyles = (colors: Palette) => themedStyles({
  row: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggle: { width: 28, height: 28, borderWidth: 1.5, borderColor: colors.muted, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { fontSize: 18, fontWeight: '700', color: colors.onAccent },
  copy: { flex: 1 },
  category: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 18, fontWeight: '600', lineHeight: 25, marginTop: 2 },
  completedTitle: { color: colors.muted },
  target: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  status: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
});
