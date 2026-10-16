import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ActivityRow } from '@/src/components/activity-row';
import { AppScreen } from '@/src/components/app-screen';
import { StreakRocket } from '@/src/components/streak-rocket';
import { getFlameStage } from '@/src/features/streak/flame';
import { WeekStrip } from '@/src/components/week-strip';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
import { isDemo } from '@/src/services/api/client';

export default function TodayScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const rocketSize = useWindowDimensions().width < 360 ? 76 : 84;
  const { data, isLoading, isError, refetch, toggleActivity, completionError, isToggling, xpReward } = useTodaySummary();
  if (isLoading) return <AppScreen><Text style={styles.sub}>Carregando sua rotina...</Text></AppScreen>;
  if (isError || !data) return <AppScreen>
    <Text style={styles.title}>VAMOS TENTAR DE NOVO.</Text>
    <Text style={styles.sub}>Não foi possível carregar sua rotina.</Text>
    <Pressable accessibilityRole="button" onPress={() => refetch()} style={styles.action}><Text style={styles.actionText}>TENTAR NOVAMENTE</Text></Pressable>
  </AppScreen>;
  const completed = data.activities.filter(activity => activity.completed).length;
  const total = data.activities.length;
  const percent = total ? Math.round(completed / total * 100) : 0;
  const xpPercent = Math.min(((data.xpInLevel ?? data.xp) / Math.max(data.xpToNextLevel, 1)) * 100, 100);
  function toggle(id: string) {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleActivity(id);
  }
  return <AppScreen testID="today-screen">
    <View style={styles.pageHead}>
      <View><Text style={styles.eyebrow}>SEU DIA / {data.displayName.toUpperCase()}</Text><Text style={styles.title}>HOJE É DIA.</Text></View>
      <Link href="/habit/new" asChild><Pressable accessibilityRole="button" style={styles.add}><Text style={styles.addText}>+ ATIVIDADE</Text></Pressable></Link>
    </View>
    {isDemo ? <Text style={styles.demo}>MODO DEMONSTRAÇÃO</Text> : null}

    <View style={styles.scoreboard}>
      <View style={styles.scoreMain}>
        <Text style={styles.scoreLabel}>ATIVIDADES CONCLUÍDAS</Text>
        <View style={styles.numberLine}><Text style={styles.scoreNumber}>{String(completed).padStart(2, '0')}</Text><Text style={styles.scoreTotal}>/ {String(total).padStart(2, '0')}</Text></View>
        <View style={styles.scoreTrack}><View style={[styles.scoreFill, { width: `${percent}%` }]} /></View>
      </View>
      <View style={styles.scoreSide}>
        <Text style={styles.scorePercent}>{percent}%</Text>
        <Text style={styles.scoreCaption}>{total === 0 ? 'Crie sua primeira atividade' : completed === total ? 'Rotina do dia completa' : `${total - completed} para fechar o dia`}</Text>
      </View>
    </View>

    <View style={styles.metrics}>
      <View style={[styles.metric, styles.streakMetric]}><View style={[styles.metricValue, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }]}><StreakRocket days={data.streakDays} size={rocketSize} /><Text style={[styles.metricNumber, { color: getFlameStage(data.streakDays).color }]}>{data.streakDays}</Text></View><Text style={styles.metricLabel}>DIAS EM SEQUÊNCIA</Text></View>
      <View style={[styles.metric, styles.metricMiddle]}><View style={styles.metricValue}><Text style={styles.metricNumber}>{data.level}<Text style={styles.metricUnit}> NÍVEL</Text></Text></View><View style={styles.levelTrack}><View style={[styles.levelFill, { width: `${xpPercent}%` }]} /></View></View>
      <View style={styles.metric}><View style={styles.metricValue}><Text style={styles.metricNumber}>{data.xp.toLocaleString('pt-BR')}</Text></View><Text style={styles.metricLabel}>XP ACUMULADO</Text></View>
    </View>
    <WeekStrip days={data.week} />

    <View style={styles.sectionLine}><Text style={styles.section}>NA SUA LISTA</Text><Link href="/routine" style={styles.textLink}>VER ROTINA ↗</Link></View>
    {completionError ? <Text accessibilityRole="alert" style={styles.error}>{completionError.message}</Text> : null}

    {!total ? <Link href="/habit/new" style={styles.textLink}>Adicionar sua primeira atividade →</Link> : null}
    {data.activities.map(activity => <ActivityRow key={activity.id} activity={activity} xpReward={xpReward?.habitId === activity.id ? xpReward : null} disabled={isToggling} onToggle={() => toggle(activity.id)} />)}

    <Link href="/sleep" asChild><Pressable accessibilityRole="button" style={styles.sleep}>
      <View><Text style={styles.eyebrow}>RECUPERAÇÃO</Text><Text style={styles.sleepTitle}>O descanso também conta.</Text><Text style={styles.sub}>Registrar horários de sono</Text></View>
      <Svg accessible={false} width={32} height={32} viewBox="0 0 24 24"><Path d="M5 19 19 5M5 5h14v14" stroke={colors.orange} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>
    </Pressable></Link>
  </AppScreen>;
}
const getStyles = (colors: Palette) => themedStyles({
  pageHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: colors.muted },
  title: { fontSize: 48, lineHeight: 52, fontWeight: '700', color: colors.ink, marginTop: 4 },
  add: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: colors.ink, borderRadius: 8 },
  addText: { fontSize: 11, fontWeight: '700', color: colors.ink, letterSpacing: 0.7 },
  demo: { color: colors.muted, fontSize: 9, letterSpacing: 1, marginBottom: 16 },
  scoreboard: { borderRadius: 14, overflow: 'hidden', flexDirection: 'row', backgroundColor: '#EEA449', padding: 22, alignItems: 'center', gap: 18, marginBottom: 0 },
  scoreMain: { flex: 1.6 },
  scoreLabel: { color: '#17120C', fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
  numberLine: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  scoreNumber: { fontSize: 82, lineHeight: 90, color: '#17120C', fontWeight: '700', letterSpacing: -1 },
  scoreTotal: { fontSize: 31, color: '#17120C', fontWeight: '600' },
  scoreSide: { flex: 1, alignItems: 'flex-end' },
  scorePercent: { fontSize: 40, fontWeight: '700', color: '#17120C' },
  scoreCaption: { color: '#17120C', fontSize: 13, textAlign: 'right', maxWidth: 155 },
  scoreTrack: { height: 3, backgroundColor: '#17120C30', marginTop: 7 },
  scoreFill: { height: '100%', backgroundColor: '#17120C' },
  metrics: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 18, marginBottom: 4 },
  metric: { flex: 1, minWidth: 0, paddingHorizontal: 8 },
  streakMetric: { flex: 1.35, paddingHorizontal: 4 },
  metricValue: { height: 84, justifyContent: 'center', alignItems: 'flex-start' },
  metricMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  metricNumber: { color: colors.ink, fontSize: 29, fontWeight: '700' },
  metricUnit: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  metricLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.6, marginTop: 3 },
  levelTrack: { height: 2, backgroundColor: colors.border, marginTop: 8, width: '85%' },
  levelFill: { height: '100%', backgroundColor: colors.orange },
  sectionLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.ink, paddingBottom: 12, marginTop: 18 },
  section: { fontSize: 24, fontWeight: '700', color: colors.ink, letterSpacing: 0.5 },
  textLink: { fontSize: 11, fontWeight: '700', color: colors.ink, paddingVertical: 10 },
  error: { color: colors.danger, fontSize: 14, marginVertical: 10 },
  sub: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 4 },
  sleep: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 2, borderTopColor: colors.ink, paddingTop: 20, marginTop: 28 },
  sleepTitle: { color: colors.ink, fontSize: 25, fontWeight: '600', marginTop: 4 },
  arrow: { color: colors.orange, fontSize: 38 },
  action: { backgroundColor: colors.primary, padding: 16, marginTop: 20 },
  actionText: { color: colors.onAccent, fontSize: 14, fontWeight: '700' },
});
