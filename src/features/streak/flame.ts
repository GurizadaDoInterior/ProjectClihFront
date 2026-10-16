export const flameStages = [
  { days: 0, color: '#8A8178', core: '#C7BDB0', name: 'Na plataforma', size: 25 },
  { days: 3, color: '#D76327', core: '#FFD189', name: 'Ignição', size: 27 },
  { days: 10, color: '#D84432', core: '#FFC080', name: 'Decolagem', size: 29 },
  { days: 30, color: '#3291C4', core: '#C8F4FF', name: 'Órbita azul', size: 31 },
  { days: 50, color: '#8D63CD', core: '#EBDAFF', name: 'Exploração violeta', size: 33 },
  { days: 100, color: '#D05DAD', core: '#FFE0F3', name: 'Viagem estelar', size: 35 },
  { days: 200, color: '#E52686', core: '#FFC9EC', name: 'Impulso cósmico', size: 37 },
  { days: 300, color: '#F2AE00', core: '#FFF5AB', name: 'Missão lendária', size: 39 },
] as const;
export function getFlameStage(days: number) {
  return [...flameStages].reverse().find(stage => days >= stage.days) ?? flameStages[0];
}
