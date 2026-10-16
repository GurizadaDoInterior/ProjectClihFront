import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTodaySummary } from '@/src/features/today/use-today-summary';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/src/services/api/today-api';
import { isDemo } from '@/src/services/api/client';
import { Link } from 'expo-router';

import { timezoneLabel } from '@/src/components/timezone-select';
import { ThemeToggle } from '@/src/components/theme-toggle';
import { AppScreen } from '@/src/components/app-screen';
import { radius } from '@/src/theme/tokens';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { data, error, refetch } = useTodaySummary();
  const profile = useQuery({ queryKey: ['me'], queryFn: getMe, enabled: !isDemo });
  if (!data)
    return (
      <AppScreen>
        <Pressable onPress={() => refetch()}>
          <Text style={{ color: colors.muted }}>
            {error ? `${error.message} Toque para tentar novamente.` : 'Carregando perfil...'}
          </Text>
        </Pressable>
      </AppScreen>
    );
  return (
    <AppScreen>
      <Text style={styles.pageEyebrow}>SUA CONTA</Text><Text style={styles.pageTitle}>PERFIL.</Text>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          {profile.data?.avatarUrl ? <Image accessibilityLabel="Foto do perfil" source={{ uri: profile.data.avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 8 }} /> : <Text style={styles.avatarText}>{data.displayName.slice(0, 1)}</Text>}
        </View>
        <Text style={styles.name}>{data.displayName}</Text>
        <Text style={styles.handle}>
          {profile.data
            ? `${profile.data.username ? `@${profile.data.username} · ` : ''}${timezoneLabel(profile.data.timezoneId)}`
            : isDemo
              ? 'Perfil de demonstração'
              : 'Seu perfil'}
        </Text>
        {profile.isError ? (
          <Pressable onPress={() => profile.refetch()}>
            <Text style={styles.noteText}>
              Não foi possível carregar os detalhes. Tentar novamente
            </Text>
          </Pressable>
        ) : null}
        <View style={styles.level}>
          <Text style={styles.levelText}>
            Nível {data.level} · {data.xp} XP
          </Text>
        </View>
      </View>

      {!isDemo ? (
        <Link href="/profile/edit" asChild><Pressable accessibilityRole="button" style={styles.editButton}><Text style={styles.editText}>✎  Editar perfil</Text><Text style={styles.editHint}>Foto, nome e preferências  →</Text></Pressable></Link>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}><Text style={styles.sectionTitle}>Aparência</Text><ThemeToggle /></View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{data.streakDays}</Text>
          <Text style={styles.statLabel}>sequência</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{data.longestStreak ?? data.streakDays}</Text>
          <Text style={styles.statLabel}>maior sequência</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {data.week.filter((day) => (day.completed ?? 0) > 0).length}
          </Text>
          <Text style={styles.statLabel}>dias nesta semana</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Concluídas hoje</Text>
      {data.activities
        .filter((item) => item.completed)
        .map((activity) => activity.title)
        .map((item, index) => (
          <View key={item} style={styles.feedRow}>
            <View style={[styles.feedDot, index === 1 && styles.feedDotOrange]} />
            <View style={styles.feedCopy}>
              <Text style={styles.feedText}>{item}</Text>
              <Text style={styles.feedTime}>Hoje</Text>
            </View>
          </View>
        ))}


    </AppScreen>
  );
}

const getStyles = (colors: Palette) => themedStyles({
  editButton: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, marginBottom: 26 },
  editText: { color: colors.onAccent, fontSize: 17, fontWeight: '700' },
  editHint: { color: colors.onAccent, fontSize: 13, marginTop: 4 },
  pageEyebrow: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  pageTitle: { color: colors.ink, fontSize: 48, lineHeight: 54, fontWeight: '700' },
  hero: { alignItems: 'flex-start', paddingTop: 24, paddingBottom: 26, marginBottom: 22, borderBottomWidth: 2, borderBottomColor: colors.ink },
  avatar: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 0,
    borderColor: colors.surface,
    backgroundColor: colors.primary,
  },
  avatarText: { color: colors.onAccent, fontSize: 36, fontWeight: '700' },
  name: { color: colors.ink, fontSize: 38, fontWeight: '700', marginTop: 15 },
  handle: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 4 },
  level: {
    marginTop: 13,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.blueSoft,
  },
  levelText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  stats: {
    flexDirection: 'row',
    padding: 8,
    marginBottom: 28,
    borderRadius: 0,
    backgroundColor: colors.background,
  },
  stat: { flex: 1, alignItems: 'flex-start', paddingVertical: 13 },
  statValue: { color: colors.ink, fontSize: 34, fontWeight: '700' },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: 3 },
  sectionTitle: { color: colors.ink, fontSize: 26, fontWeight: '700', marginBottom: 14 },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  feedDot: {
    width: 10,
    height: 10,
    marginHorizontal: 6,
    marginRight: 16,
    borderRadius: 5,
    backgroundColor: colors.teal,
  },
  feedDotOrange: { backgroundColor: colors.orange },
  feedCopy: { flex: 1 },
  feedText: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  feedTime: { color: colors.muted, fontSize: 12, marginTop: 3 },
  note: {
    padding: 18,
    marginTop: 26,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  noteTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  noteText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
