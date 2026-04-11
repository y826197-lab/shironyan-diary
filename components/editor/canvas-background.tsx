import { View } from 'react-native';
import Svg, { Line, Circle, Path, Rect } from 'react-native-svg';
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
    case 'frame-simple':
      return <FrameSimple width={width} height={height} />;
    case 'frame-floral':
      return <FrameFloral width={width} height={height} />;
    case 'frame-ribbon':
      return <FrameRibbon width={width} height={height} />;
    case 'frame-dots':
      return <FrameDots width={width} height={height} />;
    case 'frame-double':
      return <FrameDouble width={width} height={height} />;
    case 'frame-rounded':
      return <FrameRounded width={width} height={height} />;
    case 'frame-hearts':
      return <FrameHearts width={width} height={height} />;
    case 'frame-lace':
      return <FrameLace width={width} height={height} />;
    default:
      return null;
  }
}

// ───────────────────────────────────────
// Original background patterns
// ───────────────────────────────────────

function LinedBackground({ width, height }: { width: number; height: number }) {
  const spacing = 28;
  const lines = [];
  for (let y = spacing; y < height; y += spacing) {
    lines.push(
      <Line key={y} x1={0} y1={y} x2={width} y2={y} stroke="#F0E0EA" strokeWidth={0.8} />
    );
  }
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>
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
      flowers.push(
        <Path
          key={`${x}-${y}`}
          d={`M ${x + offsetX} ${y - 6} Q ${x + offsetX + 4} ${y - 4}, ${x + offsetX + 6} ${y} Q ${x + offsetX + 4} ${y + 4}, ${x + offsetX} ${y + 6} Q ${x + offsetX - 4} ${y + 4}, ${x + offsetX - 6} ${y} Q ${x + offsetX - 4} ${y - 4}, ${x + offsetX} ${y - 6} Z`}
          fill="#F9A8C9"
          opacity={0.08}
        />
      );
      flowers.push(
        <Circle key={`c-${x}-${y}`} cx={x + offsetX} cy={y} r={2} fill="#F9E4A8" opacity={0.15} />
      );
    }
  }
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>{flowers}</Svg>
    </View>
  );
}

// ───────────────────────────────────────
// Frame backgrounds
// ───────────────────────────────────────

const M = 24; // frame margin from canvas edge
const FC = '#F0C0D8'; // primary frame color (soft pink)
const FC2 = '#E0B0D0'; // secondary frame color

function FrameSimple({ width: w, height: h }: { width: number; height: number }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={w} height={h}>
        <Rect x={M} y={M} width={w - M * 2} height={h - M * 2} rx={0} fill="none" stroke={FC} strokeWidth={1.5} opacity={0.6} />
      </Svg>
    </View>
  );
}

function FrameFloral({ width: w, height: h }: { width: number; height: number }) {
  // Simple border + flower decorations in each corner
  const corners = [
    { x: M, y: M },
    { x: w - M, y: M },
    { x: M, y: h - M },
    { x: w - M, y: h - M },
  ];
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={w} height={h}>
        <Rect x={M} y={M} width={w - M * 2} height={h - M * 2} rx={0} fill="none" stroke={FC} strokeWidth={1} opacity={0.4} />
        {corners.map(({ x, y }, i) => (
          <Circle key={`fc-${i}`} cx={x} cy={y} r={0} fill="none">
            {/* Each corner: a small 5-petal flower */}
          </Circle>
        ))}
        {corners.map(({ x, y }, i) => {
          const petals = [];
          for (let a = 0; a < 5; a++) {
            const angle = (a * Math.PI * 2) / 5;
            const px = x + Math.cos(angle) * 7;
            const py = y + Math.sin(angle) * 7;
            petals.push(
              <Circle key={`p-${i}-${a}`} cx={px} cy={py} r={4} fill="#F9A8C9" opacity={0.18} />
            );
          }
          petals.push(
            <Circle key={`cc-${i}`} cx={x} cy={y} r={3} fill="#F9E4A8" opacity={0.25} />
          );
          return petals;
        })}
      </Svg>
    </View>
  );
}

function FrameRibbon({ width: w, height: h }: { width: number; height: number }) {
  // Horizontal ribbon bands at top and bottom
  const bw = 14; // ribbon band width
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={w} height={h}>
        {/* Top ribbon */}
        <Rect x={M - 4} y={M} width={w - M * 2 + 8} height={bw} rx={2} fill="#F9A8C9" opacity={0.15} />
        <Line x1={M} y1={M + bw / 2} x2={w - M} y2={M + bw / 2} stroke="#F9A8C9" strokeWidth={0.8} opacity={0.25} />
        {/* Top ribbon bow */}
        <Path d={`M ${w / 2 - 8} ${M + bw / 2} Q ${w / 2} ${M - 4} ${w / 2 + 8} ${M + bw / 2}`} fill="none" stroke="#F9A8C9" strokeWidth={1.2} opacity={0.3} />
        <Path d={`M ${w / 2 - 8} ${M + bw / 2} Q ${w / 2} ${M + bw + 4} ${w / 2 + 8} ${M + bw / 2}`} fill="none" stroke="#F9A8C9" strokeWidth={1.2} opacity={0.3} />
        <Circle cx={w / 2} cy={M + bw / 2} r={2} fill="#F9A8C9" opacity={0.35} />

        {/* Bottom ribbon */}
        <Rect x={M - 4} y={h - M - bw} width={w - M * 2 + 8} height={bw} rx={2} fill="#F9A8C9" opacity={0.15} />
        <Line x1={M} y1={h - M - bw / 2} x2={w - M} y2={h - M - bw / 2} stroke="#F9A8C9" strokeWidth={0.8} opacity={0.25} />

        {/* Side lines */}
        <Line x1={M} y1={M + bw} x2={M} y2={h - M - bw} stroke={FC} strokeWidth={0.8} opacity={0.3} />
        <Line x1={w - M} y1={M + bw} x2={w - M} y2={h - M - bw} stroke={FC} strokeWidth={0.8} opacity={0.3} />
      </Svg>
    </View>
  );
}

