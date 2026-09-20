import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/app-screen';
import { SectionHeader } from '@/src/components/section-header';
import { colors, radius } from '@/src/theme/tokens';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { ActivityRow } from '@/src/components/activity-row';

export default function RoutineScreen() {
  const { data, error, refetch, toggleActivity, completionError } = useTodaySummary();
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
          <Text style={styles.title}>Sua rotina</Text>
          <Text style={styles.subtitle}>Organize o dia sem perder o ritmo.</Text>
        </View>
        <Link href="/habit/new" asChild>
          <Pressable accessibilityRole="button" style={styles.addButton}>
            <Text style={styles.addButtonText}>＋</Text>
          </Pressable>
        </Link>
      </View>

      {!data ? (
        <Pressable onPress={() => refetch()}>
          <Text>
            {error ? `${error.message} Toque para tentar novamente.` : 'Carregando rotina...'}
          </Text>
        </Pressable>
      ) : null}
      {completionError ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {completionError.message}
        </Text>
      ) : null}
      {data && !data.activities.length ? (
        <Text style={styles.subtitle}>Nenhuma atividade para hoje. Use + para criar uma.</Text>
      ) : null}
      {groups.map(([key, title]) => (
        <View key={key} style={styles.period}>
          <SectionHeader>{title}</SectionHeader>
          {data?.activities
            .filter((item) => (item.period ?? 'ANYTIME') === key)
            .map((item) => (
              <ActivityRow key={item.id} activity={item} onToggle={() => toggleActivity(item.id)} />
            ))}
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    marginBottom: 30,
  },
  title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 5 },
  addButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  addButtonText: { color: colors.surface, fontSize: 27, lineHeight: 29, fontWeight: '500' },
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
