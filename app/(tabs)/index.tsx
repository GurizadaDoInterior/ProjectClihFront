import { RocketFlight } from '@/src/components/rocket-flight';
import { TwinkleStar } from '@/src/components/twinkle-star';
import { useCallback, useState } from 'react';
import { MotionPressable as Pressable } from '@/src/components/motion-pressable';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Link, useFocusEffect } from 'expo-router';
import { Platform, Text, View, useWindowDimensions } from 'react-native';
import { ActivityRow } from '@/src/components/activity-row';
import { AppScreen } from '@/src/components/app-screen';
import { StreakRocket } from '@/src/components/streak-rocket';
import { getFlameStage } from '@/src/features/streak/flame';
import { WeekStrip } from '@/src/components/week-strip';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
import { isDemo } from '@/src/services/api/client';

export default function TodayScreen() {
  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(useCallback(() => { setIsFocused(true); return () => setIsFocused(false); }, []));
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const screenWidth = useWindowDimensions().width;
  const rocketSize = Math.min(270, (screenWidth - 48) * 0.58);
  const heroWidth = Math.min(640, Math.min(screenWidth, 920) - 48);
  const copyWidth = (heroWidth - 12) * 1.15 / 2.15;
  const metricSize = screenWidth < 480 ? 32 : 38;
  const { data, isLoading, isError, refetch, toggleActivity, completionError, isToggling, xpReward } = useTodaySummary();
  if (isLoading) return <AppScreen><Text style={styles.sub}>Carregando sua rotina...</Text></AppScreen>;
  if (isError || !data) return <AppScreen>
    <Text style={styles.title}>VAMOS TENTAR DE NOVO.</Text>
    <Text style={styles.sub}>Não foi possível carregar sua rotina.</Text>
    <Pressable accessibilityRole="button" onPress={() => refetch()} style={styles.action}><Text style={styles.actionText}>TENTAR NOVAMENTE</Text></Pressable>
  </AppScreen>;
  const completed = data.activities.filter(activity => activity.completed).length;
  const total = data.activities.length;
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

    <View style={styles.streakHero}>
      <View style={[styles.streakCopy, {width:copyWidth + 48}]}>
        <Text style={[styles.streakDays, {color:getFlameStage(data.streakDays).color}]}>{data.streakDays} <Text style={styles.daysUnit}>{data.streakDays === 1 ? 'DIA' : 'DIAS'}</Text></Text>
        <Text style={styles.streakHeading}>EM SEQUÊNCIA.</Text>
        <Text style={styles.streakCaption}>Sua chama está crescendo. Continue abastecendo sua jornada.</Text>
        <Link href="/rocket-preview" style={[styles.streakLink,{color:getFlameStage(data.streakDays).color}]}>{getFlameStage(data.streakDays).name.toUpperCase()} / VER EVOLUÇÃO ↗</Link>
      </View>
      <View style={[styles.heroRocketSlot, {left:12 + copyWidth,width:(heroWidth - 12) / 2.15}]}>
        <View pointerEvents="none" accessible={false} style={styles.rocketStars}>
          <TwinkleStar active={isFocused} delay={0} style={[styles.rocketStar, {left:'18%',top:'12%',fontSize:17}]}>✦</TwinkleStar>
          <TwinkleStar active={isFocused} delay={330} style={[styles.rocketStar, {right:'16%',top:'19%',fontSize:10,opacity:0.65}]}>✧</TwinkleStar>
          <TwinkleStar active={isFocused} delay={660} style={[styles.rocketStar, {left:'8%',top:'56%',fontSize:9,opacity:0.6}]}>✦</TwinkleStar>
          <TwinkleStar active={isFocused} delay={990} style={[styles.rocketStar, {right:'10%',bottom:'18%',fontSize:13,opacity:0.75}]}>✦</TwinkleStar>
          <TwinkleStar active={isFocused} delay={1320} style={[styles.rocketStar, {left:'32%',bottom:'8%',fontSize:8,opacity:0.55}]}>✧</TwinkleStar>
        </View>
        <Link href="/rocket-preview" asChild><Pressable accessibilityRole="button" accessibilityLabel={`Ver evolução do foguete. Fase atual: ${getFlameStage(data.streakDays).name}`} style={({pressed}) => [styles.heroRocket,{opacity:pressed ? 0.7 : 1}]}><RocketFlight active={isFocused} color={getFlameStage(data.streakDays).color}><StreakRocket days={data.streakDays} size={rocketSize} animate={isFocused} /></RocketFlight></Pressable></Link>
      </View>
    </View>
    <WeekStrip days={data.week} />

    <View style={styles.metrics}>
      <View style={[styles.metric, styles.streakMetric]}><View style={styles.metricValue}><Text style={[styles.metricNumber,styles.metricNumberLarge,{fontSize:metricSize}]}>{String(completed).padStart(2,'0')} <Text style={styles.activityTotal}>/ {String(total).padStart(2,'0')}</Text></Text></View><Text style={styles.metricLabel}>ATIVIDADES CONCLUÍDAS</Text></View>
      <View style={[styles.metric, styles.metricMiddle]}>
        <View style={styles.levelHeading}><Text style={styles.levelTitle}>NÍVEL {data.level}</Text><Text style={styles.levelXp}>{(data.xpInLevel ?? data.xp).toLocaleString('pt-BR')} / {data.xpToNextLevel.toLocaleString('pt-BR')} XP</Text></View>
        <View accessibilityRole="progressbar" accessibilityLabel="Progresso do nível" accessibilityValue={{ min: 0, max: 100, now: Math.round(xpPercent) }} style={styles.levelTrack}><View style={[styles.levelFill, { width: `${xpPercent}%` }]} /></View>
      </View>
    </View>

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
  streakHero: { flexDirection:'row', alignItems:'center', alignSelf:'flex-start', width:'100%', maxWidth:640, minHeight:230, paddingLeft:12, paddingTop:4, paddingBottom:8 },
  streakCopy: { minWidth:0, zIndex:1, marginLeft:-8, transform:[{translateX:-16}] },
  streakDays: { fontSize:94, lineHeight:100, fontWeight:'700', letterSpacing:0 },
  daysUnit: { fontSize:39, letterSpacing:-0.5 },
  streakHeading: { fontSize:30, lineHeight:35, fontWeight:'700', letterSpacing:1.2, color:colors.ink },
  streakCaption: { fontSize:14, lineHeight:21, color:colors.muted, marginTop:5 },
  streakLink: { fontSize:11, fontWeight:'700', letterSpacing:0.5, paddingVertical:12 },
  heroRocketSlot: { position:'absolute', top:4, height:230, alignItems:'center', justifyContent:'center' },
  heroRocket: { transform:[{translateX:-8},{translateY:-12}] },
  rocketStars: { position:'absolute', width:'100%', height:'100%', transform:[{translateX:-8},{translateY:-12}] },
  rocketStar: { position:'absolute', color:colors.orange, fontWeight:'400' },
  activityTotal: { fontSize:22, color:colors.muted },
  metrics: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 18, marginBottom: 4 },
  metric: { flex: 1, minWidth: 0, paddingHorizontal: 8 },
  streakMetric: { flex: 1, paddingHorizontal: 0 },
  metricValue: { height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  metricMiddle: { flex: 1.35, borderLeftWidth: 1, borderColor: colors.border, paddingLeft: 18, justifyContent: 'center' },
  metricNumber: { color: colors.ink, fontSize: 29, fontWeight: '700' },
  metricNumberLarge: { fontSize: 38, lineHeight: 46, width: '100%', letterSpacing: -1 },
  levelHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  levelTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  levelXp: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  metricUnit: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginTop: 3 },
  levelTrack: { height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.border, marginTop: 10, width: '100%' },
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
