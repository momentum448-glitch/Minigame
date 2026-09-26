export type HorseSeat = 0 | 1 | 2 | 3;
export type HorseZone = 'yard' | 'track' | 'home';

export interface HorsePiece {
  id: string;
  owner: HorseSeat;
  zone: HorseZone;
  progress: number | null;
  homeRank: number | null;
}

export interface DiceBatch {
  values: number[];
  used: boolean[];
}

export interface HorseGameState {
  activeSeats: HorseSeat[];
  horses: HorsePiece[];
  currentSeat: HorseSeat;
  batch: DiceBatch | null;
  bonusDiceToRoll: number;
  winner: HorseSeat | null;
  turn: number;
  message: string;
}

export type HorseAction =
  | { type: 'deploy'; horseId: string; dieIndex: number }
  | { type: 'move'; horseId: string; dieIndex: number; steps: number }
  | { type: 'fly-next-gate'; horseId: string; dieIndex: number; distance: number }
  | { type: 'climb-home'; horseId: string; dieIndex: number; toRank: number }
  | { type: 'discard-die'; dieIndex: number };
