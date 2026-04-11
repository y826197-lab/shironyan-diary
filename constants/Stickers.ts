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
];

// Deco text sticker data — cute styled Japanese word stickers
export interface DecoTextSticker {
  id: string;
  text: string;
  color: string;
  bgColor: string;
}

export const DECO_TEXT_STICKERS: DecoTextSticker[] = [
  { id: 'deco_arigatou', text: 'ありがとう', color: '#FF6B9D', bgColor: '#FFF0F5' },
  { id: 'deco_suki', text: 'すき♡', color: '#FF4081', bgColor: '#FFE0EC' },
  { id: 'deco_tanoshii', text: 'たのしい！', color: '#FF9800', bgColor: '#FFF8E1' },
  { id: 'deco_yatta', text: 'やったー！', color: '#4CAF50', bgColor: '#E8F5E9' },
  { id: 'deco_kawaii', text: 'かわいい', color: '#E91E63', bgColor: '#FCE4EC' },
  { id: 'deco_oyasumi', text: 'おやすみ☆', color: '#7C4DFF', bgColor: '#EDE7F6' },
  { id: 'deco_ohayo', text: 'おはよう！', color: '#FF6F00', bgColor: '#FFF3E0' },
  { id: 'deco_iine', text: 'いいね！', color: '#2196F3', bgColor: '#E3F2FD' },
  { id: 'deco_ganbare', text: 'がんばれ！', color: '#F44336', bgColor: '#FFEBEE' },
  { id: 'deco_wakuwaku', text: 'わくわく', color: '#FF5722', bgColor: '#FBE9E7' },
  { id: 'deco_hanamaru', text: 'はなまる◎', color: '#FFC107', bgColor: '#FFFDE7' },
  { id: 'deco_daisuki', text: 'だいすき', color: '#FF1744', bgColor: '#FFE0E0' },
  { id: 'deco_kirakira', text: 'キラキラ✧', color: '#FFB300', bgColor: '#FFF8E1' },
  { id: 'deco_yumeKawa', text: 'ゆめかわ', color: '#BA68C8', bgColor: '#F3E5F5' },
  { id: 'deco_peace', text: 'ピース✌', color: '#00BCD4', bgColor: '#E0F7FA' },
  { id: 'deco_happy', text: 'HAPPY♪', color: '#FF6B6B', bgColor: '#FFF0F0' },
];

// Map for resolving deco sticker IDs to their data at render time
export const DECO_TEXT_MAP = new Map<string, DecoTextSticker>(
  DECO_TEXT_STICKERS.map((s) => [s.id, s])
);

export const ALL_STICKERS = STICKER_CATEGORIES.flatMap((c) => c.stickers);
