import type {
  FanoronaCaptureMode,
  FanoronaCell,
  FanoronaDirection,
  FanoronaPlayer,
  FanoronaState,
  FanoronaStep
} from './types';

export const FANORONA_ROWS = 5;
export const FANORONA_COLS = 9;
export const FANORONA_POINT_COUNT = FANORONA_ROWS * FANORONA_COLS;
export const FANORONA_CENTER = 2 * FANORONA_COLS + 4;

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1]
];

export const FANORONA_NODE_COORDS: readonly [number, number][] = Array.from(
  { length: FANORONA_POINT_COUNT },
  (_, index) => [index % FANORONA_COLS, Math.floor(index / FANORONA_COLS)] as [number, number]
);

function inside(row: number, col: number): boolean {
  return row >= 0 && row < FANORONA_ROWS && col >= 0 && col < FANORONA_COLS;
}

export function fanoronaIndex(row: number, col: number): number {
  return row * FANORONA_COLS + col;
}

export function fanoronaRowCol(index: number): [number, number] {
  return [Math.floor(index / FANORONA_COLS), index % FANORONA_COLS];
}

export function isFanoronaStrongPoint(index: number): boolean {
  const [row, col] = fanoronaRowCol(index);
  return (row + col) % 2 === 0;
}

function connectedByLine(from: number, to: number): boolean {
  const [fromRow, fromCol] = fanoronaRowCol(from);
  const [toRow, toCol] = fanoronaRowCol(to);
  const dr = toRow - fromRow;
  const dc = toCol - fromCol;
  if (Math.max(Math.abs(dr), Math.abs(dc)) !== 1 || (dr === 0 && dc === 0)) return false;
  if (dr !== 0 && dc !== 0) return isFanoronaStrongPoint(from) && isFanoronaStrongPoint(to);
  return true;
}

const adjacency: number[][] = Array.from({ length: FANORONA_POINT_COUNT }, () => []);
for (let from = 0; from < FANORONA_POINT_COUNT; from += 1) {
  const [row, col] = fanoronaRowCol(from);
  for (const [dr, dc] of DIRECTIONS) {
    const nextRow = row + dr;
    const nextCol = col + dc;
    if (!inside(nextRow, nextCol)) continue;
    const to = fanoronaIndex(nextRow, nextCol);
    if (connectedByLine(from, to)) adjacency[from].push(to);
  }
}

export const FANORONA_BOARD_EDGES: readonly [number, number][] = (() => {
  const edges: [number, number][] = [];
  for (let from = 0; from < adjacency.length; from += 1) {
    for (const to of adjacency[from]) {
      if (from < to) edges.push([from, to]);
    }
  }
  return edges;
})();

export function fanoronaNeighbors(index: number): number[] {
  return [...(adjacency[index] ?? [])];
}

export function otherFanoronaPlayer(player: FanoronaPlayer): FanoronaPlayer {
  return player === 0 ? 1 : 0;
}

export function countFanoronaPieces(state: FanoronaState, player: FanoronaPlayer): number {
  return state.board.reduce<number>((sum, cell) => sum + (cell === player ? 1 : 0), 0);
}

function positionKey(board: FanoronaCell[], currentPlayer: FanoronaPlayer): string {
  return `${board.map((cell) => cell === null ? '.' : String(cell)).join('')}|${currentPlayer}`;
}

export function fanoronaPositionKey(state: Pick<FanoronaState, 'board' | 'currentPlayer'>): string {
  return positionKey(state.board, state.currentPlayer);
}

export function createInitialFanoronaState(): FanoronaState {
  const board: FanoronaCell[] = Array(FANORONA_POINT_COUNT).fill(null);

  for (let col = 0; col < FANORONA_COLS; col += 1) {
    board[fanoronaIndex(0, col)] = 1;
    board[fanoronaIndex(1, col)] = 1;
    board[fanoronaIndex(3, col)] = 0;
    board[fanoronaIndex(4, col)] = 0;
  }

  const middle: FanoronaCell[] = [1, 0, 1, 0, null, 1, 0, 1, 0];
  for (let col = 0; col < FANORONA_COLS; col += 1) {
    board[fanoronaIndex(2, col)] = middle[col];
  }

  const currentPlayer: FanoronaPlayer = 0;
  return {
    board,
    currentPlayer,
    winner: null,
    drawReason: null,
    turn: 1,
    chain: null,
    lastStep: null,
    lastMessage: 'Quân sáng đi trước.',
    positionHistory: [positionKey(board, currentPlayer)]
  };
}

