import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';

type AppScreenProps = PropsWithChildren<{
  scroll?: boolean;
  testID?: string;
}>;

export function AppScreen({ children, scroll = true, testID }: AppScreenProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  if (!scroll) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe} testID={testID}>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe} testID={testID}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: Palette) => themedStyles({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
