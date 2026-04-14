import { useRef } from 'react';
import { Animated, PanResponder, Alert } from 'react-native';
import { Image } from 'expo-image';
import { DECO_CAT_STICKER_MAP } from '@/constants/Stickers';
import { DECORATION_SIZES, type CalendarDecoration } from '@/hooks/use-calendar-decorations';

interface DecorationItemProps {
  decoration: CalendarDecoration;
  onMove: (id: string, x: number, y: number) => void;
  onCycleSize: (id: string) => void;
  onRemove: (id: string) => void;
}

export function DecorationItem({
  decoration,
  onMove,
  onCycleSize,
  onRemove,
}: DecorationItemProps) {
  const sticker = DECO_CAT_STICKER_MAP.get(decoration.stickerId);
  const size = DECORATION_SIZES[decoration.sizeIndex];

  // Animated values for smooth dragging (initialised once via useRef)
  const panX = useRef(new Animated.Value(decoration.x)).current;
  const panY = useRef(new Animated.Value(decoration.y)).current;

  // Mutable refs to avoid stale closures inside panResponder
  const decorationRef = useRef(decoration);
  decorationRef.current = decoration;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onCycleSizeRef = useRef(onCycleSize);
  onCycleSizeRef.current = onCycleSize;
  const onRemoveRef = useRef(onRemove);
  onRemoveRef.current = onRemove;

  const hasMoved = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3,

      onPanResponderGrant: () => {
        const deco = decorationRef.current;
        panX.setOffset(deco.x);
        panX.setValue(0);
        panY.setOffset(deco.y);
        panY.setValue(0);
        hasMoved.current = false;

        longPressTimer.current = setTimeout(() => {
          if (!hasMoved.current) {
            Alert.alert(
              'デコを削除',
              'このデコレーションを削除しますか？',
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除する',
                  style: 'destructive',
                  onPress: () => onRemoveRef.current(decorationRef.current.id),
                },
              ]
            );
          }
        }, 600);
      },

      onPanResponderMove: (event, gs) => {
        if (Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3) {
          hasMoved.current = true;
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }
        Animated.event([null, { dx: panX, dy: panY }], {
          useNativeDriver: false,
        })(event, gs);
      },

      onPanResponderRelease: (_, gs) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        panX.flattenOffset();
        panY.flattenOffset();

        if (!hasMoved.current) {
          onCycleSizeRef.current(decorationRef.current.id);
        } else {
          const deco = decorationRef.current;
          onMoveRef.current(deco.id, deco.x + gs.dx, deco.y + gs.dy);
        }
      },

      onPanResponderTerminate: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        panX.flattenOffset();
        panY.flattenOffset();
      },
    })
  ).current;

  if (!sticker) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: size,
        height: size,
        transform: [{ translateX: panX }, { translateY: panY }],
        zIndex: 200,
        // Fully transparent — the PNG image handles its own alpha channel
        backgroundColor: 'transparent',
      }}
    >
      <Image
        source={sticker.source}
        style={{ width: size, height: size }}
        contentFit="contain"
        transition={150}
      />
    </Animated.View>
  );
}
