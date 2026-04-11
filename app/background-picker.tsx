import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import Svg, { Line, Circle } from 'react-native-svg';
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

function MiniPreview({ type }: { type: BackgroundType }) {
  const size = 48;

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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderCurve: 'continuous',
        padding: 20,
        gap: 16,
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
        背景テンプレート ✨
      </Text>

      <View style={{ gap: 10 }}>
        {BACKGROUNDS.map((bg, index) => {
          const isActive = currentBg === bg.type;
          return (
            <Animated.View key={bg.type} entering={FadeInDown.delay(index * 60).springify()}>
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
                {/* Mini preview */}
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
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 15,
                      color: theme.text,
                    }}
                  >
                    {bg.emoji} {bg.label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 12,
                      color: theme.textSecondary,
                    }}
                  >
                    {bg.desc}
                  </Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
