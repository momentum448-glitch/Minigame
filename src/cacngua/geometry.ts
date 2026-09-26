import type { HorseSeat } from './types';

export interface BoardPoint {
  x: number;
  y: number;
}

export interface BoardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const BOARD_SIZE = 700;
export const BOARD_CENTER = 350;
export const TRACK_GRID_ORIGIN = 84;
export const TRACK_GRID_STEP = 38;
export const TRACK_CELL_SIZE = 30;

const perimeterGrid: Array<[number, number]> = [
  ...Array.from({ length: 8 }, (_, i) => [7 + i, 0] as [number, number]),
  ...Array.from({ length: 7 }, (_, i) => [14, 1 + i] as [number, number]),
  ...Array.from({ length: 7 }, (_, i) => [14, 8 + i] as [number, number]),
  ...Array.from({ length: 7 }, (_, i) => [13 - i, 14] as [number, number]),
  ...Array.from({ length: 7 }, (_, i) => [6 - i, 14] as [number, number]),
  ...Array.from({ length: 7 }, (_, i) => [0, 13 - i] as [number, number]),
  ...Array.from({ length: 7 }, (_, i) => [0, 6 - i] as [number, number]),
  ...Array.from({ length: 6 }, (_, i) => [1 + i, 0] as [number, number])
];

export const TRACK_POINTS: BoardPoint[] = perimeterGrid.map(([column, row]) => ({
  x: TRACK_GRID_ORIGIN + column * TRACK_GRID_STEP,
  y: TRACK_GRID_ORIGIN + row * TRACK_GRID_STEP
}));

export const GATE_SEAT_BY_INDEX: Partial<Record<number, HorseSeat>> = {
  0: 0,
  14: 1,
  28: 2,
  42: 3
};

export const YARD_RECTS: Record<HorseSeat, BoardRect> = {
  0: { x: 128, y: 128, width: 168, height: 168 },
  1: { x: 404, y: 128, width: 168, height: 168 },
  2: { x: 404, y: 404, width: 168, height: 168 },
  3: { x: 128, y: 404, width: 168, height: 168 }
};

export const YARD_CENTERS: Record<HorseSeat, BoardPoint> = {
  0: { x: 212, y: 212 },
  1: { x: 488, y: 212 },
  2: { x: 488, y: 488 },
  3: { x: 212, y: 488 }
};

const YARD_OFFSETS: BoardPoint[] = [
  { x: -34, y: -34 },
  { x: 34, y: -34 },
  { x: -34, y: 34 },
  { x: 34, y: 34 }
];

export function trackPoint(index: number): BoardPoint {
  const normalized = ((index % TRACK_POINTS.length) + TRACK_POINTS.length) % TRACK_POINTS.length;
  return TRACK_POINTS[normalized];
}

export function gatePoint(seat: HorseSeat): BoardPoint {
  return trackPoint(seat * 14);
}

export function homeLanePoint(seat: HorseSeat, rank: number): BoardPoint {
  const gate = gatePoint(seat);
  if (rank <= 0) return gate;

  const clampedRank = Math.min(6, rank);
  const t = clampedRank / 7;
  return {
    x: gate.x + (BOARD_CENTER - gate.x) * t,
    y: gate.y + (BOARD_CENTER - gate.y) * t
  };
}

export function yardPoint(seat: HorseSeat, horseIndex: number): BoardPoint {
  const center = YARD_CENTERS[seat];
  const offset = YARD_OFFSETS[horseIndex] ?? { x: 0, y: 0 };
  return {
    x: center.x + offset.x,
    y: center.y + offset.y
  };
}

export function quadraticArcPath(
  from: BoardPoint,
  to: BoardPoint,
  lift = 118
): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  const preferredSign = midY > BOARD_CENTER ? -1 : 1;
  const controlX = midX + normalX * lift * preferredSign;
  const controlY = midY + normalY * lift * preferredSign;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}
