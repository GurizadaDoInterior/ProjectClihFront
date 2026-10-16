import { MotionPressable as Pressable } from '@/src/components/motion-pressable';
import { Text } from 'react-native';
import { useTheme } from '@/src/theme/theme-provider';
export function ThemeToggle() {
  const { colors, mode, toggleTheme, storageError } = useTheme();
  return <Pressable accessibilityRole="switch" aria-checked={mode === 'dark'} accessibilityState={{ checked: mode === 'dark' }}
    accessibilityLabel={storageError ? 'Tema escuro. ' + storageError : 'Tema escuro'} onPress={toggleTheme}
    style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}>
    <Text style={{ fontFamily: 'SourceSansSemiBold', fontSize: 11, letterSpacing: 1, color: colors.muted }}>{mode === 'dark' ? 'ESCURO / ☾' : 'CLARO / ☀'}</Text>
  </Pressable>;
}
