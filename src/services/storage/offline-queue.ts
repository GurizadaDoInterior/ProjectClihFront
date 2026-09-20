import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@clih/offline-completions/v1';

export type QueuedCompletion = {
  habitId: string;
  idempotencyKey: string;
  completedAt: string;
};

export async function enqueueCompletion(item: QueuedCompletion) {
  const current = await readCompletionQueue();
  const next = current.some((entry) => entry.idempotencyKey === item.idempotencyKey)
    ? current
    : [...current, item];

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next));
}

export async function readCompletionQueue(): Promise<QueuedCompletion[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as QueuedCompletion[];
  } catch {
    await AsyncStorage.removeItem(QUEUE_KEY);
    return [];
  }
}
