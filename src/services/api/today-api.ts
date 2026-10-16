import { demoToday } from '../../features/today/demo-data';
import { ApiError, isDemo, request } from './client';
import type { Area, CreateHabit, TodayResponse, User } from './contracts';
import { mapToday } from './today-mapper';
let demo = JSON.parse(JSON.stringify(demoToday)) as typeof demoToday;
export async function getTodaySummary() {
  if (isDemo) return JSON.parse(JSON.stringify(demo)) as typeof demoToday;
  return mapToday(await request<TodayResponse>('/today'));
}
export async function completeHabit(habitId: string) {
  if (isDemo) {
    demo = {
      ...demo,
      activities: demo.activities.map((item) =>
        item.id === habitId ? { ...item, completed: true } : item,
      ),
    };
    return;
  }
  const completedAt = new Date().toISOString();
  const idempotencyKey = `${habitId}:${completedAt}`;
  for (let attempt = 0; ; attempt++) {
    try {
      return await request<{ xpAwarded: number; idempotentReplay: boolean }>(`/habits/${habitId}/completions`, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ completedAt }),
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
      item.id === habitId ? { ...item, completed: false } : item) };
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
    demo.activities.push({
      id: `demo-${Date.now()}`,
      title: values.name,
      target: `${values.targetValue} ${values.unit ?? ''}`,
      area: 'study',
      period: values.dayPeriod,
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
