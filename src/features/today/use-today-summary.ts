import { useState } from 'react';
import { useIsMutating, useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';

import { completeHabit, undoHabit, getTodaySummary } from '@/src/services/api/today-api';
import type { DailyActivity, TodaySummary } from '@/src/types/today';

import {completionXp, previewXp} from './optimistic-xp';

const todayKey = ['today'] as const;
const locksByClient = new WeakMap<object, Set<string>>();

export function useTodaySummary() {
  const queryClient = useQueryClient();
  let locks = locksByClient.get(queryClient);
  if (!locks) { locks = new Set<string>(); locksByClient.set(queryClient, locks); }
  const activityLocks = locks;
  const pending = useIsMutating({mutationKey:['habit-toggle']});
  const pendingIds = useMutationState({
    filters: { mutationKey: ['habit-toggle'], status: 'pending' },
    select: mutation => (mutation.state.variables as DailyActivity | undefined)?.id,
  });
  const [xpReward, setXpReward] = useState<{ habitId: string; amount: number; eventId: number } | null>(null);
  const query = useQuery({ queryKey: todayKey, queryFn: getTodaySummary, staleTime: 30_000, refetchInterval: pending ? false : 60_000, refetchOnWindowFocus: !pending });
  const toggleMutation = useMutation({
    mutationKey:['habit-toggle'],
    // Save in order, while onMutate gives every clicked row immediate feedback.
    scope: { id: 'habit-toggle' },
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
          // A response for A must not overwrite the optimistic XP of queued B.
          ...previewXp(current, result.xpAwarded - completionXp(activity)),
          activities: current.activities.map(item => item.id === activity.id ? { ...item, completed: true, completionId: result.id, xpAwarded: result.xpAwarded } : item),
        } : current);
      }
      if (!activity.completed && result && result.xpAwarded > 0 && result.xpAwarded !== completionXp(activity) && !result.idempotentReplay) {
        setXpReward({ habitId: activity.id, amount: result.xpAwarded, eventId: Date.now() });
      }
    },
    onMutate: async (selected) => {
      setXpReward(null);
      void queryClient.cancelQueries({ queryKey: todayKey });
      const delta = selected.completed ? -(selected.xpAwarded ?? 0) : completionXp(selected);
      if (delta) setXpReward({ habitId:selected.id, amount:delta, eventId:Date.now() });

      queryClient.setQueryData<TodaySummary>(todayKey, (current) => {
        if (!current) return current;
        return {
          ...previewXp(current, delta),
          activities: current.activities.map((activity) =>
            activity.id === selected.id ? { ...activity, completed: !selected.completed } : activity,
          ),
        };
      });

      return { selected, delta };
    },
    onError: (_error, _activity, context) => {
      setXpReward(null);
      if (context) queryClient.setQueryData<TodaySummary>(todayKey, current => current ? {
        ...previewXp(current, -context.delta),
        activities: current.activities.map(activity => activity.id === context.selected.id ? context.selected : activity),
      } : current);
    },
    onSettled: (_data, _error, activity) => {
      activityLocks.delete(activity.id);
      // Only refresh after the last queued save, preserving other optimistic rows.
      if (queryClient.isMutating({ mutationKey: ['habit-toggle'] }) > 1) return;
      void queryClient.invalidateQueries({ queryKey: todayKey });
      void queryClient.invalidateQueries({ queryKey: ['day-history'] });
      void queryClient.invalidateQueries({ queryKey: ['calendar-activities'] });
    },
  });

  return {
    ...query,
    xpReward,
    toggleActivity: (id: string) => {
      const activity = queryClient.getQueryData<TodaySummary>(todayKey)?.activities.find(item => item.id === id);
      if (activity && !activityLocks.has(id) && !pendingIds.includes(id)) {
        activityLocks.add(id);
        toggleMutation.mutate(activity);
      }
    },
    isActivityPending: (id: string) => activityLocks.has(id) || pendingIds.includes(id),
    completionError: toggleMutation.error,
    isToggling: pending > 0,
  };
}
