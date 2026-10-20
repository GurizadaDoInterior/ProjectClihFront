import { demoToday } from '../../features/today/demo-data';
import { ApiError, isDemo, request } from './client';
import type { Area, CreateHabit, ScheduledHabit, TodayResponse, User, Progress } from './contracts';
import { mapToday } from './today-mapper';
import { dateKey, isScheduledOn, parseDateKey, weekDays } from '../../features/agenda/dates';
let demo = JSON.parse(JSON.stringify(demoToday)) as typeof demoToday;
const demoSchedules = new Map<string, CreateHabit>();
let demoSequence = 0;
const demoCancellations = new Map<string, Set<string>>();
function demoDay(date: string) {
  return JSON.parse(JSON.stringify({ ...demo, date, activities: demo.activities.filter(activity => {
    const id=activity.habitId ?? activity.id;
    if (demoCancellations.get(id)?.has(`${date}:${activity.completionPeriod ?? activity.period ?? "ANYTIME"}`)) return false;
    const schedule = demoSchedules.get(id);
    return !schedule || isScheduledOn({ ...schedule, active: true, startDate: schedule.startDate ?? dateKey() }, date);
  }).map(activity => date === dateKey() ? activity : { ...activity, completed: false, completionId: null, xpAwarded: 0 }) })) as typeof demoToday;
}
export async function getTodaySummary() {
  if (isDemo) return demoDay(dateKey());
  return mapToday(await request<TodayResponse>('/today'));
}
export async function getAgendaDay(date: string) {
  parseDateKey(date);
  if (isDemo) return demoDay(date);
  return mapToday(await request<TodayResponse>(`/today?date=${encodeURIComponent(date)}`));
}
export async function getScheduledHabits(): Promise<ScheduledHabit[]> {
  if (!isDemo) return request<ScheduledHabit[]>('/habits');
  const ids = [...new Set(demo.activities.map(activity => activity.habitId ?? activity.id))];
  return ids.map(id => {
    const items = demo.activities.filter(activity => (activity.habitId ?? activity.id) === id);
    const activity = items[0];
    return { id, areaId: 'demo-study', name: activity.title, measurementType: 'COUNT', targetValue: 1,
      dayPeriod: activity.period ?? 'ANYTIME', scheduledDays: [...weekDays], startDate: '1970-01-01',
      ...demoSchedules.get(id), active: true, canceledOccurrences: [...(demoCancellations.get(id) ?? [])],
      dayPeriods: items.map(item => item.completionPeriod ?? item.period ?? 'ANYTIME'),
    };
  });
}
export async function completeHabit(habitId: string, dayPeriod?: import('./contracts').DayPeriod) {
  if (isDemo) {
    demo = {
      ...demo,
      activities: demo.activities.map((item) =>
        (item.habitId ?? item.id) === habitId && (!dayPeriod || item.completionPeriod === dayPeriod)
          ? { ...item, completed: true, completionId: `demo-completion:${item.id}`, xpAwarded: 10 } : item,
      ),
    };
    return;
  }
  const completedAt = new Date().toISOString();
  const idempotencyKey = `${habitId}:${completedAt}`;
  for (let attempt = 0; ; attempt++) {
    try {
      return await request<{ id: string; xpAwarded: number; idempotentReplay: boolean; progress: Progress }>(`/habits/${habitId}/completions`, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ completedAt, ...(dayPeriod ? {dayPeriod} : {}) }),
      });
      return;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'HABIT_ALREADY_COMPLETED') return;
      if (
        !(error instanceof ApiError) ||
        (error.status !== 0 && error.status < 500) ||
        attempt >= 1
      )
        throw error;
    }
  }
}
export async function undoHabit(habitId: string, completionId?: string | null) {
  if (isDemo) {
    demo = { ...demo, activities: demo.activities.map((item) =>
      (item.habitId ?? item.id) === habitId && (!completionId || completionId === `demo-completion:${item.id}`)
        ? { ...item, completed: false, completionId: null } : item) };
    return;
  }
  if (!completionId) throw new Error('Não foi possível identificar a conclusão. Atualize a rotina e tente novamente.');
  await request(`/habits/${encodeURIComponent(habitId)}/completions/${encodeURIComponent(completionId)}`, { method: 'DELETE' });
}
export const getAreas = () =>
  isDemo
    ? Promise.resolve<Area[]>([
        {
          id: 'demo-study',
          name: 'Estudos',
          slug: 'estudos',
          color: '#16A085',
          icon: 'book',
          position: 0,
        },
      ])
    : request<Area[]>('/areas');
