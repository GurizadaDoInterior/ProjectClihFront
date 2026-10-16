import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { getFlameStage } from '@/src/features/streak/flame';
import { useTheme } from '@/src/theme/theme-provider';

export function StreakRocket({ days }: { days: number }) {
  const stage = getFlameStage(days);
  const { mode } = useTheme();
  const power = Math.max(0, [0, 3, 10, 30, 50, 100, 200, 300].filter(mark => days >= mark).length - 1);
  const tail = 58 + power * 0.85;
  const body = mode === 'dark' ? '#D6DCE0' : '#DCE1E4';
  const edge = mode === 'dark' ? '#8A9AA6' : '#405565';
  const accent = '#C66A3D';
  return <View accessible accessibilityRole="image" accessibilityLabel={`Foguete: ${stage.name}, ${days} dias em sequência`}>
    <Svg width={76} height={76} viewBox="-10 -6 72 76">
      <G transform="rotate(-42 22 30)">
        <Path d={`M17 36 L14.5 44 L18.5 42 L22 ${tail} L25.5 42 L29.5 44 L27 36 Z`} fill={stage.color} />
        <Path d={`M20 37 L22 ${tail - 7} L24 37 Z`} fill={stage.core} />
        <Path d="M15 23 L8 31 L8 36 L16 32 Z M29 23 L36 31 L36 36 L28 32 Z" fill={accent} />
        <Path d="M22 4 L16 14 L15 27 L18 33 L26 33 L29 27 L28 14 Z" fill={body} stroke={edge} strokeWidth={1.2} strokeLinejoin="miter" />
        <Path d="M22 4 L16 14 L28 14 Z" fill={accent} />
        <Path d="M22 14 L28 14 L29 27 L26 33 L22 33 Z" fill={edge} opacity={0.14} />
        <Circle cx={22} cy={21} r={4.2} fill={edge} />
        <Circle cx={22} cy={21} r={2.7} fill="#7297A6" />
        <Path d="M22 28 L20 35 L24 35 Z" fill={accent} />
        <Path d="M18 34 L26 34 L26 37 L18 37 Z" fill={edge} />
      </G>
    </Svg>
  </View>;
}
