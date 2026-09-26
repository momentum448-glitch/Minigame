import { describe, expect, it } from 'vitest';
import {
  START_INDEX,
  TRACK_LENGTH,
  activeSeatsForCount,
  applyHorseAction,
  canFlyNextGate,
  clearCompletedBatch,
  createDiceBatch,
  createHorseGame,
  legalActionsForDie,
  nextGateAhead,
  rollBonusDice,
  rollInitialDice,
  trackIndexForHorse
} from './engine';
import type { HorseGameState, HorsePiece } from './types';

function withDice(state: HorseGameState, values: number[], bonusDiceToRoll = 0): HorseGameState {
  return { ...state, batch: createDiceBatch(values), bonusDiceToRoll };
}

function setHorse(
  state: HorseGameState,
  id: string,
  patch: Partial<HorsePiece>
): HorseGameState {
  return {
    ...state,
    horses: state.horses.map((horse) => horse.id === id ? { ...horse, ...patch } : horse)
  };
}

describe('Cờ cá ngựa seats and dice', () => {
  it('uses opposite seats for a two-player match', () => {
    expect(activeSeatsForCount(2)).toEqual([0, 2]);
  });

  it('starts each turn with two independent dice', () => {
    const state = rollInitialDice(createHorseGame(2), () => 0.5);
    expect(state.batch?.values).toEqual([4, 4]);
    expect(state.batch?.used).toEqual([false, false]);
  });

  it('6+4 grants exactly one bonus die and 6+6 grants two', () => {
    const sixFourValues = [0.84, 0.5];
    let i = 0;
    const sixFour = rollInitialDice(createHorseGame(2), () => sixFourValues[i++]);
    expect(sixFour.batch?.values).toEqual([6, 4]);
    expect(sixFour.bonusDiceToRoll).toBe(1);

    const sixSix = rollInitialDice(createHorseGame(2), () => 0.99);
    expect(sixSix.batch?.values).toEqual([6, 6]);
    expect(sixSix.bonusDiceToRoll).toBe(2);
  });

  it('a bonus six chains into another bonus die', () => {
    const state: HorseGameState = { ...createHorseGame(2), bonusDiceToRoll: 1 };
    const rolled = rollBonusDice(state, () => 0.99);
    expect(rolled.batch?.values).toEqual([6]);
    expect(rolled.bonusDiceToRoll).toBe(1);
  });
});

describe('Cờ cá ngựa track actions', () => {
  it('deploys a yard horse with a six and can use another die on the same horse', () => {
    let state = withDice(createHorseGame(2), [6, 4], 1);
    const horseId = 's0-h0';

    state = applyHorseAction(state, { type: 'deploy', horseId, dieIndex: 0 });
    expect(state.horses.find((h) => h.id === horseId)?.progress).toBe(0);

    const move = legalActionsForDie(state, 1).find((action) =>
      action.type === 'move' && action.horseId === horseId
    );
    expect(move).toBeDefined();

    state = applyHorseAction(state, move!);
    expect(state.horses.find((h) => h.id === horseId)?.progress).toBe(4);
  });

  it('kicks an opponent when landing exactly on its square', () => {
    let state = withDice(createHorseGame(2), [4]);
    state = setHorse(state, 's0-h0', { zone: 'track', progress: 0, homeRank: null });
    state = setHorse(state, 's2-h0', { zone: 'track', progress: 32, homeRank: null });
    // seat 2 start is 28, so progress 32 => global 4.
    expect(trackIndexForHorse(state.horses.find((h) => h.id === 's2-h0')!)).toBe(4);

    state = applyHorseAction(state, { type: 'move', horseId: 's0-h0', dieIndex: 0, steps: 4 });
    const kicked = state.horses.find((h) => h.id === 's2-h0')!;
    expect(kicked.zone).toBe('yard');
  });

  it('cannot jump over a blocking horse', () => {
    let state = withDice(createHorseGame(2), [4]);
    state = setHorse(state, 's0-h0', { zone: 'track', progress: 0 });
    state = setHorse(state, 's0-h1', { zone: 'track', progress: 2 });

    const actions = legalActionsForDie(state, 0);
    expect(actions.some((a) => a.type === 'move' && 'horseId' in a && a.horseId === 's0-h0')).toBe(false);
  });

  it('requires an exact roll to reach own stable door', () => {
    let state = withDice(createHorseGame(2), [2]);
    state = setHorse(state, 's0-h0', { zone: 'track', progress: 55 });

    expect(legalActionsForDie(state, 0).some((a) => a.type === 'move' && 'horseId' in a && a.horseId === 's0-h0')).toBe(false);

    state = { ...state, batch: createDiceBatch([1]) };
    const move = legalActionsForDie(state, 0).find((a) => a.type === 'move' && 'horseId' in a && a.horseId === 's0-h0');
    expect(move).toBeDefined();
    state = applyHorseAction(state, move!);
    expect(state.horses.find((h) => h.id === 's0-h0')?.zone).toBe('home');
    expect(state.horses.find((h) => h.id === 's0-h0')?.homeRank).toBe(0);
  });
});

