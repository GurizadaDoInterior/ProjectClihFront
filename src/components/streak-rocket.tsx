import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { getFlameStage } from '@/src/features/streak/flame';
import { useTheme } from '@/src/theme/theme-provider';

export function StreakRocket({ days, size = 84 }: { days: number; size?: number }) {
  const stage = getFlameStage(days);
  const { mode } = useTheme();
  const power = Math.max(0, [0, 3, 10, 30, 50, 100, 200, 300].filter(mark => days >= mark).length - 1);
  const flameWidth = 0.85 + power * 0.075;
  const flameLength = 0.55 + power * 0.13;
  const plume = 'M17 36 C13 41 16 46 15 49 C14 53 20 57 22 66 C24 57 30 53 29 49 C28 46 31 41 27 36 Z';
  const body = mode === 'dark' ? '#D6DCE0' : '#DCE1E4';
  const edge = mode === 'dark' ? '#8A9AA6' : '#405565';
  const accent = power >= 3 ? stage.color : '#D37340';
  return <View accessible accessibilityRole="image" accessibilityLabel={`Foguete: ${stage.name}, ${days} dias em sequência`}>
    <Svg width={size} height={size} viewBox="-10 -6 72 76">
      <G transform="rotate(-42 22 30)">
        {power >= 2 ? <Circle cx={22} cy={28} r={16 + power * 0.6} fill={stage.color} opacity={0.018 * power} /> : null}
        <G transform={`translate(22 36) scale(${flameWidth} ${flameLength}) translate(-22 -36)`}>
          {power >= 2 ? <Path d={plume} fill={stage.color} stroke={stage.color} strokeWidth={2 + power * 0.5} strokeLinejoin="round" opacity={0.08 + power * 0.012} /> : null}
          <Path d={plume} fill={stage.color} />
          <Path d="M19 37 C17 42 21 45 19 49 C18 53 21 56 22 60 C23 56 26 53 25 49 C23 45 27 42 25 37 Z" fill={stage.core} />
          {power >= 3 ? <Path d="M20.5 37 C19 42 21 46 22 51 C23 46 25 42 23.5 37 Z" fill="#FFFFFF" opacity={0.55 + power * 0.045} /> : null}
        </G>
        {Array.from({length:power},(_,index) => {
          const sparks = [[11,42],[13,54],[9,33],[12,65],[7,23],[15,75],[16,16]];
          const [x,y] = sparks[index];
          return <G key={index} stroke={stage.color} strokeWidth={1 + power * 0.09} strokeLinecap="round" fill="none" opacity={0.45 + power * 0.05}>
            <Path d={`M${x} ${y} q-2 2 -1 ${3 + power * 0.45}`} />
            <Path d={`M${44-x} ${y} q2 2 1 ${3 + power * 0.45}`} />
          </G>;
        })}
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
