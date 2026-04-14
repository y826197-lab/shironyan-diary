import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
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
  eraserPosition?: { x: number; y: number } | null;
  eraserSize?: number;
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

// Generate offset path for crayon texture by shifting points
function offsetPoints(
  points: { x: number; y: number }[],
  dx: number,
  dy: number,
): { x: number; y: number }[] {
  return points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}

function getStrokeProps(penType: string, size: number) {
  switch (penType) {
    case 'pen':
      return { strokeWidth: size, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    case 'marker':
      return { strokeWidth: size * 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    case 'highlighter':
      return { strokeWidth: size * 3, strokeLinecap: 'butt' as const, strokeLinejoin: 'round' as const };
    case 'crayon':
      return { strokeWidth: size * 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    case 'neon':
    case 'sparkle':
      return { strokeWidth: size * 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    case 'shadow':
      return { strokeWidth: size * 1.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    default:
      return { strokeWidth: size, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  }
}

function renderStroke(stroke: DrawingStroke | StrokeLike, key: string) {
  const { strokeWidth, strokeLinecap, strokeLinejoin } = getStrokeProps(stroke.penType, stroke.size);
  const svgPath = pointsToSvgPath(stroke.points);

  // Skip eraser strokes from rendering (they're handled by removing other strokes)
  if (stroke.penType === 'eraser') return null;

  // Neon pen — crisp fluorescent line with subtle glow
  if (stroke.penType === 'neon' || (stroke.penType as string) === 'sparkle') {
    return (
      <G key={key}>
        {/* Subtle outer glow — gentle ambient light */}
        <Path
          d={svgPath}
          stroke={stroke.color}
          strokeWidth={strokeWidth * 2.2}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          fill="none"
          opacity={stroke.opacity * 0.15}
        />
        {/* Main fluorescent line — bright and crisp */}
        <Path
          d={svgPath}
          stroke={stroke.color}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          fill="none"
          opacity={stroke.opacity * 0.9}
        />
        {/* Bright center highlight for neon tube effect */}
        <Path
          d={svgPath}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth * 0.3}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          fill="none"
          opacity={stroke.opacity * 0.5}
        />
      </G>
    );
  }

  // Shadow pen — main stroke with a soft shadow underneath
  if (stroke.penType === 'shadow') {
    return (
      <G key={key}>
        {/* Soft shadow layer — offset and wider */}
        <Path
          d={pointsToSvgPath(offsetPoints(stroke.points, 2.5, 3))}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth={strokeWidth * 1.6}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          fill="none"
          opacity={0.5}
        />
        {/* Second shadow layer — slightly closer */}
        <Path
          d={pointsToSvgPath(offsetPoints(stroke.points, 1.2, 1.5))}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={strokeWidth * 1.3}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          fill="none"
          opacity={0.4}
        />
        {/* Main stroke */}
        <Path
          d={svgPath}
          stroke={stroke.color}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          fill="none"
          opacity={stroke.opacity}
        />
      </G>
    );
  }

  // Crayon pen — rough textured multi-layer strokes
  if (stroke.penType === 'crayon') {
    const offsets = [
      { dx: 0, dy: 0, op: 0.7 },
      { dx: 1.2, dy: 0.6, op: 0.35 },
      { dx: -0.9, dy: 0.8, op: 0.3 },
      { dx: 0.5, dy: -1.0, op: 0.25 },
    ];
    const crayonDash = `${stroke.size * 1.5} ${stroke.size * 0.3} ${stroke.size * 0.4} ${stroke.size * 0.2}`;
    return (
      <G key={key}>
        {offsets.map((o, i) => (
          <Path
            key={`${key}-c-${i}`}
            d={pointsToSvgPath(offsetPoints(stroke.points, o.dx, o.dy))}
            stroke={stroke.color}
            strokeWidth={strokeWidth - i * 0.5}
            strokeLinecap={strokeLinecap}
            strokeLinejoin={strokeLinejoin}
            strokeDasharray={i === 0 ? '' : crayonDash}
            fill="none"
            opacity={stroke.opacity * o.op}
          />
        ))}
        {/* Edge grain — tiny dots along the path edges for texture */}
        {stroke.points
          .filter((_, i) => i % 3 === 0)
          .map((p, i) => {
            const jitterX = ((i * 7) % 5 - 2) * 0.8;
            const jitterY = ((i * 11) % 5 - 2) * 0.6;
            return (
              <Circle
                key={`${key}-grain-${i}`}
                cx={p.x + jitterX + (strokeWidth / 2) * (i % 2 === 0 ? 1 : -1)}
                cy={p.y + jitterY}
                r={stroke.size * 0.15}
                fill={stroke.color}
                opacity={stroke.opacity * 0.2}
              />
            );
          })}
      </G>
    );
  }

  // Default rendering for pen, marker, highlighter
  return (
    <Path
      key={key}
      d={svgPath}
      stroke={stroke.color}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      fill="none"
      opacity={stroke.opacity}
    />
  );
}

export function DrawingLayer({ strokes, currentStroke, width, height, eraserPosition, eraserSize }: DrawingLayerProps) {
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
        {currentStroke && currentStroke.points.length > 0 && currentStroke.penType !== 'eraser' && renderStroke(currentStroke, 'current')}
        {/* Eraser cursor indicator */}
        {eraserPosition && eraserSize && (
          <Circle
            cx={eraserPosition.x}
            cy={eraserPosition.y}
            r={eraserSize}
            fill="rgba(255,255,255,0.5)"
            stroke="#999999"
            strokeWidth={1}
            strokeDasharray="4,3"
          />
        )}
      </Svg>
    </View>
  );
}
