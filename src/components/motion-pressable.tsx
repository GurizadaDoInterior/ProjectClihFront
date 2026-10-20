import { forwardRef, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Animated, Easing, Platform, StyleSheet, Pressable, type GestureResponderEvent, type PressableProps, type PressableStateCallbackType, type StyleProp, type ViewStyle, type View } from 'react-native';
import { motion, motionTransition } from '../theme/motion';
import { useReducedMotion } from './use-reduced-motion';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type MotionState = PressableStateCallbackType & { hovered: boolean };
export type MotionPressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: MotionState) => StyleProp<ViewStyle>);
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLElement>) => void;
};
export const MotionPressable = forwardRef<View, MotionPressableProps>(function MotionPressable({ style, disabled, onPressIn, onPressOut, onHoverIn, onHoverOut, onKeyDown, onKeyUp, ...props }, ref) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { if (disabled || reduced) { scale.stopAnimation(); scale.setValue(1); } if (disabled) setPressed(false); return () => scale.stopAnimation(); }, [disabled, reduced, scale]);
  const animate = (pressed: boolean) => {
    if (Platform.OS === 'web') return;
    scale.stopAnimation();
    if (reduced || disabled) { scale.setValue(1); return; }
    Animated.timing(scale, {toValue:pressed ? motion.scale.pressed : 1, duration:pressed ? motion.duration.press : motion.duration.release, easing:Easing.bezier(...motion.curve), useNativeDriver:true,isInteraction:false}).start();
  };
  const resolvedStyle=typeof style === 'function' ? style({pressed:!disabled && pressed,hovered:!disabled && hovered}) : style;
  const flat=StyleSheet.flatten(resolvedStyle);
  const transforms=Array.isArray(flat?.transform) ? flat.transform : [];
  const opacity=typeof flat?.opacity === 'number' ? flat.opacity : 1;
  const transition=[motionTransition('transform',pressed ? motion.duration.press : motion.duration.release),...['background-color','border-color','color','opacity'].map(property=>motionTransition(property))].join(', ');
  // Compose interaction feedback with positioning transforms, including custom press handlers.
  const webFeedback={transform:[...transforms,{scale:Platform.OS === 'web' ? (!reduced && !disabled && pressed ? motion.scale.pressed : 1) : scale}],opacity:disabled ? opacity*0.45 : opacity,...(Platform.OS === 'web' ? {transition:reduced ? 'none' : transition,touchAction:'manipulation'} : {})};
  const role=props.accessibilityRole ?? props.role;
  const toggleRole=role==='checkbox' || role==='radio' || role==='switch';
  const keyboard=Platform.OS==='web' ? {
    onKeyDown:(event:KeyboardEvent<HTMLElement>)=>{
      onKeyDown?.(event);
      // RN Web handles Enter and buttons; Space needs an explicit toggle handler.
      if(event.defaultPrevented || event.target!==event.currentTarget || !toggleRole || (event.key!==' ' && event.key!=='Spacebar'))return;
      event.preventDefault();
      if(disabled || event.repeat)return;
      setPressed(true);animate(true);
      props.onPress?.(event as unknown as GestureResponderEvent);
    },
    onKeyUp:(event:KeyboardEvent<HTMLElement>)=>{
      onKeyUp?.(event);
      if(toggleRole && (event.key===' ' || event.key==='Spacebar')){event.preventDefault();setPressed(false);animate(false);}
    },
  } : {};
  return <AnimatedPressable {...props} {...keyboard} ref={ref} disabled={disabled}
    accessibilityRole={props.accessibilityRole ?? (props.role ? undefined : 'button')}
    aria-checked={props['aria-checked'] ?? props.accessibilityState?.checked}
    aria-selected={props['aria-selected'] ?? props.accessibilityState?.selected}
    onBlur={event=>{setPressed(false);animate(false);props.onBlur?.(event);}}
    onHoverIn={event => {setHovered(true);onHoverIn?.(event);}} onHoverOut={event => {setHovered(false);onHoverOut?.(event);}} onPressIn={event => {setPressed(true);animate(true);onPressIn?.(event);}} onPressOut={event => {setPressed(false);animate(false);onPressOut?.(event);}} style={[resolvedStyle,webFeedback]} />;
});
