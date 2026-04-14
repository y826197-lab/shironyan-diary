import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { ColorPicker } from './color-picker';
import type { PenType } from '@/store/types';
import { useState } from 'react';

const PEN_TYPES: { type: PenType; label: string; icon: string }[] = [
  { type: 'pen', label: 'ペン', icon: '✒️' },
  { type: 'marker', label: 'マーカー', icon: '🖊️' },
  { type: 'highlighter', label: '蛍光ペン', icon: '🖍️' },
  { type: 'crayon', label: 'クレヨン', icon: '🖍️' },
  { type: 'neon', label: 'ネオン', icon: '💡' },
  { type: 'shadow', label: '影付き', icon: '🌓' },
  { type: 'eraser', label: '消しゴム', icon: '🧹' },
];

const BRUSH_SIZES = [2, 4, 6, 8, 12];
const ERASER_SIZES = [8, 14, 20, 28, 40];

export type ToolMode = 'select' | 'draw' | 'photo' | 'sticker' | 'text';

interface ToolbarProps {
  activeMode: ToolMode;
  onChangeMode: (mode: ToolMode) => void;
  drawColor: string;
  onChangeDrawColor: (color: string) => void;
  drawSize: number;
  onChangeDrawSize: (size: number) => void;
  penType: PenType;
  onChangePenType: (type: PenType) => void;
  eraserSize: number;
  onChangeEraserSize: (size: number) => void;
  onAddPhoto: () => void;
  onAddSticker: () => void;
  onAddText: () => void;
  onUndo: () => void;
}

export function Toolbar({
  activeMode,
  onChangeMode,
  drawColor,
  onChangeDrawColor,
  drawSize,
  onChangeDrawSize,
  penType,
  onChangePenType,
  eraserSize,
  onChangeEraserSize,
  onAddPhoto,
  onAddSticker,
  onAddText,
  onUndo,
}: ToolbarProps) {
  const theme = useTheme();
  const [showDrawOptions, setShowDrawOptions] = useState(false);

  const isEraser = penType === 'eraser';

  const tools: {
    mode: ToolMode;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    action?: () => void;
  }[] = [
    { mode: 'draw', icon: 'brush', label: '描画' },
    { mode: 'photo', icon: 'image', label: '写真', action: onAddPhoto },
    { mode: 'sticker', icon: 'happy', label: 'ステッカー', action: onAddSticker },
    { mode: 'text', icon: 'text', label: 'テキスト', action: onAddText },
  ];

  return (
    <View>
      {/* Draw options panel */}
      {activeMode === 'draw' && showDrawOptions && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutDown.duration(150)}
          style={{
            backgroundColor: theme.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
            gap: 12,
            boxShadow: `0 -2px 12px ${theme.shadow}`,
          }}
        >
          {/* Pen type selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PEN_TYPES.map((pen) => {
                const isActive = penType === pen.type;
                return (
                  <Pressable
                    key={pen.type}
                    onPress={() => onChangePenType(pen.type)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderCurve: 'continuous',
                      backgroundColor: isActive
                        ? pen.type === 'eraser'
                          ? '#F5F5F5'
                          : theme.primaryLight
                        : theme.background,
                      borderWidth: isActive ? 1.5 : 1,
                      borderColor: isActive
                        ? pen.type === 'eraser'
                          ? '#999'
                          : theme.primary
                        : theme.borderLight,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 16 }}>{pen.icon}</Text>
                    <Text
                      style={{
                        fontFamily: isActive ? Fonts.bold : Fonts.medium,
                        fontSize: 12,
                        color: isActive
                          ? pen.type === 'eraser'
                            ? '#666'
                            : theme.primary
                          : theme.textSecondary,
                      }}
                    >
                      {pen.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Eraser size selector (shown when eraser is active) */}
          {isEraser ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.medium,
                  fontSize: 11,
                  color: theme.textSecondary,
                }}
              >
                消しゴムサイズ
              </Text>
              {ERASER_SIZES.map((size) => {
                const isActive = eraserSize === size;
                return (
                  <Pressable
                    key={size}
                    onPress={() => onChangeEraserSize(size)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isActive ? '#F0F0F0' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: isActive ? 1.5 : 0,
                      borderColor: '#999',
                    }}
                  >
                    <View
                      style={{
                        width: Math.min(size * 0.6, 24),
                        height: Math.min(size * 0.6, 24),
                        borderRadius: Math.min(size * 0.3, 12),
                        backgroundColor: '#DDD',
                        borderWidth: 1,
                        borderColor: '#BBB',
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <>
              {/* Brush size selector */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 11,
                    color: theme.textSecondary,
                  }}
                >
                  太さ
                </Text>
                {BRUSH_SIZES.map((size) => {
                  const isActive = drawSize === size;
                  return (
                    <Pressable
                      key={size}
                      onPress={() => onChangeDrawSize(size)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isActive ? theme.primaryLight : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: isActive ? 1.5 : 0,
                        borderColor: theme.primary,
                      }}
                    >
                      <View
                        style={{
                          width: size + 4,
                          height: size + 4,
                          borderRadius: (size + 4) / 2,
                          backgroundColor: drawColor,
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>

              {/* Color palette */}
              <ColorPicker selectedColor={drawColor} onSelectColor={onChangeDrawColor} />
            </>
          )}
        </Animated.View>
      )}

      {/* Main toolbar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.surface,
          paddingVertical: 8,
          paddingHorizontal: 8,
          gap: 4,
          boxShadow:
            activeMode !== 'draw' || !showDrawOptions
              ? `0 -2px 12px ${theme.shadow}`
              : 'none',
        }}
      >
        {/* Select/move tool */}
        <ToolButton
          icon="move"
          label="移動"
          isActive={activeMode === 'select'}
          onPress={() => {
            onChangeMode('select');
            setShowDrawOptions(false);
          }}
          theme={theme}
        />

        {/* Tool buttons */}
        {tools.map((tool) => (
          <ToolButton
            key={tool.mode}
            icon={tool.icon}
            label={tool.label}
            isActive={activeMode === tool.mode}
            onPress={() => {
              if (tool.mode === 'draw') {
                onChangeMode('draw');
                setShowDrawOptions((prev) => (activeMode === 'draw' ? !prev : true));
              } else {
                setShowDrawOptions(false);
                if (tool.action) tool.action();
              }
            }}
            theme={theme}
            badge={
              tool.mode === 'draw' && activeMode === 'draw'
                ? isEraser
                  ? '#CCCCCC'
                  : drawColor
                : undefined
            }
          />
        ))}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Undo */}
        <ToolButton
          icon="arrow-undo"
          label="戻す"
          isActive={false}
          onPress={onUndo}
          theme={theme}
        />
      </View>
    </View>
  );
}

function ToolButton({
  icon,
  label,
  isActive,
  onPress,
  theme,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderCurve: 'continuous',
        backgroundColor: isActive ? theme.primaryLight : 'transparent',
        minWidth: 48,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ position: 'relative' }}>
        <Ionicons
          name={icon}
          size={22}
          color={isActive ? theme.primary : theme.textSecondary}
        />
        {badge && (
          <View
            style={{
              position: 'absolute',
              top: -3,
              right: -5,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: badge,
              borderWidth: 1.5,
              borderColor: theme.surface,
            }}
          />
        )}
      </View>
      <Text
        style={{
          fontFamily: Fonts.medium,
          fontSize: 10,
          color: isActive ? theme.primary : theme.textMuted,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
