import { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';

type SectionHeaderProps = PropsWithChildren<{
  action?: ReactNode;
}>;

export function SectionHeader({ children, action }: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{children}</Text>
      {action}
    </View>
  );
}

const getStyles = (colors: Palette) => themedStyles({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 29,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
