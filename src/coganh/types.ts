export type GanhPlayer = 0 | 1;
export type GanhCell = GanhPlayer | null;
export type GanhMode = 'local' | 'ai';
export type GanhAiLevel = 'easy' | 'medium' | 'hard';

export interface GanhMove {
  from: number;
  to: number;
}

export type GanhCaptureType = 'none' | 'ganh' | 'vay' | 'ganh+vay';

export interface GanhState {
  board: GanhCell[];
  currentPlayer: GanhPlayer;
  winner: GanhPlayer | null;
  turn: number;
  forcedGanhAt: number | null;
  lastMove: GanhMove | null;
  lastConverted: number[];
  lastCaptureType: GanhCaptureType;
  lastMessage: string;
}
