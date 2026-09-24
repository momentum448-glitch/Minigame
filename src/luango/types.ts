export type LuaNgoPlayer = 0 | 1;
export type LuaNgoCell = LuaNgoPlayer | null;
export type LuaNgoMode = 'local' | 'ai';
export type LuaNgoAiLevel = 'easy' | 'medium' | 'hard';

export interface LuaNgoMove {
  path: number[];
  capture: number | null;
  blocked: boolean;
}

export interface LuaNgoState {
  board: LuaNgoCell[];
  currentPlayer: LuaNgoPlayer;
  winner: LuaNgoPlayer | null;
  turn: number;
  lastMove: LuaNgoMove | null;
  lastMessage: string;
}
