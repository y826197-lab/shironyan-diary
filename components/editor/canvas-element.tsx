import { View, Text, Pressable, PanResponder } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// On web, Gesture.Pinch/Rotation set up multi-touch pointer handlers that
// conflict when 2+ GestureDetector instances exist on the same screen,
// causing crashes when placing a second photo/element.
const IS_WEB = process.env.EXPO_OS === 'web';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Path, Rect, Ellipse, Polygon, Line, Circle } from 'react-native-svg';
import { Fonts } from '@/constants/Typography';
import { CAT_STICKER_MAP, DECO_TEXT_MAP, WASHI_TAPE_MAP, SPEECH_BUBBLE_MAP, STICKY_NOTE_MAP, BINSEN_STICKER_MAP } from '@/constants/Stickers';
import { WashiTapeView } from '@/components/editor/washi-tape';
import type { CanvasElement } from '@/store/types';
import { useRef } from 'react';

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

  // ── Stable refs to avoid stale closures (updated every render) ──
  const elementRef = useRef(element);
  elementRef.current = element;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // ── Stable callbacks (never recreated — read latest via refs) ──
  const stableUpdatePosition = useRef((x: number, y: number) => {
    onUpdateRef.current({ x, y });
  }).current;

  const stableUpdateTransform = useRef((s: number, r: number) => {
    const el = elementRef.current;
    onUpdateRef.current({
      width: el.width * s,
      height: el.height * s,
      rotation: r,
    });
  }).current;

  const stableSelect = useRef(() => {
    onSelectRef.current();
  }).current;

  // ── Main element gestures ──
  const drag = Gesture.Pan()
    .enabled(!drawingMode)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(stableSelect)();
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      runOnJS(stableUpdatePosition)(translateX.value, translateY.value);
    });

  const pinch = Gesture.Pinch()
    // Disabled on web: multi-touch Pinch handlers from 2+ GestureDetectors
    // conflict on web and crash the app when a second element is placed.
    // Resize is handled by the scale handle (PanResponder) instead.
    .enabled(!drawingMode && !IS_WEB)
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      const finalScale = Math.max(0.3, Math.min(3, scale.value));
      runOnJS(stableUpdateTransform)(finalScale, rotation.value);
      scale.value = withSpring(1);
    });

  const rotateGesture = Gesture.Rotation()
    // Disabled on web for the same reason as Pinch above.
    // Rotation is handled by the rotate handle (PanResponder) instead.
    .enabled(!drawingMode && !IS_WEB)
    .onStart(() => {
      savedRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      runOnJS(stableUpdateTransform)(scale.value, rotation.value);
    });

  // On web: only drag (no pinch/rotate → no multi-touch conflict).
  // On native: all three gestures work simultaneously.
  const composed = IS_WEB
    ? drag
    : Gesture.Simultaneous(drag, pinch, rotateGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  // ── Scale handle (bottom-right): vertical drag = resize ──
  // CRITICAL: use useRef (created ONCE) instead of useMemo to prevent
  // recreation during active gestures, which caused crash with 2+ photos.
  const scaleStartRef = useRef({ width: element.width, height: element.height });

  const scalePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Capture initial size at gesture start to prevent compounding
        scaleStartRef.current = {
          width: elementRef.current.width,
          height: elementRef.current.height,
        };
      },
      onPanResponderMove: (_evt, gs) => {
        const scaleFactor = Math.max(0.3, Math.min(3, 1 + gs.dy / 150));
        onUpdateRef.current({
          width: Math.max(30, scaleStartRef.current.width * scaleFactor),
          height: Math.max(30, scaleStartRef.current.height * scaleFactor),
        });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // ── Rotate handle (bottom-left): horizontal drag = rotation ──
  const rotateStartRef = useRef(element.rotation);

  const rotatePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Capture initial rotation at gesture start
        rotateStartRef.current = elementRef.current.rotation;
      },
      onPanResponderMove: (_evt, gs) => {
        // dx: left = counter-clockwise, right = clockwise
        onUpdateRef.current({
          rotation: rotateStartRef.current + gs.dx / 80,
        });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

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
              style={{ width: element.width, height: element.height }}
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
              style={{ width: element.width, height: element.height }}
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
              style={{ width: element.width, height: element.height }}
              contentFit="cover"
              // Unique recycling key prevents image cache conflicts between elements
              recyclingKey={element.id}
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
      case 'speech-bubble': {
        const bubbleData = SPEECH_BUBBLE_MAP.get(element.content);
        if (!bubbleData) return null;
        return renderSpeechBubble(
          bubbleData.shape,
          element.width,
          element.height,
          bubbleData.borderColor,
          bubbleData.fillColor
        );
      }
      case 'sticky-note': {
        const noteData = STICKY_NOTE_MAP.get(element.content);
        if (!noteData) return null;
        return renderStickyNote(noteData, element.width, element.height);
      }
      case 'binsen-image': {
        const binsenData = BINSEN_STICKER_MAP.get(element.content);
        if (!binsenData) return null;
        return (
          <View
            style={{
              width: element.width,
              height: element.height,
              borderRadius: 6,
              borderCurve: 'continuous',
              overflow: 'hidden',
            }}
          >
            <Image
              source={binsenData.source}
              style={{ width: element.width, height: element.height }}
              contentFit="contain"
            />
          </View>
        );
      }
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
          style={{ width: '100%', height: '100%' }}
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
              {/* ✕ Delete button — top right */}
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

              {/* ↻ Rotate handle — bottom left (horizontal drag) */}
              <View
                {...rotatePanResponder.panHandlers}
                style={{
                  position: 'absolute',
                  bottom: -14,
                  left: -14,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: '#C9A8F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                <Ionicons name="sync-outline" size={14} color="#FFF" />
              </View>

              {/* ⤡ Scale handle — bottom right (vertical drag) */}
              <View
                {...scalePanResponder.panHandlers}
                style={{
                  position: 'absolute',
                  bottom: -14,
                  right: -14,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: '#F9A8C9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
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

// ── Speech Bubble SVG Shapes ──

function renderSpeechBubble(
  shape: string,
  w: number,
  h: number,
  borderColor: string,
  fillColor: string
) {
  const sw = 2;
  const bodyH = h * 0.8;

  switch (shape) {
    case 'round':
      return (
        <Svg width={w} height={h}>
          <Ellipse cx={w / 2} cy={bodyH / 2} rx={w / 2 - sw} ry={bodyH / 2 - sw} fill={fillColor} stroke={borderColor} strokeWidth={sw} />
          <Path d={`M ${w * 0.35} ${bodyH - sw} L ${w * 0.25} ${h - 2} L ${w * 0.5} ${bodyH - sw * 2}`} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'oval':
      return (
        <Svg width={w} height={h}>
          <Ellipse cx={w / 2} cy={bodyH / 2} rx={w / 2 - sw} ry={bodyH / 2 - sw} fill={fillColor} stroke={borderColor} strokeWidth={sw} />
          <Path d={`M ${w * 0.4} ${bodyH - sw * 2} L ${w * 0.3} ${h - 2} L ${w * 0.55} ${bodyH - sw * 3}`} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'cloud': {
      const cx = w / 2, cy = bodyH / 2;
      const rx = w / 2 - 6, ry = bodyH / 2 - 6;
      let d = '';
      const bumps = 12;
      for (let i = 0; i < bumps; i++) {
        const a1 = (i / bumps) * Math.PI * 2;
        const a2 = ((i + 1) / bumps) * Math.PI * 2;
        const x1 = cx + Math.cos(a1) * rx;
        const y1 = cy + Math.sin(a1) * ry;
        const x2 = cx + Math.cos(a2) * rx;
        const y2 = cy + Math.sin(a2) * ry;
        const midA = (a1 + a2) / 2;
        const bumpR = 8;
        const cpx = cx + Math.cos(midA) * (rx + bumpR);
        const cpy = cy + Math.sin(midA) * (ry + bumpR);
        if (i === 0) d += `M ${x1} ${y1} `;
        d += `Q ${cpx} ${cpy} ${x2} ${y2} `;
      }
      d += 'Z';
      return (
        <Svg width={w} height={h}>
          <Path d={d} fill={fillColor} stroke={borderColor} strokeWidth={sw} />
          <Circle cx={w * 0.35} cy={bodyH + 4} r={4} fill={fillColor} stroke={borderColor} strokeWidth={1.5} />
          <Circle cx={w * 0.28} cy={bodyH + 12} r={2.5} fill={fillColor} stroke={borderColor} strokeWidth={1} />
        </Svg>
      );
    }
    case 'square':
      return (
        <Svg width={w} height={h}>
          <Rect x={sw} y={sw} width={w - sw * 2} height={bodyH - sw * 2} fill={fillColor} stroke={borderColor} strokeWidth={sw} />
          <Path d={`M ${w * 0.3} ${bodyH - sw} L ${w * 0.2} ${h - 2} L ${w * 0.45} ${bodyH - sw}`} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'rounded-rect':
      return (
        <Svg width={w} height={h}>
          <Rect x={sw} y={sw} width={w - sw * 2} height={bodyH - sw * 2} rx={12} fill={fillColor} stroke={borderColor} strokeWidth={sw} />
          <Path d={`M ${w * 0.35} ${bodyH - sw * 2} L ${w * 0.25} ${h - 2} L ${w * 0.5} ${bodyH - sw * 3}`} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    case 'burst': {
      const cx2 = w / 2, cy2 = bodyH / 2;
      const points = 10;
      const outer = Math.min(w, bodyH) / 2 - 4;
      const inner = outer * 0.65;
      let burstPath = '';
      for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outer : inner;
        const px = cx2 + Math.cos(angle) * r;
        const py = cy2 + Math.sin(angle) * r;
        burstPath += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      burstPath += 'Z';
      return (
        <Svg width={w} height={h}>
          <Path d={burstPath} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'heart': {
      const s = Math.min(w, bodyH) * 0.45;
      const cx3 = w / 2, cy3 = bodyH / 2;
      const heartD = `M ${cx3} ${cy3 + s * 0.35} C ${cx3 - s * 0.5} ${cy3 - s * 0.4}, ${cx3 - s * 1.1} ${cy3 + s * 0.05}, ${cx3} ${cy3 + s * 0.9} C ${cx3 + s * 1.1} ${cy3 + s * 0.05}, ${cx3 + s * 0.5} ${cy3 - s * 0.4}, ${cx3} ${cy3 + s * 0.35} Z`;
      return (
        <Svg width={w} height={h}>
          <Path d={heartD} fill={fillColor} stroke={borderColor} strokeWidth={sw} />
        </Svg>
      );
    }
    case 'shout': {
      const cx4 = w / 2, cy4 = bodyH / 2;
      const spikes = 8;
      const outerR = Math.min(w, bodyH) / 2 - 4;
      const innerR = outerR * 0.75;
      let shoutPath = '';
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = cx4 + Math.cos(angle) * r;
        const py = cy4 + Math.sin(angle) * r;
        shoutPath += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      shoutPath += 'Z';
      return (
        <Svg width={w} height={h}>
          <Path d={shoutPath} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
          <Path d={`M ${w * 0.3} ${bodyH * 0.85} L ${w * 0.15} ${h - 2} L ${w * 0.45} ${bodyH * 0.8}`} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'wave': {
      const waveH = bodyH - 8;
      const waveW = w - 8;
      let wavePath = `M 4 ${waveH * 0.3 + 4}`;
      for (let y = waveH * 0.3; y < waveH * 0.7; y += 12) {
        wavePath += ` Q ${-2} ${y + 6 + 4} 4 ${y + 12 + 4}`;
      }
      wavePath += ` Q 4 ${waveH + 4} ${waveW * 0.3 + 4} ${waveH + 4}`;
      for (let x = waveW * 0.3; x < waveW * 0.9; x += 14) {
        wavePath += ` Q ${x + 7 + 4} ${waveH + 10} ${x + 14 + 4} ${waveH + 4}`;
      }
      wavePath += ` Q ${waveW + 4} ${waveH + 4} ${waveW + 4} ${waveH * 0.7 + 4}`;
      wavePath += ` Q ${waveW + 10} ${waveH * 0.5 + 4} ${waveW + 4} ${waveH * 0.3 + 4}`;
      wavePath += ` Q ${waveW + 4} 4 ${waveW * 0.7 + 4} 4`;
      for (let x = waveW * 0.7; x > waveW * 0.1; x -= 14) {
        wavePath += ` Q ${x - 7 + 4} ${-2} ${x - 14 + 4} 4`;
      }
      wavePath += ` Q 4 4 4 ${waveH * 0.3 + 4} Z`;
      return (
        <Svg width={w} height={h}>
          <Path d={wavePath} fill={fillColor} stroke={borderColor} strokeWidth={sw} />
          <Path d={`M ${w * 0.35} ${bodyH - 4} L ${w * 0.28} ${h - 2} L ${w * 0.48} ${bodyH - 6}`} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'diamond': {
      const pts = `${w / 2},${sw} ${w - sw},${bodyH / 2} ${w / 2},${bodyH - sw} ${sw},${bodyH / 2}`;
      return (
        <Svg width={w} height={h}>
          <Polygon points={pts} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'hexagon': {
      const cx5 = w / 2, cy5 = bodyH / 2;
      const hexR = Math.min(w, bodyH) / 2 - 4;
      let hexPoints = '';
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
        const px = cx5 + Math.cos(angle) * hexR;
        const py = cy5 + Math.sin(angle) * hexR;
        hexPoints += `${px},${py} `;
      }
      return (
        <Svg width={w} height={h}>
          <Polygon points={hexPoints.trim()} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    case 'star': {
      const cx6 = w / 2, cy6 = bodyH / 2;
      const starOuter = Math.min(w, bodyH) / 2 - 4;
      const starInner = starOuter * 0.45;
      let starPath = '';
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? starOuter : starInner;
        const px = cx6 + Math.cos(angle) * r;
        const py = cy6 + Math.sin(angle) * r;
        starPath += i === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
      }
      starPath += 'Z';
      return (
        <Svg width={w} height={h}>
          <Path d={starPath} fill={fillColor} stroke={borderColor} strokeWidth={sw} strokeLinejoin="round" />
        </Svg>
      );
    }
    default:
      return (
        <Svg width={w} height={h}>
          <Ellipse cx={w / 2} cy={bodyH / 2} rx={w / 2 - sw} ry={bodyH / 2 - sw} fill={fillColor} stroke={borderColor} strokeWidth={sw} />
        </Svg>
      );
  }
}

// ── Sticky Note Rendering ──

function renderStickyNote(
  note: { color: string; secondaryColor: string; style: string; cornerFold: boolean },
  w: number,
  h: number
) {
  const { color, secondaryColor, style, cornerFold } = note;
  const foldSize = 14;

  return (
    <View
      style={{
        width: w,
        height: h,
        backgroundColor: color,
        borderRadius: 4,
        borderCurve: 'continuous',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <View style={{ height: 3, backgroundColor: secondaryColor, opacity: 0.6 }} />

      {style === 'lined' && (
        <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
          {Array.from({ length: Math.floor(h / 16) }, (_, i) => (
            <Line key={i} x1={8} y1={16 + i * 16} x2={w - 8} y2={16 + i * 16} stroke={secondaryColor} strokeWidth={0.5} opacity={0.4} />
          ))}
        </Svg>
      )}
      {style === 'grid' && (
        <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
          {Array.from({ length: Math.floor(w / 14) }, (_, i) => (
            <Line key={`v${i}`} x1={14 + i * 14} y1={4} x2={14 + i * 14} y2={h - 4} stroke={secondaryColor} strokeWidth={0.4} opacity={0.3} />
          ))}
          {Array.from({ length: Math.floor(h / 14) }, (_, i) => (
            <Line key={`h${i}`} x1={4} y1={14 + i * 14} x2={w - 4} y2={14 + i * 14} stroke={secondaryColor} strokeWidth={0.4} opacity={0.3} />
          ))}
        </Svg>
      )}
      {style === 'dotted' && (
        <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
          {Array.from({ length: Math.floor(w / 12) }, (_, ix) =>
            Array.from({ length: Math.floor(h / 12) }, (_, iy) => (
              <Circle key={`${ix}-${iy}`} cx={10 + ix * 12} cy={10 + iy * 12} r={1} fill={secondaryColor} opacity={0.4} />
            ))
          ).flat()}
        </Svg>
      )}
      {style === 'torn' && (
        <Svg width={w} height={4} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Path
            d={Array.from({ length: Math.ceil(w / 6) }, (_, i) =>
              `${i === 0 ? 'M' : 'L'} ${i * 6} ${i % 2 === 0 ? 0 : 3}`
            ).join(' ')}
            stroke={secondaryColor}
            strokeWidth={1}
            fill="none"
            opacity={0.5}
          />
        </Svg>
      )}
      {style === 'tag' && (
        <View style={{ position: 'absolute', top: 6, left: w / 2 - 4, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: secondaryColor, opacity: 0.5 }} />
      )}
      {style === 'card' && (
        <View
          style={{
            position: 'absolute',
            top: 6, left: 6, right: 6, bottom: 6,
            borderWidth: 1,
            borderColor: secondaryColor,
            borderRadius: 3,
            borderStyle: 'dashed',
            opacity: 0.3,
          }}
        />
      )}

      {cornerFold && (
        <Svg width={foldSize} height={foldSize} style={{ position: 'absolute', bottom: 0, right: 0 }}>
          <Path d={`M ${foldSize} 0 L ${foldSize} ${foldSize} L 0 ${foldSize} Z`} fill={secondaryColor} opacity={0.35} />
        </Svg>
      )}
    </View>
  );
}
