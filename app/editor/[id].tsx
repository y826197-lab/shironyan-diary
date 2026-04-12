import { View, Text, TextInput, Pressable, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback, useRef, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { useDiaryStore } from '@/store/useDiaryStore';
import { persistImage } from '@/utils/image-storage';
import { CanvasElementView } from '@/components/editor/canvas-element';
import { CanvasBackground } from '@/components/editor/canvas-background';
import { DrawingLayer } from '@/components/editor/drawing-layer';
import { Toolbar, type ToolMode } from '@/components/editor/toolbar';
import { TextEditorModal } from '@/components/editor/text-editor-modal';
import type { PenType } from '@/store/types';

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const pages = useDiaryStore((s) => s.pages);
  const updatePage = useDiaryStore((s) => s.updatePage);
  const addElement = useDiaryStore((s) => s.addElement);
  const updateElement = useDiaryStore((s) => s.updateElement);
  const removeElement = useDiaryStore((s) => s.removeElement);
  const addStroke = useDiaryStore((s) => s.addStroke);
  const removeLastStroke = useDiaryStore((s) => s.removeLastStroke);

  const page = useMemo(() => pages.find((p) => p.id === id), [pages, id]);

  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [drawColor, setDrawColor] = useState('#5C4A6E');
  const [drawSize, setDrawSize] = useState(4);
  const [penType, setPenType] = useState<PenType>('pen');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(page?.title || '');

  // Use refs for drawing state to avoid stale closures in gesture handlers
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const isDrawing = useRef(false);

  // Canvas dimensions - fill available space
  const canvasWidth = screenWidth;
  const headerHeight = insets.top + 90;
  const toolbarHeight = 64 + insets.bottom;
  const canvasHeight = Math.max(500, screenHeight - headerHeight - toolbarHeight);

  // Canvas pan/zoom
  const canvasScale = useSharedValue(1);
  const canvasTranslateY = useSharedValue(0);

  const handleSave = useCallback(() => {
    if (page && titleText !== page.title) {
      updatePage(page.id, { title: titleText });
    }
    router.back();
  }, [page, titleText, updatePage, router]);

  const handlePickPhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0] && id) {
        const asset = result.assets[0];
        const aspectRatio = (asset.width || 200) / (asset.height || 200);
        const photoWidth = 180;
        const photoHeight = photoWidth / aspectRatio;

        // Copy image to persistent storage so it survives app restarts
        const permanentUri = await persistImage(asset.uri);

        addElement(id, {
          type: 'photo',
          x: 60 + Math.random() * 60,
          y: 60 + Math.random() * 60,
          width: photoWidth,
          height: photoHeight,
          rotation: (Math.random() - 0.5) * 0.15,
          content: permanentUri,
        });
      }
    } catch {
      Alert.alert('エラー', '写真の読み込みに失敗しました');
    }
  }, [id, addElement]);

  const handleAddSticker = useCallback(() => {
    router.push({ pathname: '/sticker-picker', params: { pageId: id } });
  }, [router, id]);

  const handleAddText = useCallback(() => {
    setShowTextEditor(true);
  }, []);

  const handleSaveText = useCallback(
    (text: string, fontSize: number, fontColor: string) => {
      if (id && text.trim()) {
        addElement(id, {
          type: 'text',
          x: 40 + Math.random() * 80,
          y: 80 + Math.random() * 80,
          width: Math.min(screenWidth - 80, Math.max(120, text.length * fontSize * 0.6)),
          height: Math.max(40, Math.ceil(text.length / 15) * fontSize * 1.5 + 16),
          rotation: 0,
          content: text,
          fontSize,
          fontColor,
        });
      }
    },
    [id, addElement, screenWidth]
  );

  const handleUndo = useCallback(() => {
    if (id) removeLastStroke(id);
  }, [id, removeLastStroke]);

  const getOpacityForPen = useCallback((type: PenType) => {
    switch (type) {
      case 'highlighter': return 0.35;
      case 'marker': return 0.7;
      case 'neon': return 0.9;
      default: return 1;
    }
  }, []);

  const finishStroke = useCallback((pts: { x: number; y: number }[]) => {
    if (id && pts.length > 1) {
      addStroke(id, {
        penType,
        color: drawColor,
        size: drawSize,
        points: pts,
        opacity: getOpacityForPen(penType),
      });
    }
    pointsRef.current = [];
    setCurrentPoints([]);
  }, [id, penType, drawColor, drawSize, addStroke, getOpacityForPen]);

  // Drawing gesture using ref to avoid stale closure
  const drawGesture = Gesture.Pan()
    .enabled(toolMode === 'draw')
    .minDistance(1)
    .onStart((event) => {
      isDrawing.current = true;
      const newPoints = [{ x: event.x, y: event.y }];
      pointsRef.current = newPoints;
      runOnJS(setCurrentPoints)(newPoints);
    })
    .onUpdate((event) => {
      if (isDrawing.current) {
        const newPoint = { x: event.x, y: event.y };
        pointsRef.current = [...pointsRef.current, newPoint];
        runOnJS(setCurrentPoints)([...pointsRef.current]);
      }
    })
    .onEnd(() => {
      isDrawing.current = false;
      const pts = [...pointsRef.current];
      runOnJS(finishStroke)(pts);
    });

  const handleDeselectAll = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  const canvasAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: canvasScale.value },
      { translateY: canvasTranslateY.value },
    ],
  }));

  if (!page) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <Text style={{ fontSize: 48 }}>😢</Text>
        <Text
          style={{
            fontFamily: Fonts.medium,
            fontSize: 16,
            color: theme.textSecondary,
            marginTop: 12,
          }}
        >
          ページが見つかりません
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
            backgroundColor: theme.primary,
          }}
        >
          <Text style={{ fontFamily: Fonts.bold, fontSize: 14, color: '#FFF' }}>
            戻る
          </Text>
        </Pressable>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 4,
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: theme.surface,
          boxShadow: `0 2px 8px ${theme.shadow}`,
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Back */}
          <Pressable
            onPress={handleSave}
            hitSlop={12}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>

          {/* Date */}
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 13,
              color: theme.textSecondary,
            }}
          >
            {formatDate(page.date)}
          </Text>

          {/* Background picker + Save */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => router.push({ pathname: '/background-picker', params: { pageId: id } })}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.background,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="color-palette-outline" size={18} color={theme.text} />
            </Pressable>

            <Pressable
              onPress={handleSave}
              hitSlop={8}
              style={{
                paddingHorizontal: 16,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: Fonts.bold, fontSize: 13, color: '#FFF' }}>
                保存
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Title */}
        {editingTitle ? (
          <TextInput
            value={titleText}
            onChangeText={setTitleText}
            onBlur={() => {
              setEditingTitle(false);
              if (titleText !== page.title) {
                updatePage(page.id, { title: titleText });
              }
            }}
            autoFocus
            placeholder="タイトルを入力..."
            placeholderTextColor={theme.textMuted}
            style={{
              fontFamily: Fonts.bold,
              fontSize: 18,
              color: theme.text,
              marginTop: 8,
              padding: 4,
              borderBottomWidth: 1.5,
              borderBottomColor: theme.primary,
            }}
          />
        ) : (
          <Pressable onPress={() => setEditingTitle(true)} style={{ marginTop: 8 }}>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 18,
                color: page.title ? theme.text : theme.textMuted,
              }}
            >
              {page.title || 'タイトルをタップして入力... ✏️'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Canvas area with scroll for tall canvases */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: canvasHeight }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={toolMode === 'select'}
      >
        <GestureDetector gesture={drawGesture}>
          <Animated.View
            style={[
              {
                width: canvasWidth,
                minHeight: canvasHeight,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              },
              canvasAnimatedStyle,
            ]}
          >
            {/* Background pattern */}
            <CanvasBackground type={page.background} width={canvasWidth} height={canvasHeight} />

            {/* Drawing layer */}
            <DrawingLayer
              strokes={page.strokes}
              currentStroke={
                currentPoints.length > 0
                  ? {
                      points: currentPoints,
                      color: drawColor,
                      size: drawSize,
                      penType,
                      opacity: getOpacityForPen(penType),
                    }
                  : null
              }
              width={canvasWidth}
              height={canvasHeight}
            />

            {/* Tap empty space to deselect */}
            {toolMode === 'select' && (
              <Pressable
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                onPress={handleDeselectAll}
              />
            )}

            {/* Canvas elements */}
            {page.elements.map((element) => (
              <CanvasElementView
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                onSelect={() => setSelectedElementId(element.id)}
                onUpdate={(updates) => updateElement(page.id, element.id, updates)}
                onRemove={() => {
                  removeElement(page.id, element.id);
                  setSelectedElementId(null);
                }}
                drawingMode={toolMode === 'draw'}
              />
            ))}

            {/* Drawing mode indicator overlay */}
            {toolMode === 'draw' && (
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: 'rgba(249,168,201,0.85)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                }}
                pointerEvents="none"
              >
                <Text style={{ fontFamily: Fonts.medium, fontSize: 11, color: '#FFF' }}>
                  ✏️ 描画モード
                </Text>
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      </ScrollView>

      {/* Bottom Toolbar */}
      <View style={{ paddingBottom: insets.bottom }}>
        <Toolbar
          activeMode={toolMode}
          onChangeMode={setToolMode}
          drawColor={drawColor}
          onChangeDrawColor={setDrawColor}
          drawSize={drawSize}
          onChangeDrawSize={setDrawSize}
          penType={penType}
          onChangePenType={setPenType}
          onAddPhoto={handlePickPhoto}
          onAddSticker={handleAddSticker}
          onAddText={handleAddText}
          onUndo={handleUndo}
        />
      </View>

      {/* Text Editor Modal */}
      <TextEditorModal
        visible={showTextEditor}
        onSave={handleSaveText}
        onClose={() => setShowTextEditor(false)}
      />
    </View>
  );
}
