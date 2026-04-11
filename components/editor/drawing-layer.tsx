import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import type { DrawingStroke, PenType } from '@/store/types';

interface StrokeLike {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  penType: PenType;
  opacity: number;
}

interface DrawingLayerProps {
  strokes: DrawingStroke[];
  currentStroke: StrokeLike | null;
  width: number;
  height: number;
}

function pointsToSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    path += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;
  return path;
}

function getStrokeProps(penType: PenType, size: number) {
  switch (penType) {
    case 'pen':
      return { strokeWidth: size, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: '' };
    case 'marker':
      return { strokeWidth: size * 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: '' };
    case 'highlighter':
      return { strokeWidth: size * 3, strokeLinecap: 'butt' as const, strokeLinejoin: 'round' as const, strokeDasharray: '' };
    case 'crayon':
      return { strokeWidth: size * 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: `${size * 0.5} ${size * 0.3}` };
    case 'sparkle':
      return { strokeWidth: size * 0.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: `${size * 0.2} ${size * 0.8}` };
    default:
      return { strokeWidth: size, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: '' };
  }
}

function renderStroke(stroke: DrawingStroke | StrokeLike, key: string) {
  const { strokeWidth, strokeLinecap, strokeLinejoin, strokeDasharray } = getStrokeProps(stroke.penType, stroke.size);

  if (stroke.penType === 'sparkle') {
    return (
      <React.Fragment key={key}>
        <Path
          d={pointsToSvgPath(stroke.points)}
          stroke={stroke.color}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          strokeDasharray={strokeDasharray}
          fill="none"
          opacity={stroke.opacity}
        />
        {stroke.points
          .filter((_, i) => i % 4 === 0)
          .map((p, i) => (
            <Circle
              key={`${key}-dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={stroke.size * 0.4}
              fill={stroke.color}
              opacity={stroke.opacity * 0.6}
            />
          ))}
      </React.Fragment>
    );
  }

  return (
    <Path
      key={key}
      d={pointsToSvgPath(stroke.points)}
      stroke={stroke.color}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeDasharray={strokeDasharray}
      fill="none"
      opacity={stroke.opacity}
    />
  );
}

export function DrawingLayer({ strokes, currentStroke, width, height }: DrawingLayerProps) {
  if (width === 0 || height === 0) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
      }}
      pointerEvents="none"
    >
      <Svg width={width} height={height}>
        {strokes.map((stroke, i) => renderStroke(stroke, `stroke-${i}`))}
        {currentStroke && currentStroke.points.length > 0 && renderStroke(currentStroke, 'current')}
      </Svg>
    </View>
  );
}
