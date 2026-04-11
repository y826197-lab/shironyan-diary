import { View, Text, ScrollView, Pressable, FlatList, Alert, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
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

  const currentCategory = STICKER_CATEGORIES.find((c) => c.id === activeCategory) || STICKER_CATEGORIES[0];

  // Gather recently used stickers from all pages
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

  // Emoji sticker handler
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

  // Cat sticker handler
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

  // Deco text sticker handler
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

  // Custom sticker handler
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

  // Image picker for custom stickers
  const handlePickCustomSticker = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets[0]) {
        addCustomSticker(result.assets[0].uri);
      }
    } catch {
      Alert.alert('エラー', '画像の読み込みに失敗しました');
    }
  }, [addCustomSticker]);

  // Delete custom sticker with confirmation
  const handleLongPressCustomSticker = useCallback(
    (sticker: CustomSticker) => {
      Alert.alert(
        'ステッカーを削除',
        'このカスタムステッカーを削除しますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '削除',
            style: 'destructive',
            onPress: () => removeCustomSticker(sticker.id),
          },
        ]
      );
    },
    [removeCustomSticker]
  );

  const isCatTab = activeCategory === CAT_TAB_ID;
  const isDecoTab = activeCategory === DECO_TAB_ID;
  const isMyTab = activeCategory === MY_TAB_ID;

  // Reusable tab pill
  const renderTab = (
    id: string,
    icon: string,
    label: string,
    accentColor?: string,
  ) => {
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

  // Render the active grid content
  const renderGrid = () => {
    // Cat image stickers — 4 columns
    if (isCatTab) {
      return (
        <FlatList
          key="cat-grid"
          data={CAT_STICKERS}
          numColumns={4}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 10 }}
          columnWrapperStyle={{ gap: 10, justifyContent: 'flex-start' }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 30).duration(300)}>
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
          )}
          ListEmptyComponent={
            <EmptyState message="ネコステッカーがありません" theme={theme} />
          }
        />
      );
    }

    // Deco text stickers — 2 columns, styled text pills
    if (isDecoTab) {
      return (
        <FlatList
          key="deco-grid"
          data={DECO_TEXT_STICKERS}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 10 }}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 40).duration(300)}>
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
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 17,
                    color: item.color,
                    letterSpacing: 1,
                  }}
                >
                  {item.text}
                </Text>
              </Pressable>
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState message="デコ文字がありません" theme={theme} />
          }
        />
      );
    }

    // My custom stickers — 4 columns with add button
    if (isMyTab) {
      const dataWithAdd = [{ _isAddButton: true as const }, ...customStickers];
      return (
        <FlatList
          key="my-grid"
          data={dataWithAdd}
          numColumns={4}
          keyExtractor={(item, index) =>
            '_isAddButton' in item ? '__add' : (item as CustomSticker).id ?? `item-${index}`
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 10 }}
          columnWrapperStyle={{ gap: 10, justifyContent: 'flex-start' }}
          renderItem={({ item, index }) => {
            // Add button
            if ('_isAddButton' in item) {
              return (
                <Animated.View entering={FadeIn.duration(200)}>
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
                    <Text
                      style={{
                        fontFamily: Fonts.bold,
                        fontSize: 10,
                        color: theme.primary,
                      }}
                    >
                      追加
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            }

            // Custom sticker
            const sticker = item as CustomSticker;
            return (
              <Animated.View entering={FadeIn.delay(index * 30).duration(300)}>
                <Pressable
                  onPress={() => handleSelectCustomSticker(sticker)}
                  onLongPress={() => handleLongPressCustomSticker(sticker)}
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
                    transform: [{ scale: pressed ? 1.08 : 1 }],
                    overflow: 'hidden',
                  })}
                >
                  <Image
                    source={{ uri: sticker.uri }}
                    style={{ width: myStickerSize - 12, height: myStickerSize - 12 }}
                    contentFit="contain"
                    transition={200}
                  />
                </Pressable>
              </Animated.View>
            );
          }}
          ListEmptyComponent={null}
        />
      );
    }

    // Emoji sticker grid — 6 columns (default for emoji categories + recent)
    return (
      <FlatList
        key="emoji-grid"
        data={activeCategory === '__recent' ? recentStickers : currentCategory.stickers}
        numColumns={6}
        keyExtractor={(item, index) => `${activeCategory}-${item}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        columnWrapperStyle={{ justifyContent: 'flex-start' }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeIn.delay(index * 20)}>
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
        )}
        ListEmptyComponent={
          <EmptyState message="ステッカーがありません" theme={theme} />
        }
      />
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

        {STICKER_CATEGORIES.map((category) =>
          renderTab(category.id, category.icon, category.name)
        )}
      </ScrollView>

      {/* Content grid */}
      {renderGrid()}
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
    <View style={{ alignItems: 'center', paddingTop: 40 }}>
      <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: theme.textMuted }}>
        {message}
      </Text>
    </View>
  );
}
