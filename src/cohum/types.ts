export type HumSide = 'hum' | 'trau';
export type HumCell = HumSide | null;
export type HumMode = 'local' | 'ai';
export type HumAiLevel = 'easy' | 'medium' | 'hard';

export interface HumMove {
  from: number;
  to: number;
  capture: number | null;
}

export interface HumState {
  board: HumCell[];
  currentPlayer: HumSide;
  winner: HumSide | null;
  turn: number;
  lastMove: HumMove | null;
  lastMoveByPlayer: Record<HumSide, HumMove | null>;
  lastCaptured: number | null;
  lastMessage: string;
}
