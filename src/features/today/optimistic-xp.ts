import type { TodaySummary, DailyActivity } from '@/src/types/today';

// Predict the current backend policy for immediate feedback. Server data always
// replaces this prediction after the request, including any future policy changes.
export function completionXp(activity: DailyActivity) { return activity.xpAwarded && activity.xpAwarded > 0 ? activity.xpAwarded : 10; }
export function previewXp(summary: TodaySummary, delta: number): TodaySummary {
  const xp = Math.max(0, summary.xp + delta);
  const span = Math.max(1, summary.xpToNextLevel);
  const base = summary.xp - (summary.xpInLevel ?? summary.xp % span);
  const levels = Math.floor((xp - base) / span);
  return {...summary, xp, level:Math.max(1,summary.level + levels), xpInLevel:((xp - base) % span + span) % span};
}
