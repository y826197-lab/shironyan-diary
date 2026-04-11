import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
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

  // Delete confirmation state — uses custom Modal instead of Alert.alert
  const [deleteTarget, setDeleteTarget] = useState<DiaryPage | null>(null);

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

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      deletePage(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, deletePage]);

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
        {/* Card wrapper with overflow visible for the × button */}
        <View style={{ overflow: 'visible' }}>
          <PageCard
            page={item}
            onPress={() => router.push(`/editor/${item.id}`)}
          />

          {/* Delete × button — TouchableOpacity, absolute at top-right of card */}
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setDeleteTarget(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
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
      </Animated.View>
    ),
    [cardWidth, router]
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
              paddingHorizontal: 24,
              paddingTop: 14,
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

      {/* ── Delete Confirmation Modal ── */}
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
              /* prevent dismiss when tapping dialog body */
            }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              borderCurve: 'continuous',
              paddingVertical: 28,
              paddingHorizontal: 24,
              width: 300,
              alignItems: 'center',
              gap: 16,
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

            {/* Title */}
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 17,
                color: '#5C4A6E',
                textAlign: 'center',
              }}
            >
              日記を削除
            </Text>

            {/* Message */}
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 13,
                color: '#8B7A9E',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              「{deleteTarget?.title || '無題のページ'}」を削除しますか？{'\n'}
              削除すると元に戻せません。
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 4 }}>
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
    </GradientBackground>
  );
}
