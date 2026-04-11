import { View, Text, Pressable } from 'react-native';
// Calendar grid with flower markers for diary entry dates
import { useTheme } from '@/components/ui/use-theme';
import { Fonts } from '@/constants/Typography';
import { Colors } from '@/constants/Colors';
import { useMemo } from 'react';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// Flower markers for days with entries — cycles through cute symbols
const ENTRY_MARKERS = ['🌸', '🌷', '💮', '🌼', '🪻', '🌺', '💐', '🌹'];

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed
  selectedDate: string | null;
  datesWithEntries: Set<string>;
  onSelectDate: (date: string) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function MonthCalendar({
  year,
  month,
  selectedDate,
  datesWithEntries,
  onSelectDate,
}: MonthCalendarProps) {
  const theme = useTheme();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [year, month]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <View>
      {/* Weekday headers */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {WEEKDAYS.map((day, i) => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 11,
                color: i === 0 ? '#E88AB3' : i === 6 ? Colors.secondary : theme.textMuted,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {Array.from({ length: calendarDays.length / 7 }, (_, weekIndex) => (
        <View key={weekIndex} style={{ flexDirection: 'row', marginBottom: 2 }}>
          {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
            if (day === null) {
              return <View key={`empty-${weekIndex}-${dayIndex}`} style={{ flex: 1, height: 48 }} />;
            }

            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasEntry = datesWithEntries.has(dateStr);
            const colIndex = dayIndex;

            // Pick a marker based on the day to give variety
            const markerIndex = day % ENTRY_MARKERS.length;

            return (
              <Pressable
                key={dateStr}
                onPress={() => onSelectDate(dateStr)}
                style={{
                  flex: 1,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected
                      ? theme.primary
                      : isToday
                      ? theme.primaryLight
                      : 'transparent',
                    boxShadow: isSelected ? `0 2px 8px ${theme.shadow}` : 'none',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: isToday || isSelected ? Fonts.bold : Fonts.regular,
                      fontSize: 14,
                      color: isSelected
                        ? '#FFFFFF'
                        : colIndex === 0
                        ? '#E88AB3'
                        : colIndex === 6
                        ? Colors.secondary
                        : theme.text,
                    }}
                  >
                    {day}
                  </Text>
                </View>
                {/* Entry flower marker */}
                {hasEntry && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 1,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 8, lineHeight: 10 }}>
                      {ENTRY_MARKERS[markerIndex]}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
