import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { deletePersistedImage } from '@/utils/image-storage';
import { getPlatformStorage } from '@/utils/web-storage';

export interface CustomSticker {
  id: string;
  uri: string;
  createdAt: string;
}

interface CustomStickerState {
  stickers: CustomSticker[];
  addSticker: (uri: string) => void;
  removeSticker: (id: string) => void;
  replaceAllStickers: (stickers: CustomSticker[]) => void;
}

function generateId(): string {
  return 'cs_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useCustomStickerStore = create<CustomStickerState>()(
  persist(
    (set, get) => ({
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
        const sticker = get().stickers.find((s) => s.id === id);
        if (sticker) {
          deletePersistedImage(sticker.uri).catch(() => {});
        }
        set((state) => ({
          stickers: state.stickers.filter((s) => s.id !== id),
        }));
      },

      replaceAllStickers: (newStickers: CustomSticker[]) => {
        // Clean up existing persisted images
        const existing = get().stickers;
        for (const s of existing) {
          deletePersistedImage(s.uri).catch(() => {});
        }
        set({ stickers: newStickers });
      },
    }),
    {
      name: 'custom-stickers-storage',
      storage: createJSONStorage(() => getPlatformStorage()),
    }
  )
);
