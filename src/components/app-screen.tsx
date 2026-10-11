import { PropsWithChildren } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from './theme-toggle';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
type AppScreenProps = PropsWithChildren<{ scroll?: boolean; testID?: string }>;
export function AppScreen({ children, scroll = true, testID }: AppScreenProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const masthead = <View style={styles.masthead}>
    <View style={styles.brandRow}><View style={styles.brandStripe} /><Text style={styles.brand}>CLIH</Text><Text style={styles.brandLabel}>ROTINA PESSOAL</Text></View>
    <ThemeToggle />
  </View>;
  return <SafeAreaView edges={['top']} style={styles.safe} testID={testID}>
    {scroll ? <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{masthead}{children}</ScrollView>
      : <View style={[styles.content, { flex: 1 }]}>{masthead}{children}</View>}
  </SafeAreaView>;
}
const getStyles = (colors: Palette) => themedStyles({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 920, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 36 },
  masthead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 14, marginBottom: 22, borderBottomWidth: 2, borderBottomColor: colors.ink },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandStripe: { width: 5, height: 24, backgroundColor: colors.orange, transform: [{ skewX: '-12deg' }] },
  brand: { color: colors.ink, fontSize: 29, fontWeight: '700', letterSpacing: 1 },
  brandLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
});
