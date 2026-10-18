export type AreaKey = 'study' | 'health' | 'reading' | 'sleep';

export type DailyActivity = {
  id: string;
  habitId?: string;
  completionPeriod?: import('../services/api/contracts').DayPeriod;
  title: string;
  target: string;
  area: AreaKey;
  completed: boolean;
  completionId?: string | null;
  xpAwarded?: number;
  areaName?: string;
  areaColor?: string;
  period?: import('../services/api/contracts').DayPeriod;
  periods?: import('../services/api/contracts').DayPeriod[];
};

export type WeekDay = {
  label: string;
  state: 'complete' | 'partial' | 'current' | 'empty';
  completed?: number;
  planned?: number;
  date?: string;
};

export type TodaySummary = {
  date?: string;
  xpInLevel?: number;
  longestStreak?: number;
  areas?: { id: string; name: string; color: string; value: number }[];
  displayName: string;
  streakDays: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  week: WeekDay[];
  areaBalance: Record<AreaKey, number>;
  activities: DailyActivity[];
};
