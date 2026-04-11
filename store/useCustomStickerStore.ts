import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomSticker {
  id: string;
  uri: string;
  createdAt: string;
}

interface CustomStickerState {
  stickers: CustomSticker[];
  addSticker: (uri: string) => void;
  removeSticker: (id: string) => void;
}

function generateId(): string {
  return 'cs_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useCustomStickerStore = create<CustomStickerState>()(
  persist(
    (set) => ({
      stickers: [],

      addSticker: (uri: string) => {
        const sticker: CustomSticker = {
          id: generateId(),
          uri,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          stickers: [sticker, ...state.stickers],
        }));
      },

      removeSticker: (id: string) => {
        set((state) => ({
          stickers: state.stickers.filter((s) => s.id !== id),
        }));
      },
    }),
    {
      name: 'custom-stickers-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
