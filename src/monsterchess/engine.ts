import { MONSTER_BY_ID, MONSTER_ROSTER } from './roster';
import type {
  BoardCell,
  DraftState,
  EvolutionOption,
  HexCoord,
  MonsterGameState,
  MonsterPlayer,
  MonsterUnit,
  PickupKind,
  TerrainType
} from './types';

export const HEX_RADIUS = 4;
export const DEFAULT_STAR_BUDGET = 10;
export const MAX_TEAM_UNITS = 5;

export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
];

export function coordKey(coord: HexCoord): string {
  return `${coord.q},${coord.r}`;
}

export function parseCoord(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function sameCoord(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

export function mirrorCoord(coord: HexCoord): HexCoord {
  return { q: -coord.q, r: -coord.r };
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  const as = -a.q - a.r;
  const bs = -b.q - b.r;
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(as - bs));
}

export function generateHexCoords(radius = HEX_RADIUS): HexCoord[] {
  const coords: HexCoord[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);
    for (let r = rMin; r <= rMax; r += 1) coords.push({ q, r });
  }
  return coords;
}

export function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canRandomizeTerrain(coord: HexCoord): boolean {
  return Math.abs(coord.q) <= 2 && Math.abs(coord.r) <= 3 && Math.abs(coord.q + coord.r) <= 3;
}

function pickupFromRoll(roll: number): PickupKind | null {
  if (roll < .035) return 'artifact';
  if (roll < .08) return 'guard';
  if (roll < .13) return 'fury';
  if (roll < .20) return 'heal';
  if (roll < .32) return 'xp';
  return null;
}

export function generateBalancedBoard(seed: number): Record<string, BoardCell> {
  const rng = mulberry32(seed);
  const cells: Record<string, BoardCell> = {};
  const coords = generateHexCoords();

  for (const coord of coords) {
    cells[coordKey(coord)] = { coord, terrain: 'ground', pickup: null };
  }

  const visited = new Set<string>();
  for (const coord of coords) {
    const key = coordKey(coord);
    if (visited.has(key)) continue;

    const mirror = mirrorCoord(coord);
    const mirrorKey = coordKey(mirror);
    visited.add(key);
    visited.add(mirrorKey);

    if (!canRandomizeTerrain(coord) || (coord.q === 0 && coord.r === 0)) continue;

    const terrainRoll = rng();
    const terrain: TerrainType =
      terrainRoll < .12 ? 'blocker' :
      terrainRoll < .34 ? 'cover' :
      'ground';

    cells[key].terrain = terrain;
    if (cells[mirrorKey]) cells[mirrorKey].terrain = terrain;
  }

  visited.clear();
  for (const coord of coords) {
    const key = coordKey(coord);
    if (visited.has(key)) continue;

    const mirror = mirrorCoord(coord);
    const mirrorKey = coordKey(mirror);
    visited.add(key);
    visited.add(mirrorKey);

    if (
      cells[key].terrain === 'blocker' ||
      !cells[mirrorKey] ||
      cells[mirrorKey].terrain === 'blocker' ||
      Math.abs(coord.q) >= 3
    ) continue;

    const pickup = pickupFromRoll(rng());
    if (!pickup) continue;
    cells[key].pickup = pickup;
    cells[mirrorKey].pickup = pickup;
  }

  return cells;
}

export function createDraftState(
  budget = DEFAULT_STAR_BUDGET,
  maxUnits = MAX_TEAM_UNITS
): DraftState {
  return {
    picks: [[], []],
    spent: [0, 0],
    currentPlayer: 0,
    passed: [false, false],
    locked: [],
    budget,
    maxUnits
  };
}

export function canDraftMonster(
  draft: DraftState,
  player: MonsterPlayer,
  speciesId: string
): boolean {
  const monster = MONSTER_BY_ID[speciesId];
  if (!monster || draft.locked.includes(speciesId) || draft.passed[player]) return false;
  if (draft.picks[player].length >= draft.maxUnits) return false;
  return draft.spent[player] + monster.stars <= draft.budget;
}

function otherPlayer(player: MonsterPlayer): MonsterPlayer {
  return player === 0 ? 1 : 0;
}

function nextDraftPlayer(draft: DraftState, after: MonsterPlayer): MonsterPlayer {
  const other = otherPlayer(after);
  if (!draft.passed[other]) return other;
  return after;
}

export function draftMonster(draft: DraftState, speciesId: string): DraftState {
  const player = draft.currentPlayer;
  if (!canDraftMonster(draft, player, speciesId)) return draft;

  const monster = MONSTER_BY_ID[speciesId];
  const picks: [string[], string[]] = [[...draft.picks[0]], [...draft.picks[1]]];
  const spent: [number, number] = [...draft.spent] as [number, number];
  picks[player].push(speciesId);
  spent[player] += monster.stars;

  const next: DraftState = {
    ...draft,
    picks,
    spent,
    locked: [...draft.locked, speciesId],
    currentPlayer: player
  };
  next.currentPlayer = nextDraftPlayer(next, player);
  return next;
}

