import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

import { colors } from '@/src/theme/tokens';
import type { AreaKey } from '@/src/types/today';

const labels: Array<{ key: AreaKey; label: string }> = [
  { key: 'study', label: 'Estudo' },
  { key: 'health', label: 'Saúde' },
  { key: 'sleep', label: 'Sono' },
  { key: 'reading', label: 'Leitura' },
];

const center = 65;
const radius = 48;

function point(index: number, value: number) {
  const angle = -Math.PI / 2 + index * (Math.PI / 2);
  return `${center + Math.cos(angle) * radius * value},${center + Math.sin(angle) * radius * value}`;
}

export function AreaRadar({ values }: { values: Record<AreaKey, number> }) {
  const valuePoints = labels.map(({ key }, index) => point(index, values[key])).join(' ');
  const outer = labels.map((_, index) => point(index, 1)).join(' ');
  const middle = labels.map((_, index) => point(index, 0.55)).join(' ');

  return (
    <View accessibilityLabel="Equilíbrio entre áreas" style={styles.wrapper}>
      <Text style={[styles.label, styles.top]}>Estudo</Text>
      <Text style={[styles.label, styles.right]}>Saúde</Text>
      <Text style={[styles.label, styles.bottom]}>Sono</Text>
      <Text style={[styles.label, styles.left]}>Leitura</Text>
      <Svg width={130} height={130}>
        <Polygon points={outer} fill="none" stroke={colors.border} strokeWidth={1.5} />
        <Polygon points={middle} fill="none" stroke={colors.border} strokeWidth={1} />
        <Line x1={center} y1={17} x2={center} y2={113} stroke={colors.border} strokeWidth={1} />
        <Line x1={17} y1={center} x2={113} y2={center} stroke={colors.border} strokeWidth={1} />
        <Polygon
          points={valuePoints}
          fill="rgba(47, 99, 238, 0.22)"
          stroke={colors.primary}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 160,
    height: 174,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  top: { top: 0 },
  right: { right: -3, top: 80 },
  bottom: { bottom: 0 },
  left: { left: -5, top: 80 },
});
