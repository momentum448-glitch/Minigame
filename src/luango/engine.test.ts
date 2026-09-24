import { describe, expect, it } from 'vitest';
import {
  LUA_NGO_BOARD_EDGES,
  applyLuaNgoMove,
  countLuaNgoPieces,
  createInitialLuaNgoState,
  findLuaNgoMoveByPath,
  legalLuaNgoMoves,
  luaNgoNeighbors,
  nextLuaNgoSteps
} from './engine';
import type { LuaNgoCell, LuaNgoPlayer, LuaNgoState } from './types';

function customState(
  pieces: Array<[number, Exclude<LuaNgoCell, null>]>,
  currentPlayer: LuaNgoPlayer = 0
): LuaNgoState {
  const board: LuaNgoCell[] = Array(12).fill(null);
  for (const [index, player] of pieces) board[index] = player;

  return {
    board,
    currentPlayer,
    winner: null,
    turn: 1,
    lastMove: null,
    lastMessage: ''
  };
}

describe('Cờ Lúa Ngô engine', () => {
  it('starts with 4 quân per side and four empty wing points', () => {
    const state = createInitialLuaNgoState();
    expect(countLuaNgoPieces(state, 0)).toBe(4);
    expect(countLuaNgoPieces(state, 1)).toBe(4);
    expect(state.board.filter((cell) => cell === null)).toHaveLength(4);
  });

  it('uses the two-overlapping-rectangles board graph', () => {
    expect(LUA_NGO_BOARD_EDGES).toContainEqual([0, 1]);
    expect(luaNgoNeighbors(3)).toEqual(expect.arrayContaining([0, 2, 4, 7]));
    expect(luaNgoNeighbors(2)).toEqual(expect.arrayContaining([3, 6]));
  });

  it('does not allow revisiting a point inside the same turn', () => {
    const state = customState([[10, 0]]);
    const options = nextLuaNgoSteps(state, [10, 7]);
    expect(options.some((option) => option.to === 10)).toBe(false);
  });

  it('cannot capture an opponent before the fifth step', () => {
    const state = customState([
      [10, 0],
      [3, 1]
    ]);

    const options = nextLuaNgoSteps(state, [10, 7, 6, 2]);
    expect(options.some((option) => option.to === 3)).toBe(false);
  });

  it('can capture an opponent exactly on Đỗ, the fifth step', () => {
    const state = customState([
      [10, 0],
      [0, 1],
      [11, 1]
    ]);

    const path = [10, 7, 6, 2, 3, 0];
    const move = findLuaNgoMoveByPath(state, path);

    expect(move).not.toBeNull();
    expect(move?.capture).toBe(0);

    const next = applyLuaNgoMove(state, move!);
    expect(next.board[0]).toBe(0);
    expect(next.board[10]).toBeNull();
    expect(countLuaNgoPieces(next, 1)).toBe(1);
  });

  it('finishes early when no unvisited empty continuation remains', () => {
    const state = customState([
      [10, 0],
      [2, 1],
      [8, 1]
    ]);

    const move = findLuaNgoMoveByPath(state, [10, 7, 6]);
    expect(move).not.toBeNull();
    expect(move?.blocked).toBe(true);
  });

  it('wins after eating the last opposing quân on the fifth step', () => {
    const state = customState([
      [10, 0],
      [0, 1]
    ]);

    const move = findLuaNgoMoveByPath(state, [10, 7, 6, 2, 3, 0]);
    const next = applyLuaNgoMove(state, move!);

    expect(next.winner).toBe(0);
    expect(countLuaNgoPieces(next, 1)).toBe(0);
  });

  it('generates at least one opening route for the starting player', () => {
    expect(legalLuaNgoMoves(createInitialLuaNgoState()).length).toBeGreaterThan(0);
  });
});
