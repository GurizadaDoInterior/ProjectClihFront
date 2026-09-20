import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/tokens';

export function BrandMark() {
  return (
    <View accessibilityLabel="Marca provisória Clih" style={styles.mark}>
      <Text style={styles.letter}>C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSoft,
  },
  letter: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -1,
  },
});
