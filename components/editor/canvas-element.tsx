import { View, Text, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { CAT_STICKER_MAP, DECO_TEXT_MAP, WASHI_TAPE_MAP } from '@/constants/Stickers';
import { WashiTapeView } from '@/components/editor/washi-tape';
import type { CanvasElement } from '@/store/types';

interface CanvasElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onRemove: () => void;
  drawingMode: boolean;
}

export function CanvasElementView({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  drawingMode,
}: CanvasElementProps) {
  const translateX = useSharedValue(element.x);
  const translateY = useSharedValue(element.y);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(element.rotation);
  const savedTranslateX = useSharedValue(element.x);
  const savedTranslateY = useSharedValue(element.y);
  const savedScale = useSharedValue(1);
  const savedRotation = useSharedValue(element.rotation);

  const handleUpdatePosition = (x: number, y: number) => {
    onUpdate({ x, y });
  };

  const handleUpdateTransform = (s: number, r: number) => {
    onUpdate({
      width: element.width * s,
      height: element.height * s,
      rotation: r,
    });
  };

  const drag = Gesture.Pan()
    .enabled(!drawingMode)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(onSelect)();
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      runOnJS(handleUpdatePosition)(translateX.value, translateY.value);
    });

  const pinch = Gesture.Pinch()
    .enabled(!drawingMode)
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      const finalScale = Math.max(0.3, Math.min(3, scale.value));
      runOnJS(handleUpdateTransform)(finalScale, rotation.value);
      scale.value = withSpring(1);
    });

  const rotateGesture = Gesture.Rotation()
    .enabled(!drawingMode)
    .onStart(() => {
      savedRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      runOnJS(handleUpdateTransform)(scale.value, rotation.value);
    });

  const composed = Gesture.Simultaneous(drag, pinch, rotateGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const renderContent = () => {
    switch (element.type) {
      case 'cat-image': {
        const catSource = CAT_STICKER_MAP.get(element.content);
        if (!catSource) return null;
        return (
          <View
            style={{
              width: element.width,
              height: element.height,
              borderRadius: 8,
              borderCurve: 'continuous',
              overflow: 'hidden',
            }}
          >
            <Image
              source={catSource}
              style={{
                width: element.width,
                height: element.height,
              }}
              contentFit="contain"
            />
          </View>
        );
      }
      case 'deco-text': {
        const decoData = DECO_TEXT_MAP.get(element.content);
        if (!decoData) return null;
        return (
          <View
            style={{
              width: element.width,
              height: element.height,
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: decoData.bgColor,
              borderWidth: 2,
              borderColor: decoData.color + '40',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 8,
              boxShadow: `0 2px 8px ${decoData.color}20`,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: Math.min(element.width, element.height) * 0.28,
                color: decoData.color,
                textAlign: 'center',
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {decoData.text}
            </Text>
          </View>
        );
      }
      case 'washi-tape': {
        const tapeData = WASHI_TAPE_MAP.get(element.content);
        if (!tapeData) return null;
        return (
          <WashiTapeView
            tape={tapeData}
            width={element.width}
            height={element.height}
          />
        );
      }
      case 'custom-image':
        return (
          <View
            style={{
              width: element.width,
              height: element.height,
              borderRadius: 10,
              borderCurve: 'continuous',
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: element.content }}
              style={{
                width: element.width,
                height: element.height,
              }}
              contentFit="contain"
            />
          </View>
        );
      case 'sticker':
        return (
          <Text
            style={{
              fontSize: Math.min(element.width, element.height) * 0.75,
              textAlign: 'center',
              lineHeight: element.height,
            }}
          >
            {element.content}
          </Text>
        );
      case 'text':
        return (
          <View
            style={{
              padding: 8,
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: 8,
              borderCurve: 'continuous',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: element.fontSize || 16,
                color: element.fontColor || '#5C4A6E',
                lineHeight: (element.fontSize || 16) * 1.5,
              }}
            >
              {element.content || 'テキストを入力...'}
            </Text>
          </View>
        );
      case 'photo':
        return (
          <View
            style={{
              width: element.width,
              height: element.height,
              borderRadius: 12,
              borderCurve: 'continuous',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <Image
              source={{ uri: element.content }}
              style={{
                width: element.width,
                height: element.height,
              }}
              contentFit="cover"
            />
            {/* Photo frame border */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 12,
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.8)',
              }}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: element.width,
            height: element.height,
            zIndex: element.zIndex,
          },
          animatedStyle,
        ]}
      >
        <Pressable
          onPress={() => {
            if (!drawingMode) onSelect();
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {renderContent()}
          {/* Selection border + controls */}
          {isSelected && !drawingMode && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderWidth: 2,
                borderColor: '#F9A8C9',
                borderRadius: 10,
                borderStyle: 'dashed',
              }}
            >
              {/* Delete button */}
              <Pressable
                onPress={onRemove}
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: '#F28B82',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                }}
                hitSlop={8}
              >
                <Ionicons name="close" size={14} color="#FFF" />
              </Pressable>

              {/* Resize / Rotate handle */}
              <View
                style={{
                  position: 'absolute',
                  bottom: -12,
                  right: -12,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: '#F9A8C9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                }}
              >
                <Ionicons name="resize-outline" size={14} color="#FFF" />
              </View>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
