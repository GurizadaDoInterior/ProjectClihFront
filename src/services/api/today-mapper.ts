import type { TodayResponse } from './contracts';
import type { TodaySummary } from '../../types/today';
export function mapToday(response: TodayResponse): TodaySummary {
  return {
    date: response.date,
    displayName: response.displayName,
    streakDays: response.progress.currentStreak,
    level: response.progress.level,
    xp: response.progress.totalXp,
    xpInLevel: response.progress.totalXp - response.progress.xpForCurrentLevel,
    xpToNextLevel: response.progress.xpForNextLevel - response.progress.xpForCurrentLevel,
    longestStreak: response.progress.longestStreak,
    week: response.week.map((day) => ({
      ...day,
      state:
        day.status === 'COMPLETE'
          ? 'complete'
          : day.current
            ? 'current'
            : day.status === 'PARTIAL'
              ? 'partial'
              : 'empty',
    })),
    areaBalance: { study: 0, health: 0, reading: 0, sleep: 0 },
    areas: response.areaProgress.map((item) => ({ ...item.area, value: item.progressPercentage })),
    activities: response.habits.map((habit) => ({
      id: habit.id,
      title: habit.name,
      target:
        habit.measurementType === 'BOOLEAN'
          ? 'Concluir uma vez'
          : `${habit.targetValue} ${habit.unit ?? ''}`.trim(),
      area: 'study',
      areaName: habit.area.name,
      areaColor: habit.area.color,
      period: habit.dayPeriod,
      completed: habit.completed,
    })),
  };
}
