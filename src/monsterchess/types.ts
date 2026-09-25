export type MonsterPlayer = 0 | 1;
export type TerrainType = 'ground' | 'blocker' | 'cover';
export type PickupKind = 'xp' | 'heal' | 'fury' | 'guard' | 'artifact';
export type BattlePhase = 'draft' | 'battle' | 'gameover';

export interface HexCoord {
  q: number;
  r: number;
}

export interface EvolutionOption {
  id: string;
  name: string;
  description: string;
}

export interface MonsterDefinition {
  id: string;
  name: string;
  glyph: string;
  stars: number;
  role: string;
  maxHp: number;
  move: number;
  range: number;
  damage: number;
  skillName: string;
  skillCooldown: number;
  skillDescription: string;
  skillTarget: 'self' | 'ally' | 'enemy' | 'hex';
  passiveName: string;
  passiveDescription: string;
  evolution1: EvolutionOption[];
  evolution2: EvolutionOption[];
}

export interface BoardCell {
  coord: HexCoord;
  terrain: TerrainType;
  pickup: PickupKind | null;
}

export interface MonsterUnit {
  id: string;
  speciesId: string;
  owner: MonsterPlayer;
  pos: HexCoord;
  hp: number;
  maxHp: number;
  move: number;
  range: number;
  damage: number;
  xp: number;
  evolutionTier: 0 | 1 | 2;
  evolutions: string[];
  activated: boolean;
  skillCooldown: number;
  shield: number;
  fury: number;
  rooted: boolean;
  slow: number;
  artifact: boolean;
}

export interface DraftState {
  picks: [string[], string[]];
  spent: [number, number];
  currentPlayer: MonsterPlayer;
  passed: [boolean, boolean];
  locked: string[];
  budget: number;
  maxUnits: number;
}

export interface SporeHazard {
  owner: MonsterPlayer;
  sourceUnitId: string;
  damage: number;
  heal: number;
}

export interface MonsterGameState {
  phase: BattlePhase;
  draft: DraftState;
  cells: Record<string, BoardCell>;
  units: MonsterUnit[];
  round: number;
  firstPlayer: MonsterPlayer;
  currentPlayer: MonsterPlayer;
  activeUnitId: string | null;
  moved: boolean;
  movedDistance: number;
  skillUsedThisActivation: boolean;
  startTerrain: TerrainType | null;
  spores: Record<string, SporeHazard>;
  winner: MonsterPlayer | null;
  message: string;
  seed: number;
}
