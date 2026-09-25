import { describe, expect, it } from 'vitest';
import {
  beginActivation,
  beginBattle,
  canDraftMonster,
  chooseEvolution,
  coordKey,
  createDraftState,
  draftMonster,
  generateBalancedBoard,
  generateHexCoords,
  hexDistance,
  moveActiveUnit,
  pendingEvolution,
  reachableCells,
  rollCombat
} from './engine';
import { MONSTER_BY_ID } from './roster';

describe('Monster Chess hex foundation', () => {
  it('creates a radius-4 hex board with 61 cells', () => {
    const coords = generateHexCoords();
    expect(coords).toHaveLength(61);
    expect(new Set(coords.map(coordKey)).size).toBe(61);
  });

  it('uses axial hex distance correctly', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 4, r: -2 })).toBe(4);
    expect(hexDistance({ q: -4, r: 0 }, { q: 4, r: 0 })).toBe(8);
  });

  it('generates rotationally mirrored terrain and pickups', () => {
    const board = generateBalancedBoard(42);
    for (const cell of Object.values(board)) {
      const mirror = board[coordKey({ q: -cell.coord.q, r: -cell.coord.r })];
      expect(mirror.terrain).toBe(cell.terrain);
      expect(mirror.pickup).toBe(cell.pickup);
    }
  });
});

describe('Monster Chess draft', () => {
  it('locks a drafted species for the opponent', () => {
    let draft = createDraftState();
    draft = draftMonster(draft, 'mam-reu');
    expect(draft.picks[0]).toEqual(['mam-reu']);
    expect(draft.currentPlayer).toBe(1);
    expect(canDraftMonster(draft, 1, 'mam-reu')).toBe(false);
  });

  it('enforces 10-star budget and five-unit cap', () => {
    let draft = createDraftState();
    draft = draftMonster(draft, 'long-lang-kinh');
    draft = { ...draft, currentPlayer: 0 };
    draft = draftMonster(draft, 'thiet-ngac');
    draft = { ...draft, currentPlayer: 0 };

    expect(draft.spent[0]).toBe(9);
    expect(canDraftMonster(draft, 0, 'mong-nam')).toBe(false);
  });
});

describe('Monster Chess battle engine', () => {
  function battle() {
    let draft = createDraftState();
    draft = draftMonster(draft, 'mam-reu');
    draft = draftMonster(draft, 'giap-te');
    draft = draftMonster({ ...draft, currentPlayer: 0 }, 'bo-hoa-dao');
    draft = draftMonster({ ...draft, currentPlayer: 1 }, 'loi-nhan');
    return beginBattle(draft, 100);
  }

  it('auto-deploys drafted monsters on opposite sides', () => {
    const state = battle();
    expect(state.units).toHaveLength(4);
    expect(state.units.filter((unit) => unit.owner === 0).every((unit) => unit.pos.q <= -3)).toBe(true);
    expect(state.units.filter((unit) => unit.owner === 1).every((unit) => unit.pos.q >= 3)).toBe(true);
  });

  it('finds reachable cells without walking through blockers or units', () => {
    const state = battle();
    const unit = state.units.find((candidate) => candidate.owner === state.currentPlayer)!;
    const reachable = reachableCells(state, unit.id);
    expect(Object.keys(reachable).length).toBeGreaterThan(1);
    expect(Math.max(...Object.values(reachable))).toBeLessThanOrEqual(unit.move);
  });

  it('allows optional movement before a main action', () => {
    let state = battle();
    const unit = state.units.find((candidate) => candidate.owner === state.currentPlayer)!;
    state = beginActivation(state, unit.id);
    const reachable = reachableCells(state, unit.id);
    const destination = Object.entries(reachable).find(([, distance]) => distance === 1)?.[0];
    expect(destination).toBeDefined();

    const [q, r] = destination!.split(',').map(Number);
    state = moveActiveUnit(state, { q, r });
    expect(state.moved).toBe(true);
    expect(state.activeUnitId).toBe(unit.id);
  });

  it('resolves combat as 10% miss, 80% normal, 10% crit boundaries', () => {
    const state = battle();
    const attacker = { ...state.units[0], pos: { q: 0, r: 0 }, range: 3 };
    const target = { ...state.units[2], pos: { q: 1, r: 0 } };

    expect(rollCombat(state, attacker, target, 4, () => .05).outcome).toBe('miss');
    expect(rollCombat(state, attacker, target, 4, () => .50).damage).toBe(4);
    expect(rollCombat(state, attacker, target, 4, () => .95).damage).toBe(6);
  });

  it('opens Evolution I at 3 XP and applies a selected branch', () => {
    let state = battle();
    const owner = state.currentPlayer;
    const unit = state.units.find((candidate) => candidate.owner === owner)!;
    state = {
      ...state,
      units: state.units.map((candidate) =>
        candidate.id === unit.id ? { ...candidate, xp: 3 } : candidate
      )
    };
    state = beginActivation(state, unit.id);
    const active = state.units.find((candidate) => candidate.id === unit.id)!;
    expect(pendingEvolution(active)).toBe(1);

    const option = MONSTER_BY_ID[unit.speciesId].evolution1[0];
    state = chooseEvolution(state, option.id);
    const evolved = state.units.find((candidate) => candidate.id === unit.id)!;
    expect(evolved.evolutionTier).toBe(1);
    expect(evolved.evolutions).toContain(option.id);
  });
});
