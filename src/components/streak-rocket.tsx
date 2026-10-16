import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { getFlameStage } from '@/src/features/streak/flame';
import { useTheme } from '@/src/theme/theme-provider';

export function StreakRocket({ days }: { days: number }) {
  const stage = getFlameStage(days);
  const { colors } = useTheme();
  const power = Math.max(0, [0, 3, 10, 30, 50, 100, 200, 300].filter(mark => days >= mark).length - 1);
  const tail = 43 + power * 0.65;
  return <View accessible accessibilityRole="image" accessibilityLabel={`Foguete: ${stage.name}, ${days} dias em sequência`}>
    <Svg width={48} height={52} viewBox="-7 -5 58 62">
      <G transform="rotate(42 22 25)">
        <Path d={`M16.5 34 C14 39 17 44 22 ${tail} C27 44 30 39 27.5 34 Z`} fill={stage.color} />
        <Path d={`M19 35 C18 39 20 41 22 ${tail - 3} C24 41 26 39 25 35 Z`} fill={stage.core} />
        <Path d="M15 21 C10 23 7 28 7 35 L16 31 Z M29 21 C34 23 37 28 37 35 L28 31 Z" fill={colors.ink} />
        <Path d="M22 3 C14 9 12.5 20 15.5 30 L18 33 L26 33 L28.5 30 C31.5 20 30 9 22 3 Z" fill={colors.ink} />
        <Path d="M22 7 C18 11 16.5 15 16.5 20" fill="none" stroke={colors.surface} strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />
        <Circle cx={22} cy={19} r={5.2} fill={colors.background} />
        <Circle cx={22} cy={19} r={3.4} fill={stage.color} />
        <Path d="M21 17.5 L22.5 16.8" stroke={stage.core} strokeWidth={1.4} strokeLinecap="round" />
        <Path d="M22 27 L22 35" stroke={colors.surface} strokeWidth={2} strokeLinecap="round" />
        <Path d="M18 34.5 L26 34.5" stroke={colors.ink} strokeWidth={2.5} strokeLinecap="round" />
        {power >= 4 ? <Path d="M12 38 L10 42 M32 38 L34 42" stroke={stage.color} strokeWidth={1.5} strokeLinecap="round" /> : null}
      </G>
    </Svg>
  </View>;
}
