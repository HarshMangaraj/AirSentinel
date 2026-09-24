export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const type = {
  hero: { fontSize: 34, fontFamily: 'Inter_700Bold', lineHeight: 40, letterSpacing: -1 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', lineHeight: 30, letterSpacing: -0.5 },
  body: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold', lineHeight: 20 },
  small: { fontSize: 12, fontFamily: 'Inter_500Medium', lineHeight: 16 },
};

export const radius = { sm: 12, md: 18, lg: 24, xl: 32 };

export interface ThemeColors {
  mode: 'light' | 'dark';
  paper: string;
  ink: string;
  signal: string;
  signalLight: string;
  muted: string;
  danger: string;
  glass: string;
  glassBorder: string;
  cardGlow: string;
  aqi: {
    good: string;
    moderate: string;
    unhealthy: string;
    hazardous: string;
  };
  chips: {
    green: { bg: string; fg: string };
    blue: { bg: string; fg: string };
    purple: { bg: string; fg: string };
    orange: { bg: string; fg: string };
    yellow: { bg: string; fg: string };
    sky: { bg: string; fg: string };
  };
}

export const lightColors: ThemeColors = {
  mode: 'light',
  paper: '#F8FAFC',
  ink: '#0F172A',
  signal: '#10B981',
  signalLight: '#E3F5EC',
  muted: '#64748B',
  danger: '#EF4444',
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(226, 232, 240, 0.8)',
  cardGlow: 'rgba(16, 185, 129, 0.04)',
  aqi: { good: '#10B981', moderate: '#F59E0B', unhealthy: '#F97316', hazardous: '#EF4444' },
  chips: {
    green: { bg: '#E3F5EC', fg: '#065F46' },
    blue: { bg: '#E8F2FB', fg: '#1E40AF' },
    purple: { bg: '#F1ECFB', fg: '#581C87' },
    orange: { bg: '#FCEFEC', fg: '#9A3412' },
    yellow: { bg: '#FFF6E0', fg: '#854D0E' },
    sky: { bg: '#EAF4FC', fg: '#0369A1' },
  },
};

export const darkColors: ThemeColors = {
  mode: 'dark',
  paper: '#0B0F19',
  ink: '#F8FAFC',
  signal: '#10B981',
  signalLight: 'rgba(16, 185, 129, 0.15)',
  muted: '#94A3B8',
  danger: '#FB7185',
  glass: 'rgba(30, 41, 59, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  cardGlow: 'rgba(16, 185, 129, 0.08)',
  aqi: { good: '#10B981', moderate: '#F59E0B', unhealthy: '#F97316', hazardous: '#EF4444' },
  chips: {
    green: { bg: '#064E3B', fg: '#D1FAE5' },
    blue: { bg: '#1E3A8A', fg: '#DBEAFE' },
    purple: { bg: '#581C87', fg: '#F3E8FF' },
    orange: { bg: '#7C2D12', fg: '#FFEDD5' },
    yellow: { bg: '#713F12', fg: '#FEF9C3' },
    sky: { bg: '#0C4A6E', fg: '#E0F2FE' },
  },
};
