import type {
  GanhCaptureType,
  GanhCell,
  GanhMove,
  GanhPlayer,
  GanhState
} from './types';

export const GANH_BOARD_SIZE = 5;

const ORTHOGONAL = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
] as const;

const DIAGONAL = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1]
] as const;

const AXIS_PAIRS = [
  [[0, -1], [0, 1]],
  [[-1, 0], [1, 0]],
  [[-1, -1], [1, 1]],
  [[-1, 1], [1, -1]]
] as const;

const initialPlayer0 = [10, 15, 19, 20, 21, 22, 23, 24];
const initialPlayer1 = [0, 1, 2, 3, 4, 5, 9, 14];

export function indexOf(row: number, col: number): number {
  return row * GANH_BOARD_SIZE + col;
}

export function coordOf(index: number): [number, number] {
  return [Math.floor(index / GANH_BOARD_SIZE), index % GANH_BOARD_SIZE];
}

function inside(row: number, col: number): boolean {
  return row >= 0 && row < GANH_BOARD_SIZE && col >= 0 && col < GANH_BOARD_SIZE;
}

function supportsDiagonal(index: number): boolean {
  const [row, col] = coordOf(index);
  return (row + col) % 2 === 0;
}

export function neighbors(index: number): number[] {
  const [row, col] = coordOf(index);
  const offsets = supportsDiagonal(index)
    ? [...ORTHOGONAL, ...DIAGONAL]
    : [...ORTHOGONAL];

  const result: number[] = [];
  for (const [dr, dc] of offsets) {
    const nextRow = row + dr;
    const nextCol = col + dc;
    if (inside(nextRow, nextCol)) result.push(indexOf(nextRow, nextCol));
  }
  return result;
}

export const GANH_BOARD_EDGES: readonly [number, number][] = (() => {
  const edges: [number, number][] = [];
  for (let from = 0; from < 25; from += 1) {
    for (const to of neighbors(from)) {
      if (from < to) edges.push([from, to]);
    }
  }
  return edges;
})();

export function otherPlayer(player: GanhPlayer): GanhPlayer {
  return player === 0 ? 1 : 0;
}

export function countPieces(state: GanhState, player: GanhPlayer): number {
  return state.board.reduce<number>((sum, cell) => sum + (cell === player ? 1 : 0), 0);
}

export function createInitialGanhState(): GanhState {
  const board: GanhCell[] = Array(25).fill(null);
  for (const index of initialPlayer0) board[index] = 0;
  for (const index of initialPlayer1) board[index] = 1;

  return {
    board,
    currentPlayer: 0,
    winner: null,
    turn: 1,
    forcedGanhAt: null,
    lastMove: null,
    lastConverted: [],
    lastCaptureType: 'none',
    lastMessage: 'Người chơi 1 đi trước.'
  };
}

export function cloneGanhState(state: GanhState): GanhState {
  return {
    ...state,
    board: [...state.board],
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    lastConverted: [...state.lastConverted]
  };
}

function oppositePairIndices(center: number): [number, number][] {
  const [row, col] = coordOf(center);
  const pairs: [number, number][] = [];

  for (let axis = 0; axis < AXIS_PAIRS.length; axis += 1) {
    if (axis >= 2 && !supportsDiagonal(center)) continue;
    const [[dr1, dc1], [dr2, dc2]] = AXIS_PAIRS[axis];
    const row1 = row + dr1;
    const col1 = col + dc1;
    const row2 = row + dr2;
    const col2 = col + dc2;
    if (!inside(row1, col1) || !inside(row2, col2)) continue;
    pairs.push([indexOf(row1, col1), indexOf(row2, col2)]);
  }

  return pairs;
}

function ganhTargets(board: GanhCell[], center: number, player: GanhPlayer): number[] {
  const opponent = otherPlayer(player);
  const targets: number[] = [];

  for (const [a, b] of oppositePairIndices(center)) {
    if (board[a] === opponent && board[b] === opponent) {
      targets.push(a, b);
    }
  }

  return [...new Set(targets)];
}

function hasPairOf(board: GanhCell[], center: number, player: GanhPlayer): boolean {
  return oppositePairIndices(center).some(([a, b]) => board[a] === player && board[b] === player);
}