export function cloneFanoronaState(state: FanoronaState): FanoronaState {
  return {
    ...state,
    board: [...state.board],
    chain: state.chain
      ? {
          ...state.chain,
          visited: [...state.chain.visited]
        }
      : null,
    lastStep: state.lastStep
      ? {
          ...state.lastStep,
          captured: [...state.lastStep.captured]
        }
      : null,
    positionHistory: [...state.positionHistory]
  };
}

function directionKey(dr: number, dc: number): FanoronaDirection {
  return `${dr},${dc}`;
}

function collectOpponentLine(
  board: FanoronaCell[],
  startRow: number,
  startCol: number,
  dr: number,
  dc: number,
  opponent: FanoronaPlayer
): number[] {
  const captured: number[] = [];
  let row = startRow;
  let col = startCol;

  while (inside(row, col)) {
    const index = fanoronaIndex(row, col);
    if (board[index] !== opponent) break;
    captured.push(index);
    row += dr;
    col += dc;
  }

  return captured;
}

function captureVariants(
  state: FanoronaState,
  from: number,
  to: number
): FanoronaStep[] {
  const player = state.currentPlayer;
  if (state.board[from] !== player || state.board[to] !== null || !connectedByLine(from, to)) return [];

  const [fromRow, fromCol] = fanoronaRowCol(from);
  const [toRow, toCol] = fanoronaRowCol(to);
  const dr = toRow - fromRow;
  const dc = toCol - fromCol;
  const direction = directionKey(dr, dc);

  if (state.chain) {
    if (state.chain.piece !== from) return [];
    if (state.chain.visited.includes(to)) return [];
    if (state.chain.lastDirection === direction) return [];
  }

  const opponent = otherFanoronaPlayer(player);
  const approach = collectOpponentLine(state.board, toRow + dr, toCol + dc, dr, dc, opponent);
  const withdrawal = collectOpponentLine(state.board, fromRow - dr, fromCol - dc, -dr, -dc, opponent);
  const variants: FanoronaStep[] = [];

  if (approach.length > 0) {
    variants.push({
      from,
      to,
      captureMode: 'approach',
      captured: approach,
      direction
    });
  }

  if (withdrawal.length > 0) {
    variants.push({
      from,
      to,
      captureMode: 'withdrawal',
      captured: withdrawal,
      direction
    });
  }

  return variants;
}

function captureStepsForPiece(state: FanoronaState, from: number): FanoronaStep[] {
  if (state.board[from] !== state.currentPlayer) return [];
  const steps: FanoronaStep[] = [];
  for (const to of adjacency[from]) {
    steps.push(...captureVariants(state, from, to));
  }
  return steps;
}

export function legalFanoronaSteps(state: FanoronaState): FanoronaStep[] {
  if (state.winner !== null || state.drawReason !== null) return [];

  if (state.chain) {
    return captureStepsForPiece(state, state.chain.piece);
  }

  const captures: FanoronaStep[] = [];
  for (let from = 0; from < state.board.length; from += 1) {
    if (state.board[from] !== state.currentPlayer) continue;
    captures.push(...captureStepsForPiece(state, from));
  }
  if (captures.length > 0) return captures;

  const paika: FanoronaStep[] = [];
  for (let from = 0; from < state.board.length; from += 1) {
    if (state.board[from] !== state.currentPlayer) continue;
    const [fromRow, fromCol] = fanoronaRowCol(from);
    for (const to of adjacency[from]) {
      if (state.board[to] !== null) continue;
      const [toRow, toCol] = fanoronaRowCol(to);
      paika.push({
        from,
        to,
        captureMode: null,
        captured: [],
        direction: directionKey(toRow - fromRow, toCol - fromCol)
      });
    }
  }
  return paika;
}

export function hasMandatoryFanoronaCapture(state: FanoronaState): boolean {
  if (state.chain) return legalFanoronaSteps(state).length > 0;
  return legalFanoronaSteps(state).some((step) => step.captureMode !== null);
}

export function canStopFanoronaChain(state: FanoronaState): boolean {
  return state.chain !== null && state.chain.captures > 0 && state.winner === null && state.drawReason === null;
}

function sameStep(a: FanoronaStep, b: FanoronaStep): boolean {
  return a.from === b.from && a.to === b.to && a.captureMode === b.captureMode;
}

