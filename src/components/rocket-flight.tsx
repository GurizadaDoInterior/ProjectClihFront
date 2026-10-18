import { useEffect, useRef, type PropsWithChildren } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useReducedMotion } from './use-reduced-motion';

export function RocketFlight({ active, color, children }: PropsWithChildren<{ active: boolean; color: string }>) {
  const motion = useRef(new Animated.Value(0)).current;
  const trails = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active || reduced) { motion.setValue(0); trails.setValue(0); return; }
    const drift = Animated.loop(Animated.sequence([
      Animated.timing(motion, { toValue: 1, duration: 580, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(motion, { toValue: 0, duration: 720, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    const rush = Animated.loop(Animated.timing(trails, { toValue: 1, duration: 650, easing: Easing.linear, useNativeDriver: true, isInteraction: false }));
    drift.start(); rush.start();
    return () => { drift.stop(); rush.stop(); motion.setValue(0); trails.setValue(0); };
  }, [active, reduced, motion, trails]);
  return <View>
    {active && !reduced ? <View pointerEvents="none" accessible={false} style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {[0, 1, 2, 3].map(index => <Animated.View key={index} style={{
        position: 'absolute', left: '24%', top: `${45 + index * 7}%`, width: 22 + index * 6, height: 2, borderRadius: 2, backgroundColor: color,
        opacity: trails.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 0.35, 0.18, 0] }),
        transform: [
          { translateX: trails.interpolate({ inputRange: [0, 1], outputRange: [8 - index * 7, -40 - index * 7] }) },
          { translateY: trails.interpolate({ inputRange: [0, 1], outputRange: [-5, 25] }) },
          { rotate: '-35deg' },
        ],
      }} />)}
    </View> : null}
    <Animated.View style={{ transform: [
      { translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) },
      { translateY: motion.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
    ] }}>{children}</Animated.View>
  </View>;
}