function resolveVay(board: GanhCell[], opponent: GanhPlayer, captor: GanhPlayer): number[] {
  const visited = new Set<number>();
  const converted: number[] = [];

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== opponent || visited.has(index)) continue;

    const component: number[] = [];
    const queue = [index];
    visited.add(index);
    let hasLiberty = false;

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);

      for (const adjacent of neighbors(current)) {
        const cell = board[adjacent];
        if (cell === null) {
          hasLiberty = true;
          continue;
        }
        if (cell === opponent && !visited.has(adjacent)) {
          visited.add(adjacent);
          queue.push(adjacent);
        }
      }
    }

    if (!hasLiberty) {
      for (const trapped of component) {
        board[trapped] = captor;
        converted.push(trapped);
      }
    }
  }

  return converted;
}

function detectForcedOpen(
  board: GanhCell[],
  vacated: number,
  mover: GanhPlayer
): number | null {
  if (board[vacated] !== null) return null;
  if (!hasPairOf(board, vacated, mover)) return null;

  const opponent = otherPlayer(mover);
  const opponentCanEnter = neighbors(vacated).some((index) => board[index] === opponent);
  return opponentCanEnter ? vacated : null;
}

export function legalGanhMoves(state: GanhState): GanhMove[] {
  if (state.winner !== null) return [];

  const player = state.currentPlayer;
  const moves: GanhMove[] = [];

  if (state.forcedGanhAt !== null) {
    const target = state.forcedGanhAt;
    if (state.board[target] !== null) return [];

    for (const source of neighbors(target)) {
      if (state.board[source] === player) moves.push({ from: source, to: target });
    }
    return moves;
  }

  for (let from = 0; from < state.board.length; from += 1) {
    if (state.board[from] !== player) continue;
    for (const to of neighbors(from)) {
      if (state.board[to] === null) moves.push({ from, to });
    }
  }

  return moves;
}

export function applyGanhMove(input: GanhState, move: GanhMove): GanhState {
  const legal = legalGanhMoves(input).some(
    (candidate) => candidate.from === move.from && candidate.to === move.to
  );
  if (!legal) return input;

  const state = cloneGanhState(input);
  const player = state.currentPlayer;
  const opponent = otherPlayer(player);

  state.board[move.from] = null;
  state.board[move.to] = player;

  const ganh = ganhTargets(state.board, move.to, player);
  for (const index of ganh) state.board[index] = player;

  const vay = resolveVay(state.board, opponent, player);
  const converted = [...new Set([...ganh, ...vay])];

  let captureType: GanhCaptureType = 'none';
  if (ganh.length > 0 && vay.length > 0) captureType = 'ganh+vay';
  else if (ganh.length > 0) captureType = 'ganh';
  else if (vay.length > 0) captureType = 'vay';

  state.lastMove = { ...move };
  state.lastConverted = converted;
  state.lastCaptureType = captureType;

  if (!state.board.some((cell) => cell === opponent)) {
    state.winner = player;
    state.forcedGanhAt = null;
    state.lastMessage = `Người chơi ${player + 1} đã đổi màu toàn bộ 16 quân và thắng ván.`;
    return state;
  }

  state.forcedGanhAt = detectForcedOpen(state.board, move.from, player);
  state.currentPlayer = opponent;
  state.turn += 1;

  const captureText = converted.length > 0
    ? `${captureType === 'ganh' ? 'Gánh' : captureType === 'vay' ? 'Vây' : 'Gánh + Vây'} ${converted.length} quân.`
    : 'Không đổi màu quân nào.';

  state.lastMessage = state.forcedGanhAt !== null
    ? `${captureText} Thế Mở: đối phương bắt buộc phải gánh vào điểm sáng.`
    : captureText;

  return state;
}

export function evaluateGanhState(state: GanhState, perspective: GanhPlayer): number {
  if (state.winner !== null) return state.winner === perspective ? 100000 : -100000;

  const opponent = otherPlayer(perspective);
  const mine = countPieces(state, perspective);
  const theirs = countPieces(state, opponent);

  const mineMobility = legalGanhMoves({
    ...state,
    currentPlayer: perspective,
    forcedGanhAt: state.currentPlayer === perspective ? state.forcedGanhAt : null
  }).length;

  const oppMobility = legalGanhMoves({
    ...state,
    currentPlayer: opponent,
    forcedGanhAt: state.currentPlayer === opponent ? state.forcedGanhAt : null
  }).length;

  const center = [6, 7, 8, 11, 12, 13, 16, 17, 18];
  const centerDelta = center.reduce((score, index) => {
    if (state.board[index] === perspective) return score + 1;
    if (state.board[index] === opponent) return score - 1;
    return score;
  }, 0);

  return (mine - theirs) * 120 + (mineMobility - oppMobility) * 3 + centerDelta * 4;
}
