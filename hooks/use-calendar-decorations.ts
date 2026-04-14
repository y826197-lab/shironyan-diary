import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CalendarDecoration {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  sizeIndex: number;
}

// 5 size steps: 40 → 60 → 80 → 100 → 120 → loop
export const DECORATION_SIZES = [40, 60, 80, 100, 120];

function buildKey(year: number, month: number): string {
  return `calendar_decorations_${year}_${String(month + 1).padStart(2, '0')}`;
}

export function useCalendarDecorations(year: number, month: number) {
  const [decorations, setDecorations] = useState<CalendarDecoration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const key = buildKey(year, month);

  // Load from AsyncStorage whenever year/month changes
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    AsyncStorage.getItem(key).then((data) => {
      if (cancelled) return;
      try {
        setDecorations(data ? (JSON.parse(data) as CalendarDecoration[]) : []);
      } catch {
        setDecorations([]);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  // Persist to AsyncStorage whenever decorations change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(key, JSON.stringify(decorations)).catch(() => {});
  }, [decorations, loaded, key]);

  const addDecoration = useCallback((stickerId: string, x: number, y: number) => {
    const newDeco: CalendarDecoration = {
      id: `${Date.now()}_${Math.floor(Math.random() * 9999)}`,
      stickerId,
      x,
      y,
      sizeIndex: 1, // start at 60px
    };
    setDecorations((prev) => [...prev, newDeco]);
  }, []);

  const moveDecoration = useCallback((id: string, x: number, y: number) => {
    setDecorations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, x, y } : d))
    );
  }, []);

  const cycleSizeDecoration = useCallback((id: string) => {
    setDecorations((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, sizeIndex: (d.sizeIndex + 1) % DECORATION_SIZES.length }
          : d
      )
    );
  }, []);

  const removeDecoration = useCallback((id: string) => {
    setDecorations((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return {
    decorations,
    addDecoration,
    moveDecoration,
    cycleSizeDecoration,
    removeDecoration,
    loaded,
  };
}
