import type { ThemeKey } from '@/constants/Colors';

export type BackgroundType = 'plain' | 'lined' | 'grid' | 'dots' | 'floral';
export type PenType = 'pen' | 'marker' | 'highlighter' | 'crayon' | 'neon';

export interface CanvasElement {
  id: string;
  type: 'photo' | 'sticker' | 'text' | 'cat-image' | 'deco-text' | 'custom-image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  fontSize?: number;
  fontColor?: string;
  imageSource?: number;
  zIndex: number;
}

export interface DrawingStroke {
  id: string;
  penType: PenType;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  opacity: number;
}

export interface DiaryPage {
  id: string;
  title: string;
  date: string;
  type: 'calendar' | 'free';
  background: BackgroundType;
  elements: CanvasElement[];
  strokes: DrawingStroke[];
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  themeKey: ThemeKey;
  fontScale: number;
}
