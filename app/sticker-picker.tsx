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
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { persistImage } from '@/utils/image-storage';
import {
  STICKER_CATEGORIES,
  CAT_STICKERS,
  DECO_TEXT_STICKERS,
  type CatSticker,
  type DecoTextSticker,
} from '@/constants/Stickers';
import { useDiaryStore } from '@/store/useDiaryStore';
import { useCustomStickerStore, type CustomSticker } from '@/store/useCustomStickerStore';

const CAT_TAB_ID = '__cats';
const DECO_TAB_ID = '__deco';
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

  // ── Delete confirmation state ──
  // We use a custom in-app Modal instead of Alert.alert / window.confirm
  // because both can be silently suppressed inside formSheet on web.
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
  const myStickerSize = Math.floor((width - 56) / 4);

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
  const isMyTab = activeCategory === MY_TAB_ID;

  // ── Tab pill ──

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

    // ──────────────────────────────────
    // My custom stickers tab
    // ──────────────────────────────────
    if (isMyTab) {
      return (
        <ScrollView
          contentContainerStyle={{
            // Extra padding so absolute-positioned × buttons (top: -8, right: -8)
            // fall within the scrollable content area and are not clipped.
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 48,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 14,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Add button */}
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

          {/* Custom sticker cards */}
          {customStickers.map((sticker) => (
            <View
              key={sticker.id}
              style={{
                width: myStickerSize,
                height: myStickerSize,
                // overflow visible so the × button at top:-8, right:-8 is not clipped
                overflow: 'visible',
              }}
            >
              {/* Sticker image — tap to select */}
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

              {/* ×  Delete button — TouchableOpacity, absolute positioned OUTSIDE the card.
                  Uses react-native TouchableOpacity (not gesture-handler) to guarantee
                  touch events are not intercepted by GestureHandlerRootView.
                  zIndex 9999 ensures it's above everything. */}
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
        {renderTab(MY_TAB_ID, '📁', 'マイ', isMyTab ? '#7C4DFF' : undefined)}
        {recentStickers.length > 0 && renderTab('__recent', '🕐', '最近')}
        {STICKER_CATEGORIES.map((category) => renderTab(category.id, category.icon, category.name))}
      </ScrollView>

      {/* Content grid */}
      {renderGrid()}

      {/* ──────────────────────────────────────────────────
          Custom in-app delete confirmation dialog.
          Rendered as a React Native <Modal> at the root of
          this component — completely independent of the
          formSheet, ScrollView, and GestureHandler hierarchy.
          This is guaranteed to receive touch events.
          ────────────────────────────────────────────────── */}
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
            onPress={() => {
              /* stop propagation — tapping inside dialog shouldn't dismiss */
            }}
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
            {/* Icon */}
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

            {/* Message */}
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

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              {/* いいえ */}
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

              {/* はい */}
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
