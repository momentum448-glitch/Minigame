export type FanoronaPlayer = 0 | 1;
export type FanoronaCell = FanoronaPlayer | null;
export type FanoronaMode = 'local' | 'ai';
export type FanoronaAiLevel = 'easy' | 'medium' | 'hard';
export type FanoronaCaptureMode = 'approach' | 'withdrawal';
export type FanoronaDirection = string;

export interface FanoronaStep {
  from: number;
  to: number;
  captureMode: FanoronaCaptureMode | null;
  captured: number[];
  direction: FanoronaDirection;
}

export interface FanoronaChain {
  piece: number;
  visited: number[];
  lastDirection: FanoronaDirection;
  captures: number;
}

export interface FanoronaState {
  board: FanoronaCell[];
  currentPlayer: FanoronaPlayer;
  winner: FanoronaPlayer | null;
  drawReason: string | null;
  turn: number;
  chain: FanoronaChain | null;
  lastStep: FanoronaStep | null;
  lastMessage: string;
  positionHistory: string[];
}

export type FanoronaAiAction =
  | { kind: 'step'; step: FanoronaStep }
  | { kind: 'stop' };
