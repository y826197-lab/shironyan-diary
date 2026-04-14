import { View, Text, Modal, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DECO_CAT_STICKERS } from '@/constants/Stickers';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';

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

  // 5 columns so more stickers are visible at once
  const numColumns = 5;
  const hPad = 16;
  const gap = 8;
  const itemSize = Math.floor((width - hPad * 2 - gap * (numColumns - 1)) / numColumns);

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
        {/* Stop backdrop tap from closing when touching the sheet itself */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={SlideInDown.springify().damping(22).stiffness(220)}
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderCurve: 'continuous',
              maxHeight: '85%',
              paddingBottom: 40,
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

            {/* Header row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 14,
                paddingBottom: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 22 }}>🐱</Text>
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 18,
                    color: theme.text,
                    letterSpacing: 0.5,
                  }}
                >
                  デコ追加
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: pressed ? theme.primaryLight : theme.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: theme.borderLight,
                })}
              >
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>

            {/* アイテム tab — single active tab pill */}
            <View
              style={{
                paddingHorizontal: hPad,
                paddingTop: 10,
                paddingBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: theme.background,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  padding: 3,
                  alignSelf: 'flex-start',
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 7,
                    backgroundColor: theme.surface,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    borderWidth: 1.5,
                    borderColor: theme.primaryLight,
                    boxShadow: '0 1px 4px rgba(249,168,201,0.25)',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 13,
                      color: theme.primary,
                      letterSpacing: 0.5,
                    }}
                  >
                    アイテム
                  </Text>
                </View>
              </View>
            </View>

            {/* Sticker grid — transparent bg, no labels */}
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: hPad,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: gap,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
            >
              {DECO_CAT_STICKERS.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeIn.delay(index * 22).duration(260)}
                >
                  <Pressable
                    onPress={() => {
                      onSelect(item.id);
                      onClose();
                    }}
                    style={({ pressed }) => ({
                      width: itemSize,
                      height: itemSize,
                      alignItems: 'center',
                      justifyContent: 'center',
                      // Transparent background — image only
                      backgroundColor: 'transparent',
                      // Subtle scale feedback on press; no border in normal state
                      transform: [{ scale: pressed ? 1.15 : 1 }],
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Image
                      source={item.source}
                      style={{ width: itemSize, height: itemSize }}
                      contentFit="contain"
                      transition={180}
                    />
                  </Pressable>
                  {/* NO label text — image only */}
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
