import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppColorPalette } from '../constants/themePalettes';

const PATTERN_ICONS = [
  'phone-portrait-outline',
  'tablet-portrait-outline',
  'watch-outline',
  'headset-outline',
  'cart-outline',
  'gift-outline',
  'flash-outline',
  'battery-charging-outline',
  'bluetooth-outline',
  'wifi-outline',
  'hardware-chip-outline',
  'camera-outline',
] as const;

const GRADIENT_STRIP_COUNT = 56;

type PatternCell = {
  x: number;
  y: number;
  icon: (typeof PATTERN_ICONS)[number];
  rotation: number;
  size: number;
  opacity: number;
};

type Props = {
  colors: AppColorPalette;
  width: number;
  height: number;
};

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map(char => char + char)
          .join('')
      : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function mixHexColors(from: string, to: string, amount: number) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const ratio = Math.min(1, Math.max(0, amount));

  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

function gradientColorAt(progress: number, top: string, middle: string, bottom: string) {
  if (progress <= 0.5) {
    return mixHexColors(top, middle, progress / 0.5);
  }

  return mixHexColors(middle, bottom, (progress - 0.5) / 0.5);
}

function buildPatternCells(width: number, height: number): PatternCell[] {
  const cellWidth = 76;
  const cellHeight = 76;
  const cols = Math.ceil(width / cellWidth) + 1;
  const rows = Math.ceil(height / cellHeight) + 1;
  const cells: PatternCell[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      cells.push({
        x: col * cellWidth + (row % 2 === 0 ? 0 : 24),
        y: row * cellHeight + (col % 2 === 0 ? 8 : 0),
        icon: PATTERN_ICONS[index % PATTERN_ICONS.length],
        rotation: ((index % 5) - 2) * 11,
        size: 15 + (index % 4) * 3,
        opacity: 0.05 + (index % 5) * 0.015,
      });
    }
  }

  return cells;
}

function buildGradientStrips(top: string, middle: string, bottom: string) {
  const stripHeight = 100 / GRADIENT_STRIP_COUNT;

  return Array.from({ length: GRADIENT_STRIP_COUNT }, (_, index) => {
    const progress = index / (GRADIENT_STRIP_COUNT - 1);

    return {
      top: `${index * stripHeight}%`,
      height: `${stripHeight + 0.8}%`,
      color: gradientColorAt(progress, top, middle, bottom),
    };
  });
}

export function ScreenBackground({ colors, width, height }: Props) {
  const cells = buildPatternCells(width, height);
  const gradientStrips = buildGradientStrips(
    colors.homeBackgroundTop,
    colors.homeBackground,
    colors.homeBackgroundBottom,
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
      {gradientStrips.map((strip, index) => (
        <View
          key={`gradient-${index}`}
          style={[
            styles.gradientStrip,
            {
              top: strip.top,
              height: strip.height,
              backgroundColor: strip.color,
            },
          ]}
        />
      ))}

      {cells.map((cell, index) => (
        <View
          key={`${cell.x}-${cell.y}-${index}`}
          style={[
            styles.patternIcon,
            {
              left: cell.x,
              top: cell.y,
              transform: [{ rotate: `${cell.rotation}deg` }],
            },
          ]}>
          <Ionicons
            name={cell.icon}
            size={cell.size}
            color={colors.homeBackgroundPattern}
            style={{ opacity: cell.opacity }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gradientStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  patternIcon: {
    position: 'absolute',
  },
});
