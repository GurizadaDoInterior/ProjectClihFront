import * as Haptics from 'expo-haptics';
import { useReducedMotion } from './use-reduced-motion';
import { isFullSwipe, swipeOffset, swipeDestination } from './swipe-gesture';
import { MotionPressable as Pressable } from './motion-pressable';
import { useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, PanResponder, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme-provider';

export function SwipeToDelete({ children, disabled, onDelete, onFullSwipe }: { children: ReactNode; disabled?: boolean; onDelete: () => void; onFullSwipe?: (animateRemoval?:()=>Promise<void>) => Promise<unknown> }) {
  const { colors } = useTheme();
  const offset = useRef(new Animated.Value(0)).current;
  const measuredHeight=useRef(0);
  const collapsedHeight=useRef(new Animated.Value(0)).current;
  const [collapsing,setCollapsing]=useState(false);
  const reduced=useReducedMotion();
  const reducedRef=useRef(reduced);reducedRef.current=reduced;
  const armed=useRef(false);
  const position = useRef(0);
  const width = useRef(300);
  const committing = useRef(false);
  const fullSwipe = useRef(onFullSwipe); fullSwipe.current = onFullSwipe;
  const start = useRef(0);
  const [open, setOpen] = useState(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const settle = (value: number) => {
    position.current = value;
    setOpen(value !== 0);
    Animated.spring(offset, { toValue: value, damping: 29, stiffness: 190, mass: 1, useNativeDriver: true }).start();
  };
  const collapse=()=>new Promise<void>(resolve=>{
    if(reducedRef.current){resolve();return;}
    collapsedHeight.setValue(measuredHeight.current);setCollapsing(true);
    Animated.timing(collapsedHeight,{toValue:0,duration:220,easing:Easing.out(Easing.cubic),useNativeDriver:false}).start(()=>resolve());
  });
  const responder = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_event, gesture) => !disabledRef.current && Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5 && (gesture.dx < 0 || position.current < 0),
    onMoveShouldSetPanResponder: (_event, gesture) => !disabledRef.current && Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5 && (gesture.dx < 0 || position.current < 0),
    onPanResponderGrant: () => { offset.stopAnimation(); start.current = position.current; },
    onPanResponderMove: (_event, gesture) => {const value=swipeOffset(start.current,gesture.dx,width.current);offset.setValue(value);const ready=isFullSwipe(value,width.current);if(ready && !armed.current && !reducedRef.current)void Haptics.selectionAsync().catch(()=>{});armed.current=ready;},
    onPanResponderRelease: (_event, gesture) => {const value=swipeOffset(start.current,gesture.dx,width.current);if(isFullSwipe(value,width.current) && fullSwipe.current && !committing.current){committing.current=true;settle(-width.current);Promise.resolve().then(()=>fullSwipe.current?.(collapse)).catch(()=>{committing.current=false;settle(0);});}else settle(swipeDestination(value));},
    onPanResponderTerminate: () => settle(0),
    onPanResponderTerminationRequest: () => true,
  })).current;
  return <Animated.View onLayout={event => {width.current=event.nativeEvent.layout.width;if(!collapsing)measuredHeight.current=event.nativeEvent.layout.height;}} style={{ height:collapsing ? collapsedHeight : undefined, overflow: 'hidden', borderRadius: 8 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Excluir atividade" accessibilityElementsHidden={!open} importantForAccessibility={open ? 'yes' : 'no-hide-descendants'} disabled={!open || disabled} onPress={() => { settle(0); onDelete(); }} style={{ position: 'absolute', right: 0, top: 0, bottom: 9, width: '100%', paddingRight:24, alignItems: 'flex-end', justifyContent: 'center', backgroundColor: colors.danger, borderRadius: 8 }}>
      <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Excluir</Text>
    </Pressable>
    <Animated.View {...responder.panHandlers} style={{ transform: [{ translateX: offset }], backgroundColor: colors.background }}>{children}</Animated.View>
  </Animated.View>;
}
