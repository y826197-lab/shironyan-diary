import { View, Text, ScrollView, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { STICKER_CATEGORIES, CAT_STICKERS, type CatSticker } from '@/constants/Stickers';
import { useDiaryStore } from '@/store/useDiaryStore';

const CAT_TAB_ID = '__cats';

export default function StickerPickerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const addElement = useDiaryStore((s) => s.addElement);
  const pages = useDiaryStore((s) => s.pages);
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

  const isCatTab = activeCategory === CAT_TAB_ID;

  // Build a tab pill component to avoid repetition
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
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
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
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 6,
          alignItems: 'center',
        }}
      >
        {/* Cat tab — prominent first position */}
        {renderTab(CAT_TAB_ID, '🐱', 'ネコ', isCatTab ? '#FF8FAB' : undefined)}

        {recentStickers.length > 0 &&
          renderTab('__recent', '🕐', '最近')}

        {STICKER_CATEGORIES.map((category) =>
          renderTab(category.id, category.icon, category.name)
        )}
      </ScrollView>

      {/* Content area */}
      {isCatTab ? (
        /* Cat image sticker grid — 4 columns for larger previews */
        <FlatList
          data={CAT_STICKERS}
          numColumns={4}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 40,
            gap: 10,
          }}
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
                  style={{
                    width: catStickerSize - 12,
                    height: catStickerSize - 12,
                  }}
                  contentFit="contain"
                  transition={200}
                />
              </Pressable>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: theme.textMuted }}>
                ネコステッカーがありません
              </Text>
            </View>
          }
        />
      ) : (
        /* Emoji sticker grid — 6 columns */
        <FlatList
          data={activeCategory === '__recent' ? recentStickers : currentCategory.stickers}
          numColumns={6}
          keyExtractor={(item, index) => `${activeCategory}-${item}-${index}`}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
          }}
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
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: theme.textMuted }}>
                ステッカーがありません
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
