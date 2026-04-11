import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DiaryPage, CanvasElement, DrawingStroke, BackgroundType } from './types';
import { deletePersistedImage } from '@/utils/image-storage';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

interface DiaryState {
  pages: DiaryPage[];
  // Actions
  createPage: (title?: string, date?: string) => string;
  deletePage: (id: string) => void;
  updatePage: (id: string, updates: Partial<Pick<DiaryPage, 'title' | 'date' | 'background'>>) => void;
  addElement: (pageId: string, element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  updateElement: (pageId: string, elementId: string, updates: Partial<CanvasElement>) => void;
  removeElement: (pageId: string, elementId: string) => void;
  addStroke: (pageId: string, stroke: Omit<DrawingStroke, 'id'>) => void;
  removeLastStroke: (pageId: string) => void;
  clearStrokes: (pageId: string) => void;
  getPagesByDate: (date: string) => DiaryPage[];
  getDatesWithEntries: () => Set<string>;
}

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      pages: [],

      createPage: (title?: string, date?: string) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newPage: DiaryPage = {
          id,
          title: title || '',
          date: date || todayISO(),
          type: 'free',
          background: 'plain',
          elements: [],
          strokes: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ pages: [newPage, ...state.pages] }));
        return id;
      },

      deletePage: (id) => {
        // Clean up persisted image files for all photo/custom-image elements
        const page = get().pages.find((p) => p.id === id);
        if (page) {
          for (const el of page.elements) {
            if (el.type === 'photo' || el.type === 'custom-image') {
              deletePersistedImage(el.content).catch(() => {});
            }
          }
        }
        set((state) => ({ pages: state.pages.filter((p) => p.id !== id) }));
      },

      updatePage: (id, updates) => {
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      addElement: (pageId, element) => {
        const elId = generateId();
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            const maxZ = p.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
            return {
              ...p,
              elements: [...p.elements, { ...element, id: elId, zIndex: maxZ + 1 }],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      updateElement: (pageId, elementId, updates) => {
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              elements: p.elements.map((e) => (e.id === elementId ? { ...e, ...updates } : e)),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeElement: (pageId, elementId) => {
        // Clean up persisted image file if this is a photo/custom-image element
        const page = get().pages.find((p) => p.id === pageId);
        const element = page?.elements.find((e) => e.id === elementId);
        if (element && (element.type === 'photo' || element.type === 'custom-image')) {
          deletePersistedImage(element.content).catch(() => {});
        }
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              elements: p.elements.filter((e) => e.id !== elementId),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      addStroke: (pageId, stroke) => {
        const strokeId = generateId();
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              strokes: [...p.strokes, { ...stroke, id: strokeId }],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeLastStroke: (pageId) => {
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              strokes: p.strokes.slice(0, -1),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      clearStrokes: (pageId) => {
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            return { ...p, strokes: [], updatedAt: new Date().toISOString() };
          }),
        }));
      },

      getPagesByDate: (date) => {
        return get().pages.filter((p) => p.date === date);
      },

      getDatesWithEntries: () => {
        return new Set(get().pages.map((p) => p.date));
      },
    }),
    {
      name: 'diary-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
