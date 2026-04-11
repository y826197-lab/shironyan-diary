import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Preferences } from './types';
import type { ThemeKey } from '@/constants/Colors';

interface AppState {
  preferences: Preferences;
  customTitle: string;
  setTheme: (key: ThemeKey) => void;
  setFontScale: (scale: number) => void;
  setCustomTitle: (title: string) => void;
  setPreferences: (prefs: Preferences) => void;
}

export type AppStore = AppState;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      preferences: {
        themeKey: 'pink',
        fontScale: 1,
      },
      customTitle: 'ひびのき',

      setTheme: (key: ThemeKey) =>
        set((state) => ({
          preferences: { ...state.preferences, themeKey: key },
        })),

      setFontScale: (scale: number) =>
        set((state) => ({
          preferences: { ...state.preferences, fontScale: scale },
        })),

      setCustomTitle: (title: string) =>
        set({ customTitle: title }),

      setPreferences: (prefs: Preferences) =>
        set({ preferences: prefs }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        customTitle: state.customTitle,
      }),
    }
  )
);
