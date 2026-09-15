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
  glassHighlight: string;
  cardGlow: string;
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
  paper: '#F8FAFC',
  ink: '#0F172A',
  signal: '#0D9488',
  signalDark: '#0F766E',
  muted: '#64748B',
  danger: '#E11D48',
  glass: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(226, 232, 240, 0.8)',
  glassHighlight: 'rgba(255, 255, 255, 0.95)',
  cardGlow: 'rgba(13, 148, 136, 0.05)',
  gradient: ['#F1F5F9', '#F8FAFC', '#F8FAFC'],
  blurTint: 'light',
  aqi: { good: '#10B981', moderate: '#F59E0B', unhealthy: '#F97316', hazardous: '#F43F5E' },
};

export const darkColors: ThemeColors = {
  mode: 'dark',
  paper: '#0B0F19',
  ink: '#F8FAFC',
  signal: '#14B8A6',
  signalDark: '#0D9488',
  muted: '#94A3B8',
  danger: '#F43F5E',
  glass: 'rgba(17, 24, 39, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.15)',
  cardGlow: 'rgba(20, 184, 166, 0.08)',
  gradient: ['#070A10', '#0B0F19', '#111827'],
  blurTint: 'dark',
  aqi: { good: '#10B981', moderate: '#F59E0B', unhealthy: '#F97316', hazardous: '#F43F5E' },
};