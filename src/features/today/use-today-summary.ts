import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { completeHabit, undoHabit, getTodaySummary } from '@/src/services/api/today-api';
import type { DailyActivity, TodaySummary } from '@/src/types/today';

const todayKey = ['today'] as const;

export function useTodaySummary() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: todayKey, queryFn: getTodaySummary, refetchInterval: 60_000 });
  const toggleMutation = useMutation({
    mutationFn: (activity: DailyActivity) => activity.completed
      ? undoHabit(activity.id, activity.completionId)
      : completeHabit(activity.id),
    onMutate: async (selected) => {
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
    toggleActivity: (id: string) => {
      const activity = query.data?.activities.find((item) => item.id === id);
      if (!toggleMutation.isPending && activity) toggleMutation.mutate(activity);
    },
    completionError: toggleMutation.error,
    isToggling: toggleMutation.isPending,
  };
}
