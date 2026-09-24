import { describe, expect, it } from 'vitest';
import {
  applyGanhMove,
  createInitialGanhState,
  legalGanhMoves,
  neighbors
} from './engine';
import type { GanhCell, GanhState } from './types';

function customState(
  pieces: Array<[number, 0 | 1]>,
  currentPlayer: 0 | 1 = 0,
  forcedGanhAt: number | null = null
): GanhState {
  const board: GanhCell[] = Array(25).fill(null);
  for (const [index, player] of pieces) board[index] = player;
  return {
    board,
    currentPlayer,
    winner: null,
    turn: 1,
    forcedGanhAt,
    lastMove: null,
    lastConverted: [],
    lastCaptureType: 'none',
    lastMessage: ''
  };
}

describe('Cờ Gánh engine', () => {
  it('starts with 8 quân per side and 9 empty intersections', () => {
    const state = createInitialGanhState();
    expect(state.board.filter((cell) => cell === 0)).toHaveLength(8);
    expect(state.board.filter((cell) => cell === 1)).toHaveLength(8);
    expect(state.board.filter((cell) => cell === null)).toHaveLength(9);
  });

  it('uses diagonal paths only on intersections connected by the drawn board', () => {
    expect(neighbors(12)).toEqual(expect.arrayContaining([6, 8, 16, 18]));
    expect(neighbors(7)).not.toContain(1);
    expect(neighbors(7)).not.toContain(13);
  });

  it('gánh converts an opposite pair when moving into the middle', () => {
    const state = customState([
      [11, 0],
      [7, 1],
      [17, 1]
    ]);

    const next = applyGanhMove(state, { from: 11, to: 12 });
    expect(next.board[7]).toBe(0);
    expect(next.board[17]).toBe(0);
    expect(next.lastCaptureType).toBe('ganh');
    expect(next.lastConverted).toEqual(expect.arrayContaining([7, 17]));
  });

  it('vây converts an opponent group with no empty adjacent intersection', () => {
    const state = customState([
      [0, 1],
      [1, 0],
      [5, 0],
      [6, 0],
      [7, 0]
    ]);

    const next = applyGanhMove(state, { from: 7, to: 2 });
    expect(next.board[0]).toBe(0);
    expect(next.lastConverted).toContain(0);
  });

  it('forces the reply into a valid thế Mở destination', () => {
    const state = customState([
      [12, 0],
      [10, 0],
      [14, 0],
      [6, 1]
    ]);

    const opened = applyGanhMove(state, { from: 12, to: 17 });
    expect(opened.forcedGanhAt).toBe(12);

    const forcedMoves = legalGanhMoves(opened);
    expect(forcedMoves.length).toBeGreaterThan(0);
    expect(forcedMoves.every((move) => move.to === 12)).toBe(true);
  });

  it('wins when all 16 quân belong to one player', () => {
    const pieces: Array<[number, 0 | 1]> = [];
    for (let index = 0; index < 15; index += 1) pieces.push([index, 0]);
    pieces.push([17, 1]);

    const state = customState(pieces);
    state.board[12] = null;
    state.board[11] = 0;
    state.board[7] = 1;
    state.board[17] = 1;

    const next = applyGanhMove(state, { from: 11, to: 12 });
    expect(next.winner).toBe(0);
  });
});
