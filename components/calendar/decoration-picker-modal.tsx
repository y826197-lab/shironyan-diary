import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import type { ImageSource } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { DECO_CAT_STICKERS, BINSEN_STICKERS } from '@/constants/Stickers';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { persistImage } from '@/utils/image-storage';
import { useCalendarCustomStickerStore } from '@/store/useCalendarCustomStickerStore';

type TabId = 'neko' | 'items' | 'user';

interface Tab {
  id: TabId;
  label: string;
  emoji: string;
}

const TABS: Tab[] = [
  { id: 'neko', label: 'ネコ', emoji: '🐱' },
  { id: 'items', label: 'アイテム', emoji: '📋' },
  { id: 'user', label: 'マイ', emoji: '＋' },
];

interface DecorationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (stickerId: string) => void;
}

export function DecorationPickerModal({
  visible,
  onClose,
  onSelect,
}: DecorationPickerModalProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabId>('neko');

  const { stickers: customStickers, addSticker, removeSticker } =
    useCalendarCustomStickerStore();

  const numColumns = 5;
  const hPad = 16;
  const gap = 8;
  const itemSize = Math.floor((width - hPad * 2 - gap * (numColumns - 1)) / numColumns);

  const handleAddCustom = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets[0]) {
        const uri = await persistImage(result.assets[0].uri);
        addSticker(uri);
      }
    } catch {
      Alert.alert('エラー', '画像の読み込みに失敗しました');
    }
  }, [addSticker]);

  const handleRemoveCustom = useCallback(
    (id: string) => {
      Alert.alert('削除しますか？', '追加したステッカーを削除します', [
        { text: 'いいえ', style: 'cancel' },
        { text: 'はい', style: 'destructive', onPress: () => removeSticker(id) },
      ]);
    },
    [removeSticker]
  );

  // Transparent sticker cell — no background, no label
  const renderStickerCell = (
    key: string,
    source: ImageSource,
    onPress: () => void,
    index: number,
    _badge?: ReactNode
  ) => (
    <Animated.View key={key} entering={FadeIn.delay(index * 20).duration(240)}>
      <View style={{ position: 'relative' }}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            width: itemSize,
            height: itemSize,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            transform: [{ scale: pressed ? 1.14 : 1 }],
            opacity: pressed ? 0.82 : 1,
          })}
        >
          <Image
            source={source}
            style={{ width: itemSize, height: itemSize }}
            contentFit="contain"
            transition={160}
          />
        </Pressable>
        {_badge}
      </View>
    </Animated.View>
  );

  const renderTabContent = () => {
    if (activeTab === 'neko') {
      return (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: hPad,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: gap,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {DECO_CAT_STICKERS.map((item, index) =>
            renderStickerCell(
              item.id,
              item.source,
              () => { onSelect(item.id); onClose(); },
              index
            )
          )}
        </ScrollView>
      );
    }

    if (activeTab === 'items') {
      return (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: hPad,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: gap,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {BINSEN_STICKERS.map((item, index) =>
            renderStickerCell(
              item.id,
              item.source,
              () => { onSelect(item.id); onClose(); },
              index
            )
          )}
        </ScrollView>
      );
    }

    // ── ユーザー追加 tab ──
    return (
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: hPad,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: gap,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ＋ Add button */}
        <Animated.View entering={FadeIn.duration(260)}>
          <Pressable
            onPress={handleAddCustom}
            style={({ pressed }) => ({
              width: itemSize,
              height: itemSize,
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
            <Ionicons name="add-circle" size={26} color={theme.primary} />
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

        {/* Custom stickers */}
        {customStickers.map((sticker, index) => (
          <Animated.View
            key={sticker.id}
            entering={FadeIn.delay(index * 22).duration(240)}
          >
            <View style={{ position: 'relative' }}>
              <Pressable
                onPress={() => { onSelect(sticker.uri); onClose(); }}
                style={({ pressed }) => ({
                  width: itemSize,
                  height: itemSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  transform: [{ scale: pressed ? 1.12 : 1 }],
                  opacity: pressed ? 0.82 : 1,
                })}
              >
                <Image
                  source={{ uri: sticker.uri }}
                  style={{ width: itemSize, height: itemSize, borderRadius: 8 }}
                  contentFit="contain"
                  transition={160}
                  recyclingKey={sticker.id}
                />
              </Pressable>
              {/* Delete badge */}
              <TouchableOpacity
                onPress={() => handleRemoveCustom(sticker.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#F28B82',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#FFF',
                  zIndex: 10,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              >
                <Ionicons name="close" size={11} color="#FFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}

        {customStickers.length === 0 && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingTop: 32,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 36 }}>🖼️</Text>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 13,
                color: theme.textMuted,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              ＋ボタンで画像を追加できます
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(92, 74, 110, 0.45)',
        }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={SlideInDown.springify().damping(22).stiffness(220)}
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderCurve: 'continuous',
              maxHeight: '82%',
              paddingBottom: 36,
              boxShadow: '0 -4px 24px rgba(92,74,110,0.18)',
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: theme.borderLight,
                borderRadius: 2,
                alignSelf: 'center',
                marginTop: 12,
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 14,
                paddingBottom: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 20 }}>🐱</Text>
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 17,
                    color: theme.text,
                    letterSpacing: 0.3,
                  }}
                >
                  デコ追加
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: pressed ? theme.primaryLight : theme.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.borderLight,
                })}
              >
                <Ionicons name="close" size={17} color={theme.textSecondary} />
              </Pressable>
            </View>

            {/* Tab bar */}
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 10,
                gap: 8,
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderCurve: 'continuous',
                      backgroundColor: isActive
                        ? theme.primaryLight
                        : pressed
                        ? theme.background
                        : 'transparent',
                      borderWidth: isActive ? 1.5 : 1,
                      borderColor: isActive ? theme.primary + '80' : theme.borderLight,
                    })}
                  >
                    <Text style={{ fontSize: 14 }}>{tab.emoji}</Text>
                    <Text
                      style={{
                        fontFamily: isActive ? Fonts.bold : Fonts.regular,
                        fontSize: 13,
                        color: isActive ? theme.primary : theme.textSecondary,
                        letterSpacing: 0.3,
                      }}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Tab content */}
            {renderTabContent()}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
