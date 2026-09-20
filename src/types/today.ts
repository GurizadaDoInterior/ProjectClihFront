export type AreaKey = 'study' | 'health' | 'reading' | 'sleep';

export type DailyActivity = {
  id: string;
  title: string;
  target: string;
  area: AreaKey;
  completed: boolean;
  areaName?: string;
  areaColor?: string;
  period?: import('../services/api/contracts').DayPeriod;
};

export type WeekDay = {
  label: string;
  state: 'complete' | 'partial' | 'current' | 'empty';
  completed?: number;
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
