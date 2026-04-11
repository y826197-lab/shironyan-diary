import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView } from 'react-native';
import { useState, useEffect } from 'react';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { ColorPicker } from './color-picker';

const FONT_SIZES = [12, 14, 16, 20, 24, 32];

interface TextEditorModalProps {
  visible: boolean;
  initialText?: string;
  initialFontSize?: number;
  initialFontColor?: string;
  onSave: (text: string, fontSize: number, fontColor: string) => void;
  onClose: () => void;
}

export function TextEditorModal({
  visible,
  initialText = '',
  initialFontSize = 16,
  initialFontColor = '#5C4A6E',
  onSave,
  onClose,
}: TextEditorModalProps) {
  const theme = useTheme();
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [fontColor, setFontColor] = useState(initialFontColor);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setText(initialText);
      setFontSize(initialFontSize);
      setFontColor(initialFontColor);
    }
  }, [visible, initialText, initialFontSize, initialFontColor]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text, fontSize, fontColor);
    }
    setText('');
    onClose();
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
        <View
          style={{
            backgroundColor: theme.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderCurve: 'continuous',
            padding: 20,
            gap: 16,
            boxShadow: `0 -4px 24px ${theme.shadow}`,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text
                style={{
                  fontFamily: Fonts.medium,
                  fontSize: 15,
                  color: theme.textSecondary,
                }}
              >
                キャンセル
              </Text>
            </Pressable>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 16,
                color: theme.text,
              }}
            >
              テキスト追加 ✨
            </Text>
            <Pressable onPress={handleSave} hitSlop={12}>
              <Text
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 15,
                  color: text.trim() ? theme.primary : theme.textMuted,
                }}
              >
                追加
              </Text>
            </Pressable>
          </View>

          {/* Preview line */}
          <View
            style={{
              backgroundColor: theme.background,
              borderRadius: 12,
              borderCurve: 'continuous',
              padding: 12,
              alignItems: 'center',
              minHeight: 40,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize,
                color: fontColor,
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {text || 'プレビュー...'}
            </Text>
          </View>

          {/* Text input */}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="テキストを入力してください..."
            placeholderTextColor={theme.textMuted}
            multiline
            autoFocus
            style={{
              fontFamily: Fonts.regular,
              fontSize: 16,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.borderLight,
              borderRadius: 16,
              borderCurve: 'continuous',
              padding: 16,
              minHeight: 100,
              maxHeight: 180,
              textAlignVertical: 'top',
            }}
          />

          {/* Font size selector */}
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 13,
                color: theme.textSecondary,
              }}
            >
              文字サイズ
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
              {FONT_SIZES.map((size) => {
                const isActive = fontSize === size;
                return (
                  <Pressable
                    key={size}
                    onPress={() => setFontSize(size)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isActive ? theme.primaryLight : theme.background,
                      borderWidth: isActive ? 1.5 : 1,
                      borderColor: isActive ? theme.primary : theme.borderLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: isActive ? Fonts.bold : Fonts.medium,
                        fontSize: 12,
                        color: isActive ? theme.primary : theme.textSecondary,
                      }}
                    >
                      {size}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Color picker */}
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: Fonts.medium,
                fontSize: 13,
                color: theme.textSecondary,
              }}
            >
              文字色
            </Text>
            <ColorPicker selectedColor={fontColor} onSelectColor={setFontColor} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
