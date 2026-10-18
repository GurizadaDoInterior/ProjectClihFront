import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { completeHabit, undoHabit, getTodaySummary } from '@/src/services/api/today-api';
import type { DailyActivity, TodaySummary } from '@/src/types/today';

const todayKey = ['today'] as const;

export function useTodaySummary() {
  const queryClient = useQueryClient();
  const [xpReward, setXpReward] = useState<{ habitId: string; amount: number; eventId: number } | null>(null);
  const query = useQuery({ queryKey: todayKey, queryFn: getTodaySummary, staleTime: 30_000, refetchInterval: 60_000 });
  const toggleMutation = useMutation({
    mutationFn: async (activity: DailyActivity) => {
      if (activity.completed) {
        await undoHabit(activity.habitId ?? activity.id, activity.completionId);
        return undefined;
      }
      return completeHabit(activity.habitId ?? activity.id, activity.completionPeriod);
    },
    onSuccess: (result, activity) => {
      if (!activity.completed && result) {
        queryClient.setQueryData<TodaySummary>(todayKey, current => current ? {
          ...current,
          ...(result.progress ? {
            xp: result.progress.totalXp,
            level: result.progress.level,
            xpInLevel: result.progress.totalXp - result.progress.xpForCurrentLevel,
            xpToNextLevel: result.progress.xpForNextLevel - result.progress.xpForCurrentLevel,
            streakDays: result.progress.currentStreak,
            longestStreak: result.progress.longestStreak,
          } : {}),
          activities: current.activities.map(item => item.id === activity.id ? { ...item, completed: true, completionId: result.id, xpAwarded: result.xpAwarded } : item),
        } : current);
      }
      if (!activity.completed && result && result.xpAwarded > 0 && !result.idempotentReplay) {
        setXpReward({ habitId: activity.id, amount: result.xpAwarded, eventId: Date.now() });
      }
    },
    onMutate: async (selected) => {
      setXpReward(null);
      await queryClient.cancelQueries({ queryKey: todayKey });
      const previous = queryClient.getQueryData<TodaySummary>(todayKey);
      if (selected.completed && (selected.xpAwarded ?? 0) > 0) {
        setXpReward({ habitId: selected.id, amount: -selected.xpAwarded!, eventId: Date.now() });
      }

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
      setXpReward(null);
      if (context?.previous) queryClient.setQueryData(todayKey, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todayKey });
      void queryClient.invalidateQueries({ queryKey: ['day-history'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar-activities'] });
    },
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
