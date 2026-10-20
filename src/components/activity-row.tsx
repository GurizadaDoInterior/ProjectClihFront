import { useEffect, useLayoutEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { MotionPressable as Pressable } from './motion-pressable';
import { useReducedMotion } from './use-reduced-motion';
import { motion } from '../theme/motion';
import { useTheme, themedStyles, type Palette } from '@/src/theme/theme-provider';
import type { DailyActivity } from '@/src/types/today';
export function ActivityRow({ activity, onToggle, disabled = false, xpReward }: { xpReward?: { amount: number; eventId: number } | null; activity: DailyActivity; onToggle: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const scale = useRef(new Animated.Value(1)).current;
  const checkProgress = useRef(new Animated.Value(activity.completed ? 1 : 0)).current;
  const wasCompleted = useRef(activity.completed);
  const reduceMotion = useReducedMotion();
  useLayoutEffect(() => {
    const justCompleted = activity.completed && !wasCompleted.current;
    const justUndone = !activity.completed && wasCompleted.current;
    wasCompleted.current = activity.completed;
    scale.stopAnimation();
    checkProgress.stopAnimation();
    scale.setValue(1);
    checkProgress.setValue(activity.completed ? 1 : 0);
    if (justCompleted && !reduceMotion) {
      scale.setValue(1);
      checkProgress.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: motion.scale.confirmation, duration: motion.duration.feedback, easing: Easing.bezier(...motion.curve), useNativeDriver: true, isInteraction: false }),
          Animated.timing(scale, { toValue: 1, duration: motion.duration.release, easing: Easing.bezier(...motion.curve), useNativeDriver: true, isInteraction: false }),
        ]),
        Animated.timing(checkProgress, { toValue: 1, duration: motion.duration.feedback, easing: Easing.bezier(...motion.curve), useNativeDriver: true, isInteraction: false }),
      ]).start();
    } else if (justUndone && !reduceMotion) {
      scale.setValue(0.96);
      Animated.timing(scale, { toValue: 1, duration: motion.duration.release, easing: Easing.bezier(...motion.curve), useNativeDriver: true, isInteraction: false }).start();
    }
    return () => { scale.stopAnimation(); checkProgress.stopAnimation(); };
  }, [activity.completed, reduceMotion, scale, checkProgress]);
  const rewardMotion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    rewardMotion.stopAnimation();
    rewardMotion.setValue(0);
    if (xpReward && ((xpReward.amount > 0) === activity.completed)) {
      Animated.sequence([
        Animated.timing(rewardMotion, { toValue: 1, duration: reduceMotion ? 0 : motion.duration.feedback, easing: Easing.bezier(...motion.curve), useNativeDriver: true, isInteraction: false }),
        Animated.delay(motion.duration.rewardHold),
        Animated.timing(rewardMotion, { toValue: 2, duration: reduceMotion ? 0 : motion.duration.rewardExit, easing: Easing.bezier(...motion.curve), useNativeDriver: true, isInteraction: false }),
      ]).start();
    }
    return () => rewardMotion.stopAnimation();
  }, [xpReward, activity.completed, reduceMotion, rewardMotion]);
  const area = activity.areaName ?? ({ study: 'ESTUDO', health: 'SAÚDE', reading: 'LEITURA', sleep: 'SONO' }[activity.area]);
  return <Pressable accessibilityRole="checkbox" aria-checked={activity.completed}
    accessibilityState={{ checked: activity.completed, disabled }} disabled={disabled}
    accessibilityLabel={`${activity.title}, ${activity.target}. ${activity.completed ? 'Desfazer conclusão' : 'Confirmar conclusão'}`}
    onPress={onToggle} style={({ pressed }) => [styles.row, pressed && !activity.completed && { opacity: 0.9 }]}>
    <Animated.View style={[styles.toggle, activity.completed && styles.checked, { transform: [{ scale }] }]}>
      {activity.completed ? <Animated.Text style={[styles.check, { opacity: checkProgress, transform: [{ scale: checkProgress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>✓</Animated.Text> : null}
    </Animated.View>
    {xpReward && ((xpReward.amount > 0) === activity.completed) ? <Animated.Text pointerEvents="none" accessibilityLiveRegion="polite" style={{ position: 'absolute', right: 0, top: 8, color: xpReward.amount < 0 ? colors.danger : colors.success, fontSize: 13, fontWeight: '700', zIndex: 1, opacity: rewardMotion.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }), transform: [{ translateY: reduceMotion ? 0 : rewardMotion.interpolate({ inputRange: [0, 1, 2], outputRange: [4, 0, -8] }) }] }}>{xpReward.amount > 0 ? '+' : '−'}{Math.abs(xpReward.amount)} XP</Animated.Text> : null}
    <View style={styles.copy}>
      <Text style={styles.category}>{area.toUpperCase()}</Text>
      <Text style={[styles.title, activity.completed && styles.completedTitle]}>{activity.title}</Text>
      <Text style={styles.target}>{activity.target}</Text>
    </View>
    <Text style={styles.status}>{activity.completed ? 'FEITO' : 'A FAZER'}</Text>
  </Pressable>;
}
const getStyles = (colors: Palette) => themedStyles({
  row: { minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 7, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggle: { width: 32, height: 32, borderWidth: 1.5, borderColor: colors.muted, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: '#15803D', borderColor: '#15803D' },
  check: { fontSize: 21, fontWeight: '700', color: '#FFFFFF' },
  copy: { flex: 1 },
  category: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 18, fontWeight: '600', lineHeight: 25, marginTop: 2 },
  completedTitle: { color: colors.muted },
  target: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  status: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
});
