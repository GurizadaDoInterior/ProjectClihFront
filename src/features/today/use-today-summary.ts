import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { completeHabit, undoHabit, getTodaySummary } from '@/src/services/api/today-api';
import type { DailyActivity, TodaySummary } from '@/src/types/today';

const todayKey = ['today'] as const;

export function useTodaySummary() {
  const queryClient = useQueryClient();
  const [xpReward, setXpReward] = useState<{ habitId: string; amount: number; eventId: number } | null>(null);
  const query = useQuery({ queryKey: todayKey, queryFn: getTodaySummary, refetchInterval: 60_000 });
  const toggleMutation = useMutation({
    mutationFn: async (activity: DailyActivity) => {
      if (activity.completed) {
        const before = queryClient.getQueryData<TodaySummary>(todayKey)?.xp ?? 0;
        await undoHabit(activity.id, activity.completionId);
        const after = await getTodaySummary();
        queryClient.setQueryData(todayKey, after);
        const amount = before - after.xp;
        if (amount > 0) setXpReward({ habitId: activity.id, amount: -amount, eventId: Date.now() });
        return undefined;
      }
      return completeHabit(activity.id);
    },
    onSuccess: (result, activity) => {
      if (!activity.completed && result && result.xpAwarded > 0 && !result.idempotentReplay) {
        setXpReward({ habitId: activity.id, amount: result.xpAwarded, eventId: Date.now() });
      }
    },
    onMutate: async (selected) => {
      setXpReward(null);
      await queryClient.cancelQueries({ queryKey: todayKey });
      const previous = queryClient.getQueryData<TodaySummary>(todayKey);

      queryClient.setQueryData<TodaySummary>(todayKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          activities: current.activities.map((activity) =>
            activity.id === selected.id ? { ...activity, completed: !selected.completed } : activity,
          ),
        };
      });

      return { previous };
    },
    onError: (_error, _habitId, context) => {
      if (context?.previous) queryClient.setQueryData(todayKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: todayKey }),
  });

  return {
    ...query,
    xpReward,
    toggleActivity: (id: string) => {
      const activity = query.data?.activities.find((item) => item.id === id);
      if (!toggleMutation.isPending && activity) toggleMutation.mutate(activity);
    },
    completionError: toggleMutation.error,
    isToggling: toggleMutation.isPending,
  };
}
