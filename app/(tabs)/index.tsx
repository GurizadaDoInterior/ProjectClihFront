import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActivityRow } from '@/src/components/activity-row';
import { AppScreen } from '@/src/components/app-screen';
import { AreaRadar } from '@/src/components/area-radar';
import { BrandMark } from '@/src/components/brand-mark';
import { ProgressRing } from '@/src/components/progress-ring';
import { SectionHeader } from '@/src/components/section-header';
import { WeekStrip } from '@/src/components/week-strip';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { colors, radius, shadows } from '@/src/theme/tokens';
import { isDemo } from '@/src/services/api/client';

export default function TodayScreen() {
  const { data, isLoading, isError, refetch, toggleActivity, completionError, isToggling } =
    useTodaySummary();

  if (isLoading) {
    return (
      <AppScreen scroll={false}>
        <View style={styles.centered}>
          <BrandMark />
          <Text style={styles.loading}>Preparando o seu dia...</Text>
        </View>
      </AppScreen>
    );
  }

  if (isError || !data) {
    return (
      <AppScreen scroll={false}>
        <View style={styles.centered}>
          <Text style={styles.title}>Não foi possível carregar sua rotina.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  const completed = data.activities.filter((activity) => activity.completed).length;

  function handleToggle(activityId: string) {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleActivity(activityId);
  }

  return (
    <AppScreen testID="today-screen">
      {isDemo ? <Text style={styles.sleepSubtitle}>Demonstração · dados de exemplo</Text> : null}
      <View style={styles.header}>
        <View style={styles.greetingBlock}>
          <Text style={styles.title}>Bom dia, {data.displayName}</Text>
          <View style={styles.streakRow}>
            <Text style={styles.flame}>♨</Text>
            <Text style={styles.streakStrong}>{data.streakDays} dias</Text>
            <Text style={styles.streak}> em sequência</Text>
          </View>
        </View>
        <BrandMark />
      </View>

      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.level}>Nível {data.level}</Text>
          <Text style={styles.xp}>{data.xp.toLocaleString('pt-BR')} XP</Text>
        </View>
        <View style={styles.xpTrack}>
          <View
            style={[
              styles.xpFill,
              {
                width: `${Math.min(((data.xpInLevel ?? data.xp) / Math.max(data.xpToNextLevel, 1)) * 100, 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      <WeekStrip days={data.week} />

      <View style={styles.overview}>
        <ProgressRing completed={completed} total={data.activities.length} />
        <View style={styles.divider} />
        {data.areas ? (
          <View style={{ flex: 1, paddingLeft: 16 }}>
            {data.areas.map((area) => (
              <Text key={area.id} style={styles.sleepSubtitle}>
                {area.name}: {area.value}%
              </Text>
            ))}
          </View>
        ) : (
          <AreaRadar values={data.areaBalance} />
        )}
      </View>

      <SectionHeader>Objetivos de hoje</SectionHeader>
      {completionError ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {completionError.message}
        </Text>
      ) : null}
      {isToggling ? <Text style={styles.sleepSubtitle}>Salvando conclusão...</Text> : null}
      {!data.activities.length ? (
        <Link href="/habit/new" style={styles.sleepTitle}>
          Crie sua primeira atividade
        </Link>
      ) : null}
      {data.activities.slice(0, 3).map((activity) => (
        <ActivityRow
          key={activity.id}
          activity={activity}
          onToggle={() => handleToggle(activity.id)}
        />
      ))}

      <Link href="/sleep" asChild>
        <Pressable style={({ pressed }) => [styles.sleepLink, pressed && styles.linkPressed]}>
          <View>
            <Text style={styles.sleepTitle}>Como você dormiu?</Text>
            <Text style={styles.sleepSubtitle}>Registre seu sono em menos de um minuto</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </Link>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 16,
  },
  greetingBlock: { flex: 1, paddingRight: 12 },
  title: {
    color: colors.ink,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    letterSpacing: -1,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  flame: { color: colors.orange, fontSize: 20, marginRight: 6 },
  streakStrong: { color: colors.orange, fontSize: 16, fontWeight: '800' },
  streak: { color: colors.muted, fontSize: 16, fontWeight: '500' },
  levelCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  level: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  xp: { color: colors.muted, fontSize: 16, fontWeight: '700' },
  xpTrack: { height: 9, overflow: 'hidden', borderRadius: 5, backgroundColor: colors.border },
  xpFill: { height: '100%', borderRadius: 5, backgroundColor: colors.teal },
  overview: {
    minHeight: 168,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  divider: { width: 1, height: 138, backgroundColor: colors.border },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  loading: { color: colors.muted, fontSize: 16, fontWeight: '600' },
  retryButton: {
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  retryText: { color: colors.surface, fontWeight: '800' },
  sleepLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 18,
    borderRadius: radius.md,
    backgroundColor: colors.orangeSoft,
  },
  sleepTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  sleepSubtitle: { color: colors.muted, fontSize: 13, marginTop: 3 },
  chevron: { color: colors.orange, fontSize: 32, lineHeight: 32 },
  linkPressed: { opacity: 0.75 },
});
