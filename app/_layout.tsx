import { BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { SourceSans3_400Regular, SourceSans3_600SemiBold, SourceSans3_700Bold } from '@expo-google-fonts/source-sans-3';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AppProviders } from '@/src/providers/app-providers';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Manrope: Manrope_400Regular, ManropeMedium: Manrope_500Medium, ManropeBold: Manrope_700Bold, SourceSans: SourceSans3_400Regular, SourceSansSemiBold: SourceSans3_600SemiBold, SourceSansBold: SourceSans3_700Bold, Barlow: BarlowCondensed_600SemiBold, BarlowBold: BarlowCondensed_700Bold });
  useEffect(() => { if (loaded || error) SplashScreen.hideAsync(); }, [loaded, error]);
  if (!loaded && !error) return null;
  return <AppProviders><Navigation /></AppProviders>;
}
function Navigation() {
  const { colors, mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: 'ManropeBold' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sleep" options={{ title: 'Como você dormiu?', presentation: 'modal' }} />
        <Stack.Screen name="habit/new" options={{ title: 'Nova atividade', presentation: 'modal' }} />
        <Stack.Screen name="profile/edit" options={{ title: 'Editar perfil', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