export function passDraft(draft: DraftState): DraftState {
  const player = draft.currentPlayer;
  const passed: [boolean, boolean] = [...draft.passed] as [boolean, boolean];
  passed[player] = true;

  const next: DraftState = { ...draft, passed, currentPlayer: player };
  const other = otherPlayer(player);
  if (!passed[other]) next.currentPlayer = other;
  return next;
}

export function draftComplete(draft: DraftState): boolean {
  return draft.passed[0] && draft.passed[1] &&
    draft.picks[0].length > 0 && draft.picks[1].length > 0;
}

export function availableDraftMonsters(draft: DraftState, player = draft.currentPlayer) {
  return MONSTER_ROSTER.filter((monster) => canDraftMonster(draft, player, monster.id));
}

function spawnCoords(player: MonsterPlayer): HexCoord[] {
  const coords = generateHexCoords().filter((coord) =>
    player === 0 ? coord.q <= -3 : coord.q >= 3
  );
  return coords.sort((a, b) => {
    const edgeA = Math.abs(a.q) === 4 ? 0 : 1;
    const edgeB = Math.abs(b.q) === 4 ? 0 : 1;
    return edgeA - edgeB || a.r - b.r;
  });
}

function createUnit(
  speciesId: string,
  owner: MonsterPlayer,
  index: number,
  pos: HexCoord
): MonsterUnit {
  const def = MONSTER_BY_ID[speciesId];
  return {
    id: `p${owner}-${speciesId}-${index}`,
    speciesId,
    owner,
    pos,
    hp: def.maxHp,
    maxHp: def.maxHp,
    move: def.move,
    range: def.range,
    damage: def.damage,
    xp: 0,
    evolutionTier: 0,
    evolutions: [],
    activated: false,
    skillCooldown: 0,
    shield: 0,
    fury: 0,
    rooted: false,
    slow: 0,
    artifact: false
  };
}

export function beginBattle(draft: DraftState, seed: number): MonsterGameState {
  const cells = generateBalancedBoard(seed);
  const p0Spawns = spawnCoords(0);
  const p1Spawns = spawnCoords(1);
  const units: MonsterUnit[] = [];

  draft.picks[0].forEach((speciesId, index) => {
    units.push(createUnit(speciesId, 0, index, p0Spawns[index]));
  });
  draft.picks[1].forEach((speciesId, index) => {
    units.push(createUnit(speciesId, 1, index, p1Spawns[index]));
  });

  const firstPlayer: MonsterPlayer = seed % 2 === 0 ? 0 : 1;
  return {
    phase: 'battle',
    draft,
    cells,
    units,
    round: 1,
    firstPlayer,
    currentPlayer: firstPlayer,
    activeUnitId: null,
    moved: false,
    movedDistance: 0,
    skillUsedThisActivation: false,
    startTerrain: null,
    spores: {},
    winner: null,
    message: `Round 1 · Người chơi ${firstPlayer + 1} kích hoạt trước.`,
    seed
  };
}

export function createMonsterGame(seed = Date.now()): MonsterGameState {
  return {
    phase: 'draft',
    draft: createDraftState(),
    cells: {},
    units: [],
    round: 0,
    firstPlayer: 0,
    currentPlayer: 0,
    activeUnitId: null,
    moved: false,
    movedDistance: 0,
    skillUsedThisActivation: false,
    startTerrain: null,
    spores: {},
    winner: null,
    message: 'Người chơi 1 chọn quái đầu tiên.',
    seed
  };
}

function alive(unit: MonsterUnit): boolean {
  return unit.hp > 0;
}

export function unitAt(state: MonsterGameState, coord: HexCoord): MonsterUnit | undefined {
  return state.units.find((unit) => alive(unit) && sameCoord(unit.pos, coord));
}

export function neighbors(state: MonsterGameState, coord: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS
    .map((dir) => ({ q: coord.q + dir.q, r: coord.r + dir.r }))
    .filter((candidate) => state.cells[coordKey(candidate)] !== undefined);
}

function effectiveMove(state: MonsterGameState, unit: MonsterUnit): number {
  if (unit.rooted) return 0;
  let move = Math.max(0, unit.move - unit.slow);
  if (unit.speciesId === 'thiet-ngac') {
    const woundedEnemy = state.units.some((enemy) =>
      alive(enemy) && enemy.owner !== unit.owner && enemy.hp <= enemy.maxHp / 2
    );
    if (woundedEnemy) move += 1;
  }
  return move;
}

export function reachableCells(
  state: MonsterGameState,
  unitId: string
): Record<string, number> {
  const unit = state.units.find((candidate) => candidate.id === unitId);
  if (!unit || !alive(unit)) return {};

  const maxMove = effectiveMove(state, unit);
  const distances: Record<string, number> = { [coordKey(unit.pos)]: 0 };
  const queue: HexCoord[] = [unit.pos];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDistance = distances[coordKey(current)];
    if (currentDistance >= maxMove) continue;

    for (const next of neighbors(state, current)) {
      const key = coordKey(next);
      const cell = state.cells[key];
      if (cell.terrain === 'blocker') continue;
      if (unitAt(state, next) && !sameCoord(next, unit.pos)) continue;
      if (distances[key] !== undefined) continue;
      distances[key] = currentDistance + 1;
      queue.push(next);
    }
  }

  return distances;
}

