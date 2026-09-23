import { describe, expect, it } from 'vitest';
import { createInitialState, finalizeGame, legalMoves, refillSide } from './engine';

describe('Ô ăn quan engine', () => {
  it('starts with 10 dân pits x 5 and two quan', () => {
    const state = createInitialState();
    expect(state.pits.filter((_, i) => i !== 0 && i !== 6).every((p) => p.dan === 5)).toBe(true);
    expect(state.pits[0].quan && state.pits[6].quan).toBe(true);
    expect(legalMoves(state)).toHaveLength(10);
  });

  it('refills an empty side and records debt when the player has no captured dân', () => {
    const state = createInitialState();
    for (const pit of [7, 8, 9, 10, 11]) state.pits[pit].dan = 0;
    const next = refillSide(state, 0);
    expect([7, 8, 9, 10, 11].every((pit) => next.pits[pit].dan === 1)).toBe(true);
    expect(next.debt[0]).toBe(5);
  });

  it('finalizes scores and remaining dân', () => {
    const state = createInitialState();
    state.pits.forEach((pit) => { pit.dan = 0; pit.quan = false; });
    state.pits[7].dan = 3;
    state.pits[1].dan = 2;
    const done = finalizeGame(state);
    expect(done.gameOver).toBe(true);
    expect(done.score).toEqual([3, 2]);
    expect(done.winner).toBe(0);
  });
});
