export const flameStages = [
  { days: 0, color: '#8A8178', core: '#C7BDB0', name: 'Faísca', size: 25 },
  { days: 3, color: '#D76327', core: '#FFD189', name: 'Chama acesa', size: 27 },
  { days: 10, color: '#D84432', core: '#FFC080', name: 'Em brasa', size: 29 },
  { days: 30, color: '#CB951C', core: '#FFF2A0', name: 'Chama dourada', size: 31 },
  { days: 50, color: '#3291C4', core: '#C8F4FF', name: 'Chama azul', size: 33 },
  { days: 100, color: '#8D63CD', core: '#EBDAFF', name: 'Chama violeta', size: 35 },
  { days: 200, color: '#D05DAD', core: '#FFE0F3', name: 'Chama intensa', size: 37 },
  { days: 300, color: '#A6B6C9', core: '#FFFFFF', name: 'Chama lendária', size: 39 },
] as const;
export function getFlameStage(days: number) {
  return [...flameStages].reverse().find(stage => days >= stage.days) ?? flameStages[0];
}
