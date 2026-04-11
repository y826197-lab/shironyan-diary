import { View, Text, FlatList, TextInput, Pressable, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useMemo, useCallback } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { GradientBackground } from '@/components/ui/gradient-background';
import { PageCard } from '@/components/pages/page-card';
import { useDiaryStore } from '@/store/useDiaryStore';
import type { DiaryPage } from '@/store/types';

export default function PagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const pages = useDiaryStore((s) => s.pages);
  const createPage = useDiaryStore((s) => s.createPage);
  const deletePage = useDiaryStore((s) => s.deletePage);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    const q = searchQuery.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.date.includes(q) ||
        p.elements.some((e) => e.type === 'text' && e.content.toLowerCase().includes(q))
    );
  }, [pages, searchQuery]);

  const sortedPages = useMemo(
    () => [...filteredPages].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [filteredPages]
  );

  const handleCreate = useCallback(() => {
    const id = createPage();
    router.push(`/editor/${id}`);
  }, [createPage, router]);

  const handleDeletePage = useCallback(
    (page: DiaryPage) => {
      Alert.alert(
        'ページを削除',
        `「${page.title || '無題のページ'}」を削除しますか？\nこの操作は取り消せません。`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '削除',
            style: 'destructive',
            onPress: () => deletePage(page.id),
          },
        ]
      );
    },
    [deletePage]
  );

  const numColumns = width > 600 ? 3 : 2;
  const cardGap = 14;
  const horizontalPadding = 20;
  const cardWidth = (width - horizontalPadding * 2 - cardGap * (numColumns - 1)) / numColumns;

  const renderItem = useCallback(
    ({ item, index }: { item: DiaryPage; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        style={{ width: cardWidth }}
      >
        <PageCard
          page={item}
          onPress={() => router.push(`/editor/${item.id}`)}
          onLongPress={() => handleDeletePage(item)}
        />
      </Animated.View>
    ),
    [cardWidth, router, handleDeletePage]
  );

  return (
    <GradientBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 12 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, gap: 14, marginBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>📖</Text>
              <Text
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 22,
                  color: theme.text,
                }}
              >
                自由ページ
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.primaryLight,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                borderCurve: 'continuous',
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 13,
                  color: theme.primary,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {pages.length}
              </Text>
            </View>
          </View>

          {/* Search bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderRadius: 16,
              borderCurve: 'continuous',
              paddingHorizontal: 14,
              gap: 8,
              height: 44,
              boxShadow: `0 1px 6px ${theme.shadow}`,
            }}
          >
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ページを検索..."
              placeholderTextColor={theme.textMuted}
              style={{
                flex: 1,
                fontFamily: Fonts.regular,
                fontSize: 14,
                color: theme.text,
                padding: 0,
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Pages Grid */}
        {sortedPages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 80 }}>
            <Text style={{ fontSize: 56 }}>🌸</Text>
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 16,
                color: theme.textSecondary,
                textAlign: 'center',
              }}
            >
              {searchQuery ? '検索結果がありません' : 'まだページがありません'}
            </Text>
            {!searchQuery && (
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: theme.textMuted,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                右下の＋ボタンで{'\n'}新しいページを作成しましょう
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            data={sortedPages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            key={numColumns}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 100,
              gap: cardGap,
            }}
            columnWrapperStyle={{
              gap: cardGap,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FAB */}
        <Pressable
          onPress={handleCreate}
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            transform: [{ scale: pressed ? 0.88 : 1 }],
          })}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </Pressable>
      </View>
    </GradientBackground>
  );
}
