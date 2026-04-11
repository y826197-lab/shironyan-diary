import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import Svg, { Line, Circle, Rect, Path } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { useDiaryStore } from '@/store/useDiaryStore';
import type { BackgroundType } from '@/store/types';

const BACKGROUNDS: { type: BackgroundType; label: string; emoji: string; desc: string }[] = [
  { type: 'plain', label: '無地', emoji: '📃', desc: 'シンプルな白紙' },
  { type: 'lined', label: '罫線', emoji: '📏', desc: 'ノートのような横線' },
  { type: 'grid', label: '方眼', emoji: '📐', desc: '細かいグリッド線' },
  { type: 'dots', label: 'ドット', emoji: '⚬', desc: '等間隔のドット' },
  { type: 'floral', label: '花柄', emoji: '🌸', desc: 'かわいい花模様' },
];

const FRAMES: { type: BackgroundType; label: string; emoji: string; desc: string }[] = [
  { type: 'frame-simple', label: 'シンプル枠', emoji: '▫️', desc: '細い線のフレーム' },
  { type: 'frame-floral', label: '花柄フレーム', emoji: '🌺', desc: '四隅に花のデコレーション' },
  { type: 'frame-ribbon', label: 'リボン', emoji: '🎀', desc: '上下にリボン装飾' },
  { type: 'frame-dots', label: 'ドット枠', emoji: '⚬', desc: '点線のフレーム' },
  { type: 'frame-double', label: '二重線', emoji: '▪️', desc: '二重線のフレーム' },
  { type: 'frame-rounded', label: '角丸フレーム', emoji: '⬜', desc: '丸みのある枠' },
  { type: 'frame-hearts', label: 'ハート枠', emoji: '💕', desc: '四隅にハート装飾' },
  { type: 'frame-lace', label: 'レース枠', emoji: '🧶', desc: 'レース風スカラップ' },
];

function MiniPreview({ type }: { type: BackgroundType }) {
  const size = 48;
  const FC = '#F0C0D8';

  switch (type) {
    case 'lined':
      return (
        <Svg width={size} height={size}>
          {[12, 20, 28, 36].map((y) => (
            <Line key={y} x1={4} y1={y} x2={44} y2={y} stroke="#F0E0EA" strokeWidth={0.8} />
          ))}
          <Line x1={10} y1={4} x2={10} y2={44} stroke="#F9A8C9" strokeWidth={0.5} opacity={0.4} />
        </Svg>
      );
    case 'grid':
      return (
        <Svg width={size} height={size}>
          {[12, 24, 36].map((v) => (
            <Line key={`v${v}`} x1={v} y1={4} x2={v} y2={44} stroke="#E8DDF2" strokeWidth={0.5} />
          ))}
          {[12, 24, 36].map((h) => (
            <Line key={`h${h}`} x1={4} y1={h} x2={44} y2={h} stroke="#E8DDF2" strokeWidth={0.5} />
          ))}
        </Svg>
      );
    case 'dots':
      return (
        <Svg width={size} height={size}>
          {[12, 24, 36].map((x) =>
            [12, 24, 36].map((y) => (
              <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="#D8CCE6" opacity={0.6} />
            ))
          )}
        </Svg>
      );
    case 'floral':
      return (
        <Svg width={size} height={size}>
          {[16, 32].map((x) =>
            [16, 32].map((y) => (
              <Circle key={`f-${x}-${y}`} cx={x} cy={y} r={4} fill="#F9A8C9" opacity={0.12} />
            ))
          )}
          {[16, 32].map((x) =>
            [16, 32].map((y) => (
              <Circle key={`fc-${x}-${y}`} cx={x} cy={y} r={1.5} fill="#F9E4A8" opacity={0.2} />
            ))
          )}
        </Svg>
      );
    // ── Frame previews ──
    case 'frame-simple':
      return (
        <Svg width={size} height={size}>
          <Rect x={6} y={6} width={36} height={36} rx={0} fill="none" stroke={FC} strokeWidth={1.2} opacity={0.6} />
        </Svg>
      );
    case 'frame-floral':
      return (
        <Svg width={size} height={size}>
          <Rect x={6} y={6} width={36} height={36} rx={0} fill="none" stroke={FC} strokeWidth={0.8} opacity={0.4} />
          {[{ x: 6, y: 6 }, { x: 42, y: 6 }, { x: 6, y: 42 }, { x: 42, y: 42 }].map(({ x, y }, i) => (
            <Circle key={i} cx={x} cy={y} r={4} fill="#F9A8C9" opacity={0.2} />
          ))}
        </Svg>
      );
    case 'frame-ribbon':
      return (
        <Svg width={size} height={size}>
          <Rect x={4} y={8} width={40} height={6} rx={1} fill="#F9A8C9" opacity={0.18} />
          <Rect x={4} y={34} width={40} height={6} rx={1} fill="#F9A8C9" opacity={0.18} />
          <Line x1={6} y1={14} x2={6} y2={34} stroke={FC} strokeWidth={0.8} opacity={0.3} />
          <Line x1={42} y1={14} x2={42} y2={34} stroke={FC} strokeWidth={0.8} opacity={0.3} />
        </Svg>
      );
    case 'frame-dots':
      return (
        <Svg width={size} height={size}>
          <Rect x={6} y={6} width={36} height={36} rx={0} fill="none" stroke={FC} strokeWidth={1.5} strokeDasharray="3,4" opacity={0.5} />
        </Svg>
      );
    case 'frame-double':
      return (
        <Svg width={size} height={size}>
          <Rect x={6} y={6} width={36} height={36} rx={0} fill="none" stroke={FC} strokeWidth={1.2} opacity={0.45} />
          <Rect x={10} y={10} width={28} height={28} rx={0} fill="none" stroke={FC} strokeWidth={0.6} opacity={0.35} />
        </Svg>
      );
    case 'frame-rounded':
      return (
        <Svg width={size} height={size}>
          <Rect x={6} y={6} width={36} height={36} rx={10} fill="none" stroke={FC} strokeWidth={1.5} opacity={0.45} />
        </Svg>
      );
    case 'frame-hearts': {
      const heartPath = (cx: number, cy: number, s: number) =>
        `M ${cx} ${cy + s * 0.35} C ${cx - s * 0.5} ${cy - s * 0.3}, ${cx - s} ${cy + s * 0.1}, ${cx} ${cy + s * 0.8} C ${cx + s} ${cy + s * 0.1}, ${cx + s * 0.5} ${cy - s * 0.3}, ${cx} ${cy + s * 0.35} Z`;
      return (
        <Svg width={size} height={size}>
          <Rect x={6} y={6} width={36} height={36} rx={0} fill="none" stroke={FC} strokeWidth={0.8} opacity={0.3} />
          {[{ x: 6, y: 6 }, { x: 42, y: 6 }, { x: 6, y: 42 }, { x: 42, y: 42 }].map(({ x, y }, i) => (
            <Path key={i} d={heartPath(x, y, 5)} fill="#F9A8C9" opacity={0.3} />
          ))}
        </Svg>
      );
    }
    case 'frame-lace':
      return (
        <Svg width={size} height={size}>
          {[6, 14, 22, 30, 38].map((x) => (
            <Path key={`t-${x}`} d={`M ${x} 6 A 3 3 0 0 1 ${x + 8} 6`} fill="none" stroke={FC} strokeWidth={0.8} opacity={0.4} />
          ))}
          {[6, 14, 22, 30, 38].map((x) => (
            <Path key={`b-${x}`} d={`M ${x} 42 A 3 3 0 0 0 ${x + 8} 42`} fill="none" stroke={FC} strokeWidth={0.8} opacity={0.4} />
          ))}
        </Svg>
      );
    default:
      return <View style={{ width: size, height: size }} />;
  }
}