function FrameDots({ width: w, height: h }: { width: number; height: number }) {
  // Dotted line border
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={w} height={h}>
        <Rect
          x={M}
          y={M}
          width={w - M * 2}
          height={h - M * 2}
          rx={0}
          fill="none"
          stroke={FC}
          strokeWidth={2}
          strokeDasharray="4,6"
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}

function FrameDouble({ width: w, height: h }: { width: number; height: number }) {
  // Double-line border
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={w} height={h}>
        <Rect x={M} y={M} width={w - M * 2} height={h - M * 2} rx={0} fill="none" stroke={FC} strokeWidth={1.5} opacity={0.45} />
        <Rect x={M + 5} y={M + 5} width={w - M * 2 - 10} height={h - M * 2 - 10} rx={0} fill="none" stroke={FC2} strokeWidth={0.8} opacity={0.35} />
      </Svg>
    </View>
  );
}

function FrameRounded({ width: w, height: h }: { width: number; height: number }) {
  // Rounded corner frame
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={w} height={h}>
        <Rect x={M} y={M} width={w - M * 2} height={h - M * 2} rx={20} fill="none" stroke={FC} strokeWidth={2} opacity={0.45} />
      </Svg>
    </View>
  );
}

function FrameHearts({ width: w, height: h }: { width: number; height: number }) {
  // Simple border + heart/star decorations at corners
  const corners = [
    { x: M, y: M },
    { x: w - M, y: M },
    { x: M, y: h - M },
    { x: w - M, y: h - M },
  ];
  // Simple heart path centered at (0,0)
  const heartPath = (cx: number, cy: number, s: number) =>
    `M ${cx} ${cy + s * 0.35} ` +
    `C ${cx - s * 0.5} ${cy - s * 0.3}, ${cx - s} ${cy + s * 0.1}, ${cx} ${cy + s * 0.8} ` +
    `C ${cx + s} ${cy + s * 0.1}, ${cx + s * 0.5} ${cy - s * 0.3}, ${cx} ${cy + s * 0.35} Z`;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={w} height={h}>
        <Rect x={M} y={M} width={w - M * 2} height={h - M * 2} rx={0} fill="none" stroke={FC} strokeWidth={1} opacity={0.35} />
        {corners.map(({ x, y }, i) => (
          <Path key={`h-${i}`} d={heartPath(x, y, 8)} fill="#F9A8C9" opacity={0.3} />
        ))}
        {/* Mid-side decorations */}
        <Path d={heartPath(w / 2, M, 6)} fill="#F9A8C9" opacity={0.2} />
        <Path d={heartPath(w / 2, h - M, 6)} fill="#F9A8C9" opacity={0.2} />
        <Path d={heartPath(M, h / 2, 6)} fill="#F9A8C9" opacity={0.2} />
        <Path d={heartPath(w - M, h / 2, 6)} fill="#F9A8C9" opacity={0.2} />
      </Svg>
    </View>
  );
}

function FrameLace({ width: w, height: h }: { width: number; height: number }) {
  // Lace-like scalloped border
  const elements = [];
  const sp = 12; // scallop spacing
  const r = sp / 2.5; // scallop radius

  // Top edge scallops
  for (let x = M; x < w - M; x += sp) {
    elements.push(
      <Path key={`t-${x}`} d={`M ${x} ${M} A ${r} ${r} 0 0 1 ${x + sp} ${M}`} fill="none" stroke={FC} strokeWidth={1} opacity={0.4} />
    );
  }
  // Bottom edge scallops
  for (let x = M; x < w - M; x += sp) {
    elements.push(
      <Path key={`b-${x}`} d={`M ${x} ${h - M} A ${r} ${r} 0 0 0 ${x + sp} ${h - M}`} fill="none" stroke={FC} strokeWidth={1} opacity={0.4} />
    );
  }
  // Left edge scallops
  for (let y = M; y < h - M; y += sp) {
    elements.push(
      <Path key={`l-${y}`} d={`M ${M} ${y} A ${r} ${r} 0 0 0 ${M} ${y + sp}`} fill="none" stroke={FC} strokeWidth={1} opacity={0.4} />
    );
  }
  // Right edge scallops
  for (let y = M; y < h - M; y += sp) {
    elements.push(
      <Path key={`r-${y}`} d={`M ${w - M} ${y} A ${r} ${r} 0 0 1 ${w - M} ${y + sp}`} fill="none" stroke={FC} strokeWidth={1} opacity={0.4} />
    );
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={w} height={h}>{elements}</Svg>
    </View>
  );
}
