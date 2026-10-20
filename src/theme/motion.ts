// Feedback starts immediately; these durations never delay an action.
export const motion = {
  duration: { press: 70, release: 160, feedback: 160, transition: 200, reveal: 240, exit: 180, rewardHold: 320, rewardExit: 240 },
  curve: [0.22, 1, 0.36, 1] as const,
  easing: 'cubic-bezier(0.22,1,0.36,1)',
  scale: { pressed: 0.975, confirmation: 1.16 },
} as const;

export function motionTransition(property: string, duration: number = motion.duration.feedback) {
  return `${property} ${duration}ms ${motion.easing}`;
}
