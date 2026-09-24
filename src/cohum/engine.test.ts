import { describe, expect, it } from 'vitest';
import {
  HUM_GATE,
  HUM_HANG_RIGHT,
  applyHumMove,
  countHumPieces,
  createInitialHumState,
  humNeighbors,
  legalHumMoves
} from './engine';
import type { HumCell, HumMove, HumSide, HumState } from './types';

function customState(
  pieces: Array<[number, Exclude<HumCell, null>]>,
  currentPlayer: HumSide,
  lastMoveByPlayer: HumState['lastMoveByPlayer'] = { hum: null, trau: null }
): HumState {
  const board: HumCell[] = Array(29).fill(null);
  for (const [index, piece] of pieces) board[index] = piece;
  return {
    board,
    currentPlayer,
    winner: null,
    turn: 1,
    lastMove: null,
    lastMoveByPlayer,
    lastCaptured: null,
    lastMessage: ''
  };
}

describe('Cờ Hùm engine', () => {
  it('starts with 1 Hùm, 15 Trâu, and the Hang gate open', () => {
    const state = createInitialHumState();
    expect(countHumPieces(state, 'hum')).toBe(1);
    expect(countHumPieces(state, 'trau')).toBe(15);
    expect(state.board[HUM_HANG_RIGHT]).toBe('hum');
    expect(state.board[HUM_GATE]).toBeNull();
    expect(state.currentPlayer).toBe('hum');
  });

  it('connects the Hang Hùm to the middle-right gate', () => {
    expect(humNeighbors(HUM_GATE)).toEqual(expect.arrayContaining([25, 27, 28]));
    expect(humNeighbors(HUM_HANG_RIGHT)).toEqual(expect.arrayContaining([25, 27, 28]));
  });

  it('lets Hùm jump over one exposed Trâu into the empty point behind it', () => {
    const state = customState([
      [6, 'hum'],
      [7, 'trau']
    ], 'hum');

    const capture = legalHumMoves(state).find(
      (move) => move.from === 6 && move.to === 8 && move.capture === 7
    );

    expect(capture).toBeDefined();

    const next = applyHumMove(state, capture!);
    expect(next.board[6]).toBeNull();
    expect(next.board[7]).toBeNull();
    expect(next.board[8]).toBe('hum');
  });

  it('cannot capture when the landing point behind Trâu is occupied', () => {
    const state = customState([
      [6, 'hum'],
      [7, 'trau'],
      [8, 'trau']
    ], 'hum');

    expect(
      legalHumMoves(state).some((move) => move.capture === 7)
    ).toBe(false);
  });

  it('Trâu only moves one connected step and never captures Hùm', () => {
    const state = customState([
      [6, 'hum'],
      [7, 'trau']
    ], 'trau');

    const moves = legalHumMoves(state);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((move) => move.capture === null)).toBe(true);
  });

  it('forbids immediately reversing the same side previous move', () => {
    const reverse: HumMove = { from: 7, to: 6, capture: null };
    const state = customState(
      [
        [6, null as never],
        [7, 'trau']
      ].filter(([, piece]) => piece !== null) as Array<[number, 'hum' | 'trau']>,
      'trau',
      {
        hum: null,
        trau: { from: 6, to: 7, capture: null }
      }
    );

    expect(legalHumMoves(state).some((move) =>
      move.from === reverse.from && move.to === reverse.to
    )).toBe(false);
  });

  it('Trâu wins when its move leaves Hùm with no legal step or jump', () => {
    const state = customState([
      [0, 'hum'],
      [1, 'trau'], [2, 'trau'],
      [5, 'trau'], [10, 'trau'],
      [7, 'trau'], [12, 'trau']
    ], 'trau');

    const move = legalHumMoves(state).find((candidate) =>
      candidate.from === 7 && candidate.to === 6
    );
    expect(move).toBeDefined();

    const next = applyHumMove(state, move!);
    expect(next.winner).toBe('trau');
  });

  it('Hùm wins after capturing the last Trâu', () => {
    const state = customState([
      [6, 'hum'],
      [7, 'trau']
    ], 'hum');

    const move = legalHumMoves(state).find((candidate) => candidate.capture === 7);
    const next = applyHumMove(state, move!);
    expect(next.winner).toBe('hum');
    expect(countHumPieces(next, 'trau')).toBe(0);
  });
});
