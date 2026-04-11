// Sticker collection organized by category
import type { ImageSource } from 'expo-image';

export interface StickerCategory {
  id: string;
  name: string;
  icon: string;
  stickers: string[];
}

// Cat image sticker data
export interface CatSticker {
  id: string;
  source: ImageSource;
}

export const CAT_STICKERS: CatSticker[] = [
  { id: 'sticker_cat_01', source: require('@/assets/sticker_cat_01.png') },
  { id: 'sticker_cat_02', source: require('@/assets/sticker_cat_02.png') },
  { id: 'sticker_cat_03', source: require('@/assets/sticker_cat_03.png') },
  { id: 'sticker_cat_04', source: require('@/assets/sticker_cat_04.png') },
  { id: 'sticker_cat_05', source: require('@/assets/sticker_cat_05.png') },
  { id: 'sticker_cat_06', source: require('@/assets/sticker_cat_06.png') },
  { id: 'sticker_cat_07', source: require('@/assets/sticker_cat_07.png') },
  { id: 'sticker_cat_08', source: require('@/assets/sticker_cat_08.png') },
  { id: 'sticker_cat_09', source: require('@/assets/sticker_cat_09.png') },
  { id: 'sticker_cat_10', source: require('@/assets/sticker_cat_10.png') },
  { id: 'sticker_cat_11', source: require('@/assets/sticker_cat_11.png') },
  { id: 'sticker_cat_12', source: require('@/assets/sticker_cat_12.png') },
  { id: 'sticker_cat_13', source: require('@/assets/sticker_cat_13.png') },
  { id: 'sticker_cat_14', source: require('@/assets/sticker_cat_14.png') },
  { id: 'sticker_cat_15', source: require('@/assets/sticker_cat_15.png') },
  { id: 'sticker_cat_16', source: require('@/assets/sticker_cat_16.png') },
  { id: 'sticker_cat_17', source: require('@/assets/sticker_cat_17.png') },
  { id: 'sticker_cat_18', source: require('@/assets/sticker_cat_18.png') },
  { id: 'sticker_cat_19', source: require('@/assets/sticker_cat_19.png') },
];

// Map for resolving cat sticker IDs to their require() sources at render time
export const CAT_STICKER_MAP = new Map<string, ImageSource>(
  CAT_STICKERS.map((s) => [s.id, s.source])
);

export const STICKER_CATEGORIES: StickerCategory[] = [
  {
    id: 'flowers',
    name: '花',
    icon: '🌸',
    stickers: [
      '🌸', '🌷', '🌹', '🌺', '🌻', '🌼', '💐', '🏵️',
      '🌿', '🍀', '🍃', '🌱', '🪻', '🪷', '💮', '🌾',
    ],
  },
  {
    id: 'hearts',
    name: 'ハート',
    icon: '💖',
    stickers: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🖤',
      '🤍', '💖', '💝', '💗', '💓', '💕', '💞', '💘',
    ],
  },
  {
    id: 'stars',
    name: '星',
    icon: '⭐',
    stickers: [
      '⭐', '🌟', '✨', '💫', '🌠', '☀️', '🌙', '🌈',
      '☁️', '❄️', '🔥', '💧', '🫧', '🪩', '🎇', '🎆',
    ],
  },
  {
    id: 'animals',
    name: '動物',
    icon: '🐱',
    stickers: [
      '🐱', '🐶', '🐰', '🐻', '🦊', '🐼', '🐨', '🦋',
      '🐝', '🐞', '🦄', '🐣', '🐥', '🦢', '🐠', '🐙',
    ],
  },
  {
    id: 'food',
    name: '食べ物',
    icon: '🍰',
    stickers: [
      '🍰', '🧁', '🍩', '🍪', '🍫', '🍬', '🍭', '🎂',
      '🍓', '🍑', '🍒', '🥝', '🍵', '☕', '🧋', '🍦',
    ],
  },
  {
    id: 'seasonal',
    name: '季節',
    icon: '🎋',
    stickers: [
      '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🧧', '🎃',
      '🎄', '🎅', '⛄', '🎊', '🎉', '🎀', '🎁', '🏮',
    ],
  },
  {
    id: 'emotions',
    name: '感情',
    icon: '😊',
    stickers: [
      '😊', '🥰', '😍', '🤗', '😌', '🥺', '😢', '😤',
      '🤔', '😴', '🤩', '😎', '🥳', '😋', '🙈', '💤',
    ],
  },
  {
    id: 'deco',
    name: 'デコ文字',
    icon: '🎀',
    stickers: [
      '🎀', '🎗️', '📎', '📌', '✏️', '📝', '📖', '📷',
      '🎵', '🎶', '🔔', '💌', '✉️', '🏷️', '🪄', '👑',
    ],
  },
];

export const ALL_STICKERS = STICKER_CATEGORIES.flatMap((c) => c.stickers);
