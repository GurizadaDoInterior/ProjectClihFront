import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { completeHabit, getTodaySummary } from '@/src/services/api/today-api';
import type { TodaySummary } from '@/src/types/today';

const todayKey = ['today'] as const;

export function useTodaySummary() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: todayKey, queryFn: getTodaySummary, refetchInterval: 60_000 });
  const toggleMutation = useMutation({
    mutationFn: completeHabit,
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: todayKey });
      const previous = queryClient.getQueryData<TodaySummary>(todayKey);

      queryClient.setQueryData<TodaySummary>(todayKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          activities: current.activities.map((activity) =>
            activity.id === habitId ? { ...activity, completed: true } : activity,
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
      if (
        !toggleMutation.isPending &&
        !query.data?.activities.find((item) => item.id === id)?.completed
      )
        toggleMutation.mutate(id);
    },
    completionError: toggleMutation.error,
    isToggling: toggleMutation.isPending,
  };
}