function findPath(
  state: MonsterGameState,
  unit: MonsterUnit,
  destination: HexCoord
): HexCoord[] | null {
  const reachable = reachableCells(state, unit.id);
  const destKey = coordKey(destination);
  if (reachable[destKey] === undefined) return null;
  if (sameCoord(unit.pos, destination)) return [unit.pos];

  const queue: HexCoord[] = [unit.pos];
  const cameFrom: Record<string, string | null> = { [coordKey(unit.pos)]: null };

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (sameCoord(current, destination)) break;

    for (const next of neighbors(state, current)) {
      const key = coordKey(next);
      if (reachable[key] === undefined || cameFrom[key] !== undefined) continue;
      cameFrom[key] = coordKey(current);
      queue.push(next);
    }
  }

  const path: HexCoord[] = [];
  let key: string | null = destKey;
  while (key) {
    path.unshift(parseCoord(key));
    key = cameFrom[key] ?? null;
  }
  return path;
}

export function pendingEvolution(unit: MonsterUnit): 1 | 2 | null {
  if (unit.evolutionTier === 0 && unit.xp >= 3) return 1;
  if (unit.evolutionTier === 1 && unit.xp >= 7) return 2;
  return null;
}

export function evolutionOptions(unit: MonsterUnit): EvolutionOption[] {
  const def = MONSTER_BY_ID[unit.speciesId];
  const tier = pendingEvolution(unit);
  return tier === 1 ? def.evolution1 : tier === 2 ? def.evolution2 : [];
}

export function beginActivation(state: MonsterGameState, unitId: string): MonsterGameState {
  if (state.phase !== 'battle' || state.activeUnitId) return state;
  const unit = state.units.find((candidate) => candidate.id === unitId);
  if (!unit || !alive(unit) || unit.owner !== state.currentPlayer || unit.activated) return state;

  const terrain = state.cells[coordKey(unit.pos)]?.terrain ?? 'ground';
  return {
    ...state,
    activeUnitId: unitId,
    moved: false,
    movedDistance: 0,
    skillUsedThisActivation: false,
    startTerrain: terrain,
    message: pendingEvolution(unit)
      ? `${MONSTER_BY_ID[unit.speciesId].name} đủ EXP · chọn tiến hóa trước.`
      : `${MONSTER_BY_ID[unit.speciesId].name} đang kích hoạt.`
  };
}

function updateUnit(
  units: MonsterUnit[],
  unitId: string,
  updater: (unit: MonsterUnit) => MonsterUnit
): MonsterUnit[] {
  return units.map((unit) => unit.id === unitId ? updater(unit) : unit);
}

function applyEvolutionEffect(unit: MonsterUnit, optionId: string): MonsterUnit {
  let next = { ...unit };
  const hpUp = (amount: number) => {
    next.maxHp += amount;
    next.hp += amount;
  };

  if (['reu-e1-root'].includes(optionId)) hpUp(2);
  if (optionId === 'chon-e1-speed') next.move += 1;
  if (optionId === 'te-e1-fort') hpUp(2);
  if (optionId === 'bo-e1-blade') {
    next.damage += 1;
    next.maxHp = Math.max(1, next.maxHp - 1);
    next.hp = Math.min(next.hp, next.maxHp);
  }
  if (optionId === 'loi-e1-aim') next.range += 1;
  if (optionId === 'ngac-e1-jaw') next.damage += 1;
  if (optionId === 'ngac-e1-iron') hpUp(2);
  if (optionId === 'long-e1-red') next.damage += 1;
  if (optionId === 'long-e1-blue') {
    next.range += 1;
    next.move += 1;
  }
  if (optionId === 'long-e1-green') hpUp(3);

  return next;
}

export function chooseEvolution(
  state: MonsterGameState,
  optionId: string
): MonsterGameState {
  const unitId = state.activeUnitId;
  if (!unitId) return state;
  const unit = state.units.find((candidate) => candidate.id === unitId);
  if (!unit) return state;

  const options = evolutionOptions(unit);
  if (!options.some((option) => option.id === optionId)) return state;

  const nextTier = (unit.evolutionTier + 1) as 1 | 2;
  const units = updateUnit(state.units, unitId, (current) => ({
    ...applyEvolutionEffect(current, optionId),
    evolutionTier: nextTier,
    evolutions: [...current.evolutions, optionId]
  }));

  return {
    ...state,
    units,
    message: `${MONSTER_BY_ID[unit.speciesId].name} tiến hóa: ${options.find((option) => option.id === optionId)!.name}.`
  };
}

