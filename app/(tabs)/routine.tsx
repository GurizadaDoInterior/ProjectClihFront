import {AppText as Text} from '@/src/components/app-text';
import { MotionPressable as Pressable } from '@/src/components/motion-pressable';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteHabit } from '@/src/services/api/today-api';
import type { DailyActivity, TodaySummary } from '@/src/types/today';
import { Link } from 'expo-router';
import { Modal, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/src/components/app-screen';
import { SectionHeader } from '@/src/components/section-header';
import { radius } from '@/src/theme/tokens';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { SwipeToDelete } from '@/src/components/swipe-to-delete';
import { ActivityRow } from '@/src/components/activity-row';

export default function RoutineScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { data, error, refetch, toggleActivity, completionError, isToggling, xpReward } = useTodaySummary();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<DailyActivity | null>(null);
  const deletion = useMutation({
    mutationFn: async ({activity, animateRemoval}: {activity:DailyActivity; animateRemoval?:()=>Promise<void>}) => {
      await deleteHabit(activity.habitId ?? activity.id, activity.completionPeriod);
      await animateRemoval?.();
      return activity.id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<TodaySummary>(['today'], current => current ? { ...current, activities: current.activities.filter(activity => activity.id !== deletedId) } : current);
      setDeleting(null);
      for (const key of ['today', 'day-history', 'calendar-activities']) void queryClient.invalidateQueries({ queryKey: [key] });
    },
  });
  const groups = [
    ['MORNING', 'Manhã'],
    ['AFTERNOON', 'Tarde'],
    ['EVENING', 'Noite'],
    ['ANYTIME', 'Sem horário'],
  ];
  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>PLANEJAMENTO DIÁRIO</Text><Text style={styles.title}>SUA ROTINA.</Text>
          <Text style={styles.subtitle}>Suas atividades, organizadas por período.</Text>
        </View>
        <Link href="/habit/new" asChild>
          <Pressable accessibilityRole="button" style={styles.addButton}>
            <Text style={styles.addButtonText}>＋</Text>
          </Pressable>
        </Link>
      </View>

      {!data ? (
        <Pressable onPress={() => refetch()}>
          <Text style={{ color: colors.muted }}>
            {error ? `${error.message} Toque para tentar novamente.` : 'Carregando rotina...'}
          </Text>
        </Pressable>
      ) : null}
      {completionError ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {completionError.message}
        </Text>
      ) : null}
      {deletion.error && !deleting ? <Text accessibilityRole="alert" style={{color:colors.danger}}>Não foi possível excluir a atividade. {deletion.error.message}</Text> : null}
      {data && !data.activities.length ? (
        <Text style={styles.subtitle}>Nenhuma atividade para hoje. Use + para criar uma.</Text>
      ) : null}
      {groups.filter(([key]) => data?.activities.some(item => (item.periods ?? [item.period ?? 'ANYTIME']).some(period => period === key))).map(([key, title]) => (
        <View key={key} style={styles.period}>
          <SectionHeader>{title}</SectionHeader>
          {data?.activities
            .filter((item) => (item.periods ?? [item.period ?? 'ANYTIME']).some(period => period === key))
            .map((item) => (
              <View key={item.id}>
              <SwipeToDelete onFullSwipe={animateRemoval => deletion.mutateAsync({activity:item,animateRemoval})} disabled={isToggling || deletion.isPending} onDelete={() => { deletion.reset(); setDeleting(item); }}><ActivityRow activity={item} xpReward={xpReward?.habitId === item.id ? xpReward : null} disabled={isToggling || deletion.isPending} onToggle={() => toggleActivity(item.id)} />
              <Pressable accessibilityRole="button" accessibilityLabel={'Excluir atividade '+item.title} disabled={isToggling || deletion.isPending} onPress={() => { deletion.reset(); setDeleting(item); }} style={({pressed}) => ({alignSelf:'flex-end',paddingVertical:10,paddingLeft:18,opacity:pressed?0.7:1})}><Text style={{color:colors.danger,fontSize:12,fontWeight:'600'}}>Excluir atividade</Text></Pressable>
              </SwipeToDelete></View>
            ))}
        </View>
      ))}
      <Modal visible={deleting !== null} transparent animationType="fade" onRequestClose={() => {if(!deletion.isPending)setDeleting(null);}}>
        <View style={{flex:1,backgroundColor:'#00000080',alignItems:'center',justifyContent:'center',padding:24}}>
          <View accessibilityViewIsModal style={{width:'100%',maxWidth:420,padding:24,borderRadius:16,backgroundColor:colors.surface,gap:16}}>
            <Text style={{color:colors.ink,fontSize:23,fontWeight:'700'}}>Excluir atividade?</Text>
            <Text style={{color:colors.muted,lineHeight:22}}>“{deleting?.title}” será removida somente deste turno. Os outros turnos continuam na rotina.</Text>
            {deletion.error ? <Text accessibilityRole="alert" style={{color:colors.danger}}>{deletion.error.message}</Text> : null}
            <View style={{flexDirection:'row',gap:12}}>
              <Pressable disabled={deletion.isPending} onPress={() => setDeleting(null)} style={{flex:1,padding:14,alignItems:'center',borderWidth:1,borderColor:colors.border,borderRadius:8}}><Text style={{color:colors.ink,fontWeight:'700'}}>Cancelar</Text></Pressable>
              <Pressable disabled={deletion.isPending} onPress={() => {if(deleting)deletion.mutate({activity:deleting});}} style={{flex:1,padding:14,alignItems:'center',backgroundColor:'#BC3831',borderRadius:8}}><Text style={{color:'#FFFFFF',fontWeight:'700'}}>{deletion.isPending?'Excluindo...':'Excluir'}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const getStyles = (colors: Palette) => themedStyles({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
    marginBottom: 30,
  },
  title: { color: colors.ink, fontSize: 46, lineHeight: 52, fontWeight: '700', letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 5 },
  addButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  addButtonText: { color: colors.onAccent, fontSize: 27, lineHeight: 29, fontWeight: '500' },
  period: { marginBottom: 28 },
  time: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  item: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  itemMarker: {
    width: 8,
    height: 8,
    marginRight: 12,
    borderRadius: 4,
    backgroundColor: colors.teal,
  },
  itemText: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '600' },
  drag: { color: '#9CA9BC', fontSize: 22 },
});
