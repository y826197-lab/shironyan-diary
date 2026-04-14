import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DiaryPage, CanvasElement, DrawingStroke, BackgroundType } from './types';
import { deletePersistedImage } from '@/utils/image-storage';
import { getPlatformStorage } from '@/utils/web-storage';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Reduce stroke point density by skipping points closer than `minDist` px.
 * This dramatically reduces storage size (e.g. 800 pts → 80 pts) while
 * keeping the drawn shape visually identical.
 */
function simplifyStroke(
  points: { x: number; y: number }[],
  minDist = 2.5
): { x: number; y: number }[] {
  if (points.length <= 3) return points;
  const out: { x: number; y: number }[] = [points[0]];
  let prev = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const dx = points[i].x - prev.x;
    const dy = points[i].y - prev.y;
    if (dx * dx + dy * dy >= minDist * minDist) {
      out.push(points[i]);
      prev = points[i];
    }
  }
  // Always keep the last point so strokes end exactly where the user lifted
  out.push(points[points.length - 1]);
  return out;
}

interface DiaryState {
  pages: DiaryPage[];
  createPage: (title?: string, date?: string) => string;
  deletePage: (id: string) => void;
  updatePage: (
    id: string,
    updates: Partial<
      Pick<DiaryPage, 'title' | 'date' | 'background' | 'backgroundImage'>
    >
  ) => void;
  removeStroke: (pageId: string, strokeId: string) => void;
  addElement: (
    pageId: string,
    element: Omit<CanvasElement, 'id' | 'zIndex'>
  ) => void;
  updateElement: (
    pageId: string,
    elementId: string,
    updates: Partial<CanvasElement>
  ) => void;
  removeElement: (pageId: string, elementId: string) => void;
  addStroke: (pageId: string, stroke: Omit<DrawingStroke, 'id'>) => void;
  removeLastStroke: (pageId: string) => void;
  clearStrokes: (pageId: string) => void;
  getPagesByDate: (date: string) => DiaryPage[];
  getDatesWithEntries: () => Set<string>;
  replaceAllPages: (pages: DiaryPage[]) => void;
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
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      addElement: (pageId, element) => {
        const elId = generateId();
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            const maxZ = p.elements.reduce(
              (max, e) => Math.max(max, e.zIndex),
              0
            );
            return {
              ...p,
              elements: [
                ...p.elements,
                { ...element, id: elId, zIndex: maxZ + 1 },
              ],
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
              elements: p.elements.map((e) =>
                e.id === elementId ? { ...e, ...updates } : e
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeElement: (pageId, elementId) => {
        const page = get().pages.find((p) => p.id === pageId);
        const element = page?.elements.find((e) => e.id === elementId);
        if (
          element &&
          (element.type === 'photo' || element.type === 'custom-image')
        ) {
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
        // Simplify points before storing to keep storage size small
        const simplifiedPoints = simplifyStroke(stroke.points);
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              strokes: [
                ...p.strokes,
                { ...stroke, id: strokeId, points: simplifiedPoints },
              ],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeStroke: (pageId, strokeId) => {
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id !== pageId) return p;
            return {
              ...p,
              strokes: p.strokes.filter((s) => s.id !== strokeId),
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

      replaceAllPages: (newPages: DiaryPage[]) => {
        const existing = get().pages;
        for (const page of existing) {
          for (const el of page.elements) {
            if (el.type === 'photo' || el.type === 'custom-image') {
              deletePersistedImage(el.content).catch(() => {});
            }
          }
        }
        set({ pages: newPages });
      },
    }),
    {
      name: 'diary-storage',
      // Use IndexedDB on web (no 5 MB quota), AsyncStorage on native
      storage: createJSONStorage(() => getPlatformStorage()),
    }
  )
);
