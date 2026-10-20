import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { useMutation, useQuery, useQueryClient, useIsMutating } from '@tanstack/react-query';
import { AppText as Text } from './app-text';
import { MotionPressable as Pressable } from './motion-pressable';
import { SmoothReveal } from './smooth-reveal';
import { SwipeToDelete } from './swipe-to-delete';
import type { DailyActivity, TodaySummary } from '../types/today';
import type { DayPeriod } from '../services/api/contracts';
import { TaskCalendar } from './task-calendar';
import { dateKey, formatDate, monthCounts, parseDateKey } from '../features/agenda/dates';
import { getAgendaDay, getScheduledHabits, setAgendaOccurrenceCanceled } from '../services/api/today-api';
import { useTheme } from '../theme/theme-provider';

const periodLabels = { MORNING: 'Manhã', AFTERNOON: 'Tarde', EVENING: 'Noite', ANYTIME: 'Sem horário' };

export function RoutineAgenda({ today }: { today: string }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => parseDateKey(today));
  const client=useQueryClient();
  const toggling=useIsMutating({mutationKey:['habit-toggle']});
  const [lastCanceled,setLastCanceled]=useState<{habitId:string; date:string; period:DayPeriod; title:string} | null>(null);
  const cancellation=useMutation({
    mutationFn: async (item:{habitId:string; date:string; period:DayPeriod; title:string; canceled:boolean; animate?:()=>Promise<void>}) => {
      await setAgendaOccurrenceCanceled(item.habitId,item.date,item.period,item.canceled);
      await item.animate?.();
    },
    onSuccess: (_,item) => {
      setLastCanceled(item.canceled ? item : null);
      if(item.canceled) client.setQueryData<TodaySummary>(['day-history',item.date], current=>current ? {...current,activities:current.activities.filter(a=>(a.habitId ?? a.id)!==item.habitId || (a.completionPeriod ?? a.period ?? 'ANYTIME')!==item.period)} : current);
      for(const key of ['agenda','today','day-history','evolution','calendar-activities']) void client.invalidateQueries({queryKey:[key]});
    },
  });
  const cancel=(activity:DailyActivity,animate?:()=>Promise<void>) => cancellation.mutateAsync({habitId:activity.habitId ?? activity.id,date:selected,period:activity.completionPeriod ?? activity.period ?? 'ANYTIME',title:activity.title,canceled:true,animate});
  const schedules = useQuery({ queryKey: ['agenda', 'habits'], queryFn: getScheduledHabits, enabled: open, staleTime: 30_000 });
  const day = useQuery({ queryKey: ['day-history', selected], queryFn: () => getAgendaDay(selected), enabled: open });
  const counts = useMemo(() => schedules.data ? monthCounts(schedules.data, month) : undefined, [schedules.data, month]);
  return <View style={{ marginBottom: 24 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={open ? 'Ocultar minha agenda' : 'Ver minha agenda'}
      aria-expanded={open} accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)}
      style={{ minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.primary, fontWeight: '700' }}>{open ? 'Ocultar minha agenda ↑' : 'Ver minha agenda ↓'}</Text>
    </Pressable>
    <SmoothReveal visible={open}>
      <View style={{ paddingTop: 16, gap: 12 }}>
        <Text style={{ color: colors.muted, fontSize: 14 }}>Sua agenda. Escolha um dia para ver as atividades programadas.</Text>
        {schedules.isPending ? <Text style={{ color: colors.muted }}>Carregando agenda...</Text> : null}
        {schedules.isError ? <Pressable onPress={() => schedules.refetch()}><Text style={{ color: colors.danger }}>Não foi possível carregar os totais. Tentar novamente.</Text></Pressable> : null}
        <TaskCalendar month={month} selected={selected} counts={counts} onSelect={setSelected}
          onMonth={date => { setMonth(date); setSelected(dateKey(new Date(date.getFullYear(), date.getMonth(), 1, 12))); }} />
        <View style={{ padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}>
          <Text accessibilityRole="header" style={{ color: colors.ink, fontSize: 20, fontWeight: '700' }}>{formatDate(selected)}</Text>
          {day.isPending ? <Text style={{ color: colors.muted }}>Carregando atividades do dia...</Text> : day.isError ?
            <Pressable onPress={() => day.refetch()}><Text style={{ color: colors.danger }}>Não foi possível carregar este dia. Tentar novamente.</Text></Pressable> : <>
              {!day.data?.activities.length ? <Text style={{ color: colors.muted }}>Nenhuma atividade agendada para este dia.</Text> :
                <Text style={{ color: colors.muted }}>{day.data.activities.length} {day.data.activities.length === 1 ? 'atividade programada' : 'atividades programadas'}</Text>}
              {!!day.data?.activities.some(a=>!a.completed) && selected>=today ? <Text style={{color:colors.muted,fontSize:12}}>← Arraste para cancelar só neste dia</Text> : null}
              {cancellation.isError ? <Text accessibilityRole="alert" style={{color:colors.danger,fontSize:13}}>{cancellation.error.message}</Text> : null}
              {lastCanceled ? <View style={{flexDirection:'row',alignItems:'center',gap:12}}><Text style={{color:colors.muted,flex:1,fontSize:13}}>Atividade cancelada em {formatDate(lastCanceled.date)}.</Text><Pressable disabled={cancellation.isPending} accessibilityLabel="Desfazer cancelamento" onPress={()=>cancellation.mutate({...lastCanceled,canceled:false})} style={{padding:10}}><Text style={{color:colors.primary,fontWeight:'700'}}>Desfazer</Text></Pressable></View> : null}
              {day.data?.activities.map(activity => <SwipeToDelete key={`${selected}:${activity.id}`} actionLabel="Cancelar dia" accessibilityLabel={`Cancelar ${activity.title} só em ${formatDate(selected)}`} disabled={selected<today || activity.completed || cancellation.isPending || toggling>0} onDelete={()=>{void cancel(activity).catch(()=>{});}} onFullSwipe={animate=>cancel(activity,animate)}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: activity.completed ? colors.success : colors.orange }}>{activity.completed ? '✓' : '○'}</Text>
                <View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontSize: 17, fontWeight: '600' }}>{activity.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{activity.target} · {periodLabels[activity.completionPeriod ?? activity.period ?? 'ANYTIME']}</Text></View>
                <Text style={{ color: colors.muted, fontSize: 10 }}>{activity.completed ? 'FEITO' : selected > today ? 'AGENDADO' : 'PENDENTE'}</Text>
                {!activity.completed && selected>=today ? <Pressable accessibilityLabel={`Cancelar ${activity.title} neste dia`} disabled={cancellation.isPending || toggling>0} onPress={()=>{void cancel(activity).catch(()=>{});}} style={{padding:10}}><Text style={{color:colors.muted,fontSize:18}}>×</Text></Pressable> : null}
              </View></SwipeToDelete>)}
            </>}
          {selected >= today ? <Link href={{ pathname: '/habit/new', params: { date: selected } }} asChild>
            <Pressable accessibilityLabel={`Agendar atividade para ${formatDate(selected)}`} style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: colors.primary }}>
              <Text style={{ color: colors.onAccent, fontWeight: '700' }}>+ Agendar para este dia</Text>
            </Pressable>
          </Link> : null}
        </View>
      </View>
    </SmoothReveal>
  </View>;
}
