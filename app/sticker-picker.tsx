import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import Svg, { Path, Rect, Ellipse, Circle, Polygon } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { persistImage } from '@/utils/image-storage';
import {
  STICKER_CATEGORIES,
  CAT_STICKERS,
  DECO_TEXT_STICKERS,
  WASHI_TAPE_STICKERS,
  SPEECH_BUBBLE_STICKERS,
  STICKY_NOTE_STICKERS,
  type CatSticker,
  type DecoTextSticker,
  type WashiTapeSticker,
  type SpeechBubbleSticker,
  type StickyNoteSticker,
} from '@/constants/Stickers';
import { WashiTapePreview } from '@/components/editor/washi-tape';
import { useDiaryStore } from '@/store/useDiaryStore';
import { useCustomStickerStore, type CustomSticker } from '@/store/useCustomStickerStore';

const CAT_TAB_ID = '__cats';
const DECO_TAB_ID = '__deco';
const WASHI_TAB_ID = '__washi';
const BUBBLE_TAB_ID = '__bubble';
const NOTE_TAB_ID = '__note';
const MY_TAB_ID = '__my';

export default function StickerPickerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const addElement = useDiaryStore((s) => s.addElement);
  const pages = useDiaryStore((s) => s.pages);
  const customStickers = useCustomStickerStore((s) => s.stickers);
  const addCustomSticker = useCustomStickerStore((s) => s.addSticker);
  const removeCustomSticker = useCustomStickerStore((s) => s.removeSticker);
  const [activeCategory, setActiveCategory] = useState(CAT_TAB_ID);

  const [deleteTarget, setDeleteTarget] = useState<CustomSticker | null>(null);

  const currentCategory = STICKER_CATEGORIES.find((c) => c.id === activeCategory) || STICKER_CATEGORIES[0];

  const recentStickers = useMemo(() => {
    const all: string[] = [];
    for (const page of pages) {
      for (const el of page.elements) {
        if (el.type === 'sticker' && !all.includes(el.content)) {
          all.push(el.content);
        }
      }
    }
    return all.slice(0, 12);
  }, [pages]);

  const stickerSize = Math.floor((width - 60) / 6);
  const catStickerSize = Math.floor((width - 56) / 4);
  const decoStickerWidth = Math.floor((width - 52) / 2);
  const washiTapeWidth = Math.floor(width - 64);
  const myStickerSize = Math.floor((width - 56) / 4);
  const bubbleSize = Math.floor((width - 56) / 4);
  const noteSize = Math.floor((width - 52) / 3);

  // ── Handlers ──

  const handleSelectSticker = useCallback(
    (sticker: string) => {
      if (pageId) {
        addElement(pageId, {
          type: 'sticker',
          x: 100 + Math.random() * 100,
          y: 100 + Math.random() * 100,
          width: 60,
          height: 60,
          rotation: (Math.random() - 0.5) * 0.2,
          content: sticker,
        });
      }
      router.back();
    },
    [pageId, addElement, router]
  );

  const handleSelectCatSticker = useCallback(
    (cat: CatSticker) => {
      if (pageId) {
        addElement(pageId, {
          type: 'cat-image',
          x: 80 + Math.random() * 120,
          y: 80 + Math.random() * 120,
          width: 90,
          height: 90,
          rotation: (Math.random() - 0.5) * 0.15,
          content: cat.id,
        });
      }
      router.back();
    },
    [pageId, addElement, router]
  );

  const handleSelectDecoSticker = useCallback(
    (deco: DecoTextSticker) => {
      if (pageId) {
        const charCount = deco.text.length;
        const w = Math.max(100, charCount * 22);
        addElement(pageId, {
          type: 'deco-text',
          x: 60 + Math.random() * 100,
          y: 80 + Math.random() * 100,
          width: w,
          height: 48,
          rotation: (Math.random() - 0.5) * 0.1,
          content: deco.id,
          fontColor: deco.color,
        });
      }
      router.back();
    },
    [pageId, addElement, router]
  );

  const handleSelectWashiTape = useCallback(
    (tape: WashiTapeSticker) => {
      if (pageId) {
        addElement(pageId, {
          type: 'washi-tape',
          x: 20 + Math.random() * 40,
          y: 80 + Math.random() * 120,
          width: tape.wide ? 220 : 180,
          height: tape.wide ? 32 : 20,
          rotation: (Math.random() - 0.5) * 0.15,
          content: tape.id,
        });
      }
      router.back();
    },
    [pageId, addElement, router]
  );

  const handleSelectBubble = useCallback(
    (bubble: SpeechBubbleSticker) => {
      if (pageId) {
        addElement(pageId, {
          type: 'speech-bubble',
          x: 60 + Math.random() * 100,
          y: 60 + Math.random() * 100,
          width: 140,
          height: 110,
          rotation: 0,
          content: bubble.id,
        });
      }
      router.back();
    },
    [pageId, addElement, router]
  );

  const handleSelectNote = useCallback(
    (note: StickyNoteSticker) => {
      if (pageId) {
        addElement(pageId, {
          type: 'sticky-note',
          x: 60 + Math.random() * 100,
          y: 60 + Math.random() * 100,
          width: 120,
          height: 120,
          rotation: (Math.random() - 0.5) * 0.1,
          content: note.id,
        });
      }
      router.back();
    },
    [pageId, addElement, router]
  );

  const handleSelectCustomSticker = useCallback(
    (sticker: CustomSticker) => {
      if (pageId) {
        addElement(pageId, {
          type: 'custom-image',
          x: 80 + Math.random() * 120,
          y: 80 + Math.random() * 120,
          width: 90,
          height: 90,
          rotation: (Math.random() - 0.5) * 0.15,
          content: sticker.uri,
        });
      }
      router.back();
    },
    [pageId, addElement, router]
  );

  const handlePickCustomSticker = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets[0]) {
        const permanentUri = await persistImage(result.assets[0].uri);
        addCustomSticker(permanentUri);
      }
    } catch {
      Alert.alert('エラー', '画像の読み込みに失敗しました');
    }
  }, [addCustomSticker]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      removeCustomSticker(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, removeCustomSticker]);

  const isCatTab = activeCategory === CAT_TAB_ID;
  const isDecoTab = activeCategory === DECO_TAB_ID;
  const isWashiTab = activeCategory === WASHI_TAB_ID;
  const isBubbleTab = activeCategory === BUBBLE_TAB_ID;
  const isNoteTab = activeCategory === NOTE_TAB_ID;
  const isMyTab = activeCategory === MY_TAB_ID;

  const renderTab = (id: string, icon: string, label: string, accentColor?: string) => {
    const isActive = activeCategory === id;
    const activeBg = accentColor || theme.primaryLight;
    const activeBorder = accentColor ? accentColor + '90' : theme.primary;
    return (
      <Pressable
        key={id}
        onPress={() => setActiveCategory(id)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          borderCurve: 'continuous',
          backgroundColor: isActive ? activeBg : theme.background,
          borderWidth: isActive ? 1.5 : 1,
          borderColor: isActive ? activeBorder : theme.borderLight,
        }}
      >
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text
          style={{
            fontFamily: isActive ? Fonts.bold : Fonts.medium,
            fontSize: 12,
            color: isActive ? (accentColor ? '#FFF' : theme.primary) : theme.textSecondary,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  // ── Grid content ──

  const renderGrid = () => {
    if (isCatTab) {
      return (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {CAT_STICKERS.map((item, index) => (
            <Animated.View key={item.id} entering={FadeIn.delay(index * 30).duration(300)}>
              <Pressable
                onPress={() => handleSelectCatSticker(item)}
                style={({ pressed }) => ({
                  width: catStickerSize,
                  height: catStickerSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  backgroundColor: pressed ? '#FFF0F5' : '#FAFAFA',
                  borderWidth: 1.5,
                  borderColor: pressed ? '#FF8FAB' : '#F0E8EE',
                  transform: [{ scale: pressed ? 1.08 : 1 }],
                  overflow: 'hidden',
                })}
              >
                <Image
                  source={item.source}
                  style={{ width: catStickerSize - 12, height: catStickerSize - 12 }}
                  contentFit="contain"
                  transition={200}
                />
              </Pressable>
            </Animated.View>
          ))}
          {CAT_STICKERS.length === 0 && <EmptyState message="ネコステッカーがありません" theme={theme} />}
        </ScrollView>
      );
    }

    if (isDecoTab) {
      return (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {DECO_TEXT_STICKERS.map((item, index) => (
            <Animated.View key={item.id} entering={FadeIn.delay(index * 40).duration(300)}>
              <Pressable
                onPress={() => handleSelectDecoSticker(item)}
                style={({ pressed }) => ({
                  width: decoStickerWidth,
                  height: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: pressed ? item.color + '18' : item.bgColor,
                  borderWidth: 2,
                  borderColor: pressed ? item.color : item.color + '30',
                  transform: [{ scale: pressed ? 1.04 : 1 }],
                })}
              >
                <Text style={{ fontFamily: Fonts.bold, fontSize: 17, color: item.color, letterSpacing: 1 }}>
                  {item.text}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
          {DECO_TEXT_STICKERS.length === 0 && <EmptyState message="デコ文字がありません" theme={theme} />}
        </ScrollView>
      );
    }

    if (isWashiTab) {
      return (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {WASHI_TAPE_STICKERS.map((tape, index) => (
            <Animated.View key={tape.id} entering={FadeIn.delay(index * 40).duration(300)}>
              <Pressable
                onPress={() => handleSelectWashiTape(tape)}
                style={({ pressed }) => ({
                  width: washiTapeWidth,
                  height: tape.wide ? 36 : 24,
                  borderRadius: 3,
                  overflow: 'hidden',
                  opacity: pressed ? 0.75 : 1,
                  transform: [{ scale: pressed ? 1.02 : 1 }],
                })}
              >
                <WashiTapePreview tape={tape} width={washiTapeWidth} height={tape.wide ? 36 : 24} />
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      );
    }

    // ── Speech Bubbles tab ──
    if (isBubbleTab) {
      return (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {SPEECH_BUBBLE_STICKERS.map((bubble, index) => (
            <Animated.View key={bubble.id} entering={FadeIn.delay(index * 40).duration(300)}>
              <Pressable
                onPress={() => handleSelectBubble(bubble)}
                style={({ pressed }) => ({
                  width: bubbleSize,
                  height: bubbleSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: pressed ? '#F0F0F0' : '#FAFAFA',
                  borderWidth: 1.5,
                  borderColor: pressed ? bubble.borderColor : '#F0E8EE',
                  transform: [{ scale: pressed ? 1.05 : 1 }],
                })}
              >
                <BubblePreview shape={bubble.shape} color={bubble.borderColor} fill={bubble.fillColor} size={bubbleSize - 20} />
                <Text style={{ fontFamily: Fonts.medium, fontSize: 9, color: '#999', marginTop: 2 }}>
                  {bubble.label}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      );
    }

    // ── Sticky Notes tab ──
    if (isNoteTab) {
      return (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {STICKY_NOTE_STICKERS.map((note, index) => (
            <Animated.View key={note.id} entering={FadeIn.delay(index * 40).duration(300)}>
              <Pressable
                onPress={() => handleSelectNote(note)}
                style={({ pressed }) => ({
                  width: noteSize,
                  height: noteSize,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  overflow: 'hidden',
                  backgroundColor: note.color,
                  borderWidth: 1.5,
                  borderColor: pressed ? note.secondaryColor : note.secondaryColor + '50',
                  transform: [{ scale: pressed ? 1.05 : 1 }],
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                })}
              >
                {/* Top accent */}
                <View style={{ height: 3, backgroundColor: note.secondaryColor, opacity: 0.5 }} />
                {/* Mini pattern preview */}
                <NotePatternPreview style={note.style} color={note.secondaryColor} w={noteSize} h={noteSize} />
                {/* Corner fold */}
                {note.cornerFold && (
                  <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
                    <Svg width={12} height={12}>
                      <Path d="M 12 0 L 12 12 L 0 12 Z" fill={note.secondaryColor} opacity={0.3} />
                    </Svg>
                  </View>
                )}
                {/* Label */}
                <View style={{ position: 'absolute', bottom: 6, left: 0, right: 0, alignItems: 'center' }}>
                  <Text style={{ fontFamily: Fonts.medium, fontSize: 9, color: note.secondaryColor }}>
                    {note.label}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      );
    }

    // ── My custom stickers tab ──
    if (isMyTab) {
      return (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 48,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 14,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={handlePickCustomSticker}
            style={({ pressed }) => ({
              width: myStickerSize,
              height: myStickerSize,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              borderCurve: 'continuous',
              backgroundColor: pressed ? theme.primaryLight : theme.background,
              borderWidth: 2,
              borderColor: theme.primary,
              borderStyle: 'dashed',
              gap: 4,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="add-circle" size={28} color={theme.primary} />
            <Text style={{ fontFamily: Fonts.bold, fontSize: 10, color: theme.primary }}>
              追加
            </Text>
          </Pressable>

          {customStickers.map((sticker) => (
            <View
              key={sticker.id}
              style={{
                width: myStickerSize,
                height: myStickerSize,
                overflow: 'visible',
              }}
            >
              <Pressable
                onPress={() => handleSelectCustomSticker(sticker)}
                style={({ pressed }) => ({
                  width: myStickerSize,
                  height: myStickerSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  backgroundColor: pressed ? '#FFF0F5' : '#FAFAFA',
                  borderWidth: 1.5,
                  borderColor: pressed ? theme.primary : '#F0E8EE',
                  transform: [{ scale: pressed ? 1.05 : 1 }],
                })}
              >
                <Image
                  source={{ uri: sticker.uri }}
                  style={{ width: myStickerSize - 16, height: myStickerSize - 16, borderRadius: 8 }}
                  contentFit="contain"
                  transition={200}
                  recyclingKey={sticker.id}
                />
              </Pressable>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setDeleteTarget(sticker)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  zIndex: 9999,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#F28B82',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2.5,
                  borderColor: '#FFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                }}
              >
                <Ionicons name="close" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      );
    }

    // Emoji sticker grid
    return (
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, flexDirection: 'row', flexWrap: 'wrap' }}
        showsVerticalScrollIndicator={false}
      >
        {(activeCategory === '__recent' ? recentStickers : currentCategory.stickers).map(
          (item, index) => (
            <Animated.View key={`${activeCategory}-${item}-${index}`} entering={FadeIn.delay(index * 20)}>
              <Pressable
                onPress={() => handleSelectSticker(item)}
                style={({ pressed }) => ({
                  width: stickerSize,
                  height: stickerSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: pressed ? theme.primaryLight : 'transparent',
                  transform: [{ scale: pressed ? 1.3 : 1 }],
                })}
              >
                <Text style={{ fontSize: 32 }}>{item}</Text>
              </Pressable>
            </Animated.View>
          )
        )}
        {(activeCategory === '__recent' ? recentStickers : currentCategory.stickers).length === 0 && (
          <EmptyState message="ステッカーがありません" theme={theme} />
        )}
      </ScrollView>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderCurve: 'continuous',
      }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text
          style={{
            fontFamily: Fonts.bold,
            fontSize: 18,
            color: theme.text,
            textAlign: 'center',
          }}
        >
          ステッカー 🎀
        </Text>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 48, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6, alignItems: 'center' }}
      >
        {renderTab(CAT_TAB_ID, '🐱', 'ネコ', isCatTab ? '#FF8FAB' : undefined)}
        {renderTab(DECO_TAB_ID, '🔤', 'デコ文字', isDecoTab ? '#E91E63' : undefined)}
        {renderTab(WASHI_TAB_ID, '🎀', 'マステ', isWashiTab ? '#FF8A65' : undefined)}
        {renderTab(BUBBLE_TAB_ID, '💬', '吹き出し', isBubbleTab ? '#42A5F5' : undefined)}
        {renderTab(NOTE_TAB_ID, '📝', '付箋', isNoteTab ? '#66BB6A' : undefined)}
        {renderTab(MY_TAB_ID, '📁', 'マイ', isMyTab ? '#7C4DFF' : undefined)}
        {recentStickers.length > 0 && renderTab('__recent', '🕐', '最近')}
        {STICKER_CATEGORIES.map((category) => renderTab(category.id, category.icon, category.name))}
      </ScrollView>

      {/* Content grid */}
      {renderGrid()}

      {/* Delete confirmation dialog */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <Pressable
          onPress={() => setDeleteTarget(null)}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(92, 74, 110, 0.45)',
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              borderCurve: 'continuous',
              paddingVertical: 28,
              paddingHorizontal: 24,
              width: 280,
              alignItems: 'center',
              gap: 18,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#FDE8E6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="trash-outline" size={28} color="#E57373" />
            </View>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 16,
                color: '#5C4A6E',
                textAlign: 'center',
              }}
            >
              このステッカーを削除しますか？
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: '#F5F0F8',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: '#8B7A9E' }}>
                  いいえ
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleConfirmDelete}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: '#F28B82',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: '#FFFFFF' }}>
                  はい
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Mini Speech Bubble Preview for picker grid ──
function BubblePreview({ shape, color, fill, size }: { shape: string; color: string; fill: string; size: number }) {
  const s = size;
  const sw = 1.5;
  const bodyH = s * 0.8;

  switch (shape) {
    case 'round':
      return (
        <Svg width={s} height={s}>
          <Ellipse cx={s / 2} cy={bodyH / 2} rx={s / 2 - sw} ry={bodyH / 2 - sw} fill={fill} stroke={color} strokeWidth={sw} />
          <Path d={`M ${s * 0.35} ${bodyH - sw} L ${s * 0.25} ${s - 1} L ${s * 0.5} ${bodyH - sw * 2}`} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'oval':
      return (
        <Svg width={s} height={s}>
          <Ellipse cx={s / 2} cy={bodyH / 2} rx={s / 2 - sw} ry={bodyH / 2 - sw} fill={fill} stroke={color} strokeWidth={sw} />
          <Path d={`M ${s * 0.4} ${bodyH - sw * 2} L ${s * 0.3} ${s - 1} L ${s * 0.55} ${bodyH - sw * 3}`} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'cloud': {
      const cx = s / 2, cy = bodyH / 2;
      const rx = s / 2 - 4, ry = bodyH / 2 - 4;
      let d = '';
      const bumps = 8;
      for (let i = 0; i < bumps; i++) {
        const a1 = (i / bumps) * Math.PI * 2;
        const a2 = ((i + 1) / bumps) * Math.PI * 2;
        const x1 = cx + Math.cos(a1) * rx;
        const y1 = cy + Math.sin(a1) * ry;
        const x2 = cx + Math.cos(a2) * rx;
        const y2 = cy + Math.sin(a2) * ry;
        const midA = (a1 + a2) / 2;
        const cpx = cx + Math.cos(midA) * (rx + 4);
        const cpy = cy + Math.sin(midA) * (ry + 4);
        if (i === 0) d += `M ${x1} ${y1} `;
        d += `Q ${cpx} ${cpy} ${x2} ${y2} `;
      }
      d += 'Z';
      return (
        <Svg width={s} height={s}>
          <Path d={d} fill={fill} stroke={color} strokeWidth={sw} />
          <Circle cx={s * 0.35} cy={bodyH + 2} r={2.5} fill={fill} stroke={color} strokeWidth={1} />
          <Circle cx={s * 0.28} cy={bodyH + 6} r={1.5} fill={fill} stroke={color} strokeWidth={0.8} />
        </Svg>
      );
    }
    case 'square':
      return (
        <Svg width={s} height={s}>
          <Rect x={sw} y={sw} width={s - sw * 2} height={bodyH - sw * 2} fill={fill} stroke={color} strokeWidth={sw} />
          <Path d={`M ${s * 0.3} ${bodyH - sw} L ${s * 0.2} ${s - 1} L ${s * 0.45} ${bodyH - sw}`} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'rounded-rect':
      return (
        <Svg width={s} height={s}>
          <Rect x={sw} y={sw} width={s - sw * 2} height={bodyH - sw * 2} rx={6} fill={fill} stroke={color} strokeWidth={sw} />
          <Path d={`M ${s * 0.35} ${bodyH - sw * 2} L ${s * 0.25} ${s - 1} L ${s * 0.5} ${bodyH - sw * 3}`} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'burst': {
      const cx2 = s / 2, cy2 = bodyH / 2;
      const outer = Math.min(s, bodyH) / 2 - 3;
      const inner = outer * 0.65;
      const points = 8;
      let burstPath = '';
      for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outer : inner;
        const px = cx2 + Math.cos(angle) * r;
        const py = cy2 + Math.sin(angle) * r;
        burstPath += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      burstPath += 'Z';
      return (
        <Svg width={s} height={s}>
          <Path d={burstPath} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'heart': {
      const hs = s * 0.35;
      const hc = s / 2;
      const hcy = bodyH / 2;
      return (
        <Svg width={s} height={s}>
          <Path d={`M ${hc} ${hcy + hs * 0.35} C ${hc - hs * 0.5} ${hcy - hs * 0.4}, ${hc - hs * 1.1} ${hcy + hs * 0.05}, ${hc} ${hcy + hs * 0.9} C ${hc + hs * 1.1} ${hcy + hs * 0.05}, ${hc + hs * 0.5} ${hcy - hs * 0.4}, ${hc} ${hcy + hs * 0.35} Z`} fill={fill} stroke={color} strokeWidth={sw} />
        </Svg>
      );
    }
    case 'shout': {
      const cx3 = s / 2, cy3 = bodyH / 2;
      const outerR = Math.min(s, bodyH) / 2 - 3;
      const innerR = outerR * 0.75;
      const spikes = 6;
      let shoutPath = '';
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = cx3 + Math.cos(angle) * r;
        const py = cy3 + Math.sin(angle) * r;
        shoutPath += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      shoutPath += 'Z';
      return (
        <Svg width={s} height={s}>
          <Path d={shoutPath} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'wave':
      return (
        <Svg width={s} height={s}>
          <Rect x={3} y={3} width={s - 6} height={bodyH - 6} rx={8} fill={fill} stroke={color} strokeWidth={sw} />
          <Path d={`M ${s * 0.35} ${bodyH - 4} L ${s * 0.28} ${s - 1} L ${s * 0.48} ${bodyH - 5}`} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'diamond': {
      const pts = `${s / 2},${sw} ${s - sw},${bodyH / 2} ${s / 2},${bodyH - sw} ${sw},${bodyH / 2}`;
      return (
        <Svg width={s} height={s}>
          <Polygon points={pts} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'hexagon': {
      const hxc = s / 2, hyc = bodyH / 2;
      const hexR = Math.min(s, bodyH) / 2 - 3;
      let hexPoints = '';
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
        const px = hxc + Math.cos(angle) * hexR;
        const py = hyc + Math.sin(angle) * hexR;
        hexPoints += `${px},${py} `;
      }
      return (
        <Svg width={s} height={s}>
          <Polygon points={hexPoints.trim()} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'star': {
      const stc = s / 2, sty = bodyH / 2;
      const starOuter = Math.min(s, bodyH) / 2 - 3;
      const starInner = starOuter * 0.45;
      let starPath = '';
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? starOuter : starInner;
        const px = stc + Math.cos(angle) * r;
        const py = sty + Math.sin(angle) * r;
        starPath += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      starPath += 'Z';
      return (
        <Svg width={s} height={s}>
          <Path d={starPath} fill={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    default:
      return (
        <Svg width={s} height={s}>
          <Ellipse cx={s / 2} cy={bodyH / 2} rx={s / 2 - sw} ry={bodyH / 2 - sw} fill={fill} stroke={color} strokeWidth={sw} />
        </Svg>
      );
  }
}

// ── Sticky Note pattern preview ──
function NotePatternPreview({ style, color, w, h }: { style: string; color: string; w: number; h: number }) {
  if (style === 'lined') {
    return (
      <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: Math.floor(h / 12) }, (_, i) => (
          <Path key={i} d={`M 6 ${14 + i * 12} L ${w - 6} ${14 + i * 12}`} stroke={color} strokeWidth={0.4} opacity={0.3} />
        ))}
      </Svg>
    );
  }
  if (style === 'grid') {
    return (
      <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: Math.floor(w / 10) }, (_, i) => (
          <Path key={`v${i}`} d={`M ${10 + i * 10} 6 L ${10 + i * 10} ${h - 6}`} stroke={color} strokeWidth={0.3} opacity={0.2} />
        ))}
        {Array.from({ length: Math.floor(h / 10) }, (_, i) => (
          <Path key={`h${i}`} d={`M 6 ${10 + i * 10} L ${w - 6} ${10 + i * 10}`} stroke={color} strokeWidth={0.3} opacity={0.2} />
        ))}
      </Svg>
    );
  }
  if (style === 'dotted') {
    return (
      <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
        {Array.from({ length: Math.floor(w / 10) }, (_, ix) =>
          Array.from({ length: Math.floor(h / 10) }, (_, iy) => (
            <Circle key={`${ix}-${iy}`} cx={8 + ix * 10} cy={8 + iy * 10} r={0.8} fill={color} opacity={0.3} />
          ))
        ).flat()}
      </Svg>
    );
  }
  return null;
}

function EmptyState({
  message,
  theme,
}: {
  message: string;
  theme: ReturnType<typeof import('@/components/ui/use-theme').useTheme>;
}) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 40, width: '100%' }}>
      <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: theme.textMuted }}>
        {message}
      </Text>
    </View>
  );
}