function applyPickupToUnit(unit: MonsterUnit, pickup: PickupKind): MonsterUnit {
  const next = { ...unit };
  if (pickup === 'xp') {
    const bonus = unit.speciesId === 'chon-chop' && unit.evolutions.includes('chon-e2-thief') ? 2 : 1;
    next.xp += bonus;
  }
  if (pickup === 'heal') next.hp = Math.min(next.maxHp, next.hp + 2);
  if (pickup === 'fury') next.fury += 1;
  if (pickup === 'guard') next.shield += 2;
  if (pickup === 'artifact' && !next.artifact) next.artifact = true;
  return next;
}

function collectAdjacentChonPickup(
  cells: Record<string, BoardCell>,
  unit: MonsterUnit
): { cells: Record<string, BoardCell>; unit: MonsterUnit } {
  if (unit.speciesId !== 'chon-chop') return { cells, unit };

  for (const dir of HEX_DIRECTIONS) {
    const coord = { q: unit.pos.q + dir.q, r: unit.pos.r + dir.r };
    const key = coordKey(coord);
    const pickup = cells[key]?.pickup;
    if (!pickup) continue;

    const nextCells = { ...cells, [key]: { ...cells[key], pickup: null } };
    return { cells: nextCells, unit: applyPickupToUnit(unit, pickup) };
  }
  return { cells, unit };
}

function resolveSporeOnStep(
  state: MonsterGameState,
  unit: MonsterUnit,
  coord: HexCoord
): { unit: MonsterUnit; spores: MonsterGameState['spores']; stop: boolean } {
  const key = coordKey(coord);
  const hazard = state.spores[key];
  if (!hazard) return { unit, spores: state.spores, stop: false };

  if (hazard.owner === unit.owner) {
    if (hazard.heal > 0) {
      const spores = { ...state.spores };
      delete spores[key];
      return {
        unit: { ...unit, hp: Math.min(unit.maxHp, unit.hp + hazard.heal) },
        spores,
        stop: false
      };
    }
    return { unit, spores: state.spores, stop: false };
  }

  const spores = { ...state.spores };
  delete spores[key];
  return {
    unit: { ...unit, hp: Math.max(0, unit.hp - hazard.damage) },
    spores,
    stop: true
  };
}

export function moveActiveUnit(
  state: MonsterGameState,
  destination: HexCoord
): MonsterGameState {
  const unitId = state.activeUnitId;
  if (!unitId || state.moved) return state;

  const unit = state.units.find((candidate) => candidate.id === unitId);
  if (!unit || pendingEvolution(unit)) return state;

  const path = findPath(state, unit, destination);
  if (!path) return state;

  let nextUnit = { ...unit };
  let nextCells = { ...state.cells };
  let spores = { ...state.spores };
  let travelled = 0;

  for (const step of path.slice(1)) {
    travelled += 1;
    nextUnit.pos = step;

    const key = coordKey(step);
    const pickup = nextCells[key]?.pickup;
    if (pickup) {
      nextUnit = applyPickupToUnit(nextUnit, pickup);
      nextCells[key] = { ...nextCells[key], pickup: null };
    }

    const sporeResult = resolveSporeOnStep({ ...state, spores }, nextUnit, step);
    nextUnit = sporeResult.unit;
    spores = sporeResult.spores;
    if (sporeResult.stop) break;
  }

  const adjacent = collectAdjacentChonPickup(nextCells, nextUnit);
  nextCells = adjacent.cells;
  nextUnit = adjacent.unit;

  const endTerrain = nextCells[coordKey(nextUnit.pos)]?.terrain ?? 'ground';
  if (nextUnit.speciesId === 'mam-reu' && endTerrain === 'cover') nextUnit.shield = Math.max(nextUnit.shield, 1);
  if (
    nextUnit.speciesId === 'long-lang-kinh' &&
    state.startTerrain &&
    endTerrain !== state.startTerrain
  ) nextUnit.shield = Math.max(nextUnit.shield, 1);

  return {
    ...state,
    cells: nextCells,
    spores,
    units: updateUnit(state.units, unitId, () => nextUnit),
    moved: travelled > 0,
    movedDistance: travelled,
    message: travelled > 0
      ? `${MONSTER_BY_ID[unit.speciesId].name} di chuyển ${travelled} hex.`
      : state.message
  };
}

function cubeRound(q: number, r: number): HexCoord {
  let x = q;
  let z = r;
  let y = -x - z;

  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
  else if (yDiff > zDiff) ry = -rx - rz;
  else rz = -rx - ry;

  return { q: rx, r: rz };
}

export function lineBetween(a: HexCoord, b: HexCoord): HexCoord[] {
  const distance = hexDistance(a, b);
  if (distance === 0) return [a];
  const result: HexCoord[] = [];
  for (let i = 0; i <= distance; i += 1) {
    const t = i / distance;
    result.push(cubeRound(
      a.q + (b.q - a.q) * t,
      a.r + (b.r - a.r) * t
    ));
  }
  return result;
}

export function hasLineOfSight(
  state: MonsterGameState,
  from: HexCoord,
  to: HexCoord
): boolean {
  return lineBetween(from, to)
    .slice(1, -1)
    .every((coord) => state.cells[coordKey(coord)]?.terrain !== 'blocker');
}

