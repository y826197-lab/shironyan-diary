import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deletePersistedImage } from '@/utils/image-storage';

export interface CustomBackground {
  id: string;
  uri: string;
  createdAt: string;
}

interface CustomBackgroundState {
  backgrounds: CustomBackground[];
  addBackground: (uri: string) => void;
  removeBackground: (id: string) => void;
}

function generateId(): string {
  return 'cbg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useCustomBackgroundStore = create<CustomBackgroundState>()(
  persist(
    (set, get) => ({
      backgrounds: [],

      addBackground: (uri: string) => {
        const bg: CustomBackground = {
          id: generateId(),
          uri,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          backgrounds: [bg, ...state.backgrounds],
        }));
      },

      removeBackground: (id: string) => {
        const bg = get().backgrounds.find((b) => b.id === id);
        if (bg) {
          deletePersistedImage(bg.uri).catch(() => {});
        }
        set((state) => ({
          backgrounds: state.backgrounds.filter((b) => b.id !== id),
        }));
      },
    }),
    {
      name: 'custom-backgrounds-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
