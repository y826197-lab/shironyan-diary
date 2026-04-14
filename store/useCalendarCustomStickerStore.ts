import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { deletePersistedImage } from '@/utils/image-storage';
import { getPlatformStorage } from '@/utils/web-storage';

export interface CalendarCustomSticker {
  id: string;
  uri: string;
  createdAt: string;
}

interface CalendarCustomStickerState {
  stickers: CalendarCustomSticker[];
  addSticker: (uri: string) => void;
  removeSticker: (id: string) => void;
}

function generateId(): string {
  return 'cal_cs_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useCalendarCustomStickerStore = create<CalendarCustomStickerState>()(
  persist(
    (set, get) => ({
      stickers: [],

      addSticker: (uri: string) => {
        const sticker: CalendarCustomSticker = {
          id: generateId(),
          uri,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ stickers: [sticker, ...state.stickers] }));
      },

      removeSticker: (id: string) => {
        const sticker = get().stickers.find((s) => s.id === id);
        if (sticker) {
          deletePersistedImage(sticker.uri).catch(() => {});
        }
        set((state) => ({ stickers: state.stickers.filter((s) => s.id !== id) }));
      },
    }),
    {
      name: 'calendar-custom-stickers-storage',
      storage: createJSONStorage(() => getPlatformStorage()),
    }
  )
);