export function canTargetBasic(
  state: MonsterGameState,
  attacker: MonsterUnit,
  target: MonsterUnit
): boolean {
  if (!alive(attacker) || !alive(target) || attacker.owner === target.owner) return false;
  const distance = hexDistance(attacker.pos, target.pos);
  const effectiveRange = Math.max(1, attacker.range - attacker.slow);
  if (distance > effectiveRange) return false;
  return effectiveRange <= 1 || hasLineOfSight(state, attacker.pos, target.pos);
}

export interface CombatResult {
  outcome: 'miss' | 'normal' | 'crit';
  damage: number;
}

function coverReduction(state: MonsterGameState, attacker: MonsterUnit, target: MonsterUnit): number {
  const ranged = hexDistance(attacker.pos, target.pos) > 1;
  if (!ranged) return 0;
  if (state.cells[coordKey(target.pos)]?.terrain !== 'cover') return 0;
  if (attacker.speciesId === 'loi-nhan' && attacker.evolutions.includes('loi-e1-cover')) return .10;
  if (target.speciesId === 'giap-te') return .40;
  return .25;
}

export function rollCombat(
  state: MonsterGameState,
  attacker: MonsterUnit,
  target: MonsterUnit,
  listedDamage: number,
  random: () => number = Math.random,
  critBonus = 0
): CombatResult {
  const roll = random();
  const missChance = .10;
  const critChance = .10 + critBonus;
  if (roll < missChance) return { outcome: 'miss', damage: 0 };

  const outcome: CombatResult['outcome'] =
    roll >= 1 - critChance ? 'crit' : 'normal';
  let damage = outcome === 'crit' ? Math.ceil(listedDamage * 1.5) : listedDamage;
  const reduction = coverReduction(state, attacker, target);
  if (reduction > 0) damage = Math.max(1, Math.ceil(damage * (1 - reduction)));

  return { outcome, damage };
}

function damageUnit(unit: MonsterUnit, amount: number): { unit: MonsterUnit; hpDamage: number } {
  let remaining = amount;
  let shield = unit.shield;
  if (shield > 0) {
    const blocked = Math.min(shield, remaining);
    shield -= blocked;
    remaining -= blocked;
  }
  const hpDamage = Math.min(unit.hp, remaining);
  return {
    unit: { ...unit, shield, hp: Math.max(0, unit.hp - remaining) },
    hpDamage
  };
}

function grantCombatXp(attacker: MonsterUnit, dealtDamage: number, killed: boolean): MonsterUnit {
  let xp = attacker.xp;
  if (dealtDamage > 0) xp += 1;
  if (killed) xp += 2;
  return { ...attacker, xp };
}

function finishActivation(
  state: MonsterGameState,
  units: MonsterUnit[],
  message: string
): MonsterGameState {
  const activeId = state.activeUnitId;
  if (!activeId) return state;

  let nextUnits = updateUnit(units, activeId, (unit) => ({
    ...unit,
    activated: true,
    rooted: false,
    slow: 0,
    skillCooldown: state.skillUsedThisActivation
      ? unit.skillCooldown
      : Math.max(0, unit.skillCooldown - 1)
  }));

  const active = nextUnits.find((unit) => unit.id === activeId);
  const enemyPlayer = active ? otherPlayer(active.owner) : otherPlayer(state.currentPlayer);
  const enemyAlive = nextUnits.some((unit) => unit.owner === enemyPlayer && alive(unit));

  if (!enemyAlive) {
    return {
      ...state,
      phase: 'gameover',
      units: nextUnits,
      activeUnitId: null,
      winner: active?.owner ?? state.currentPlayer,
      message: `${message} · Người chơi ${(active?.owner ?? state.currentPlayer) + 1} thắng!`
    };
  }

  const p0Left = nextUnits.some((unit) => unit.owner === 0 && alive(unit) && !unit.activated);
  const p1Left = nextUnits.some((unit) => unit.owner === 1 && alive(unit) && !unit.activated);

  let round = state.round;
  let firstPlayer = state.firstPlayer;
  let currentPlayer = state.currentPlayer;

  if (!p0Left && !p1Left) {
    round += 1;
    firstPlayer = otherPlayer(firstPlayer);
    currentPlayer = firstPlayer;
    nextUnits = nextUnits.map((unit) => alive(unit) ? { ...unit, activated: false } : unit);
  } else {
    const opponent = otherPlayer(state.currentPlayer);
    const opponentHas = opponent === 0 ? p0Left : p1Left;
    const currentHas = state.currentPlayer === 0 ? p0Left : p1Left;
    currentPlayer = opponentHas ? opponent : currentHas ? state.currentPlayer : opponent;
  }

  return {
    ...state,
    units: nextUnits,
    round,
    firstPlayer,
    currentPlayer,
    activeUnitId: null,
    moved: false,
    movedDistance: 0,
    skillUsedThisActivation: false,
    startTerrain: null,
    message: !p0Left && !p1Left
      ? `${message} · Round ${round}, Người chơi ${currentPlayer + 1} đi trước.`
      : message
  };
}

