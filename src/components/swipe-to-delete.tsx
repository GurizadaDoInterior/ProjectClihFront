import { MotionPressable as Pressable } from './motion-pressable';
import { useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, Text, View } from 'react-native';
import { useTheme } from '@/src/theme/theme-provider';

export function SwipeToDelete({ children, disabled, onDelete }: { children: ReactNode; disabled?: boolean; onDelete: () => void }) {
  const { colors } = useTheme();
  const offset = useRef(new Animated.Value(0)).current;
  const position = useRef(0);
  const start = useRef(0);
  const [open, setOpen] = useState(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const settle = (value: number) => {
    position.current = value;
    setOpen(value !== 0);
    Animated.spring(offset, { toValue: value, damping: 24, stiffness: 230, mass: 1, useNativeDriver: true }).start();
  };
  const responder = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_event, gesture) => !disabledRef.current && Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5 && (gesture.dx < 0 || position.current < 0),
    onMoveShouldSetPanResponder: (_event, gesture) => !disabledRef.current && Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5 && (gesture.dx < 0 || position.current < 0),
    onPanResponderGrant: () => { offset.stopAnimation(); start.current = position.current; },
    onPanResponderMove: (_event, gesture) => offset.setValue(Math.max(-100, Math.min(0, start.current + gesture.dx))),
    onPanResponderRelease: (_event, gesture) => settle(start.current + gesture.dx < -42 ? -100 : 0),
    onPanResponderTerminate: () => settle(0),
    onPanResponderTerminationRequest: () => true,
  })).current;
  return <View style={{ overflow: 'hidden', borderRadius: 8 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Excluir atividade" accessibilityElementsHidden={!open} importantForAccessibility={open ? 'yes' : 'no-hide-descendants'} disabled={!open || disabled} onPress={() => { settle(0); onDelete(); }} style={{ position: 'absolute', right: 0, top: 0, bottom: 9, width: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger, borderRadius: 8 }}>
      <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Excluir</Text>
    </Pressable>
    <Animated.View {...responder.panHandlers} style={{ transform: [{ translateX: offset }], backgroundColor: colors.background }}>{children}</Animated.View>
  </View>;
}
