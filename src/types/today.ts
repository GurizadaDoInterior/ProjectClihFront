export type AreaKey = 'study' | 'health' | 'reading' | 'sleep';

export type DailyActivity = {
  id: string;
  title: string;
  target: string;
  area: AreaKey;
  completed: boolean;
};

export type WeekDay = {
  label: string;
  state: 'complete' | 'partial' | 'current' | 'empty';
};

export type TodaySummary = {
  displayName: string;
  streakDays: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  week: WeekDay[];
  areaBalance: Record<AreaKey, number>;
  activities: DailyActivity[];
};
