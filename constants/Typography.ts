import {
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
} from '@expo-google-fonts/noto-sans-jp';

// Font map passed to useFonts() in _layout.tsx
export const FontMap = {
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
};

// Semantic aliases used in styles throughout the app
export const Fonts = {
  regular: 'NotoSansJP_400Regular',
  medium: 'NotoSansJP_500Medium',
  bold: 'NotoSansJP_700Bold',
} as const;

export type FontWeight = keyof typeof Fonts;
