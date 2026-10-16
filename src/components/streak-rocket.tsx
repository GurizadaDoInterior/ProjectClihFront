import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { getFlameStage } from '@/src/features/streak/flame';
import { useTheme } from '@/src/theme/theme-provider';

export function StreakRocket({ days, size = 84 }: { days: number; size?: number }) {
  const stage = getFlameStage(days);
  const { mode } = useTheme();
  const power = Math.max(0, [0, 3, 10, 30, 50, 100, 200, 300].filter(mark => days >= mark).length - 1);
  const tail = 58 + power * 0.85;
  const body = mode === 'dark' ? '#D6DCE0' : '#DCE1E4';
  const edge = mode === 'dark' ? '#8A9AA6' : '#405565';
  const accent = '#D37340';
  return <View accessible accessibilityRole="image" accessibilityLabel={`Foguete: ${stage.name}, ${days} dias em sequência`}>
    <Svg width={size} height={size} viewBox="-10 -6 72 76">
      <G transform="rotate(-42 22 30)">
        <Path d={`M17 36 C13 41 15 46 18.5 48 Q20 55 22 ${tail} Q26 55 27 48 C30 44 31 40 27 36 Z`} fill={stage.color} />
        <Path d={`M20 37 Q17.5 44 22 ${tail - 6} Q26.5 44 24 37 Z`} fill={stage.core} />
        <Path d="M15 23 Q9 26 8 33 L8 36 L16 32 Z M29 23 Q35 26 36 33 L36 36 L28 32 Z" fill={accent} />
        <Path d="M22 4 C17 8 14 16 15 25 Q15 30 18 33 L26 33 Q29 30 29 25 C30 16 27 8 22 4 Z" fill={body} stroke={edge} strokeWidth={1.2} strokeLinejoin="round" />
        <Path d="M22 4 Q17.5 8 15.6 14 L28.4 14 Q26.5 8 22 4 Z" fill={accent} />
        <Path d="M22 14 L28.4 14 Q30 26 26 33 L22 33 Z" fill={edge} opacity={0.14} />
        <Circle cx={22} cy={21} r={4.6} fill={edge} />
        <Circle cx={22} cy={21} r={3.1} fill="#7297A6" />
        <Path d="M22 28 L20 35 L24 35 Z" fill={accent} />
        <Path d="M18 34 L26 34 L26 37 L18 37 Z" fill={edge} />
      </G>
    </Svg>
  </View>;
}