describe('Cờ cá ngựa face-1 flight', () => {
  it('finds the next gate clockwise', () => {
    expect(nextGateAhead(3)).toEqual({ gateIndex: 14, distance: 11 });
    expect(nextGateAhead(42)).toEqual({ gateIndex: 0, distance: 14 });
  });

  it('lets face 1 fly to the next gate when the path is clear', () => {
    let state = withDice(createHorseGame(2), [1]);
    state = setHorse(state, 's0-h0', { zone: 'track', progress: 3 });
    const horse = state.horses.find((h) => h.id === 's0-h0')!;

    expect(canFlyNextGate(state, horse, 1)).toEqual({ valid: true, distance: 11 });
    const flight = legalActionsForDie(state, 0).find((a) => a.type === 'fly-next-gate');
    expect(flight).toBeDefined();

    state = applyHorseAction(state, flight!);
    expect(trackIndexForHorse(state.horses.find((h) => h.id === 's0-h0')!)).toBe(14);
  });

  it('blocks face-1 flight if any horse lies between current position and next gate', () => {
    let state = withDice(createHorseGame(2), [1]);
    state = setHorse(state, 's0-h0', { zone: 'track', progress: 3 });
    state = setHorse(state, 's0-h1', { zone: 'track', progress: 6 });

    const horse = state.horses.find((h) => h.id === 's0-h0')!;
    expect(canFlyNextGate(state, horse, 1).valid).toBe(false);
  });
});

describe('Cờ cá ngựa home lane and victory', () => {
  it('climbs one home rank only when die equals the next rank', () => {
    let state = withDice(createHorseGame(2), [1]);
    state = setHorse(state, 's0-h0', { zone: 'home', progress: null, homeRank: 0 });

    const climb1 = legalActionsForDie(state, 0).find((a) => a.type === 'climb-home');
    expect(climb1).toBeDefined();
    state = applyHorseAction(state, climb1!);
    expect(state.horses.find((h) => h.id === 's0-h0')?.homeRank).toBe(1);

    state = { ...clearCompletedBatch(state), batch: createDiceBatch([3]) };
    expect(legalActionsForDie(state, 0).some((a) => a.type === 'climb-home' && 'horseId' in a && a.horseId === 's0-h0')).toBe(false);
  });

  it('wins when the four horses occupy ranks 3,4,5,6', () => {
    let state = withDice(createHorseGame(2), [6]);
    state = setHorse(state, 's0-h0', { zone: 'home', homeRank: 3, progress: null });
    state = setHorse(state, 's0-h1', { zone: 'home', homeRank: 4, progress: null });
    state = setHorse(state, 's0-h2', { zone: 'home', homeRank: 5, progress: null });
    state = setHorse(state, 's0-h3', { zone: 'home', homeRank: 5, progress: null });

    const action = legalActionsForDie(state, 0).find((a) =>
      a.type === 'climb-home' && a.horseId === 's0-h3'
    );
    expect(action).toBeDefined();

    state = applyHorseAction(state, action!);
    expect(state.winner).toBe(0);
  });
});
