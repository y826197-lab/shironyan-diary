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

// Removed 'animals' and 'emotions' categories per requirements
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

// ── Speech Bubble Stickers (empty shapes, no text) ──
export interface SpeechBubbleSticker {
  id: string;
  label: string;
  shape: string;
  borderColor: string;
  fillColor: string;
}

export const SPEECH_BUBBLE_STICKERS: SpeechBubbleSticker[] = [
  { id: 'sb_round', label: '丸', shape: 'round', borderColor: '#5C4A6E', fillColor: '#FFFFFF' },
  { id: 'sb_oval', label: '楕円', shape: 'oval', borderColor: '#F9A8C9', fillColor: '#FFF5F9' },
  { id: 'sb_cloud', label: 'もくもく', shape: 'cloud', borderColor: '#90CAF9', fillColor: '#F0F7FF' },
  { id: 'sb_square', label: '四角', shape: 'square', borderColor: '#5C4A6E', fillColor: '#FFFFFF' },
  { id: 'sb_rounded_rect', label: '角丸', shape: 'rounded-rect', borderColor: '#C9A8F9', fillColor: '#F8F0FF' },
  { id: 'sb_burst', label: 'ギザギザ', shape: 'burst', borderColor: '#FF6B6B', fillColor: '#FFF0F0' },
  { id: 'sb_heart', label: 'ハート', shape: 'heart', borderColor: '#FF4081', fillColor: '#FFE0EC' },
  { id: 'sb_shout', label: '叫び', shape: 'shout', borderColor: '#FF9800', fillColor: '#FFF8E1' },
  { id: 'sb_wave', label: '波型', shape: 'wave', borderColor: '#4CAF50', fillColor: '#F0FFF0' },
  { id: 'sb_diamond', label: 'ひし形', shape: 'diamond', borderColor: '#9C27B0', fillColor: '#F3E5F5' },
  { id: 'sb_hexagon', label: '六角形', shape: 'hexagon', borderColor: '#00BCD4', fillColor: '#E0F7FA' },
  { id: 'sb_star', label: '星形', shape: 'star', borderColor: '#FFC107', fillColor: '#FFFDE7' },
];

export const SPEECH_BUBBLE_MAP = new Map<string, SpeechBubbleSticker>(
  SPEECH_BUBBLE_STICKERS.map((s) => [s.id, s])
);

// ── Sticky Note Stickers (cute memo/card designs) ──
export interface StickyNoteSticker {
  id: string;
  label: string;
  color: string;
  secondaryColor: string;
  style: 'plain' | 'lined' | 'grid' | 'dotted' | 'torn' | 'tag' | 'card';
  cornerFold: boolean;
}

export const STICKY_NOTE_STICKERS: StickyNoteSticker[] = [
  { id: 'sn_yellow', label: 'イエロー付箋', color: '#FFF9C4', secondaryColor: '#F9E04B', style: 'plain', cornerFold: true },
  { id: 'sn_pink', label: 'ピンク付箋', color: '#FCE4EC', secondaryColor: '#F48FB1', style: 'plain', cornerFold: true },
  { id: 'sn_blue', label: 'ブルー付箋', color: '#E3F2FD', secondaryColor: '#64B5F6', style: 'plain', cornerFold: true },
  { id: 'sn_green', label: 'グリーン付箋', color: '#E8F5E9', secondaryColor: '#81C784', style: 'plain', cornerFold: true },
  { id: 'sn_purple', label: 'ラベンダー付箋', color: '#EDE7F6', secondaryColor: '#B39DDB', style: 'plain', cornerFold: true },
  { id: 'sn_orange', label: 'オレンジ付箋', color: '#FFF3E0', secondaryColor: '#FFB74D', style: 'plain', cornerFold: true },
  { id: 'sn_lined', label: '罫線メモ', color: '#FFFFFF', secondaryColor: '#BDBDBD', style: 'lined', cornerFold: false },
  { id: 'sn_grid', label: '方眼メモ', color: '#FFFFFF', secondaryColor: '#E0E0E0', style: 'grid', cornerFold: false },
  { id: 'sn_dotted', label: 'ドットメモ', color: '#FFF8E1', secondaryColor: '#FFD54F', style: 'dotted', cornerFold: false },
  { id: 'sn_torn', label: 'ちぎりメモ', color: '#FFFFFF', secondaryColor: '#E0E0E0', style: 'torn', cornerFold: false },
  { id: 'sn_tag', label: 'タグ', color: '#EFEBE9', secondaryColor: '#A1887F', style: 'tag', cornerFold: false },
  { id: 'sn_card_pink', label: 'ピンクカード', color: '#FCE4EC', secondaryColor: '#F48FB1', style: 'card', cornerFold: false },
];

