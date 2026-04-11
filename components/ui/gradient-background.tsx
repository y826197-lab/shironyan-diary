import { View, useWindowDimensions } from 'react-native';
import { useTheme } from './use-theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: object;
}

export function GradientBackground({ children, style }: GradientBackgroundProps) {
  const theme = useTheme();
  const { height } = useWindowDimensions();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.background,
        },
        style,
      ]}
    >
      {/* Top gradient overlay — soft pastel wash */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.45,
          experimental_backgroundImage: `linear-gradient(180deg, ${theme.gradientStart}CC, ${theme.background}00)`,
          backgroundColor: theme.gradientStart,
          opacity: 0.7,
        }}
      />
      {/* Bottom accent wash */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.35,
          experimental_backgroundImage: `linear-gradient(0deg, ${theme.gradientEnd}AA, ${theme.background}00)`,
          backgroundColor: theme.gradientEnd,
          opacity: 0.35,
        }}
      />
      {/* Decorative corner orb — very subtle */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: theme.primaryLight,
          opacity: 0.18,
        }}
      />
      {children}
    </View>
  );
}
