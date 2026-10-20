export const weekDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
export type Recurrence = 'once' | 'daily' | 'weekly';

export function dateKey(date = new Date()) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Data inválida.');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  if (dateKey(date) !== value) throw new Error('Data inválida.');
  return date;
}

export function initialScheduleDate(value: unknown, today: string) {
  if (typeof value !== 'string') return today;
  try { parseDateKey(value); return value >= today ? value : today; } catch { return today; }
}

export function scheduleFor(date: string, recurrence: Recurrence) {
  const selected = parseDateKey(date);
  return {
    startDate: date,
    ...(recurrence === 'once' ? { endDate: date } : {}),
    scheduledDays: recurrence === 'daily' ? [...weekDays] : [weekDays[selected.getDay()]],
  };
}

export type Schedule = {
  canceledOccurrences?: readonly string[];
  active: boolean; startDate: string; endDate?: string | null;
  scheduledDays: string[]; dayPeriods?: readonly string[]; dayPeriod: string;
};

export function isScheduledOn(schedule: Schedule, date: string) {
  return schedule.active && date >= schedule.startDate && (!schedule.endDate || date <= schedule.endDate)
    && schedule.scheduledDays.includes(weekDays[parseDateKey(date).getDay()]);
}

export function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(first); date.setDate(1 - offset + index);
    return { date: dateKey(date), day: date.getDate(), inMonth: date.getMonth() === month.getMonth() };
  });
}

export function monthCounts(schedules: readonly Schedule[], month: Date) {
  return Object.fromEntries(calendarDays(month).filter(day => day.inMonth).map(day => [day.date,
    schedules.reduce((total, schedule) => total + (isScheduledOn(schedule, day.date)
      ? new Set(schedule.dayPeriods?.length ? schedule.dayPeriods : [schedule.dayPeriod]).size - (schedule.dayPeriods?.length ? schedule.dayPeriods : [schedule.dayPeriod]).filter(period => schedule.canceledOccurrences?.includes(`${day.date}:${period}`)).length : 0), 0),
  ]));
}

export function formatDate(value: string) {
  return parseDateKey(value).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}
