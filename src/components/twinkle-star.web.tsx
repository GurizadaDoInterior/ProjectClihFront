import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useReducedMotion } from './use-reduced-motion';

export function TwinkleStar({ active, delay = 0, style, children }: {
  active: boolean; delay?: number; style: StyleProp<TextStyle>; children: string;
}) {
  const reduced = useReducedMotion();
  const enabled = active && !reduced;
  return <Text accessible={false} style={[style, { opacity: 0.55,
    animation: enabled ? `clih-twinkle 1100ms ease-in-out ${delay * 0.5}ms infinite` : 'none',
  } as TextStyle]}>{children}</Text>;
}
