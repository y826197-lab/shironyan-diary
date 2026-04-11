import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ui/use-theme';
import { Fonts } from '@/constants/Typography';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const tabBarHeight = Math.max(56, 56 + insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontFamily: Fonts.medium,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.borderLight,
          borderTopWidth: 1,
          paddingBottom: insets.bottom || 4,
          paddingTop: 4,
          height: tabBarHeight,
          minHeight: 56,
          boxShadow: '0 -2px 12px rgba(249, 168, 201, 0.15)',
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'カレンダー',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pages"
        options={{
          title: 'ページ一覧',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
