import { describe, expect, it } from 'vitest';
import {
  FANORONA_CENTER,
  FANORONA_POINT_COUNT,
  applyFanoronaStep,
  canStopFanoronaChain,
  countFanoronaPieces,
  createInitialFanoronaState,
  fanoronaIndex,
  fanoronaNeighbors,
  legalFanoronaSteps,
  stopFanoronaChain
} from './engine';
import type { FanoronaCell, FanoronaPlayer, FanoronaState } from './types';

function customState(
  pieces: Array<[number, Exclude<FanoronaCell, null>]>,
  currentPlayer: FanoronaPlayer = 0
): FanoronaState {
  const board: FanoronaCell[] = Array(FANORONA_POINT_COUNT).fill(null);
  for (const [index, player] of pieces) board[index] = player;
  return {
    board,
    currentPlayer,
    winner: null,
    drawReason: null,
    turn: 1,
    chain: null,
    lastStep: null,
    lastMessage: '',
    positionHistory: []
  };
}

describe('Fanorona engine', () => {
  it('starts Fanoron-Tsivy with 22 pieces each and the center empty', () => {
    const state = createInitialFanoronaState();
    expect(countFanoronaPieces(state, 0)).toBe(22);
    expect(countFanoronaPieces(state, 1)).toBe(22);
    expect(state.board[FANORONA_CENTER]).toBeNull();
    expect(state.currentPlayer).toBe(0);
  });

  it('allows diagonals only at strong intersections', () => {
    const strong = fanoronaIndex(2, 4);
    const weak = fanoronaIndex(2, 3);
    expect(fanoronaNeighbors(strong)).toContain(fanoronaIndex(1, 3));
    expect(fanoronaNeighbors(weak)).not.toContain(fanoronaIndex(1, 2));
  });

  it('forces a capture when any capture exists', () => {
    const state = customState([
      [fanoronaIndex(2, 2), 0],
      [fanoronaIndex(4, 0), 0],
      [fanoronaIndex(2, 4), 1]
    ]);
    const moves = legalFanoronaSteps(state);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((move) => move.captureMode !== null)).toBe(true);
  });

  it('captures a contiguous line by approach', () => {
    const from = fanoronaIndex(2, 2);
    const to = fanoronaIndex(2, 3);
    const state = customState([
      [from, 0],
      [fanoronaIndex(2, 4), 1],
      [fanoronaIndex(2, 5), 1]
    ]);
    const step = legalFanoronaSteps(state).find((move) => move.from === from && move.to === to && move.captureMode === 'approach');
    expect(step?.captured).toEqual([fanoronaIndex(2, 4), fanoronaIndex(2, 5)]);
  });

  it('captures a contiguous line by withdrawal', () => {
    const from = fanoronaIndex(2, 2);
    const to = fanoronaIndex(2, 3);
    const state = customState([
      [from, 0],
      [fanoronaIndex(2, 1), 1],
      [fanoronaIndex(2, 0), 1]
    ]);
    const step = legalFanoronaSteps(state).find((move) => move.from === from && move.to === to && move.captureMode === 'withdrawal');
    expect(step?.captured).toEqual([fanoronaIndex(2, 1), fanoronaIndex(2, 0)]);
  });

  it('offers approach and withdrawal separately when both are possible', () => {
    const from = fanoronaIndex(2, 2);
    const to = fanoronaIndex(2, 3);
    const state = customState([
      [from, 0],
      [fanoronaIndex(2, 1), 1],
      [fanoronaIndex(2, 4), 1]
    ]);
    const options = legalFanoronaSteps(state).filter((move) => move.from === from && move.to === to);
    expect(options.map((move) => move.captureMode).sort()).toEqual(['approach', 'withdrawal']);
  });

  it('blocks revisits and the same direction during a capture chain', () => {
    const current = fanoronaIndex(2, 3);
    const previous = fanoronaIndex(2, 2);
    const state = customState([
      [current, 0],
      [fanoronaIndex(2, 5), 1],
      [fanoronaIndex(0, 3), 1]
    ]);
    state.chain = {
      piece: current,
      visited: [previous, current],
      lastDirection: '0,1',
      captures: 1
    };
    const moves = legalFanoronaSteps(state);
    expect(moves.some((move) => move.to === previous)).toBe(false);
    expect(moves.some((move) => move.direction === '0,1')).toBe(false);
    expect(moves.some((move) => move.to === fanoronaIndex(1, 3))).toBe(true);
  });

  it('lets the player voluntarily stop after a capture when a continuation exists', () => {
    const from = fanoronaIndex(2, 2);
    const to = fanoronaIndex(2, 3);
    const state = customState([
      [from, 0],
      [fanoronaIndex(2, 4), 1],
      [fanoronaIndex(0, 3), 1],
      [fanoronaIndex(4, 8), 1]
    ]);
    const first = legalFanoronaSteps(state).find((move) => move.from === from && move.to === to && move.captureMode === 'approach')!;
    const chained = applyFanoronaStep(state, first);
    expect(chained.chain).not.toBeNull();
    expect(canStopFanoronaChain(chained)).toBe(true);
    const stopped = stopFanoronaChain(chained);
    expect(stopped.currentPlayer).toBe(1);
    expect(stopped.chain).toBeNull();
  });

  it('wins when the final opposing piece is captured', () => {
    const from = fanoronaIndex(2, 2);
    const state = customState([
      [from, 0],
      [fanoronaIndex(2, 4), 1]
    ]);
    const step = legalFanoronaSteps(state).find((move) => move.captureMode === 'approach')!;
    const next = applyFanoronaStep(state, step);
    expect(next.winner).toBe(0);
    expect(countFanoronaPieces(next, 1)).toBe(0);
  });
});
