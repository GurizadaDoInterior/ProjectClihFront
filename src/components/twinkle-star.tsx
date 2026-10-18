import { useEffect, useRef } from 'react';
import { Animated, Easing, type StyleProp, type TextStyle } from 'react-native';
import { useReducedMotion } from './use-reduced-motion';

export function TwinkleStar({ active, delay = 0, style, children }: {
  active: boolean;
  delay?: number;
  style: StyleProp<TextStyle>;
  children: string;
}) {
  const opacity = useRef(new Animated.Value(0.55)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    opacity.setValue(0.55);
    if (!active || reduced) return;
    opacity.setValue(0);
    const animation = Animated.loop(Animated.sequence([
      Animated.delay(delay * 0.5),
      Animated.timing(opacity, { toValue: 0.85, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(opacity, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.delay(150),
    ]));
    animation.start();
    return () => { animation.stop(); opacity.setValue(0.55); };
  }, [active, delay, opacity, reduced]);
  return <Animated.Text accessible={false} style={[style, { opacity }]}>{children}</Animated.Text>;
}
