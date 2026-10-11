import { Pressable, Text, View } from 'react-native';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { AreaRadar } from '@/src/components/area-radar';
import { WeekStrip } from '@/src/components/week-strip';
import { AppScreen } from '@/src/components/app-screen';
import { SectionHeader } from '@/src/components/section-header';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
export default function ProgressScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { data, error, refetch } = useTodaySummary();
  if (!data) return <AppScreen><Pressable onPress={() => refetch()}><Text style={styles.sub}>{error ? error.message + ' Toque para tentar novamente.' : 'Carregando evolução...'}</Text></Pressable></AppScreen>;
  const areas = data.areas ?? Object.entries(data.areaBalance).map(([id, value]) => ({ id, name: ({study:'Estudo',health:'Saúde',reading:'Leitura',sleep:'Sono'} as Record<string,string>)[id], value: Math.round(value * 100), color: colors.primary }));
  const weekly = data.activities.filter(activity => activity.completed).length;
  return <AppScreen>
    <Text style={styles.eyebrow}>SEU DESEMPENHO</Text><Text style={styles.title}>EVOLUÇÃO.</Text>
    <Text style={styles.sub}>Resumo da semana e atividades de hoje.</Text>
    <View style={styles.mainStat}><Text style={styles.mainValue}>{weekly.toString().padStart(2, '0')}</Text><View style={styles.mainCopy}><Text style={styles.mainLabel}>ATIVIDADES</Text><Text style={styles.sub}>concluídas hoje</Text></View></View>
    <View style={styles.metrics}>
      <View style={styles.metric}><Text style={styles.number}>{data.week.filter(day => day.state === 'complete' || day.state === 'partial' || (day.completed ?? 0) > 0).length}</Text><Text style={styles.label}>DIAS ATIVOS</Text></View>
      <View style={styles.metric}><Text style={styles.number}>{data.streakDays}</Text><Text style={styles.label}>SEQUÊNCIA ATUAL</Text></View>
      <View style={styles.metric}><Text style={styles.number}>{data.longestStreak ?? data.streakDays}</Text><Text style={styles.label}>RECORDE</Text></View>
    </View>
    <SectionHeader>ESTA SEMANA</SectionHeader><WeekStrip days={data.week} />
    <View style={{ marginTop: 28 }}><SectionHeader>SEUS ATRIBUTOS</SectionHeader></View>
    <Text style={styles.sub}>Desempenho de hoje em cada área.</Text>
    {areas.length >= 3 ? <AreaRadar areas={areas} /> : <Text style={styles.sub}>O gráfico aparece a partir de três áreas.</Text>}
    {areas.length ? areas.map((area, i) => <View key={area.id} style={styles.areaRow}>
      <Text style={styles.index}>{String(i + 1).padStart(2,'0')}</Text>
      <View style={{ flex: 1 }}><View style={styles.areaCopy}><Text style={styles.areaName}>{area.name}</Text><Text style={styles.areaValue}>{area.value}%</Text></View>
      <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(area.value,100))}%` }]} /></View></View>
    </View>) : <Text style={styles.sub}>Crie uma área e uma atividade para acompanhar seu progresso.</Text>}
  </AppScreen>;
}
const getStyles = (colors: Palette) => themedStyles({
  eyebrow: { color: colors.muted, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 48, lineHeight: 54, fontWeight: '700' },
  sub: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 4 },
  mainStat: { flexDirection: 'row', alignItems: 'center', gap: 20, borderBottomWidth: 2, borderBottomColor: colors.ink, paddingVertical: 22, marginTop: 12 },
  mainValue: { color: colors.orange, fontSize: 88, lineHeight: 96, fontWeight: '700' },
  mainCopy: { flex: 1 }, mainLabel: { color: colors.ink, fontSize: 25, fontWeight: '700' },
  metrics: { flexDirection: 'row', paddingVertical: 22, marginBottom: 20 },
  metric: { flex: 1 }, number: { color: colors.ink, fontSize: 35, fontWeight: '700' },
  label: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  index: { color: colors.muted, fontSize: 23, fontWeight: '600' },
  areaCopy: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  areaName: { color: colors.ink, fontSize: 17, fontWeight: '600' },
  areaValue: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  track: { height: 4, backgroundColor: colors.border }, fill: { height: '100%', backgroundColor: colors.orange },
});