export const STICKY_NOTE_MAP = new Map<string, StickyNoteSticker>(
  STICKY_NOTE_STICKERS.map((s) => [s.id, s])
);

export const ALL_STICKERS = STICKER_CATEGORIES.flatMap((c) => c.stickers);

// ── Binsen (便箋) letter paper image stickers ──
export interface BinsenSticker {
  id: string;
  label: string;
  source: ImageSource;
}

export const BINSEN_STICKERS: BinsenSticker[] = [
  { id: 'binsen_hello_cat',        label: 'HELLO猫カップメモ',      source: require('@/assets/binsen_hello_cat.png') },
  { id: 'binsen_todolist_watermelon', label: 'スイカTODOリスト',     source: require('@/assets/binsen_todolist_watermelon.png') },
  { id: 'binsen_strawberry',       label: 'いちごフレーム',          source: require('@/assets/binsen_strawberry.png') },
  { id: 'binsen_todo_pink',        label: 'ピンクTODO',             source: require('@/assets/binsen_todo_pink.png') },
  { id: 'binsen_notes_pancake',    label: 'パンケーキNOTES',         source: require('@/assets/binsen_notes_pancake.png') },
  { id: 'binsen_pink_memo',        label: 'ピンクメモ',              source: require('@/assets/binsen_pink_memo.png') },
  { id: 'binsen_tape_memo',        label: 'テープ付きメモ',          source: require('@/assets/binsen_tape_memo.png') },
  { id: 'binsen_cloud_note',       label: '雲型NOTE',               source: require('@/assets/binsen_cloud_note.png') },
  { id: 'binsen_grid_bear',        label: '方眼くまメモ',            source: require('@/assets/binsen_grid_bear.png') },
  { id: 'binsen_dot_bear',         label: 'ドットくまメモ',          source: require('@/assets/binsen_dot_bear.png') },
  { id: 'binsen_rabbit_round',     label: '丸うさぎ',               source: require('@/assets/binsen_rabbit_round.png') },
  { id: 'binsen_dog_corner',       label: '犬コーナーメモ',          source: require('@/assets/binsen_dog_corner.png') },
  { id: 'binsen_rabbit_grid',      label: 'うさぎ方眼メモ',          source: require('@/assets/binsen_rabbit_grid.png') },
  { id: 'binsen_tomato',           label: 'トマトメモ',              source: require('@/assets/binsen_tomato.png') },
  { id: 'binsen_grid_planet',      label: '惑星方眼メモ',            source: require('@/assets/binsen_grid_planet.png') },
  { id: 'binsen_butterfly',        label: '蝶々メモ',               source: require('@/assets/binsen_butterfly.png') },
  { id: 'binsen_dot_todo',         label: 'ドットTODO',             source: require('@/assets/binsen_dot_todo.png') },
  { id: 'binsen_blue_clip',        label: '青クリップメモ',          source: require('@/assets/binsen_blue_clip.png') },
  { id: 'binsen_todolist_heart',   label: 'ハートTODOリスト',        source: require('@/assets/binsen_todolist_heart.png') },
  { id: 'binsen_myplans_blue',     label: 'My Plans青メモ',         source: require('@/assets/binsen_myplans_blue.png') },
];

export const BINSEN_STICKER_MAP = new Map<string, BinsenSticker>(
  BINSEN_STICKERS.map((s) => [s.id, s])
);
