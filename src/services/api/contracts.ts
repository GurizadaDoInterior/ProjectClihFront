export type DayPeriod = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME';
export type MeasurementType = 'BOOLEAN' | 'COUNT' | 'MINUTES' | 'PAGES' | 'DISTANCE_KM' | 'MONEY';
export type Area = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  position: number;
};
export type Progress = {
  totalXp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
};
export type User = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  timezoneId: string;
  profileVisibility: string;
  onboardingCompleted: boolean;
};
export type TodayResponse = {
  date: string;
  displayName: string;
  progress: Progress;
  summary: { planned: number; completed: number; progressPercentage: number };
  week: {
    date: string;
    label: string;
    status: 'EMPTY' | 'PENDING' | 'PARTIAL' | 'COMPLETE' | 'MISSED' | 'FUTURE';
    current: boolean;
    planned: number;
    completed: number;
    progressPercentage: number;
  }[];
  areaProgress: { area: Area; planned: number; completed: number; progressPercentage: number }[];
  habits: {
    id: string;
    name: string;
    area: Area;
    measurementType: MeasurementType;
    targetValue: number;
    unit: string | null;
    dayPeriod: DayPeriod;
    preferredTime: string | null;
    completed: boolean;
  }[];
};
export type CreateHabit = {
  areaId: string;
  name: string;
  measurementType: MeasurementType;
  targetValue: number;
  unit?: string;
  dayPeriod: DayPeriod;
  scheduledDays: string[];
};
