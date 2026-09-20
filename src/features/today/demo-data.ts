import type { TodaySummary } from '@/src/types/today';

export const demoToday: TodaySummary = {
  displayName: 'Gustavo',
  streakDays: 7,
  level: 8,
  xp: 1240,
  xpToNextLevel: 1800,
  week: [
    { label: 'SEG', state: 'complete' },
    { label: 'TER', state: 'complete' },
    { label: 'QUA', state: 'complete' },
    { label: 'QUI', state: 'partial' },
    { label: 'SEX', state: 'current' },
    { label: 'SÁB', state: 'empty' },
    { label: 'DOM', state: 'empty' },
  ],
  areaBalance: {
    study: 0.72,
    health: 0.68,
    reading: 0.42,
    sleep: 0.61,
  },
  activities: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Estudar programação',
      target: '30 min',
      area: 'study',
      completed: true,
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Caminhar',
      target: '3 km',
      area: 'health',
      completed: false,
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Ler',
      target: '10 páginas',
      area: 'reading',
      completed: false,
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      title: 'Organizar prioridades',
      target: '10 min',
      area: 'study',
      completed: true,
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      title: 'Dormir antes das 23h',
      target: '8 horas',
      area: 'sleep',
      completed: true,
    },
  ],
};
