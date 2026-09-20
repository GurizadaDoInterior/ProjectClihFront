import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/app-screen';
import { SectionHeader } from '@/src/components/section-header';
import { colors, radius } from '@/src/theme/tokens';

const days = Array.from({ length: 28 }, (_, index) => ({
  key: index,
  intensity: index % 9 === 0 ? 0 : ((index * 7) % 4) + 1,
}));

const areas = [
  { name: 'Estudos', value: 82, color: colors.teal },
  { name: 'Saúde', value: 68, color: colors.primary },
  { name: 'Leitura', value: 54, color: colors.violet },
  { name: 'Sono', value: 76, color: colors.orange },
];

export default function ProgressScreen() {
  return (
    <AppScreen>
      <Text style={styles.title}>Evolução</Text>
      <Text style={styles.subtitle}>Uma visão honesta da sua constância.</Text>

      <View style={styles.summaryRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>18</Text>
          <Text style={styles.metricLabel}>atividades</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>5</Text>
          <Text style={styles.metricLabel}>dias ativos</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>+12%</Text>
          <Text style={styles.metricLabel}>vs. semana</Text>
        </View>
      </View>

      <SectionHeader>Últimas 4 semanas</SectionHeader>
      <View style={styles.calendar}>
        {days.map((day) => (
          <View
            key={day.key}
            style={[
              styles.calendarDay,
              day.intensity === 1 && styles.dayOne,
              day.intensity === 2 && styles.dayTwo,
              day.intensity === 3 && styles.dayThree,
              day.intensity === 4 && styles.dayFour,
            ]}
          />
        ))}
      </View>

      <SectionHeader>Equilíbrio por área</SectionHeader>
      <View style={styles.areaList}>
        {areas.map((area) => (
          <View key={area.name} style={styles.areaRow}>
            <View style={styles.areaCopy}>
              <Text style={styles.areaName}>{area.name}</Text>
              <Text style={styles.areaValue}>{area.value}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${area.value}%`, backgroundColor: area.color }]} />
            </View>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -1, paddingTop: 18 },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 5, marginBottom: 26 },
  summaryRow: { flexDirection: 'row', gap: 9, marginBottom: 30 },
  metric: { flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface },
  metricValue: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  metricLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: 4 },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 18, marginBottom: 30, borderRadius: radius.lg, backgroundColor: colors.surface },
  calendarDay: { width: '11.2%', aspectRatio: 1, borderRadius: 6, backgroundColor: colors.surfaceMuted },
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