export function basicAttack(
  state: MonsterGameState,
  targetId: string,
  random: () => number = Math.random
): MonsterGameState {
  const activeId = state.activeUnitId;
  if (!activeId) return state;

  const attacker = state.units.find((unit) => unit.id === activeId);
  const target = state.units.find((unit) => unit.id === targetId);
  if (!attacker || !target || pendingEvolution(attacker) || !canTargetBasic(state, attacker, target)) return state;

  let listedDamage = attacker.damage + attacker.fury;
  if (attacker.speciesId === 'bo-hoa-dao' && state.movedDistance >= 2) listedDamage += 1;
  if (
    attacker.speciesId === 'loi-nhan' &&
    attacker.evolutions.includes('loi-e2-sky') &&
    hexDistance(attacker.pos, target.pos) >= 4
  ) listedDamage += 1;
  if (
    attacker.speciesId === 'thiet-ngac' &&
    attacker.evolutions.includes('ngac-e2-finish') &&
    target.hp <= target.maxHp * .25
  ) listedDamage += 2;

  const critBonus =
    attacker.speciesId === 'bo-hoa-dao' &&
    attacker.evolutions.includes('bo-e2-crit')
      ? .10
      : 0;

  const result = rollCombat(state, attacker, target, listedDamage, random, critBonus);
  let units = [...state.units];
  const damaged = damageUnit(target, result.damage);
  const killed = target.hp > 0 && damaged.unit.hp === 0;
  let nextAttacker = grantCombatXp(attacker, damaged.hpDamage, killed);

  if (damaged.hpDamage > 0 && attacker.fury > 0) nextAttacker.fury = Math.max(0, attacker.fury - 1);
  if (attacker.speciesId === 'loi-nhan' && result.outcome === 'crit') {
    damaged.unit.slow = Math.max(damaged.unit.slow, 1);
  }
  if (killed && attacker.speciesId === 'thiet-ngac' && attacker.evolutions.includes('ngac-e2-repair')) {
    nextAttacker.hp = Math.min(nextAttacker.maxHp, nextAttacker.hp + 3);
  }

  units = updateUnit(units, target.id, () => damaged.unit);
  units = updateUnit(units, attacker.id, () => nextAttacker);

  return finishActivation(
    state,
    units,
    result.outcome === 'miss'
      ? `${MONSTER_BY_ID[attacker.speciesId].name} đánh hụt!`
      : `${MONSTER_BY_ID[attacker.speciesId].name} ${result.outcome === 'crit' ? 'CRIT' : 'đánh'} ${damaged.hpDamage} damage.`
  );
}

function applySkillDamage(
  state: MonsterGameState,
  attacker: MonsterUnit,
  target: MonsterUnit,
  listedDamage: number,
  random: () => number
) {
  const result = rollCombat(state, attacker, target, listedDamage, random);
  const damaged = damageUnit(target, result.damage);
  return { result, damaged, killed: target.hp > 0 && damaged.unit.hp === 0 };
}

function skillCooldownFor(unit: MonsterUnit): number {
  const def = MONSTER_BY_ID[unit.speciesId];
  if (unit.speciesId === 'bo-hoa-dao' && unit.evolutions.includes('bo-e2-fast')) return 1;
  if (unit.speciesId === 'mong-nam' && unit.evolutions.includes('nam-e2-web')) return 2;
  if (unit.speciesId === 'loi-nhan' && unit.evolutions.includes('loi-e2-overload')) return 1;
  return def.skillCooldown;
}

