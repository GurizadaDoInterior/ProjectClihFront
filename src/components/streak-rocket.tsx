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
        <Path d="M17 21 L8 30 L7 36 L17 31 Z M27 21 L36 30 L37 36 L27 31 Z" fill={edge} />
        <Path d="M16 25 L10 31 L10 33 L17 29 Z M28 25 L34 31 L34 33 L27 29 Z" fill={accent} />
        <Path d="M22 3 L27.5 14 Q29 18 27.5 25 L25 34 L19 34 L16.5 25 Q15 18 16.5 14 Z" fill={body} stroke={edge} strokeWidth={1} strokeLinejoin="round" />
        <Path d="M22 3 L27.5 14 Q29 18 27.5 25 L25 34 L22 34 Z" fill={edge} opacity={0.18} />
        <Path d="M22 13 L24.5 18 L24 23 L20 23 L19.5 18 Z" fill={edge} />
        <Path d="M22 15.5 L23.1 18.5 L22.8 21.5 L21.2 21.5 L20.9 18.5 Z" fill="#8DB7C6" />
        <Path d="M18.5 27 L20 31 L24 31 L25.5 27" stroke={accent} strokeWidth={1.8} fill="none" />
        <Path d="M18.5 34 L25.5 34 L27 37 L17 37 Z" fill={edge} />
      </G>
    </Svg>
  </View>;
}
