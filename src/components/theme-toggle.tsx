import { Pressable, Text } from 'react-native';
import { useTheme } from '@/src/theme/theme-provider';
export function ThemeToggle() {
  const { colors, mode, toggleTheme, storageError } = useTheme();
  return <Pressable accessibilityRole="switch" aria-checked={mode === "dark"} accessibilityState={{ checked: mode === 'dark' }}
    accessibilityLabel={storageError ? "Tema escuro. " + storageError : "Tema escuro"} onPress={toggleTheme}
    style={{ borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border }}>
    <Text style={{ fontFamily: 'SourceSansSemiBold', fontSize: 13, color: colors.ink }}>{mode === 'dark' ? '☾ Escuro' : '☀ Claro'}</Text>
  </Pressable>;
}
