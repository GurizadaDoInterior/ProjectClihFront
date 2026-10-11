import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { StyleSheet, useColorScheme, type TextStyle, type ViewStyle, type ImageStyle } from 'react-native';
import { lightColors, darkColors, type Palette } from './tokens';
export type ThemeMode = 'light' | 'dark';
const ThemeContext = createContext<{ mode: ThemeMode; colors: Palette; toggleTheme: () => void; storageError: string }>({ mode: 'light' as ThemeMode, colors: lightColors, toggleTheme: () => {}, storageError: '' });
export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(system === 'dark' ? 'dark' : 'light');
  const [storageError, setStorageError] = useState('');
  const changed = useRef(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('@clih/theme').then(saved => {
      if (active && !changed.current && (saved === 'light' || saved === 'dark')) setMode(saved);
    }).catch(() => { if (active) setStorageError('Não foi possível recuperar o tema salvo.'); });
    return () => { active = false; };
  }, []);
  function toggleTheme() {
    changed.current = true;
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    setStorageError('');
    writes.current = writes.current.catch(() => {}).then(() => AsyncStorage.setItem('@clih/theme', next))
      .catch(() => setStorageError('Tema aplicado, mas não foi possível salvar sua preferência.'));
  }
  return <ThemeContext.Provider value={{ mode, colors: mode === 'dark' ? darkColors : lightColors, toggleTheme, storageError }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
export function themedStyles<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T {
  const result = Object.fromEntries(Object.entries(styles).map(([key, value]) => {
    const text = value as TextStyle;
    const weight = Number(text.fontWeight ?? 400);
    return [key, ('fontSize' in text || 'fontWeight' in text || 'lineHeight' in text || 'color' in text)
      ? { ...text, fontFamily: text.fontFamily ?? ((text.fontSize ?? 0) >= 20 ? (weight >= 700 ? 'BarlowBold' : 'Barlow') : weight >= 700 ? 'SourceSansBold' : weight >= 500 ? 'SourceSansSemiBold' : 'SourceSans'), fontWeight: 'normal' as const }
      : value];
  }));
  return StyleSheet.create(result as T);
}
export type { Palette };
