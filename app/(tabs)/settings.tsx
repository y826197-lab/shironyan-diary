import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { ThemePresets, type ThemeKey } from '@/constants/Colors';
import { useTheme } from '@/components/ui/use-theme';
import { GradientBackground } from '@/components/ui/gradient-background';
import { CuteCard } from '@/components/ui/cute-card';
import { useAppStore } from '@/store/useAppStore';
import { useDiaryStore } from '@/store/useDiaryStore';
import { exportBackup, importBackup } from '@/utils/backup';

const THEME_OPTIONS: { key: ThemeKey; label: string; emoji: string }[] = [
  { key: 'pink', label: 'ピンク', emoji: '🌸' },
  { key: 'lavender', label: 'ラベンダー', emoji: '💜' },
  { key: 'mint', label: 'ミント', emoji: '🍃' },
  { key: 'yellow', label: 'イエロー', emoji: '🌻' },
];

const FONT_SIZES = [
  { scale: 0.85, label: '小', sample: 'あ' },
  { scale: 1, label: '中', sample: 'あ' },
  { scale: 1.15, label: '大', sample: 'あ' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const setTheme = useAppStore((s) => s.setTheme);
  const setFontScale = useAppStore((s) => s.setFontScale);
  const preferences = useAppStore((s) => s.preferences);
  const customTitle = useAppStore((s) => s.customTitle);
  const pages = useDiaryStore((s) => s.pages);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  const totalStrokes = pages.reduce((sum, p) => sum + p.strokes.length, 0);
  const totalPhotos = pages.reduce(
    (sum, p) => sum + p.elements.filter((e) => e.type === 'photo').length,
    0
  );
  const stickerTypes = new Set(['sticker', 'cat-image', 'deco-text', 'custom-image']);
  const totalStickers = pages.reduce(
    (sum, p) => sum + p.elements.filter((e) => stickerTypes.has(e.type)).length,
    0
  );

  const handleClearData = () => {
    Alert.alert(
      'データをクリア',
      'すべての日記データを削除しますか？\nこの操作は取り消せません。',
      [
        { text: 'いいえ', style: 'cancel' },
        {
          text: 'はい',
          style: 'destructive',
          onPress: () => {
            pages.forEach((p) => useDiaryStore.getState().deletePage(p.id));
          },
        },
      ]
    );
  };

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setProgressMessage('');
    try {
      await exportBackup((msg) => setProgressMessage(msg));
      Alert.alert('エクスポート完了', 'バックアップデータを書き出しました。');
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
      Alert.alert('エクスポート失敗', message);
    } finally {
      setIsExporting(false);
      setProgressMessage('');
    }
  }, [isExporting]);

  const handleImport = useCallback(async () => {
    if (isImporting) return;

    // Show confirmation dialog before proceeding
    Alert.alert(
      'データを読み込む',
      '現在のデータを上書きします。よろしいですか？',
      [
        { text: 'いいえ', style: 'cancel' },
        {
          text: 'はい',
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            setProgressMessage('');
            try {
              const success = await importBackup((msg) => setProgressMessage(msg));
              if (success) {
                Alert.alert('インポート完了', 'バックアップデータを正常に復元しました。');
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
              Alert.alert('インポート失敗', message);
            } finally {
              setIsImporting(false);
              setProgressMessage('');
            }
          },
        },
      ]
    );
  }, [isImporting]);

  const isBusy = isExporting || isImporting;

  return (
    <GradientBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 40,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={{ alignItems: 'center', gap: 4 }}
        >
          <Text style={{ fontSize: 32 }}>⚙️</Text>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 22,
              color: theme.text,
            }}
          >
            設定
          </Text>
        </Animated.View>

        {/* Theme Color */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 15,
              color: theme.text,
              paddingLeft: 4,
            }}
          >
            🎨 テーマカラー
          </Text>
          <CuteCard>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {THEME_OPTIONS.map((option) => {
                const isActive = preferences.themeKey === option.key;
                const preset = ThemePresets[option.key];
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setTheme(option.key)}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: 'center',
                      gap: 8,
                      paddingVertical: 14,
                      paddingHorizontal: 4,
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      backgroundColor: isActive ? preset.background : 'transparent',
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? preset.primary : theme.borderLight,
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: preset.primary,
                        borderWidth: isActive ? 3 : 0,
                        borderColor: '#FFF',
                        boxShadow: isActive
                          ? `0 2px 8px ${preset.primary}66`
                          : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isActive && (
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      )}
                    </View>
                    <Text
                      style={{
                        fontFamily: isActive ? Fonts.bold : Fonts.medium,
                        fontSize: 12,
                        color: isActive ? preset.primary : theme.textSecondary,
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </CuteCard>
        </Animated.View>

        {/* Font Size */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 15,
              color: theme.text,
              paddingLeft: 4,
            }}
          >
            🔤 フォントサイズ
          </Text>
          <CuteCard>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {FONT_SIZES.map((fs) => {
                const isActive = preferences.fontScale === fs.scale;
                return (
                  <Pressable
                    key={fs.scale}
                    onPress={() => setFontScale(fs.scale)}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 14,
                      borderRadius: 14,
                      borderCurve: 'continuous',
                      backgroundColor: isActive ? theme.primaryLight : theme.background,
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? theme.primary : theme.borderLight,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.bold,
                        fontSize: 14 * fs.scale,
                        color: isActive ? theme.primary : theme.textSecondary,
                      }}
                    >
                      {fs.sample}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: 12,
                        color: isActive ? theme.primary : theme.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      {fs.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </CuteCard>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 15,
              color: theme.text,
              paddingLeft: 4,
            }}
          >
            📊 統計情報
          </Text>
          <CuteCard>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <StatBubble emoji="📖" value={pages.length} label="ページ" theme={theme} />
              <StatBubble emoji="🖼️" value={totalPhotos} label="写真" theme={theme} />
              <StatBubble emoji="🎀" value={totalStickers} label="ステッカー" theme={theme} />
              <StatBubble emoji="🖌️" value={totalStrokes} label="ストローク" theme={theme} />
            </View>
          </CuteCard>
        </Animated.View>

        {/* Export / Import */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 15,
              color: theme.text,
              paddingLeft: 4,
            }}
          >
            💾 データのバックアップ
          </Text>
          <CuteCard>
            <View style={{ gap: 4 }}>
              {/* Export button */}
              <Pressable
                onPress={handleExport}
                disabled={isBusy}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  opacity: isBusy ? 0.5 : pressed ? 0.7 : 1,
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#E8F5E9',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color="#66BB6A" />
                  ) : (
                    <Ionicons name="cloud-upload-outline" size={18} color="#66BB6A" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 14,
                      color: theme.text,
                    }}
                  >
                    データを書き出す
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 11,
                      color: theme.textMuted,
                    }}
                  >
                    日記・写真・ステッカーをJSONファイルに保存
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </Pressable>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: theme.borderLight, marginHorizontal: 4 }} />

              {/* Import button */}
              <Pressable
                onPress={handleImport}
                disabled={isBusy}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  opacity: isBusy ? 0.5 : pressed ? 0.7 : 1,
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#E3F2FD',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isImporting ? (
                    <ActivityIndicator size="small" color="#42A5F5" />
                  ) : (
                    <Ionicons name="cloud-download-outline" size={18} color="#42A5F5" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 14,
                      color: theme.text,
                    }}
                  >
                    データを読み込む
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 11,
                      color: theme.textMuted,
                    }}
                  >
                    バックアップJSONファイルからデータを復元
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </Pressable>

              {/* Progress message */}
              {progressMessage ? (
                <View
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: theme.primaryLight,
                    borderRadius: 10,
                    borderCurve: 'continuous',
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 12,
                      color: theme.primary,
                      textAlign: 'center',
                    }}
                  >
                    {progressMessage}
                  </Text>
                </View>
              ) : null}
            </View>
          </CuteCard>
        </Animated.View>

        {/* Data Management */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 15,
              color: theme.text,
              paddingLeft: 4,
            }}
          >
            🗂️ データ管理
          </Text>
          <CuteCard>
            <Pressable
              onPress={handleClearData}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 8,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#FDE8E6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#E57373" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.medium,
                    fontSize: 14,
                    color: '#E57373',
                  }}
                >
                  すべてのデータを削除
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 11,
                    color: theme.textMuted,
                  }}
                >
                  日記ページ・ストロークを全て削除します
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </Pressable>
          </CuteCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(700).springify()} style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 15,
              color: theme.text,
              paddingLeft: 4,
            }}
          >
            ℹ️ アプリについて
          </Text>
          <CuteCard>
            <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
              <Text style={{ fontSize: 40 }}>🌸</Text>
              <Text
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 20,
                  color: theme.text,
                  letterSpacing: 2,
                }}
              >
                {customTitle}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 11,
                  color: theme.textMuted,
                  letterSpacing: 2,
                }}
              >
                HIBINOKI DIARY v1.0.0
              </Text>
              <View
                style={{
                  height: 1,
                  width: 60,
                  backgroundColor: theme.borderLight,
                  marginVertical: 6,
                }}
              />
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 12,
                  color: theme.textSecondary,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                かわいいパステル系の日本語日記アプリ{'\n'}
                写真・ステッカー・テキスト・手書きを{'\n'}
                自由に配置できるノート風キャンバス 🎀
              </Text>
            </View>
          </CuteCard>
        </Animated.View>
      </ScrollView>
    </GradientBackground>
  );
}

function StatBubble({
  emoji,
  value,
  label,
  theme,
}: {
  emoji: string;
  value: number;
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '40%',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderCurve: 'continuous',
        backgroundColor: theme.background,
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: Fonts.bold,
          fontSize: 20,
          color: theme.text,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 11,
          color: theme.textSecondary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
