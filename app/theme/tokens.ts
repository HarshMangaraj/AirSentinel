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
  blurTint: 'light' | 'dark' | 'systemThinMaterial' | 'systemChromeMaterial';
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
  signal: '#059669',
  signalDark: '#047857',
  muted: '#64748B',
  danger: '#DC2626',
  glass: 'rgba(255, 255, 255, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.85)',
  glassHighlight: 'rgba(255, 255, 255, 0.95)',
  cardGlow: 'rgba(5, 150, 105, 0.08)',
  gradient: ['#E6F4EF', '#F0F9F5', '#F8FAFC'],
  blurTint: 'light',
  aqi: { good: '#10B981', moderate: '#F59E0B', unhealthy: '#F97316', hazardous: '#EF4444' },
};

export const darkColors: ThemeColors = {
  mode: 'dark',
  paper: '#060C0A',
  ink: '#F3F4F6',
  signal: '#10B981',
  signalDark: '#059669',
  muted: '#9CA3AF',
  danger: '#EF4444',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.22)',
  cardGlow: 'rgba(16, 185, 129, 0.15)',
  gradient: ['#060C0A', '#0D1814', '#14241E'],
  blurTint: 'dark',
  aqi: { good: '#10B981', moderate: '#F59E0B', unhealthy: '#F97316', hazardous: '#EF4444' },
};