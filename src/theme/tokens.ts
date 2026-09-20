export const colors = {
  background: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F3F8',
  ink: '#0D1742',
  muted: '#60708C',
  border: '#E1E7F0',
  primary: '#2F63EE',
  teal: '#23B6A4',
  tealSoft: '#E9FAF7',
  orange: '#FF8A3D',
  orangeSoft: '#FFF1E8',
  violet: '#7B61F2',
  violetSoft: '#F0ECFF',
  blueSoft: '#EAF0FF',
  danger: '#D84A4A',
} as const;

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
  sm: 10,
  md: 16,
  lg: 22,
  round: 999,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#132047',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
} as const;
