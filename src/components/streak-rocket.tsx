import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { useId } from 'react';
import { getFlameStage } from '@/src/features/streak/flame';

export function StreakRocket({ days }: { days: number }) {
  const stage = getFlameStage(days);
  const gradient = `rocket-${useId().replace(/:/g, '')}`;
  const power = Math.max(0, [0, 3, 10, 30, 50, 100, 200, 300].filter(mark => days >= mark).length - 1);
  const tail = 58 + power * 0.85;
  const outline = '#293C55';
  return <View accessible accessibilityRole="image" accessibilityLabel={`Foguete: ${stage.name}, ${days} dias em sequência`}>
    <Svg width={64} height={64} viewBox="-10 -6 72 76">
      <Defs>
        <LinearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.55" stopColor="#F4F0E7" />
          <Stop offset="1" stopColor="#C7D4DF" />
        </LinearGradient>
      </Defs>
      <G transform="rotate(-42 22 30)">
        {/* A chama ocupa um espaço próprio: sua cor identifica a evolução. */}
        <Path d={`M16 35 C10 42 13 50 16 53 L18 48 Q19 57 22 ${tail} Q28 56 28 48 L30 53 C34 46 33 40 28 35 Z`} fill={stage.color} />
        <Path d={`M19 37 C16 43 19 49 22 ${tail - 5} C26 49 29 42 25 37 Z`} fill={stage.core} />
        <Path d="M21 38 Q19 44 22 48 Q25 43 23 38 Z" fill="#FFFFFF" opacity={0.9} />
        <Path d="M15 22 Q7 25 7 35 L16 32 Z" fill="#E97938" stroke={outline} strokeWidth={1.3} strokeLinejoin="round" />
        <Path d="M29 22 Q37 25 37 35 L28 32 Z" fill="#CE542C" stroke={outline} strokeWidth={1.3} strokeLinejoin="round" />
        <Path d="M22 3 C14 9 12.5 20 15.5 30 L18 34 L26 34 L28.5 30 C31.5 20 30 9 22 3 Z" fill={`url(#${gradient})`} stroke={outline} strokeWidth={1.3} strokeLinejoin="round" />
        <Path d="M22 3 Q16.5 8.5 15.6 13 L28.4 13 Q27.5 8.5 22 3 Z" fill="#E66B32" />
        <Path d="M22 5 Q19 8 18 10" stroke="#FFBA83" strokeWidth={1.5} strokeLinecap="round" fill="none" />
        <Circle cx={22} cy={20} r={5.6} fill={outline} />
        <Circle cx={22} cy={20} r={4.1} fill="#419CC0" />
        <Path d="M19.6 20.2 Q19.3 17.7 22 17.5" stroke="#BDEEFF" strokeWidth={1.6} strokeLinecap="round" fill="none" />
        <Path d="M22 27 L19.7 35 L22 37 L24.3 35 Z" fill="#E66B32" stroke={outline} strokeWidth={1} strokeLinejoin="round" />
        <Path d="M17.5 34 L26.5 34 L26 37 L18 37 Z" fill={outline} />
        {power >= 4 ? <Path d="M11 43 L9 48 M33 43 L35 48" stroke={stage.color} strokeWidth={1.8} strokeLinecap="round" /> : null}
      </G>
    </Svg>
  </View>;
}
