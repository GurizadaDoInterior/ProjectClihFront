import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/app-screen';
import { SectionHeader } from '@/src/components/section-header';
import { colors, radius } from '@/src/theme/tokens';

const periods = [
  { title: 'Manhã', time: '07:00 – 11:30', items: ['Caminhar · 3 km', 'Revisar prioridades · 10 min'] },
  { title: 'Tarde', time: '13:00 – 18:00', items: ['Estudar programação · 30 min'] },
  { title: 'Noite', time: '19:00 – 23:00', items: ['Ler · 10 páginas', 'Desacelerar · 20 min'] },
];

export default function RoutineScreen() {
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

      {periods.map((period) => (
        <View key={period.title} style={styles.period}>
          <SectionHeader action={<Text style={styles.time}>{period.time}</Text>}>
            {period.title}
          </SectionHeader>
          {period.items.map((item) => (
            <View key={item} style={styles.item}>
              <View style={styles.itemMarker} />
              <Text style={styles.itemText}>{item}</Text>
              <Text style={styles.drag}>⠿</Text>
            </View>
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
  itemMarker: { width: 8, height: 8, marginRight: 12, borderRadius: 4, backgroundColor: colors.teal },
  itemText: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '600' },
  drag: { color: '#9CA9BC', fontSize: 22 },
});
