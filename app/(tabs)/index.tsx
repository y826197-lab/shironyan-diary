import { View, Text, ScrollView, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback, useMemo, useRef } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Fonts } from '@/constants/Typography';
import { useTheme } from '@/components/ui/use-theme';
import { GradientBackground } from '@/components/ui/gradient-background';
import { CuteCard } from '@/components/ui/cute-card';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { useDiaryStore } from '@/store/useDiaryStore';
import { useAppStore } from '@/store/useAppStore';

const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

const SEASON_EMOJI: Record<number, string> = {
  0: '❄️', 1: '❄️', 2: '🌸',
  3: '🌸', 4: '🌿', 5: '🌿',
  6: '☀️', 7: '☀️', 8: '🍂',
  9: '🍂', 10: '🎄', 11: '🎄',
};

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const pages = useDiaryStore((s) => s.pages);
  const createPage = useDiaryStore((s) => s.createPage);
  const customTitle = useAppStore((s) => s.customTitle);
  const setCustomTitle = useAppStore((s) => s.setCustomTitle);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    now.toISOString().split('T')[0]
  );

  // Title editing state
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [titleInput, setTitleInput] = useState(customTitle);
  const titleInputRef = useRef<TextInput>(null);

  const datesWithEntries = useMemo(() => new Set(pages.map((p) => p.date)), [pages]);

  const selectedDatePages = useMemo(
    () => (selectedDate ? pages.filter((p) => p.date === selectedDate) : []),
    [selectedDate, pages]
  );

  const handlePrevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const handleNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const handleCreateForDate = useCallback(() => {
    const date = selectedDate || new Date().toISOString().split('T')[0];
    const id = createPage('', date);
    router.push(`/editor/${id}`);
  }, [selectedDate, createPage, router]);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const handleTitlePress = useCallback(() => {
    setTitleInput(customTitle);
    setTitleModalVisible(true);
    // Focus input after modal opens
    setTimeout(() => titleInputRef.current?.focus(), 150);
  }, [customTitle]);

  const handleSaveTitle = useCallback(() => {
    const trimmed = titleInput.trim();
    setCustomTitle(trimmed || 'ひびのき');
    setTitleModalVisible(false);
  }, [titleInput, setCustomTitle]);

  const isThisMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <GradientBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 24,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — tappable to edit title */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={{ alignItems: 'center', gap: 2 }}
        >
          <Text style={{ fontSize: 28, lineHeight: 36 }}>🌸</Text>
          <Pressable
            onPress={handleTitlePress}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              borderCurve: 'continuous',
              backgroundColor: pressed ? theme.primaryLight : 'transparent',
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 26,
                color: theme.text,
                letterSpacing: 3,
              }}
            >
              {customTitle}
            </Text>
            <Ionicons name="pencil" size={14} color={theme.textMuted} style={{ marginTop: 2 }} />
          </Pressable>
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 11,
              color: theme.textMuted,
              letterSpacing: 2,
              marginTop: 2,
            }}
          >
            HIBINOKI DIARY
          </Text>
        </Animated.View>

        {/* Month Calendar Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <CuteCard padding={20}>
            {/* Month navigation */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Pressable
                onPress={handlePrevMonth}
                hitSlop={12}
                style={({ pressed }) => ({
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: theme.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="chevron-back" size={18} color={theme.text} />
              </Pressable>

              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 18,
                    color: theme.text,
                  }}
                >
                  {SEASON_EMOJI[month]} {year}年 {MONTH_NAMES[month]}
                </Text>
                {isThisMonth && (
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 10,
                      color: theme.primary,
                      marginTop: 2,
                    }}
                  >
                    今月
                  </Text>
                )}
              </View>

              <Pressable
                onPress={handleNextMonth}
                hitSlop={12}
                style={({ pressed }) => ({
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: theme.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="chevron-forward" size={18} color={theme.text} />
              </Pressable>
            </View>

            <MonthCalendar
              year={year}
              month={month}
              selectedDate={selectedDate}
              datesWithEntries={datesWithEntries}
              onSelectDate={setSelectedDate}
            />

            {/* Quick stats */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 20,
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: theme.borderLight,
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 18,
                    color: theme.primary,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {datesWithEntries.size}
                </Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 10, color: theme.textMuted }}>
                  記録した日
                </Text>
              </View>
              <View style={{ width: 1, height: 28, backgroundColor: theme.borderLight }} />
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 18,
                    color: theme.primary,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {pages.length}
                </Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 10, color: theme.textMuted }}>
                  総ページ
                </Text>
              </View>
            </View>
          </CuteCard>
        </Animated.View>

        {/* Selected date entries section */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 16,
                color: theme.text,
              }}
            >
              {selectedDate ? formatDisplayDate(selectedDate) : '今日'}の記録
            </Text>
            <Pressable
              onPress={handleCreateForDate}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: theme.primary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                borderCurve: 'continuous',
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text
                style={{
                  fontFamily: Fonts.medium,
                  fontSize: 13,
                  color: '#FFF',
                }}
              >
                新規作成
              </Text>
            </Pressable>
          </View>

          {selectedDatePages.length === 0 ? (
            <CuteCard>
              <View style={{ alignItems: 'center', paddingVertical: 28, gap: 12 }}>
                <Text style={{ fontSize: 44 }}>📝</Text>
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 14,
                    color: theme.textSecondary,
                    textAlign: 'center',
                    lineHeight: 22,
                  }}
                >
                  まだ日記がありません{'\n'}タップして書き始めましょう ✨
                </Text>
              </View>
            </CuteCard>
          ) : (
            selectedDatePages.map((page, index) => (
              <Animated.View
                key={page.id}
                entering={FadeInUp.delay(index * 80).springify()}
              >
                <CuteCard
                  onPress={() => router.push(`/editor/${page.id}`)}
                >
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    {/* Thumbnail preview */}
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        borderCurve: 'continuous',
                        backgroundColor: theme.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {page.elements.length > 0 ? (
                        <Text style={{ fontSize: 28 }}>
                          {page.elements.find((e) => e.type === 'sticker')?.content
                            || (page.elements.some((e) => e.type === 'cat-image') ? '🐱'
                            : page.elements.some((e) => e.type === 'deco-text') ? '🔤'
                            : page.elements.some((e) => e.type === 'custom-image') ? '🖼️'
                            : '📄')}
                        </Text>
                      ) : page.strokes.length > 0 ? (
                        <Ionicons name="brush" size={24} color={theme.primary} />
                      ) : (
                        <Text style={{ fontSize: 28 }}>📄</Text>
                      )}
                    </View>

                    <View style={{ flex: 1, gap: 4 }}>
                      <Text
                        style={{
                          fontFamily: Fonts.bold,
                          fontSize: 15,
                          color: theme.text,
                        }}
                        numberOfLines={1}
                      >
                        {page.title || '無題のページ'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {page.elements.length > 0 && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Ionicons name="layers-outline" size={12} color={theme.textMuted} />
                            <Text
                              style={{
                                fontFamily: Fonts.regular,
                                fontSize: 11,
                                color: theme.textSecondary,
                              }}
                            >
                              {page.elements.length}
                            </Text>
                          </View>
                        )}
                        {page.strokes.length > 0 && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Ionicons name="brush-outline" size={12} color={theme.textMuted} />
                            <Text
                              style={{
                                fontFamily: Fonts.regular,
                                fontSize: 11,
                                color: theme.textSecondary,
                              }}
                            >
                              {page.strokes.length}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                  </View>
                </CuteCard>
              </Animated.View>
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* Title Edit Modal */}
      <Modal
        visible={titleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTitleModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable
            onPress={() => setTitleModalVisible(false)}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(92, 74, 110, 0.4)',
            }}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 24,
                borderCurve: 'continuous',
                padding: 28,
                width: 300,
                gap: 20,
                boxShadow: `0 8px 32px rgba(0,0,0,0.18)`,
              }}
            >
              {/* Modal header */}
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 32 }}>✏️</Text>
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 17,
                    color: theme.text,
                  }}
                >
                  タイトルを編集
                </Text>
              </View>

              {/* Text input */}
              <TextInput
                ref={titleInputRef}
                value={titleInput}
                onChangeText={setTitleInput}
                placeholder="ひびのき"
                placeholderTextColor={theme.textMuted}
                maxLength={20}
                selectTextOnFocus
                autoFocus
                onSubmitEditing={handleSaveTitle}
                returnKeyType="done"
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 20,
                  color: theme.text,
                  textAlign: 'center',
                  letterSpacing: 2,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  backgroundColor: theme.background,
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  borderWidth: 2,
                  borderColor: theme.primaryLight,
                }}
              />

              {/* Character count */}
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 11,
                  color: theme.textMuted,
                  textAlign: 'right',
                  marginTop: -14,
                }}
              >
                {titleInput.length}/20
              </Text>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => setTitleModalVisible(false)}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    borderCurve: 'continuous',
                    backgroundColor: theme.background,
                    borderWidth: 1,
                    borderColor: theme.borderLight,
                    alignItems: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 14,
                      color: theme.textSecondary,
                    }}
                  >
                    キャンセル
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveTitle}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    borderCurve: 'continuous',
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.bold,
                      fontSize: 14,
                      color: '#FFF',
                    }}
                  >
                    保存
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </GradientBackground>
  );
}
