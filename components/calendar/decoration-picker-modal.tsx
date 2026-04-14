import { View, Text, Modal, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BINSEN_STICKERS } from '@/constants/Stickers';
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

  const numColumns = 4;
  const hPad = 16;
  const gap = 10;
  const itemWidth = Math.floor((width - hPad * 2 - gap * (numColumns - 1)) / numColumns);
  const itemHeight = Math.round(itemWidth * 1.3);

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
        {/* Prevent backdrop tap from closing when tapping the sheet */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={SlideInDown.springify().damping(22).stiffness(220)}
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderCurve: 'continuous',
              maxHeight: '88%',
              paddingBottom: 40,
              boxShadow: '0 -4px 24px rgba(92,74,110,0.18)',
            }}
          >
            {/* Grab handle */}
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
                <Text style={{ fontSize: 22 }}>✨</Text>
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

            {/* "アイテム" tab pill */}
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
                    🎀 アイテム
                  </Text>
                </View>
              </View>
            </View>

            {/* Sticker grid */}
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
              {BINSEN_STICKERS.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeIn.delay(index * 28).duration(280)}
                >
                  <Pressable
                    onPress={() => {
                      onSelect(item.id);
                      onClose();
                    }}
                    style={({ pressed }) => ({
                      width: itemWidth,
                      height: itemHeight,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 14,
                      borderCurve: 'continuous',
                      backgroundColor: pressed ? '#FFF0F5' : '#FAFAFA',
                      borderWidth: 1.5,
                      borderColor: pressed ? '#F9A8C9' : '#F0E8EE',
                      transform: [{ scale: pressed ? 1.06 : 1 }],
                      overflow: 'hidden',
                      boxShadow: pressed
                        ? '0 4px 12px rgba(249,168,201,0.30)'
                        : '0 2px 6px rgba(0,0,0,0.06)',
                    })}
                  >
                    <Image
                      source={item.source}
                      style={{
                        width: itemWidth - 8,
                        height: itemHeight - 8,
                      }}
                      contentFit="contain"
                      transition={200}
                    />
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