export function useActiveSkillOnUnit(
  state: MonsterGameState,
  targetId: string,
  random: () => number = Math.random
): MonsterGameState {
  const activeId = state.activeUnitId;
  if (!activeId) return state;

  const attacker = state.units.find((unit) => unit.id === activeId);
  const target = state.units.find((unit) => unit.id === targetId);
  if (!attacker || !target || pendingEvolution(attacker) || attacker.skillCooldown > 0) return state;

  const def = MONSTER_BY_ID[attacker.speciesId];
  const distance = hexDistance(attacker.pos, target.pos);
  let units = [...state.units];
  let message = `${def.name} dùng ${def.skillName}.`;
  let valid = false;
  let nextAttacker = { ...attacker, skillCooldown: skillCooldownFor(attacker) };

  if (attacker.speciesId === 'mam-reu' && target.owner === attacker.owner) {
    const reach = attacker.evolutions.includes('reu-e2-reach') ? 2 : 1;
    if (distance <= reach) {
      const baseHeal = target.id === attacker.id ? 1 : 2;
      const bonus = attacker.evolutions.includes('reu-e1-sap') ? 1 : 0;
      units = updateUnit(units, target.id, (unit) => ({
        ...unit,
        hp: Math.min(unit.maxHp, unit.hp + baseHeal + bonus),
        fury: attacker.evolutions.includes('reu-e1-graft') && unit.id !== attacker.id
          ? unit.fury + 1
          : unit.fury
      }));
      valid = true;
    }
  }

  if (attacker.speciesId === 'giap-te' && target.owner !== attacker.owner && distance === 1) {
    const skill = applySkillDamage(state, attacker, target, 2, random);
    let damaged = skill.damaged.unit;
    const direction = { q: target.pos.q - attacker.pos.q, r: target.pos.r - attacker.pos.r };
    const push = { q: target.pos.q + direction.q, r: target.pos.r + direction.r };
    const pushCell = state.cells[coordKey(push)];
    const canPush =
      pushCell &&
      pushCell.terrain !== 'blocker' &&
      !unitAt(state, push) &&
      !(target.speciesId === 'giap-te' && target.evolutions.includes('te-e2-anchor') &&
        state.cells[coordKey(target.pos)]?.terrain === 'cover');

    if (canPush) damaged = { ...damaged, pos: push };
    else if (attacker.evolutions.includes('te-e1-horn') && skill.result.outcome !== 'miss') {
      damaged = damageUnit(damaged, 1).unit;
    }

    const killed = target.hp > 0 && damaged.hp === 0;
    nextAttacker = grantCombatXp(nextAttacker, Math.max(0, target.hp - damaged.hp), killed);
    units = updateUnit(units, target.id, () => damaged);
    valid = true;
  }

  if (attacker.speciesId === 'bo-hoa-dao' && target.owner !== attacker.owner && distance === 1) {
    const skill = applySkillDamage(state, attacker, target, 2, random);
    let damaged = skill.damaged.unit;
    const direction = { q: target.pos.q - attacker.pos.q, r: target.pos.r - attacker.pos.r };
    const landing = { q: target.pos.q + direction.q, r: target.pos.r + direction.r };
    const landCell = state.cells[coordKey(landing)];
    if (landCell && landCell.terrain !== 'blocker' && !unitAt(state, landing)) {
      nextAttacker.pos = landing;
    }
    if (attacker.evolutions.includes('bo-e1-burn') && skill.result.outcome !== 'miss') {
      damaged = damageUnit(damaged, 1).unit;
    }
    const killed = target.hp > 0 && damaged.hp === 0;
    nextAttacker = grantCombatXp(nextAttacker, Math.max(0, target.hp - damaged.hp), killed);
    units = updateUnit(units, target.id, () => damaged);
    valid = true;
  }

  if (attacker.speciesId === 'loi-nhan' && target.owner !== attacker.owner && distance <= 4 && hasLineOfSight(state, attacker.pos, target.pos)) {
    const skill = applySkillDamage(state, attacker, target, 2, random);
    let damaged = skill.damaged.unit;
    const killed = target.hp > 0 && damaged.hp === 0;
    nextAttacker = grantCombatXp(nextAttacker, skill.damaged.hpDamage, killed);
    units = updateUnit(units, target.id, () => damaged);

    const line = lineBetween(attacker.pos, target.pos);
    const lastDir = line.length >= 2
      ? { q: line[line.length - 1].q - line[line.length - 2].q, r: line[line.length - 1].r - line[line.length - 2].r }
      : null;
    if (lastDir) {
      const behind = { q: target.pos.q + lastDir.q, r: target.pos.r + lastDir.r };
      const second = unitAt({ ...state, units }, behind);
      if (second && second.owner !== attacker.owner) {
        const secondDamage = attacker.evolutions.includes('loi-e1-chain') ? 2 : 1;
        units = updateUnit(units, second.id, (unit) => damageUnit(unit, secondDamage).unit);
      }
    }
    if (attacker.evolutions.includes('loi-e2-overload')) nextAttacker.hp = Math.max(1, nextAttacker.hp - 1);
    valid = true;
  }

  if (attacker.speciesId === 'thiet-ngac' && target.owner !== attacker.owner) {
    const reach = attacker.evolutions.includes('ngac-e1-chain') ? 2 : 1;
    if (distance <= reach && hasLineOfSight(state, attacker.pos, target.pos)) {
      let targetPos = target.pos;
      if (distance === 2) {
        const candidates = neighbors(state, attacker.pos).filter((coord) =>
          hexDistance(coord, target.pos) === 1 &&
          state.cells[coordKey(coord)]?.terrain !== 'blocker' &&
          !unitAt(state, coord)
        );
        if (candidates[0]) targetPos = candidates[0];
      }

      const movedTarget = { ...target, pos: targetPos };
      const skill = applySkillDamage(state, attacker, movedTarget, 3, random);
      const damaged = { ...skill.damaged.unit, rooted: true };
      const killed = target.hp > 0 && damaged.hp === 0;
      nextAttacker = grantCombatXp(nextAttacker, skill.damaged.hpDamage, killed);
      units = updateUnit(units, target.id, () => damaged);
      if (killed && attacker.evolutions.includes('ngac-e2-repair')) {
        nextAttacker.hp = Math.min(nextAttacker.maxHp, nextAttacker.hp + 3);
      }
      valid = true;
    }
  }

  if (attacker.speciesId === 'long-lang-kinh' && target.owner !== attacker.owner && distance <= attacker.range && hasLineOfSight(state, attacker.pos, target.pos)) {
    const focused = attacker.evolutions.includes('long-e2-focus');
    const primaryDamage = focused ? 5 : 2;
    const skill = applySkillDamage(state, attacker, target, primaryDamage, random);
    const killed = target.hp > 0 && skill.damaged.unit.hp === 0;
    nextAttacker = grantCombatXp(nextAttacker, skill.damaged.hpDamage, killed);
    units = updateUnit(units, target.id, () => skill.damaged.unit);

    if (!focused) {
      const maxSplash = attacker.evolutions.includes('long-e2-split') ? 4 : 2;
      const splashTargets = units.filter((unit) =>
        alive(unit) &&
        unit.owner !== attacker.owner &&
        unit.id !== target.id &&
        hexDistance(unit.pos, target.pos) === 1
      ).slice(0, maxSplash);
      for (const splash of splashTargets) {
        units = updateUnit(units, splash.id, (unit) => damageUnit(unit, 1).unit);
      }
    }
    if (attacker.evolutions.includes('long-e2-armor')) nextAttacker.shield += 2;
    valid = true;
  }

  if (!valid) return state;

  units = updateUnit(units, attacker.id, () => nextAttacker);
  return finishActivation(
    { ...state, skillUsedThisActivation: true },
    units,
    message
  );
}

