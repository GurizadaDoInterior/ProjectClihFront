import { useEffect, useRef, useState } from 'react';
import { Link } from 'expo-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SleepHistory, dateKey, type SleepEntry } from '@/src/components/sleep-history';
import { request } from '@/src/services/api/client';
import { mapToday } from '@/src/services/api/today-mapper';
import type { TodayResponse } from '@/src/services/api/contracts';
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View } from 'react-native';
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const calendarReveal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const animation = Animated.timing(calendarReveal, { toValue: showCalendar ? 1 : 0, duration: reduceMotion ? 0 : showCalendar ? 440 : 420, easing: Easing.inOut(Easing.sin), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [showCalendar, reduceMotion, calendarReveal]);
  const [selected, setSelected] = useState(dateKey(new Date()));
  const [month, setMonth] = useState(new Date());
  const from = dateKey(new Date(month.getFullYear(), month.getMonth(), -6));
  const to = dateKey(new Date(month.getFullYear(), month.getMonth()+1, 0));
  const sleep = useQuery({ queryKey: ['sleep', from, to], placeholderData: keepPreviousData, queryFn: () => request<SleepEntry[]>('/sleep?from='+from+'&to='+to) });
  const day = useQuery({ queryKey: ['day-history', selected], enabled: showCalendar, queryFn: async () => mapToday(await request<TodayResponse>('/today?date='+selected)) });
  const monthActivities = useQuery({
    queryKey: ['calendar-activities', month.getFullYear(), month.getMonth()],
    placeholderData: keepPreviousData,
    enabled: showCalendar,
    queryFn: async () => {
      const dates = Array.from({length:6}, (_,i) => dateKey(new Date(month.getFullYear(),month.getMonth(),1+i*7)));
      const responses = await Promise.all(dates.map(date => request<TodayResponse>('/today?date='+date)));
      return Object.fromEntries(responses.flatMap(response => response.week.map(day => [day.date, {completed:day.completed,planned:day.planned}])));
    },
  });
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
    <Pressable accessibilityRole="button" accessibilityState={{expanded:showCalendar}} onPress={() => setShowCalendar(value => !value)} style={({pressed}) => ({paddingVertical:16,marginTop:20,borderWidth:1,borderColor:colors.border,borderRadius:8,alignItems:'center',opacity:pressed?0.85:1})}>
      <Text style={{color:colors.primary,fontWeight:'700'}}>{showCalendar ? 'Ocultar calendário ↑' : 'Ver calendário ↓'}</Text>
    </Pressable>
    <Animated.View pointerEvents={showCalendar ? 'auto' : 'none'} accessibilityElementsHidden={!showCalendar} importantForAccessibility={showCalendar ? 'auto' : 'no-hide-descendants'} style={{ height: calendarReveal.interpolate({inputRange:[0,1],outputRange:[0,calendarHeight]}), overflow:'hidden', opacity:calendarReveal }}>
    <View aria-hidden={!showCalendar} onLayout={event => setCalendarHeight(event.nativeEvent.layout.height)} style={{position:'absolute',top:0,left:0,right:0}}>
    {sleep.isPending ? <Text style={styles.sub}>Carregando calendário...</Text> : sleep.isError ? <Pressable onPress={() => sleep.refetch()}><Text style={styles.sub}>Não foi possível carregar o sono. Toque para tentar novamente.</Text></Pressable> : <SleepHistory overview activities={monthActivities.isPlaceholderData ? undefined : monthActivities.data} dayDetails={<View style={{ marginTop: 24, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 8, gap: 10 }}>
      <Text style={{color:colors.ink,fontWeight:'700',fontSize:18}}>ATIVIDADES • {selected.split('-').reverse().join('/')}</Text>
      {day.isPending ? <Text style={styles.sub}>Carregando atividades do dia...</Text> : day.isError ? <Pressable onPress={() => day.refetch()}><Text style={styles.sub}>Não foi possível carregar. Toque para tentar novamente.</Text></Pressable> : <>
        <Text style={styles.sub}>{day.data?.activities.filter(item => item.completed).length ?? 0} de {day.data?.activities.length ?? 0} atividades concluídas</Text>
        {day.data?.activities.map(item => <View key={item.id} style={{flexDirection:'row',gap:10,alignItems:'center'}}><Text style={{color:item.completed?colors.success:colors.muted}}>{item.completed?'✓':'○'}</Text><View style={{flex:1}}><Text style={{color:colors.ink}}>{item.title}</Text><Text style={styles.sub}>{item.target}</Text></View><Text style={{color:colors.muted,fontSize:11}}>{item.completed?'FEITO':'PENDENTE'}</Text></View>)}
        {!day.data?.activities.length ? <Text style={styles.sub}>Nenhuma atividade programada para esse dia.</Text> : null}
      </>}
      <Link href="/sleep" style={{color:colors.primary,fontWeight:'700',paddingVertical:10}}>REGISTRAR SONO →</Link>
    </View>} month={month} selected={selected} entries={sleep.data ?? []} onMonth={date => { setMonth(date); setSelected(dateKey(date)); }} onSelect={setSelected} />}
    </View></Animated.View>
    <View style={{ marginTop: 28 }}><SectionHeader>SEUS ATRIBUTOS</SectionHeader></View>
    <Text style={styles.sub}>Desempenho de hoje em cada área.</Text>
    {areas.length ? <AreaRadar areas={areas} /> : <Text style={styles.sub}>Crie sua primeira área para acompanhar seus atributos.</Text>}
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
