import { View } from 'react-native';
import Svg, { Line, Circle, Path } from 'react-native-svg';
import type { BackgroundType } from '@/store/types';

interface CanvasBackgroundProps {
  type: BackgroundType;
  width: number;
  height: number;
}

export function CanvasBackground({ type, width, height }: CanvasBackgroundProps) {
  if (width === 0 || height === 0) return null;

  switch (type) {
    case 'lined':
      return <LinedBackground width={width} height={height} />;
    case 'grid':
      return <GridBackground width={width} height={height} />;
    case 'dots':
      return <DotsBackground width={width} height={height} />;
    case 'floral':
      return <FloralBackground width={width} height={height} />;
    default:
      return null;
  }
}

function LinedBackground({ width, height }: { width: number; height: number }) {
  const spacing = 28;
  const lines = [];
  for (let y = spacing; y < height; y += spacing) {
    lines.push(
      <Line
        key={y}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="#F0E0EA"
        strokeWidth={0.8}
      />
    );
  }
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>
        {/* Left margin line */}
        <Line x1={40} y1={0} x2={40} y2={height} stroke="#F9A8C9" strokeWidth={0.6} opacity={0.4} />
        {lines}
      </Svg>
    </View>
  );
}

function GridBackground({ width, height }: { width: number; height: number }) {
  const spacing = 24;
  const elements = [];

  for (let x = spacing; x < width; x += spacing) {
    elements.push(
      <Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={height} stroke="#E8DDF2" strokeWidth={0.5} />
    );
  }
  for (let y = spacing; y < height; y += spacing) {
    elements.push(
      <Line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke="#E8DDF2" strokeWidth={0.5} />
    );
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>{elements}</Svg>
    </View>
  );
}

function DotsBackground({ width, height }: { width: number; height: number }) {
  const spacing = 24;
  const dots = [];
  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      dots.push(
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="#D8CCE6" opacity={0.5} />
      );
    }
  }
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>{dots}</Svg>
    </View>
  );
}

function FloralBackground({ width, height }: { width: number; height: number }) {
  const flowers = [];
  const spacing = 80;
  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      const offsetX = (y / spacing) % 2 === 0 ? spacing / 3 : 0;
      // Simple petal shape
      flowers.push(
        <Path
          key={`${x}-${y}`}
          d={`M ${x + offsetX} ${y - 6} Q ${x + offsetX + 4} ${y - 4}, ${x + offsetX + 6} ${y} Q ${x + offsetX + 4} ${y + 4}, ${x + offsetX} ${y + 6} Q ${x + offsetX - 4} ${y + 4}, ${x + offsetX - 6} ${y} Q ${x + offsetX - 4} ${y - 4}, ${x + offsetX} ${y - 6} Z`}
          fill="#F9A8C9"
          opacity={0.08}
        />
      );
      flowers.push(
        <Circle
          key={`c-${x}-${y}`}
          cx={x + offsetX}
          cy={y}
          r={2}
          fill="#F9E4A8"
          opacity={0.15}
        />
      );
    }
  }
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>{flowers}</Svg>
    </View>
  );
}