export const getMe = () => request<User>('/me');
export const updateMe = (values: {
  displayName: string;
  username?: string;
  timezoneId: string;
  completeOnboarding: boolean;
}) => request<User>('/me', { method: 'PATCH', body: JSON.stringify(values) });
export const createArea = (name: string) =>
  request<Area>('/areas', {
    method: 'POST',
    body: JSON.stringify({ name, color: '#2F63EE', icon: 'book' }),
  });
export async function createHabit(values: CreateHabit) {
  if (isDemo) {
    const id = `demo-${Date.now()}-${++demoSequence}`;
    demoSchedules.set(id, { ...values, startDate: values.startDate ?? dateKey() });
    for (const period of values.dayPeriods ?? [values.dayPeriod]) demo.activities.push({
      id: `${id}:${period}`, habitId: id, completionPeriod: period,
      title: values.name,
      target: values.measurementType === 'BOOLEAN' ? 'Concluir uma vez' : `${values.targetValue} ${values.unit ?? ''}`.trim(),
      area: 'study',
      period,
      periods: [period],
      completed: false,
    });
    return;
  }
  await request('/habits', { method: 'POST', body: JSON.stringify(values) });
}

export const uploadProfilePhoto = (image: string) => request<User>('/me/avatar', { method: 'PUT', body: JSON.stringify({ image }) });
export const removeProfilePhoto = () => request<User>('/me/avatar', { method: 'DELETE' });

export async function resolveHabitArea(selectedId: string, newName: string, available: Area[]) {
  const name = newName.trim();
  if (name) {
    const existing = available.find(area => area.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (existing) return existing.id;
    return (await createArea(name)).id;
  }
  const id = selectedId || available[0]?.id;
  if (!id) throw new Error('Digite o nome de uma área, como Saúde ou Estudos, para criar sua primeira atividade.');
  return id;
}

export async function deleteHabit(habitId: string, dayPeriod?: import('./contracts').DayPeriod) {
  if (isDemo) { demo = { ...demo, activities: demo.activities.filter(item => (item.habitId ?? item.id) !== habitId || (!!dayPeriod && item.completionPeriod !== dayPeriod)) }; return; }
  await request(`/habits/${encodeURIComponent(habitId)}${dayPeriod ? `?dayPeriod=${encodeURIComponent(dayPeriod)}` : ''}`, { method: 'DELETE' });
}
export async function deleteArea(areaId: string) {
  await request(`/areas/${encodeURIComponent(areaId)}`, { method: 'DELETE' });
}

export type LinkedAreaHabit = {id:string; areaId:string; name:string; active:boolean; scheduledDays:string[]; dayPeriod:import('./contracts').DayPeriod; dayPeriods?:import('./contracts').DayPeriod[]};
export async function getAreaHabits(areaId:string) {
  const habits=await request<LinkedAreaHabit[]>('/habits');
  return habits.filter(habit=>habit.active && habit.areaId===areaId);
}

export async function setAgendaOccurrenceCanceled(habitId: string, date: string, period: import('./contracts').DayPeriod, canceled: boolean) {
  parseDateKey(date);
  if (isDemo) {
    const entries=demoCancellations.get(habitId) ?? new Set<string>();
    if(canceled) entries.add(`${date}:${period}`); else entries.delete(`${date}:${period}`);
    demoCancellations.set(habitId,entries); return;
  }
  return request(`/habits/${encodeURIComponent(habitId)}/cancellations/${date}/${period}`, {method:canceled ? 'PUT' : 'DELETE'});
}
