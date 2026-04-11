import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { CAT_STICKER_MAP } from '@/constants/Stickers';
import { useTheme } from '@/components/ui/use-theme';
import type { DiaryPage, BackgroundType } from '@/store/types';

const BG_COLORS: Record<BackgroundType, string> = {
  plain: '#FFF9FC',
  lined: '#FFFFF0',
  grid: '#F5FAFF',
  dots: '#F0FFF5',
  floral: '#FFF0F8',
};

interface PageCardProps {
  page: DiaryPage;
  onPress: () => void;
  onLongPress?: () => void;
}

export function PageCard({ page, onPress, onLongPress }: PageCardProps) {
  const theme = useTheme();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const emojiStickerElements = page.elements.filter((e) => e.type === 'sticker');
  const catStickerElements = page.elements.filter((e) => e.type === 'cat-image');
  const allStickerElements = [...emojiStickerElements, ...catStickerElements];
  const textElements = page.elements.filter((e) => e.type === 'text');
  const photoElements = page.elements.filter((e) => e.type === 'photo');

  const itemCount = page.elements.length + page.strokes.length;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 20,
        borderCurve: 'continuous',
        backgroundColor: theme.surface,
        boxShadow: `0 2px 12px ${theme.shadow}`,
        overflow: 'hidden',
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {/* Thumbnail area */}
      <View
        style={{
          height: 130,
          backgroundColor: BG_COLORS[page.background],
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {photoElements.length > 0 ? (
          <Image
            source={{ uri: photoElements[0].content }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : allStickerElements.length > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              padding: 12,
            }}
          >
            {allStickerElements.slice(0, 6).map((el) =>
              el.type === 'cat-image' ? (
                <Image
                  key={el.id}
                  source={CAT_STICKER_MAP.get(el.content)}
                  style={{ width: 32, height: 32 }}
                  contentFit="contain"
                />
              ) : (
                <Text key={el.id} style={{ fontSize: 28 }}>
                  {el.content}
                </Text>
              )
            )}
          </View>
        ) : textElements.length > 0 ? (
          <View style={{ padding: 14 }}>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 13,
                color: theme.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
              }}
              numberOfLines={4}
            >
              {textElements[0].content}
            </Text>
          </View>
        ) : page.strokes.length > 0 ? (
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Ionicons name="brush" size={36} color={theme.primaryLight} />
            <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: theme.textMuted }}>
              {page.strokes.length} ストローク
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 32 }}>📝</Text>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 11,
                color: theme.textMuted,
              }}
            >
              空のページ
            </Text>
          </View>
        )}

        {/* Background type badge */}
        {page.background !== 'plain' && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.85)',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <Text style={{ fontSize: 12 }}>
              {page.background === 'lined'
                ? '📏'
                : page.background === 'grid'
                ? '📐'
                : page.background === 'dots'
                ? '⚬'
                : '🌸'}
            </Text>
          </View>
        )}

        {/* Item count badge */}
        {itemCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(255,255,255,0.85)',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
              borderCurve: 'continuous',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 10,
                color: theme.textSecondary,
                fontVariant: ['tabular-nums'],
              }}
            >
              {itemCount}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: 12, gap: 4 }}>
        <Text
          style={{
            fontFamily: Fonts.bold,
            fontSize: 13,
            color: theme.text,
          }}
          numberOfLines={1}
        >
          {page.title || '無題のページ'}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 11,
            color: theme.textSecondary,
          }}
        >
          {formatDate(page.date)}
        </Text>
      </View>
    </Pressable>
  );
}
