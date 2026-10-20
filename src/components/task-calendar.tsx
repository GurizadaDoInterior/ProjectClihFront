import { View } from 'react-native';
import { AppText as Text } from './app-text';
import { MotionPressable as Pressable } from './motion-pressable';
import { calendarDays, dateKey, formatDate, parseDateKey } from '../features/agenda/dates';
import { useTheme } from '../theme/theme-provider';

export function TaskCalendar({ month, selected, onMonth, onSelect, minDate, counts }: {
  month: Date; selected: string; onMonth: (date: Date) => void; onSelect: (date: string) => void;
  minDate?: string; counts?: Record<string, number>;
}) {
  const { colors } = useTheme();
  const today = dateKey();
  const previous = new Date(month.getFullYear(), month.getMonth() - 1, 1, 12);
  const cannotGoBack = !!minDate && dateKey(new Date(month.getFullYear(), month.getMonth(), 0, 12)) < minDate;
  const title = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return <View accessibilityLabel="Calendário de tarefas" style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, gap: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pressable accessibilityLabel="Mês anterior da agenda" disabled={cannotGoBack} onPress={() => onMonth(previous)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.ink, fontSize: 28 }}>‹</Text></Pressable>
      <Text accessibilityLiveRegion="polite" style={{ color: colors.ink, fontWeight: '700', fontSize: 18, textTransform: 'capitalize' }}>{title}</Text>
      <Pressable accessibilityLabel="Próximo mês da agenda" onPress={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1, 12))} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.ink, fontSize: 28 }}>›</Text></Pressable>
    </View>
    <View style={{ flexDirection: 'row' }}>{['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map(label => <Text key={label} style={{ width: '14.2857%', textAlign: 'center', color: colors.muted, fontSize: 10, fontWeight: '700' }}>{label}</Text>)}</View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {calendarDays(month).map(day => {
        if (!day.inMonth) return <View key={day.date} style={{ width: '14.2857%', minHeight: 58 }} />;
        const checked = day.date === selected;
        const count = counts?.[day.date] ?? 0;
        return <Pressable key={day.date} accessibilityRole="radio" accessibilityState={{ checked }}
          accessibilityLabel={`${formatDate(day.date)}${counts ? `, ${count} ${count === 1 ? 'atividade' : 'atividades'}` : ''}${day.date === today ? ', hoje' : ''}`}
          disabled={!!minDate && day.date < minDate} onPress={() => onSelect(day.date)}
          style={{ width: '14.2857%', minHeight: 58, paddingVertical: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 8,
            backgroundColor: checked ? colors.primary : 'transparent', borderWidth: 1, borderColor: day.date === today ? colors.orange : 'transparent' }}>
          <Text style={{ color: checked ? colors.onAccent : colors.ink, fontSize: 16, fontWeight: checked || count ? '700' : '400' }}>{day.day}</Text>
          {counts ? <Text style={{ color: checked ? colors.onAccent : count ? colors.orange : colors.muted, fontSize: 10, marginTop: 3 }}>{count ? `${count} ${count === 1 ? 'tarefa' : 'tarefas'}` : '·'}</Text> : null}
        </Pressable>;
      })}
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>Selecionado: {selected.split('-').reverse().join('/')}</Text>
      <Pressable accessibilityLabel="Selecionar hoje na agenda" disabled={!!minDate && today < minDate} onPress={() => { onMonth(parseDateKey(today)); onSelect(today); }} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' }}><Text style={{ color: colors.primary, fontWeight: '700' }}>Hoje</Text></Pressable>
    </View>
  </View>;
}
