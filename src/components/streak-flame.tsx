import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getFlameStage } from '@/src/features/streak/flame';
export function StreakFlame({ days }: { days: number }) {
  const stage = getFlameStage(days);
  return <View accessible accessibilityRole="image" accessibilityLabel={stage.name}><Svg width={stage.size} height={42} viewBox="0 0 32 42">
    <Path fill={stage.color} d="M17 1C19 10 29 14 29 25C29 34 23 41 16 41C8 41 2 35 2 27C2 20 7 16 9 12C9 18 11 20 13 21C18 15 12 9 17 1Z" />
    <Path fill={stage.core} d="M17 22C18 27 23 29 23 33C23 37 20 40 16 40C12 40 9 37 9 33C9 29 13 27 14 25C14 29 16 30 16 30C18 27 16 25 17 22Z" />
  </Svg></View>;
}
