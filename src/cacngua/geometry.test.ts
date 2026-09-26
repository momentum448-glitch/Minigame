import { describe, expect, it } from 'vitest';
import {
  BOARD_CENTER,
  TRACK_POINTS,
  gatePoint,
  homeLanePoint,
  trackPoint,
  yardPoint
} from './geometry';

describe('Cờ cá ngựa square-board geometry', () => {
  it('maps all 56 track indices to unique square-perimeter points', () => {
    expect(TRACK_POINTS).toHaveLength(56);
    const unique = new Set(TRACK_POINTS.map((point) => `${point.x},${point.y}`));
    expect(unique.size).toBe(56);
  });

  it('puts the four stable gates on the four side midpoints', () => {
    const top = gatePoint(0);
    const right = gatePoint(1);
    const bottom = gatePoint(2);
    const left = gatePoint(3);

    expect(top.y).toBeLessThan(BOARD_CENTER);
    expect(right.x).toBeGreaterThan(BOARD_CENTER);
    expect(bottom.y).toBeGreaterThan(BOARD_CENTER);
    expect(left.x).toBeLessThan(BOARD_CENTER);

    expect(top.x).toBe(BOARD_CENTER);
    expect(right.y).toBe(BOARD_CENTER);
    expect(bottom.x).toBe(BOARD_CENTER);
    expect(left.y).toBe(BOARD_CENTER);
  });

  it('moves home ranks monotonically from each gate toward board center', () => {
    for (const seat of [0, 1, 2, 3] as const) {
      const gate = homeLanePoint(seat, 0);
      const rank1 = homeLanePoint(seat, 1);
      const rank6 = homeLanePoint(seat, 6);
      const gateDistance = Math.hypot(gate.x - BOARD_CENTER, gate.y - BOARD_CENTER);
      const rank1Distance = Math.hypot(rank1.x - BOARD_CENTER, rank1.y - BOARD_CENTER);
      const rank6Distance = Math.hypot(rank6.x - BOARD_CENTER, rank6.y - BOARD_CENTER);
      expect(rank1Distance).toBeLessThan(gateDistance);
      expect(rank6Distance).toBeLessThan(rank1Distance);
    }
  });

  it('keeps yard horses inside their respective board quadrants', () => {
    expect(yardPoint(0, 0).x).toBeLessThan(BOARD_CENTER);
    expect(yardPoint(0, 0).y).toBeLessThan(BOARD_CENTER);
    expect(yardPoint(1, 0).x).toBeGreaterThan(BOARD_CENTER);
    expect(yardPoint(1, 0).y).toBeLessThan(BOARD_CENTER);
    expect(yardPoint(2, 0).x).toBeGreaterThan(BOARD_CENTER);
    expect(yardPoint(2, 0).y).toBeGreaterThan(BOARD_CENTER);
    expect(yardPoint(3, 0).x).toBeLessThan(BOARD_CENTER);
    expect(yardPoint(3, 0).y).toBeGreaterThan(BOARD_CENTER);
  });

  it('wraps arbitrary track indices safely', () => {
    expect(trackPoint(56)).toEqual(trackPoint(0));
    expect(trackPoint(-1)).toEqual(trackPoint(55));
  });
});
