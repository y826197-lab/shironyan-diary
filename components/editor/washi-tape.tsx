import { View } from 'react-native';
import Svg, { Rect, Circle, Line, Path } from 'react-native-svg';
import type { WashiTapeSticker } from '@/constants/Stickers';

interface WashiTapeViewProps {
  tape: WashiTapeSticker;
  width: number;
  height: number;
}

/**
 * Renders a masking-tape (washi tape) sticker with patterns.
 * The tape is a horizontal band with semi-transparent look and
 * jagged/torn edges drawn via SVG.
 */
export function WashiTapeView({ tape, width, height }: WashiTapeViewProps) {
  const tapeH = height;
  const tapeW = width;

  return (
    <View style={{ width: tapeW, height: tapeH, opacity: 0.85 }}>
      <Svg width={tapeW} height={tapeH}>
        {/* Base tape body */}
        <Rect x={0} y={0} width={tapeW} height={tapeH} fill={tape.color} rx={1} opacity={0.7} />

        {/* Torn/jagged edge — left */}
        {renderTornEdge(tapeH, 'left', tape.color)}
        {/* Torn/jagged edge — right */}
        {renderTornEdge(tapeH, 'right', tape.color)}

        {/* Pattern overlay */}
        {renderPattern(tape, tapeW, tapeH)}
      </Svg>
    </View>
  );
}

/** Renders a simplified preview of a washi tape for the picker grid */
export function WashiTapePreview({ tape, width, height }: WashiTapeViewProps) {
  return (
    <View style={{ width, height, opacity: 0.88 }}>
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={tape.color} rx={1} opacity={0.7} />
        {renderPattern(tape, width, height)}
      </Svg>
    </View>
  );
}

function renderTornEdge(h: number, side: 'left' | 'right', color: string) {
  const x = side === 'left' ? 0 : -1;
  const points: string[] = [];
  const step = 4;
  for (let y = 0; y <= h; y += step) {
    const jag = (Math.sin(y * 1.3) + Math.cos(y * 0.7)) * 1.5;
    points.push(`${x + jag},${y}`);
  }
  points.push(`${x},${h}`);
  points.push(`${x},0`);
  return (
    <Path
      d={`M ${points.join(' L ')} Z`}
      fill="#FFFFFF"
      opacity={side === 'left' ? 0.5 : 0.5}
      translateX={side === 'right' ? 1 : 0}
    />
  );
}

