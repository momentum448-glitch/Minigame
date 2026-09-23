export type Player = 0 | 1;
export type Direction = -1 | 1;
export type GameMode = 'local' | 'ai';
export type AiLevel = 'easy' | 'medium' | 'hard';

export interface Pit {
  dan: number;
  quan: boolean;
}

export interface GameState {
  pits: Pit[];
  currentPlayer: Player;
  score: [number, number];
  debt: [number, number];
  winner: Player | 'draw' | null;
  gameOver: boolean;
  turn: number;
  lastMessage: string;
}

export interface Move {
  pit: number;
  direction: Direction;
}

export type MoveEvent =
  | {
      type: 'pickup' | 'continue-pickup';
      pit: number;
      count: number;
      hand: number;
    }
  | {
      type: 'drop';
      pit: number;
      hand: number;
    }
  | {
      type: 'capture';
      pit: number;
      dan: number;
      quan: boolean;
      points: number;
      hand: 0;
    }
  | {
      type: 'refill';
      player: Player;
      pit: number;
      borrowed: number;
      hand: number;
    }
  | {
      type: 'turn-end';
      player: Player;
      nextPlayer: Player | null;
      captured: number;
      gameOver: boolean;
      hand: 0;
    };
