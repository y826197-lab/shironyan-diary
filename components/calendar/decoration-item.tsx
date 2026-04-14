import { useRef } from 'react';
import { Animated, PanResponder, Alert } from 'react-native';
import { Image } from 'expo-image';
import { DECO_CAT_STICKER_MAP, BINSEN_STICKER_MAP } from '@/constants/Stickers';
import { DECORATION_SIZES, type CalendarDecoration } from '@/hooks/use-calendar-decorations';
import type { ImageSource } from 'expo-image';

interface DecorationItemProps {
  decoration: CalendarDecoration;
  onMove: (id: string, x: number, y: number) => void;
  onCycleSize: (id: string) => void;
  onRemove: (id: string) => void;
}

/** Resolve a stickerId to an expo-image source.
 *  - deco_cat_*  → DECO_CAT_STICKER_MAP (require'd PNG)
 *  - binsen_*    → BINSEN_STICKER_MAP   (require'd PNG)
 *  - anything else → treat as a URI (user-added custom image)
 */
function resolveStickerSource(stickerId: string): ImageSource | null {
  if (stickerId.startsWith('deco_cat_')) {
    return DECO_CAT_STICKER_MAP.get(stickerId)?.source ?? null;
  }
  if (stickerId.startsWith('binsen_')) {
    return BINSEN_STICKER_MAP.get(stickerId)?.source ?? null;
  }
  // Custom user image — stickerId IS the URI
  if (stickerId.length > 0) {
    return { uri: stickerId };
  }
  return null;
}

export function DecorationItem({
  decoration,
  onMove,
  onCycleSize,
  onRemove,
}: DecorationItemProps) {
  const source = resolveStickerSource(decoration.stickerId);
  const size = DECORATION_SIZES[decoration.sizeIndex];

  // Animated values for smooth dragging (created once per instance)
  const panX = useRef(new Animated.Value(decoration.x)).current;
  const panY = useRef(new Animated.Value(decoration.y)).current;

  // Stable refs — updated every render to avoid stale closures
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

        // Long-press (600 ms) → delete confirmation
        longPressTimer.current = setTimeout(() => {
          if (!hasMoved.current) {
            Alert.alert(
              'デコを削除',
              '削除しますか？',
              [
                { text: 'いいえ', style: 'cancel' },
                {
                  text: 'はい',
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
          // Short tap → cycle through 5 sizes
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

  if (!source) return null;

  const isCustomUri =
    !decoration.stickerId.startsWith('deco_cat_') &&
    !decoration.stickerId.startsWith('binsen_');

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
        backgroundColor: 'transparent',
      }}
    >
      <Image
        source={source}
        style={{ width: size, height: size }}
        contentFit="contain"
        transition={150}
        // Unique key for custom images to avoid cache conflicts
        recyclingKey={isCustomUri ? decoration.stickerId : undefined}
      />
    </Animated.View>
  );
}
