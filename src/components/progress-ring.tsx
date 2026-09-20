import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/src/theme/tokens';

const SIZE = 150;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const progress = total === 0 ? 0 : completed / total;
  const percent = Math.round(progress * 100);

  return (
    <View
      accessibilityLabel={`${percent}% concluído, ${completed} de ${total} atividades`}
      style={styles.wrapper}>
      <Svg height={SIZE} width={SIZE} style={styles.svg}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.border}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.orange}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          fill="none"
        />
      </Svg>
      <View style={styles.copy}>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.caption}>{completed} de {total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  copy: {
    alignItems: 'center',
  },
  percent: {
    color: colors.ink,
    fontSize: 37,
    lineHeight: 43,
    fontWeight: '800',
    letterSpacing: -1.6,
  },
  caption: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
});