export function useActiveSkillOnHex(
  state: MonsterGameState,
  target: HexCoord
): MonsterGameState {
  const activeId = state.activeUnitId;
  if (!activeId) return state;
  const attacker = state.units.find((unit) => unit.id === activeId);
  if (!attacker || pendingEvolution(attacker) || attacker.skillCooldown > 0) return state;

  const distance = hexDistance(attacker.pos, target);
  const cell = state.cells[coordKey(target)];
  if (!cell || cell.terrain === 'blocker') return state;

  let units = [...state.units];
  let spores = { ...state.spores };
  let valid = false;
  let nextAttacker = { ...attacker, skillCooldown: skillCooldownFor(attacker) };
  let message = '';

  if (attacker.speciesId === 'chon-chop' && distance <= 3 && !unitAt(state, target)) {
    nextAttacker.pos = target;
    const adjacentEnemy = state.units.find((unit) =>
      alive(unit) && unit.owner !== attacker.owner && hexDistance(unit.pos, target) === 1
    );
    if (adjacentEnemy) {
      units = updateUnit(units, adjacentEnemy.id, (unit) => damageUnit(unit, 1).unit);
    }
    valid = true;
    message = 'Chồn Chớp dùng Lướt Điện.';
  }

  if (
    attacker.speciesId === 'mong-nam' &&
    distance <= 3 &&
    hasLineOfSight(state, attacker.pos, target)
  ) {
    const heal = attacker.evolutions.includes('nam-e1-heal') ? 1 : 0;
    const damage = attacker.evolutions.includes('nam-e1-poison') ? 1 : 0;
    spores[coordKey(target)] = {
      owner: attacker.owner,
      sourceUnitId: attacker.id,
      damage,
      heal
    };

    if (attacker.evolutions.includes('nam-e1-wide')) {
      const extra = neighbors(state, target).find((coord) =>
        state.cells[coordKey(coord)]?.terrain !== 'blocker' &&
        !spores[coordKey(coord)]
      );
      if (extra) {
        spores[coordKey(extra)] = {
          owner: attacker.owner,
          sourceUnitId: attacker.id,
          damage,
          heal
        };
      }
    }
    valid = true;
    message = 'Mộng Nấm gieo Bào Tử Dính.';
  }

  if (!valid) return state;
  units = updateUnit(units, attacker.id, () => nextAttacker);
  return finishActivation(
    { ...state, spores, skillUsedThisActivation: true },
    units,
    message
  );
}

export function useArtifact(state: MonsterGameState): MonsterGameState {
  const activeId = state.activeUnitId;
  if (!activeId) return state;
  const unit = state.units.find((candidate) => candidate.id === activeId);
  if (!unit || !unit.artifact || pendingEvolution(unit)) return state;

  const units = updateUnit(state.units, unit.id, (current) => ({
    ...current,
    artifact: false,
    hp: Math.min(current.maxHp, current.hp + 4),
    shield: current.shield + 2
  }));
  return finishActivation(state, units, `${MONSTER_BY_ID[unit.speciesId].name} kích hoạt Cổ Vật: +4 HP, +2 khiên.`);
}

export function waitAction(state: MonsterGameState): MonsterGameState {
  const activeId = state.activeUnitId;
  if (!activeId) return state;
  const unit = state.units.find((candidate) => candidate.id === activeId);
  if (!unit || pendingEvolution(unit)) return state;
  return finishActivation(state, state.units, `${MONSTER_BY_ID[unit.speciesId].name} chờ.`);
}

export function resetDraft(seed = Date.now()): MonsterGameState {
  return createMonsterGame(seed);
}
