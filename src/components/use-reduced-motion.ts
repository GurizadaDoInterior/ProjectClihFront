import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';
let reduced = true;
const listeners = new Set<() => void>();
let subscription: { remove: () => void } | undefined;
function update(value: boolean) {
  if (value === reduced) return;
  reduced = value;
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    AccessibilityInfo.isReduceMotionEnabled().then(update).catch(() => {});
    subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
  }
  return () => { listeners.delete(listener); if (!listeners.size) subscription?.remove(); };
}
export function useReducedMotion() { return useSyncExternalStore(subscribe, () => reduced, () => true); }
