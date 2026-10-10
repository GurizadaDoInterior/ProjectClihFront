export const lightColors = {
  background: '#F5F4F0',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F3F8',
  ink: '#172131',
  muted: '#60708C',
  border: '#E1E7F0',
  primary: '#243B5A',
  teal: '#304D70',
  tealSoft: '#EAF0F7',
  orange: '#BC521F',
  orangeSoft: '#FFF1E8',
  violet: '#7B61F2',
  violetSoft: '#F0ECFF',
  blueSoft: '#E8EDF4',
  danger: '#D84A4A',
  onAccent: '#FFFFFF',
  hero: '#1D2B40',
  heroMuted: '#CDD6E3',
} as const;
export type Palette = { [K in keyof typeof lightColors]: string };
export const darkColors: Palette = {
  background: '#181714', surface: '#24221D', surfaceMuted: '#302D25',
  ink: '#F5F0E6', muted: '#BDB4A2', border: '#443F33',
  primary: '#E8B64F', teal: '#E8B64F', tealSoft: '#3A3020',
  orange: '#F2A65A', orangeSoft: '#3C2C20', violet: '#C4ACD0', violetSoft: '#342C38',
  blueSoft: '#3A3020', danger: '#F39483', onAccent: '#261D0C', hero: '#332B1D', heroMuted: '#D6C5A0',
};
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 10,
  round: 999,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#132047',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.025,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;
