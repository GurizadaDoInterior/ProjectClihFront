import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeToggle } from '@/src/components/theme-toggle';
import { ActivityRow } from '@/src/components/activity-row';
import { AppScreen } from '@/src/components/app-screen';
import { AreaRadar } from '@/src/components/area-radar';
import { BrandMark } from '@/src/components/brand-mark';
import { ProgressRing } from '@/src/components/progress-ring';
import { SectionHeader } from '@/src/components/section-header';
import { WeekStrip } from '@/src/components/week-strip';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { radius, shadows } from '@/src/theme/tokens';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
import { isDemo } from '@/src/services/api/client';

export default function TodayScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
          <Text style={styles.title}>Olá, {data.displayName}</Text>
<Text style={styles.kicker}>Sua rotina de hoje</Text>
        </View>
        <ThemeToggle />
      </View>

      <View style={styles.streakHero}>
        <Text style={styles.heroFlame}>🔥</Text>
        <View style={styles.streakCopy}>
          <Text style={styles.streakEyebrow}>SEQUÊNCIA</Text>
          <Text style={styles.streakUnit}><Text style={styles.streakNumber}>{data.streakDays}</Text> dias em sequência</Text>
        </View>
        <View style={styles.streakRecord}>
          <Text style={styles.heroFooterText}>Recorde</Text>
          <Text style={styles.recordValue}>{data.longestStreak ?? data.streakDays} dias</Text>
        </View>
      </View>

      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={[styles.level, { fontFamily: "ManropeMedium", fontWeight: "normal" }]}>Nível {data.level}</Text>
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

      <View style={styles.objectivesHeader}><SectionHeader>Atividades de hoje</SectionHeader><Text style={styles.kicker}>{completed}/{data.activities.length} feitos</Text></View>
      {completionError ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {completionError.message}
        </Text>
      ) : null}
      {isToggling ? <Text style={styles.sleepSubtitle}>Salvando alteração...</Text> : null}
      {!data.activities.length ? (
        <Link href="/habit/new" style={styles.sleepTitle}>
          Crie sua primeira atividade
        </Link>
      ) : null}
      {data.activities.slice(0, 3).map((activity) => (
        <ActivityRow
          key={activity.id}
          activity={activity}
          disabled={isToggling}
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

const getStyles = (colors: Palette) => themedStyles({
  kicker: { color: colors.muted, fontSize: 13, marginTop: 6 },
  objectivesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 },
  streakHero: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 8, padding: 16, backgroundColor: colors.hero, marginBottom: 16 },
  streakCopy: { flex: 1 },
  streakEyebrow: { color: colors.heroMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.3, marginBottom: 3 },
  heroFlame: { fontSize: 28 },
  streakNumber: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  streakUnit: { color: '#FFFFFF', fontSize: 14, lineHeight: 34, fontWeight: '600' },
  streakRecord: { alignItems: 'flex-end' },
  heroFooterText: { color: colors.heroMuted, fontSize: 10, fontWeight: '500' },
  recordValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginTop: 4 },
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
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  flame: { color: colors.orange, fontSize: 20, marginRight: 6 },
  streakStrong: { color: colors.orange, fontSize: 16, fontWeight: '700' },
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
  level: { color: colors.ink, fontSize: 19, fontWeight: '700' },
  xp: { color: colors.muted, fontSize: 16, fontWeight: '700' },
  xpTrack: { height: 9, overflow: 'hidden', borderRadius: 5, backgroundColor: colors.border },
  xpFill: { height: '100%', borderRadius: 5, backgroundColor: colors.teal },
  overview: {
    minHeight: 188,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryText: { color: colors.onAccent, fontWeight: '700' },
  sleepLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 18,
    borderRadius: radius.md,
    backgroundColor: colors.orangeSoft,
  },
  sleepTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  sleepSubtitle: { color: colors.muted, fontSize: 13, marginTop: 3 },
  chevron: { color: colors.orange, fontSize: 32, lineHeight: 32 },
  linkPressed: { opacity: 0.75 },
});
