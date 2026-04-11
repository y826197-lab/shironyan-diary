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

// Washi tape (masking tape) sticker definitions
export interface WashiTapeSticker {
  id: string;
  label: string;
  color: string;
  secondaryColor: string;
  pattern: 'stripe' | 'dots' | 'check' | 'floral' | 'stars' | 'polka' | 'gingham' | 'lace' | 'solid' | 'zigzag';
  wide: boolean; // true = wide tape, false = thin tape
}

export const WASHI_TAPE_STICKERS: WashiTapeSticker[] = [
  { id: 'wt_pink_stripe', label: 'ピンクストライプ', color: '#F9A8C9', secondaryColor: '#FFFFFF', pattern: 'stripe', wide: true },
  { id: 'wt_lavender_dots', label: 'ラベンダードット', color: '#C9A8F9', secondaryColor: '#FFFFFF', pattern: 'dots', wide: true },
  { id: 'wt_mint_check', label: 'ミントチェック', color: '#8ED8BE', secondaryColor: '#FFFFFF', pattern: 'check', wide: false },
  { id: 'wt_yellow_floral', label: 'イエロー花柄', color: '#F9D88A', secondaryColor: '#FF9800', pattern: 'floral', wide: true },
  { id: 'wt_blue_stars', label: 'ブルー星柄', color: '#90CAF9', secondaryColor: '#42A5F5', pattern: 'stars', wide: false },
  { id: 'wt_orange_polka', label: 'オレンジ水玉', color: '#FFCC80', secondaryColor: '#FF9800', pattern: 'polka', wide: true },
  { id: 'wt_red_gingham', label: 'レッドギンガム', color: '#EF9A9A', secondaryColor: '#FFFFFF', pattern: 'gingham', wide: false },
  { id: 'wt_pink_lace', label: 'ピンクレース', color: '#F48FB1', secondaryColor: '#FCE4EC', pattern: 'lace', wide: true },
  { id: 'wt_mint_solid', label: 'ミント無地', color: '#A5D6A7', secondaryColor: '#C8E6C9', pattern: 'solid', wide: false },
  { id: 'wt_purple_zigzag', label: 'パープルジグザグ', color: '#CE93D8', secondaryColor: '#F3E5F5', pattern: 'zigzag', wide: true },
  { id: 'wt_blue_stripe', label: 'ブルーストライプ', color: '#81D4FA', secondaryColor: '#FFFFFF', pattern: 'stripe', wide: false },
  { id: 'wt_pink_polka', label: 'ピンク水玉', color: '#F48FB1', secondaryColor: '#FFFFFF', pattern: 'polka', wide: false },
];

export const WASHI_TAPE_MAP = new Map<string, WashiTapeSticker>(
  WASHI_TAPE_STICKERS.map((s) => [s.id, s])
);

export const STICKER_CATEGORIES: StickerCategory[] = [
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
