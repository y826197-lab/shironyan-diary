// Hibinoki (ひびのき) — Kawaii Pastel Diary App Color System

export const Colors = {
  primary: '#F9A8C9',
  primaryLight: '#FDCFE1',
  primaryDark: '#E88AB3',
  secondary: '#C9A8F9',
  secondaryLight: '#DED0FC',
  accent: '#F9E4A8',
  accentLight: '#FCF0CD',
  background: '#FFF5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFF9FC',
  text: '#5C4A6E',
  textSecondary: '#8B7A9E',
  textMuted: '#C4B0D0',
  border: '#F0E0EA',
  borderLight: '#F8EDF3',
  shadow: 'rgba(249, 168, 201, 0.15)',
  shadowDark: 'rgba(92, 74, 110, 0.08)',
  overlay: 'rgba(92, 74, 110, 0.4)',
  white: '#FFFFFF',
  error: '#F28B82',
  success: '#81C995',
  mint: '#A8F9D8',
  mintLight: '#D4FCE9',
} as const;

export type ThemeKey = 'pink' | 'lavender' | 'mint' | 'yellow';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  gradientStart: string;
  gradientEnd: string;
  tabActive: string;
}

export const ThemePresets: Record<ThemeKey, ThemeColors> = {
  pink: {
    primary: '#F9A8C9',
    primaryLight: '#FDCFE1',
    background: '#FFF5F9',
    gradientStart: '#FFF0F5',
    gradientEnd: '#F5EEFF',
    tabActive: '#F9A8C9',
  },
  lavender: {
    primary: '#C9A8F9',
    primaryLight: '#DED0FC',
    background: '#F8F5FF',
    gradientStart: '#F5EEFF',
    gradientEnd: '#FFF0F5',
    tabActive: '#C9A8F9',
  },
  mint: {
    primary: '#8ED8BE',
    primaryLight: '#C2F0DE',
    background: '#F2FFF8',
    gradientStart: '#EDFFF5',
    gradientEnd: '#F5FAFF',
    tabActive: '#8ED8BE',
  },
  yellow: {
    primary: '#F9D88A',
    primaryLight: '#FCF0CD',
    background: '#FFFDF5',
    gradientStart: '#FFFBEE',
    gradientEnd: '#FFF5F9',
    tabActive: '#F9D88A',
  },
};
