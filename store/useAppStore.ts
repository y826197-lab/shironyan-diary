import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Preferences } from './types';
import type { ThemeKey } from '@/constants/Colors';

interface PreferencesSlice {
  preferences: Preferences;
  setTheme: (key: ThemeKey) => void;
  setFontScale: (scale: number) => void;
}

export type AppStore = PreferencesSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      preferences: {
        themeKey: 'pink',
        fontScale: 1,
      },

      setTheme: (key: ThemeKey) =>
        set((state) => ({
          preferences: { ...state.preferences, themeKey: key },
        })),

      setFontScale: (scale: number) =>
        set((state) => ({
          preferences: { ...state.preferences, fontScale: scale },
        })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
