export const sleepQualityColor = (quality?: string) => ({
  Ruim: '#DC2626',
  Regular: '#EA580C',
  Boa: '#EAB308',
  Ótima: '#16A34A',
}[quality ?? ''] ?? '#94A3B8');
