import { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { useTheme, themedStyles } from '@/src/theme/theme-provider';
export function SectionHeader({ children, action }: PropsWithChildren<{ action?: string }>) {
  const { colors } = useTheme();
  const styles = themedStyles({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
    title: { color: colors.ink, fontSize: 24, fontWeight: '700' },
    action: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  });
  return <View style={styles.row}><Text style={styles.title}>{children}</Text>{action ? <Text style={styles.action}>{action}</Text> : null}</View>;
}
