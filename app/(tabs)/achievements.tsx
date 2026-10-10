import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/app-screen';
import { radius } from '@/src/theme/tokens';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
import { isDemo } from '@/src/services/api/client';

const achievements = [
  {
    icon: '✦',
    title: 'Primeiro passo',
    description: 'Conclua sua primeira atividade',
    unlocked: true,
  },
  {
    icon: '7',
    title: 'Uma semana em movimento',
    description: 'Tenha 7 dias ativos',
    unlocked: true,
  },
  {
    icon: '↗',
    title: 'Constância nos estudos',
    description: 'Estude por 10 horas',
    unlocked: false,
  },
  {
    icon: '◎',
    title: 'Vida em equilíbrio',
    description: 'Use 4 áreas na mesma semana',
    unlocked: false,
  },
];

export default function AchievementsScreen() {
  const { colors, mode } = useTheme();
  const styles = getStyles(colors, mode === "dark");
  if (!isDemo)
    return (
      <AppScreen>
        <Text style={styles.title}>Conquistas</Text>
        <Text style={styles.subtitle}>
          Em breve. O desbloqueio de conquistas ainda não está disponível nesta versão.
        </Text>
      </AppScreen>
    );
  return (
    <AppScreen>
      <Text style={styles.title}>Conquistas</Text>
      <Text style={styles.subtitle}>Marcos da sua evolução, sem pressão.</Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressValue}>2 de 12</Text>
        <Text style={styles.progressLabel}>conquistas desbloqueadas</Text>
        <View style={styles.track}>
          <View style={styles.fill} />
        </View>
      </View>

      {achievements.map((achievement) => (
        <View key={achievement.title} style={[styles.row, !achievement.unlocked && styles.locked]}>
          <View style={[styles.icon, achievement.unlocked && styles.unlockedIcon]}>
            <Text style={[styles.iconText, achievement.unlocked && styles.unlockedText]}>
              {achievement.icon}
            </Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.name}>{achievement.title}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
          </View>
          <Text style={styles.status}>{achievement.unlocked ? '✓' : '· · ·'}</Text>
        </View>
      ))}
    </AppScreen>
  );
}

const getStyles = (colors: Palette, dark: boolean) => themedStyles({
  title: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.3,
    paddingTop: 18,
  },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 5, marginBottom: 26 },
  progressCard: {
    padding: 20,
    marginBottom: 22,
    borderRadius: radius.lg,
    backgroundColor: dark ? "#D4C9B3" : colors.ink,
  },
  progressValue: { color: dark ? "#171511" : colors.onAccent, fontSize: 26, fontWeight: '700' },
  progressLabel: { color: dark ? '#171511' : '#D8DFEA', fontSize: 13, marginTop: 3, marginBottom: 14 },
  track: { height: 7, overflow: 'hidden', borderRadius: 4, backgroundColor: dark ? '#ACA18B' : '#344064' },
  fill: { width: '17%', height: '100%', borderRadius: 4, backgroundColor: colors.orange },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  locked: { opacity: 0.62 },
  icon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  unlockedIcon: { backgroundColor: colors.orangeSoft },
  iconText: { color: colors.muted, fontSize: 20, fontWeight: '700' },
  unlockedText: { color: colors.orange },
  copy: { flex: 1 },
  name: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  status: { color: colors.teal, fontSize: 18, fontWeight: '700' },
});
