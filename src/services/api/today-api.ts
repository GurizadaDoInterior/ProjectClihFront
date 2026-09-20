import { demoToday } from '@/src/features/today/demo-data';
import { enqueueCompletion } from '@/src/services/storage/offline-queue';
import type { TodaySummary } from '@/src/types/today';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export async function getTodaySummary(): Promise<TodaySummary> {
  if (!apiUrl) return demoToday;

  const response = await fetch(`${apiUrl}/today`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar a rotina de hoje.');
  }

  return (await response.json()) as TodaySummary;
}

export async function completeHabit(habitId: string) {
  const completedAt = new Date().toISOString();
  const idempotencyKey = `${habitId}:${completedAt.slice(0, 10)}`;

  if (!apiUrl) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/habits/${habitId}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ completedAt }),
    });

    if (!response.ok) throw new Error('API indisponível');
  } catch {
    await enqueueCompletion({ habitId, idempotencyKey, completedAt });
  }
}
