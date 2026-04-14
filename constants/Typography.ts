import {
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
} from '@expo-google-fonts/noto-sans-jp';

// Font map passed to useFonts() in _layout.tsx
// JK Maru Gothic is loaded from local .otf file
export const FontMap = {
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  JKMaruGothic: require('@/assets/fonts/JK-Maru-Gothic-M.otf'),
};

// Semantic aliases: all point to JK Maru Gothic as the primary display font,
// with Noto Sans JP as fallback for weights the .otf doesn't supply.
export const Fonts = {
  regular: 'JKMaruGothic',
  medium: 'JKMaruGothic',
  bold: 'JKMaruGothic',
} as const;

export type FontWeight = keyof typeof Fonts;
