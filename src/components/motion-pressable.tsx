import { forwardRef, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, type PressableProps, type View } from 'react-native';
import { useReducedMotion } from './use-reduced-motion';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export const MotionPressable = forwardRef<View, PressableProps>(function MotionPressable({ style, disabled, onPressIn, onPressOut, onHoverIn, onHoverOut, ...props }, ref) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { if (disabled || reduced) { scale.stopAnimation(); scale.setValue(1); } return () => scale.stopAnimation(); }, [disabled, reduced, scale]);
  const animate = (pressed: boolean) => {
    scale.stopAnimation();
    if (reduced || disabled || onPressIn || onPressOut) { scale.setValue(1); return; }
    Animated.timing(scale, {toValue:pressed ? 0.975 : 1, duration:pressed ? 90 : 160, easing:Easing.out(Easing.cubic), useNativeDriver:true}).start();
  };
  return <AnimatedPressable {...props} ref={ref} disabled={disabled} onHoverIn={event => {setHovered(true);onHoverIn?.(event);}} onHoverOut={event => {setHovered(false);onHoverOut?.(event);}} onPressIn={event => {setPressed(true);animate(true);onPressIn?.(event);}} onPressOut={event => {setPressed(false);animate(false);onPressOut?.(event);}} style={[typeof style === 'function' ? style({pressed: !disabled && pressed, hovered: !disabled && hovered}) : style, {transform:[{scale}]}]} />;
});