function renderPattern(tape: WashiTapeSticker, w: number, h: number) {
  const { pattern, secondaryColor } = tape;
  const opacity = 0.55;

  switch (pattern) {
    case 'stripe': {
      const lines = [];
      const spacing = tape.wide ? 6 : 4;
      for (let x = -h; x < w + h; x += spacing) {
        lines.push(
          <Line key={x} x1={x} y1={0} x2={x + h} y2={h} stroke={secondaryColor} strokeWidth={spacing / 2.5} opacity={opacity} />
        );
      }
      return <>{lines}</>;
    }
    case 'dots': {
      const dots = [];
      const sp = tape.wide ? 8 : 6;
      for (let x = sp; x < w; x += sp) {
        for (let y = sp / 2; y < h; y += sp) {
          dots.push(
            <Circle key={`${x}-${y}`} cx={x} cy={y} r={sp / 5} fill={secondaryColor} opacity={opacity} />
          );
        }
      }
      return <>{dots}</>;
    }
    case 'check': {
      const rects = [];
      const sz = tape.wide ? 8 : 5;
      for (let x = 0; x < w; x += sz * 2) {
        for (let y = 0; y < h; y += sz * 2) {
          rects.push(
            <Rect key={`a-${x}-${y}`} x={x} y={y} width={sz} height={sz} fill={secondaryColor} opacity={opacity * 0.7} />
          );
          rects.push(
            <Rect key={`b-${x}-${y}`} x={x + sz} y={y + sz} width={sz} height={sz} fill={secondaryColor} opacity={opacity * 0.7} />
          );
        }
      }
      return <>{rects}</>;
    }
    case 'floral': {
      const flowers = [];
      const sp = tape.wide ? 14 : 10;
      for (let x = sp / 2; x < w; x += sp) {
        for (let y = h / 2; y < h; y += sp) {
          const yy = y > h ? h / 2 : y;
          // Tiny 4-petal flower
          for (let a = 0; a < 4; a++) {
            const angle = (a * Math.PI) / 2;
            const px = x + Math.cos(angle) * 2.5;
            const py = yy + Math.sin(angle) * 2.5;
            flowers.push(
              <Circle key={`p-${x}-${a}`} cx={px} cy={py} r={1.8} fill={secondaryColor} opacity={opacity} />
            );
          }
          flowers.push(
            <Circle key={`c-${x}`} cx={x} cy={yy} r={1} fill={secondaryColor} opacity={0.8} />
          );
        }
      }
      return <>{flowers}</>;
    }
    case 'stars': {
      const stars = [];
      const sp = tape.wide ? 12 : 8;
      for (let x = sp / 2; x < w; x += sp) {
        const y = h / 2 + (Math.sin(x * 0.4) * h * 0.15);
        const sz = 2.5;
        // Simple 4-point star
        stars.push(
          <Path
            key={`s-${x}`}
            d={`M ${x} ${y - sz} L ${x + sz * 0.35} ${y - sz * 0.35} L ${x + sz} ${y} L ${x + sz * 0.35} ${y + sz * 0.35} L ${x} ${y + sz} L ${x - sz * 0.35} ${y + sz * 0.35} L ${x - sz} ${y} L ${x - sz * 0.35} ${y - sz * 0.35} Z`}
            fill={secondaryColor}
            opacity={opacity}
          />
        );
      }
      return <>{stars}</>;
    }
    case 'polka': {
      const dots = [];
      const sp = tape.wide ? 10 : 7;
      for (let x = sp / 2; x < w; x += sp) {
        for (let y = sp / 2; y < h; y += sp) {
          dots.push(
            <Circle key={`${x}-${y}`} cx={x} cy={y} r={sp / 3.2} fill={secondaryColor} opacity={opacity * 0.65} />
          );
        }
      }
      return <>{dots}</>;
    }
    case 'gingham': {
      const rects = [];
      const sz = tape.wide ? 6 : 4;
      for (let x = 0; x < w; x += sz) {
        for (let y = 0; y < h; y += sz) {
          const ix = Math.floor(x / sz);
          const iy = Math.floor(y / sz);
          if ((ix + iy) % 2 === 0) {
            rects.push(
              <Rect key={`g-${x}-${y}`} x={x} y={y} width={sz} height={sz} fill={secondaryColor} opacity={opacity * 0.5} />
            );
          }
        }
      }
      return <>{rects}</>;
    }
    case 'lace': {
      const arcs = [];
      const sp = tape.wide ? 8 : 6;
      // Top scallop edge
      for (let x = 0; x < w; x += sp) {
        arcs.push(
          <Path
            key={`t-${x}`}
            d={`M ${x} 2 Q ${x + sp / 2} ${-2} ${x + sp} 2`}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={1}
            opacity={opacity}
          />
        );
      }
      // Bottom scallop edge
      for (let x = 0; x < w; x += sp) {
        arcs.push(
          <Path
            key={`b-${x}`}
            d={`M ${x} ${h - 2} Q ${x + sp / 2} ${h + 2} ${x + sp} ${h - 2}`}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={1}
            opacity={opacity}
          />
        );
      }
      // Center dotted line
      for (let x = sp / 2; x < w; x += sp) {
        arcs.push(
          <Circle key={`d-${x}`} cx={x} cy={h / 2} r={1} fill={secondaryColor} opacity={opacity * 0.6} />
        );
      }
      return <>{arcs}</>;
    }
    case 'zigzag': {
      const zigs = [];
      const sp = tape.wide ? 8 : 5;
      const amp = h * 0.25;
      const mid = h / 2;
      let d = `M 0 ${mid}`;
      for (let x = 0; x < w; x += sp) {
        const peak = x % (sp * 2) === 0 ? mid - amp : mid + amp;
        d += ` L ${x + sp / 2} ${peak} L ${x + sp} ${mid}`;
      }
      zigs.push(
        <Path key="zig" d={d} fill="none" stroke={secondaryColor} strokeWidth={1.5} opacity={opacity} />
      );
      return <>{zigs}</>;
    }
    case 'solid':
    default: {
      // Subtle horizontal center line
      return (
        <Line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke={secondaryColor} strokeWidth={0.8} opacity={0.3} />
      );
    }
  }
}
