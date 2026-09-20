import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/app-screen';
import { colors, radius } from '@/src/theme/tokens';

export default function ProfileScreen() {
  return (
    <AppScreen>
      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>G</Text></View>
        <Text style={styles.name}>Gustavo</Text>
        <Text style={styles.handle}>@gustavo · Explorador da constância</Text>
        <View style={styles.level}><Text style={styles.levelText}>Nível 8 · 1.240 XP</Text></View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statValue}>7</Text><Text style={styles.statLabel}>sequência</Text></View>
        <View style={styles.stat}><Text style={styles.statValue}>18</Text><Text style={styles.statLabel}>conquistas</Text></View>
        <View style={styles.stat}><Text style={styles.statValue}>42</Text><Text style={styles.statLabel}>dias ativos</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Atividade recente</Text>
      {['Concluiu “Estudar programação”', 'Desbloqueou “Primeiro passo”', 'Manteve 7 dias de sequência'].map((item, index) => (
        <View key={item} style={styles.feedRow}>
          <View style={[styles.feedDot, index === 1 && styles.feedDotOrange]} />
          <View style={styles.feedCopy}>
            <Text style={styles.feedText}>{item}</Text>
            <Text style={styles.feedTime}>{index === 0 ? 'Hoje' : `${index + 1} dias atrás`}</Text>
          </View>
        </View>
      ))}

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Perfil social é uma próxima etapa</Text>
        <Text style={styles.noteText}>Seguir pessoas, verificação e sugestões de amigos entram depois de validar o ciclo principal da rotina.</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 28, paddingBottom: 24 },
  avatar: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center', borderRadius: 44, borderWidth: 5, borderColor: colors.surface, backgroundColor: colors.ink },
  avatarText: { color: colors.surface, fontSize: 36, fontWeight: '800' },
  name: { color: colors.ink, fontSize: 26, fontWeight: '800', marginTop: 15 },
  handle: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 4 },
  level: { marginTop: 13, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 14, backgroundColor: colors.blueSoft },
  levelText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  stats: { flexDirection: 'row', padding: 8, marginBottom: 28, borderRadius: radius.lg, backgroundColor: colors.surface },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 13 },
  statValue: { color: colors.ink, fontSize: 21, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: 3 },
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', marginBottom: 14 },
  feedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  feedDot: { width: 10, height: 10, marginHorizontal: 6, marginRight: 16, borderRadius: 5, backgroundColor: colors.teal },
  feedDotOrange: { backgroundColor: colors.orange },
  feedCopy: { flex: 1 },
  feedText: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  feedTime: { color: colors.muted, fontSize: 12, marginTop: 3 },
  note: { padding: 18, marginTop: 26, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  noteTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  noteText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
