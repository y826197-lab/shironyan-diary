import { View, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from './use-theme';

interface CuteCardProps {
  children: React.ReactNode;
  style?: object;
  onPress?: () => void;
  padding?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CuteCard({ children, style, onPress, padding = 16 }: CuteCardProps) {
  const theme = useTheme();
  const pressed = useSharedValue(0);

  const cardStyle = {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderCurve: 'continuous' as const,
    padding,
    boxShadow: `0 2px 12px ${theme.shadow}`,
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.97 : 1, { damping: 15 }) }],
    opacity: withSpring(pressed.value ? 0.88 : 1),
  }));

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { pressed.value = 1; }}
        onPressOut={() => { pressed.value = 0; }}
        style={[cardStyle, animatedCardStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
