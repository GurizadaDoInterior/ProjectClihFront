export const lightColors = {
  background: '#F2F0E9', surface: '#FAF9F5', surfaceMuted: '#E5E2D9',
  ink: '#191A1B', muted: '#62635F', border: '#D3D1C8',
  primary: '#26364A', teal: '#26364A', tealSoft: '#E1E5E9',
  orange: '#B6471D', orangeSoft: '#F4E2D5', violet: '#645A6B', violetSoft: '#E9E4EB',
  blueSoft: '#E1E5E9', danger: '#BC3831', onAccent: '#FFFFFF', hero: '#1C2430', heroMuted: '#C9CFD7',
} as const;
export type Palette = { [K in keyof typeof lightColors]: string };
export const darkColors: Palette = {
  background: '#131313', surface: '#1D1D1C', surfaceMuted: '#292825',
  ink: '#F5F3EC', muted: '#B1AEA5', border: '#3C3A34',
  primary: '#F0AD45', teal: '#F0AD45', tealSoft: '#332B20',
  orange: '#F0AD45', orangeSoft: '#332B20', violet: '#B8ACBD', violetSoft: '#302B32',
  blueSoft: '#2C2D2E', danger: '#F39483', onAccent: '#191610', hero: '#23221E', heroMuted: '#D8CEB9',
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
