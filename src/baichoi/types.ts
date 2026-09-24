export type BaiChoiMode = 'solo' | 'local';

export interface BaiChoiCard {
  id: string;
  name: string;
}

export type BaiChoiHutOwner = 'human-1' | 'human-2' | 'bot';

export interface BaiChoiHut {
  id: number;
  owner: BaiChoiHutOwner;
  cards: BaiChoiCard[];
  hits: string[];
}

export interface BaiChoiState {
  huts: BaiChoiHut[];
  drawPile: BaiChoiCard[];
  drawn: string[];
  lastDraw: BaiChoiCard | null;
  winnerHutId: number | null;
  turn: number;
  mode: BaiChoiMode;
}
