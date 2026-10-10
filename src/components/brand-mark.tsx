import { StyleSheet, Text, View } from 'react-native';

import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';

export function BrandMark() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View accessibilityLabel="Marca provisória Clih" style={styles.mark}>
      <Text style={styles.letter}>C</Text>
    </View>
  );
}

const getStyles = (colors: Palette) => themedStyles({
  mark: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSoft,
  },
  letter: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
