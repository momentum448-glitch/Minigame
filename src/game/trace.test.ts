import { describe, expect, it } from 'vitest';
import { applyMove, createInitialState } from './engine';
import { createMoveTrace } from './trace';

describe('move trace', () => {
  it('starts by picking up the whole pit and drops one quân at a time', () => {
    const state = createInitialState();
    const trace = createMoveTrace(state, { pit: 7, direction: 1 });

    expect(trace.steps[0].event).toMatchObject({
      type: 'pickup',
      pit: 7,
      count: 5,
      hand: 5
    });

    const firstDrops = trace.steps.slice(1, 6).map((step) => step.event);
    expect(firstDrops.map((event) => event.type)).toEqual(['drop', 'drop', 'drop', 'drop', 'drop']);
    expect(firstDrops.map((event) => event.type === 'drop' ? event.pit : -1)).toEqual([8, 9, 10, 11, 0]);
    expect(firstDrops.map((event) => event.hand)).toEqual([4, 3, 2, 1, 0]);
  });

  it('emits continue-pickup when the next dân pit contains quân', () => {
    const state = createInitialState();
    const trace = createMoveTrace(state, { pit: 7, direction: 1 });

    const continued = trace.steps.find((step) => step.event.type === 'continue-pickup');
    expect(continued?.event).toMatchObject({
      type: 'continue-pickup',
      pit: 1,
      count: 5,
      hand: 5
    });
  });

  it('emits capture and still ends at exactly the same state as applyMove', () => {
    const state = createInitialState();
    for (let index = 1; index < 12; index += 1) {
      if (index !== 6) state.pits[index].dan = 0;
    }
    state.pits[7].dan = 1;
    state.pits[10].dan = 3;

    const move = { pit: 7, direction: 1 as const };
    const trace = createMoveTrace(state, move);
    const capture = trace.steps.find((step) => step.event.type === 'capture');

    expect(capture?.event).toMatchObject({
      type: 'capture',
      pit: 10,
      dan: 3,
      points: 3
    });
    expect(trace.finalState).toEqual(applyMove(state, move));
    expect(trace.steps.at(-1)?.state).toEqual(trace.finalState);
  });

  it('matches applyMove for every legal opening move', () => {
    const state = createInitialState();
    for (const pit of [7, 8, 9, 10, 11]) {
      for (const direction of [-1, 1] as const) {
        const move = { pit, direction };
        expect(createMoveTrace(state, move).finalState).toEqual(applyMove(state, move));
      }
    }
  });
});
