import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getFlameStage } from '@/src/features/streak/flame';
import { useTheme } from '@/src/theme/theme-provider';

export function StreakRocket({ days }: { days: number }) {
  const stage = getFlameStage(days);
  const { colors } = useTheme();
  const power = Math.max(0, Math.min(7, [0, 3, 10, 30, 50, 100, 200, 300].filter(mark => days >= mark).length - 1));
  const tail = 43 + power * 0.8;
  return <View accessible accessibilityRole="image" accessibilityLabel={`Foguete: ${stage.name}, ${days} dias em sequência`}>
    <Svg width={38 + power} height={52} viewBox="0 0 44 52">
      {/* Geometria simples, contorno firme e cores do próprio tema. */}
      <Path d={`M17 34 Q14 41 22 ${tail} Q30 41 27 34 Z`} fill={stage.color} />
      <Path d={`M20 35 Q18 40 22 ${tail - 3} Q26 40 24 35 Z`} fill={stage.core} />
      {power >= 4 ? <Path d="M14 39 L12 43 M30 39 L32 43" stroke={stage.color} strokeWidth={1.6} strokeLinecap="round" /> : null}
      <Path d="M15 22 L8 29 L8 35 L16 32 M29 22 L36 29 L36 35 L28 32" fill={colors.surface} stroke={colors.ink} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M22 4 C15 10 14 18 15 27 L17 33 L27 33 L29 27 C30 18 29 10 22 4 Z" fill={colors.surface} stroke={colors.ink} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M22 4 Q17 9 16 13 L28 13 Q27 9 22 4 Z" fill={colors.ink} />
      <Circle cx={22} cy={20} r={4.2} fill={stage.color} stroke={colors.ink} strokeWidth={1.5} />
      <Circle cx={23.2} cy={18.8} r={1.15} fill={stage.core} />
      <Path d="M18 29 L26 29 M18 34 L26 34" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" />
      {power >= 3 ? <Path d="M20 26 L24 26" stroke={stage.color} strokeWidth={1.5} strokeLinecap="round" /> : null}
      {power >= 6 ? <Path d="M35 8 L35 13 M32.5 10.5 L37.5 10.5" stroke={stage.color} strokeWidth={1.5} strokeLinecap="round" /> : null}
    </Svg>
  </View>;
}