export default function BackgroundPickerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const updatePage = useDiaryStore((s) => s.updatePage);
  const pages = useDiaryStore((s) => s.pages);

  const currentPage = pages.find((p) => p.id === pageId);
  const currentBg = currentPage?.background || 'plain';

  const handleSelect = useCallback(
    (bg: BackgroundType) => {
      if (pageId) {
        updatePage(pageId, { background: bg });
      }
      router.back();
    },
    [pageId, updatePage, router]
  );

  const renderOption = (bg: { type: BackgroundType; label: string; emoji: string; desc: string }, index: number) => {
    const isActive = currentBg === bg.type;
    return (
      <Animated.View key={bg.type} entering={FadeInDown.delay(index * 50).springify()}>
        <Pressable
          onPress={() => handleSelect(bg.type)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 14,
            borderRadius: 16,
            borderCurve: 'continuous',
            backgroundColor: isActive ? theme.primaryLight : theme.background,
            borderWidth: isActive ? 2 : 1,
            borderColor: isActive ? theme.primary : theme.borderLight,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              borderCurve: 'continuous',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: theme.borderLight,
            }}
          >
            <MiniPreview type={bg.type} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 15, color: theme.text }}>
              {bg.emoji} {bg.label}
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 12, color: theme.textSecondary }}>
              {bg.desc}
            </Text>
          </View>
          {isActive && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderCurve: 'continuous' }}
      contentContainerStyle={{ padding: 20, gap: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={{
          fontFamily: Fonts.bold,
          fontSize: 18,
          color: theme.text,
          textAlign: 'center',
        }}
      >
        背景テンプレート ✨
      </Text>

      {/* Background patterns section */}
      <Text
        style={{
          fontFamily: Fonts.bold,
          fontSize: 14,
          color: theme.textSecondary,
          paddingLeft: 4,
          marginTop: 4,
        }}
      >
        📄 パターン
      </Text>
      <View style={{ gap: 8 }}>
        {BACKGROUNDS.map((bg, i) => renderOption(bg, i))}
      </View>

      {/* Frame section */}
      <Text
        style={{
          fontFamily: Fonts.bold,
          fontSize: 14,
          color: theme.textSecondary,
          paddingLeft: 4,
          marginTop: 8,
        }}
      >
        🖼️ フレーム
      </Text>
      <View style={{ gap: 8 }}>
        {FRAMES.map((bg, i) => renderOption(bg, BACKGROUNDS.length + i))}
      </View>
    </ScrollView>
  );
}
