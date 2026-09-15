export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const type = {
  hero: { fontSize: 34, fontFamily: 'Inter_700Bold', lineHeight: 38, letterSpacing: -0.5 },
  title: { fontSize: 22, fontFamily: 'Inter_600SemiBold', lineHeight: 28, letterSpacing: -0.2 },
  body: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  label: { fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 20 },
  small: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 16 },
};

export const radius = { sm: 10, md: 16, lg: 24, xl: 32 };

export interface ThemeColors {
  mode: 'light' | 'dark';
  paper: string;
  ink: string;
  signal: string;
  signalDark: string;
  muted: string;
  danger: string;
  glass: string;
  glassBorder: string;
  gradient: [string, string, string];
  blurTint: 'light' | 'dark';
  aqi: {
    good: string;
    moderate: string;
    unhealthy: string;
    hazardous: string;
  };
}

export const lightColors: ThemeColors = {
  mode: 'light',
  paper: '#F4F6F2',
  ink: '#1A2420',
  signal: '#2F6E5C',
  signalDark: '#1E4B3E',
  muted: '#6B7570',
  danger: '#B23A3A',
  glass: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.7)',
  gradient: ['#DCEDE6', '#EAF3EE', '#F4F6F2'],
  blurTint: 'light',
  aqi: { good: '#4C9A6A', moderate: '#D9A441', unhealthy: '#D9722F', hazardous: '#B23A3A' },
};

export const darkColors: ThemeColors = {
  mode: 'dark',
  paper: '#0E1512',
  ink: '#EAF2EE',
  signal: '#4FBF9C',
  signalDark: '#3A9C7D',
  muted: '#8FA098',
  danger: '#E06B6B',
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.14)',
  gradient: ['#0B1210', '#101A16', '#0E1512'],
  blurTint: 'dark',
  aqi: { good: '#5FCB94', moderate: '#E5B85A', unhealthy: '#E5895A', hazardous: '#D65B5B' },
};