import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { WeekStrip } from '@/src/components/week-strip';

import { AppScreen } from '@/src/components/app-screen';
import { SectionHeader } from '@/src/components/section-header';
import { colors, radius } from '@/src/theme/tokens';

export default function ProgressScreen() {
  const { data, error, refetch } = useTodaySummary();
  if (!data)
    return (
      <AppScreen>
        <Pressable onPress={() => refetch()}>
          <Text>
            {error ? `${error.message} Toque para tentar novamente.` : 'Carregando evolução...'}
          </Text>
        </Pressable>
      </AppScreen>
    );
  const areas = data.areas ?? [];
  return (
    <AppScreen>
      <Text style={styles.title}>Evolução</Text>
      <Text style={styles.subtitle}>Uma visão honesta da sua constância.</Text>

      <View style={styles.summaryRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {data.week.reduce((sum, day) => sum + (day.completed ?? 0), 0)}
          </Text>
          <Text style={styles.metricLabel}>atividades na semana</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {data.week.filter((day) => (day.completed ?? 0) > 0).length}
          </Text>
          <Text style={styles.metricLabel}>dias ativos</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{data.longestStreak ?? data.streakDays}</Text>
          <Text style={styles.metricLabel}>maior sequência</Text>
        </View>
      </View>

      <SectionHeader>Esta semana</SectionHeader>
      <WeekStrip days={data.week} />
      <SectionHeader>Progresso de hoje por área</SectionHeader>
      <View style={styles.areaList}>
        {areas.map((area) => (
          <View key={area.name} style={styles.areaRow}>
            <View style={styles.areaCopy}>
              <Text style={styles.areaName}>{area.name}</Text>
              <Text style={styles.areaValue}>{area.value}%</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[styles.fill, { width: `${area.value}%`, backgroundColor: area.color }]}
              />
            </View>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -1,
    paddingTop: 18,
  },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 5, marginBottom: 26 },
  summaryRow: { flexDirection: 'row', gap: 9, marginBottom: 30 },
  metric: { flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface },
  metricValue: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  metricLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: 4 },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 18,
    marginBottom: 30,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  calendarDay: {
    width: '11.2%',
    aspectRatio: 1,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
  },
  dayOne: { backgroundColor: '#DDF6F1' },
  dayTwo: { backgroundColor: '#AEE9DE' },
  dayThree: { backgroundColor: '#6FD5C5' },
  dayFour: { backgroundColor: colors.teal },
  areaList: { padding: 18, borderRadius: radius.lg, backgroundColor: colors.surface },
  areaRow: { marginBottom: 18 },
  areaCopy: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  areaName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  areaValue: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  track: { height: 8, overflow: 'hidden', borderRadius: 4, backgroundColor: colors.surfaceMuted },
  fill: { height: '100%', borderRadius: 4 },
});
