export type TamCucPlayer = 0 | 1;
export type TamCucColor = 'red' | 'black';
export type TamCucRank = 'tuong' | 'si' | 'tuong-voi' | 'xe' | 'phao' | 'ma' | 'tot';
export type TamCucMode = 'local' | 'ai';
export type TamCucAiLevel = 'easy' | 'medium' | 'hard';

export interface TamCucCard {
  id: string;
  color: TamCucColor;
  rank: TamCucRank;
  copy: number;
}

export interface TamCucRoundResult {
  lead: TamCucCard[];
  response: TamCucCard[];
  responseRevealed: boolean;
  winner: TamCucPlayer;
}

export interface TamCucState {
  hands: [TamCucCard[], TamCucCard[]];
  captured: [TamCucCard[], TamCucCard[]];
  caller: TamCucPlayer;
  round: number;
  winner: TamCucPlayer | 'draw' | null;
  lastResult: TamCucRoundResult | null;
  lastMessage: string;
}