function finishTurn(
  state: FanoronaState,
  playerWhoMoved: FanoronaPlayer,
  message: string
): FanoronaState {
  state.chain = null;
  state.currentPlayer = otherFanoronaPlayer(playerWhoMoved);
  state.turn += 1;
  state.lastMessage = message;

  if (countFanoronaPieces(state, state.currentPlayer) === 0 || legalFanoronaSteps(state).length === 0) {
    state.winner = playerWhoMoved;
    state.lastMessage = countFanoronaPieces(state, state.currentPlayer) === 0
      ? `${playerWhoMoved === 0 ? 'Quân sáng' : 'Quân tối'} đã ăn hết quân đối phương.`
      : `${state.currentPlayer === 0 ? 'Quân sáng' : 'Quân tối'} không còn nước hợp lệ.`;
    return state;
  }

  const key = positionKey(state.board, state.currentPlayer);
  state.positionHistory.push(key);
  const repeats = state.positionHistory.reduce((count, candidate) => count + (candidate === key ? 1 : 0), 0);
  if (repeats >= 3) {
    state.drawReason = 'Cùng thế cờ và người tới lượt đã lặp lại 3 lần.';
    state.lastMessage = 'Hòa do lặp thế cờ 3 lần.';
  }

  return state;
}

export function applyFanoronaStep(input: FanoronaState, requested: FanoronaStep): FanoronaState {
  const legal = legalFanoronaSteps(input).find((candidate) => sameStep(candidate, requested));
  if (!legal) return input;

  const state = cloneFanoronaState(input);
  const player = state.currentPlayer;
  state.board[legal.from] = null;
  state.board[legal.to] = player;
  for (const captured of legal.captured) state.board[captured] = null;
  state.lastStep = { ...legal, captured: [...legal.captured] };

  if (legal.captureMode === null) {
    return finishTurn(state, player, 'Đi một nước paika. Đổi lượt.');
  }

  if (countFanoronaPieces(state, otherFanoronaPlayer(player)) === 0) {
    state.chain = null;
    state.winner = player;
    state.lastMessage = `${player === 0 ? 'Quân sáng' : 'Quân tối'} đã ăn hết quân đối phương.`;
    return state;
  }

  const previous = input.chain;
  state.chain = {
    piece: legal.to,
    visited: previous ? [...previous.visited, legal.to] : [legal.from, legal.to],
    lastDirection: legal.direction,
    captures: (previous?.captures ?? 0) + legal.captured.length
  };

  const continuations = legalFanoronaSteps(state);
  if (continuations.length === 0) {
    return finishTurn(
      state,
      player,
      `Ăn ${state.chain.captures} quân trong chuỗi. Không còn nước ăn tiếp.`
    );
  }

  state.lastMessage = `Ăn ${legal.captured.length} quân bằng ${legal.captureMode === 'approach' ? 'tiến ăn' : 'lùi ăn'}. Có thể ăn tiếp hoặc dừng lượt.`;
  return state;
}

export function stopFanoronaChain(input: FanoronaState): FanoronaState {
  if (!canStopFanoronaChain(input)) return input;
  const state = cloneFanoronaState(input);
  const player = state.currentPlayer;
  const total = state.chain?.captures ?? 0;
  return finishTurn(state, player, `Dừng chuỗi sau khi ăn ${total} quân.`);
}

export function evaluateFanoronaState(
  state: FanoronaState,
  perspective: FanoronaPlayer
): number {
  if (state.winner !== null) return state.winner === perspective ? 100000 : -100000;
  if (state.drawReason !== null) return 0;

  const opponent = otherFanoronaPlayer(perspective);
  const mine = countFanoronaPieces(state, perspective);
  const theirs = countFanoronaPieces(state, opponent);

  let center = 0;
  for (let index = 0; index < state.board.length; index += 1) {
    const cell = state.board[index];
    if (cell === null) continue;
    const [row, col] = fanoronaRowCol(index);
    const centrality = 6 - (Math.abs(row - 2) + Math.abs(col - 4));
    center += (cell === perspective ? 1 : -1) * Math.max(0, centrality);
  }

  const mineProbe: FanoronaState = { ...state, currentPlayer: perspective, chain: null };
  const oppProbe: FanoronaState = { ...state, currentPlayer: opponent, chain: null };
  const mineMoves = legalFanoronaSteps(mineProbe);
  const oppMoves = legalFanoronaSteps(oppProbe);
  const mineCapturePower = mineMoves.reduce((sum, step) => sum + step.captured.length, 0);
  const oppCapturePower = oppMoves.reduce((sum, step) => sum + step.captured.length, 0);

  return (
    (mine - theirs) * 120 +
    (mineCapturePower - oppCapturePower) * 18 +
    (mineMoves.length - oppMoves.length) * 2 +
    center * 1.5
  );
}

export function captureModeLabel(mode: FanoronaCaptureMode | null): string {
  if (mode === 'approach') return 'Tiến ăn';
  if (mode === 'withdrawal') return 'Lùi ăn';
  return 'Paika';
}
