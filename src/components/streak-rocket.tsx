import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { getFlameStage } from '@/src/features/streak/flame';

export function StreakRocket({ days, size = 84 }: { days: number; size?: number }) {
  const stage = getFlameStage(days);
  const power = Math.max(0, [0, 3, 10, 30, 50, 100, 200, 300].filter(mark => days >= mark).length - 1);
  const flameWidth = 0.85 + power * 0.075;
  const flameLength = 0.55 + power * 0.13;
  const plume = 'M17 36 C13 41 16 46 15 49 C14 53 20 57 22 66 C24 57 30 53 29 49 C28 46 31 41 27 36 Z';
  const body = '#369DB5';
  const edge = '#20365D';
  const accent = power >= 3 ? stage.color : '#EF563D';
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
        <G transform="translate(0 -5.55) scale(1 1.15)">
        <Path d="M14 23 L7 22 L1 38 L10 31 L16 33 Z M30 23 L37 22 L43 38 L34 31 L28 33 Z" fill={edge} />
        <Path d="M14 23 L7 22 L1 38 L8 29 L15 30 Z" fill="#EA4937" />
        <Path d="M30 23 L37 22 L43 38 L36 29 L29 30 Z" fill="#D6372D" />
        <Path d="M22 1 C13 8 10 21 15 31 L17 34 L27 34 L29 31 C34 21 31 8 22 1 Z" fill={body} />
        <Path d="M22 1 C17 10 16 23 20 34 L17 34 L15 31 C10 21 13 8 22 1 Z" fill="#8DD5DD" />
        <Path d="M22 1 C31 8 34 21 29 31 L27 34 L24 34 C29 23 29 12 22 1 Z" fill="#177A96" />
        <Path d="M22 1 C17.5 4.5 14.4 9 13.3 13 Q22 17 30.7 13 C29.6 9 26.5 4.5 22 1 Z" fill="#EF4C36" />
        <Path d="M22 1 Q17.6 7 16.5 13.8 L13.3 13 C14.4 9 17.5 4.5 22 1 Z" fill="#FF9272" />
        <Path d="M22 1 Q27.8 7 27.8 14 L30.7 13 C29.6 9 26.5 4.5 22 1 Z" fill="#C8302A" />
        <Path d="M13.3 13 Q22 17 30.7 13" stroke={edge} strokeWidth={1.5} fill="none" />
        <Circle cx={22} cy={22} r={5.7} fill={edge} />
        <Circle cx={22} cy={22} r={4.25} fill="#F6FAF8" />
        <Circle cx={22} cy={22} r={3.05} fill="#8DD5DD" />
        <Path d="M20.4 21.2 Q20.6 19.8 22 20" stroke="#FFFFFF" strokeWidth={1.1} strokeLinecap="round" fill="none" />
        <Path d="M16 31 L28 31 L27 34 L17 34 Z" fill={accent} />
        <Path d="M22 27 Q19 30 20.2 34 L22 36 L23.8 34 Q25 30 22 27 Z" fill="#EF563D" />
        <Path d="M17 34 L27 34 L29 37 L15 37 Z" fill={edge} />
        <Path d="M17 34 L22 34 L22 37 L15 37 Z" fill="#345187" />
        </G>
      </G>
    </Svg>
  </View>;
}
