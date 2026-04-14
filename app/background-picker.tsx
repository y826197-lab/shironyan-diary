import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import Svg, { Line, Circle, Rect, Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { useDiaryStore } from '@/store/useDiaryStore';
import { useCustomBackgroundStore, type CustomBackground } from '@/store/useCustomBackgroundStore';
import { persistImage } from '@/utils/image-storage';
import type { BackgroundType } from '@/store/types';

type TabId = 'patterns' | 'frames' | 'my';

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
  const { width } = useWindowDimensions();
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const updatePage = useDiaryStore((s) => s.updatePage);
  const pages = useDiaryStore((s) => s.pages);
  const customBackgrounds = useCustomBackgroundStore((s) => s.backgrounds);
  const addCustomBackground = useCustomBackgroundStore((s) => s.addBackground);
  const removeCustomBackground = useCustomBackgroundStore((s) => s.removeBackground);

  const currentPage = pages.find((p) => p.id === pageId);
  const currentBg = currentPage?.background || 'plain';

  const [activeTab, setActiveTab] = useState<TabId>('patterns');
  const [deleteTarget, setDeleteTarget] = useState<CustomBackground | null>(null);

  const bgTileSize = Math.floor((width - 56) / 3);

  const handleSelect = useCallback(
    (bg: BackgroundType) => {
      if (pageId) {
        updatePage(pageId, { background: bg, backgroundImage: undefined });
      }
      router.back();
    },
    [pageId, updatePage, router]
  );

  const handleSelectCustomBg = useCallback(
    (bg: CustomBackground) => {
      if (pageId) {
        updatePage(pageId, { background: 'custom' as BackgroundType, backgroundImage: bg.uri });
      }
      router.back();
    },
    [pageId, updatePage, router]
  );

  const handlePickCustomBackground = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const permanentUri = await persistImage(result.assets[0].uri);
        addCustomBackground(permanentUri);
      }
    } catch {
      Alert.alert('エラー', '画像の読み込みに失敗しました');
    }
  }, [addCustomBackground]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      removeCustomBackground(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, removeCustomBackground]);

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

  // ── Tab rendering ──
  const renderTab = (id: TabId, label: string, emoji: string) => {
    const isActive = activeTab === id;
    return (
      <Pressable
        key={id}
        onPress={() => setActiveTab(id)}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          paddingVertical: 10,
          borderRadius: 14,
          borderCurve: 'continuous',
          backgroundColor: isActive ? theme.primaryLight : 'transparent',
          borderWidth: isActive ? 1.5 : 0,
          borderColor: isActive ? theme.primary : 'transparent',
        }}
      >
        <Text style={{ fontSize: 14 }}>{emoji}</Text>
        <Text
          style={{
            fontFamily: isActive ? Fonts.bold : Fonts.medium,
            fontSize: 13,
            color: isActive ? theme.primary : theme.textSecondary,
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
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
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
      </View>

      {/* 3-tab bar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 6, paddingBottom: 8 }}>
        {renderTab('patterns', 'パターン', '📄')}
        {renderTab('frames', 'フレーム', '🖼️')}
        {renderTab('my', 'マイ背景', '📁')}
      </View>

      {/* Tab content */}
      {activeTab === 'patterns' && (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {BACKGROUNDS.map((bg, i) => renderOption(bg, i))}
        </ScrollView>
      )}

      {activeTab === 'frames' && (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {FRAMES.map((bg, i) => renderOption(bg, i))}
        </ScrollView>
      )}

      {activeTab === 'my' && (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 48,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Add button */}
          <Pressable
            onPress={handlePickCustomBackground}
            style={({ pressed }) => ({
              width: bgTileSize,
              height: bgTileSize,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
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

          {/* Custom background tiles */}
          {customBackgrounds.map((bg, index) => {
            const isActive = currentBg === ('custom' as BackgroundType) && currentPage?.backgroundImage === bg.uri;
            return (
              <Animated.View key={bg.id} entering={FadeIn.delay(index * 40).duration(300)}>
                <Pressable
                  onPress={() => handleSelectCustomBg(bg)}
                  onLongPress={() => setDeleteTarget(bg)}
                  delayLongPress={500}
                  style={({ pressed }) => ({
                    width: bgTileSize,
                    height: bgTileSize,
                    borderRadius: 14,
                    borderCurve: 'continuous',
                    overflow: 'hidden',
                    borderWidth: isActive ? 3 : 1.5,
                    borderColor: isActive ? theme.primary : '#F0E8EE',
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Image
                    source={{ uri: bg.uri }}
                    style={{ width: bgTileSize - 4, height: bgTileSize - 4 }}
                    contentFit="cover"
                    transition={200}
                    recyclingKey={bg.id}
                  />
                  {isActive && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: theme.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}

          {customBackgrounds.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 40, width: '100%' }}>
              <Text style={{ fontSize: 36 }}>🖼️</Text>
              <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: theme.textMuted, marginTop: 8, textAlign: 'center' }}>
                お気に入りの画像を{'\n'}背景に設定できます
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Delete confirmation modal */}
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
              この背景を削除しますか？
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
