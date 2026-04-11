import { Colors, ThemePresets } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';

export function useTheme() {
  const preferences = useAppStore((s) => s.preferences);
  const theme = ThemePresets[preferences.themeKey];

  return {
    ...Colors,
    ...theme,
    themeKey: preferences.themeKey,
    fontScale: preferences.fontScale,
  };
}
