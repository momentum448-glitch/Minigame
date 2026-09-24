import type {
  LuaNgoCell,
  LuaNgoMove,
  LuaNgoPlayer,
  LuaNgoState
} from './types';

export const LUA_NGO_WORDS = ['Lúa', 'Ngô', 'Khoai', 'Sắn', 'Đỗ'] as const;

export const LUA_NGO_NODE_COORDS: readonly [number, number][] = [
  [1,0], [3,0],
  [0,1], [1,1], [3,1], [4,1],
  [0,2], [1,2], [3,2], [4,2],
  [1,3], [3,3]
];

export const LUA_NGO_BOARD_EDGES: readonly [number, number][] = [
  [0,1],
  [0,3], [3,7], [7,10],
  [1,4], [4,8], [8,11],
  [10,11],
  [2,3], [3,4], [4,5],
  [2,6], [5,9],
  [6,7], [7,8], [8,9]
];

const adjacency: number[][] = Array.from({ length: LUA_NGO_NODE_COORDS.length }, () => []);
for (const [a, b] of LUA_NGO_BOARD_EDGES) {
  adjacency[a].push(b);
  adjacency[b].push(a);
}

const INITIAL_PLAYER_1 = [0, 1, 3, 4];
const INITIAL_PLAYER_0 = [7, 8, 10, 11];

export interface LuaNgoStepOption {
  to: number;
  capture: boolean;
}

export function luaNgoNeighbors(index: number): number[] {
  return [...adjacency[index]];
}

export function otherLuaNgoPlayer(player: LuaNgoPlayer): LuaNgoPlayer {
  return player === 0 ? 1 : 0;
}

export function countLuaNgoPieces(state: LuaNgoState, player: LuaNgoPlayer): number {
  return state.board.reduce<number>((sum, cell) => sum + (cell === player ? 1 : 0), 0);
}

export function createInitialLuaNgoState(): LuaNgoState {
  const board: LuaNgoCell[] = Array(LUA_NGO_NODE_COORDS.length).fill(null);
  for (const index of INITIAL_PLAYER_0) board[index] = 0;
  for (const index of INITIAL_PLAYER_1) board[index] = 1;

  return {
    board,
    currentPlayer: 0,
    winner: null,
    turn: 1,
    lastMove: null,
    lastMessage: 'Người chơi 1 đi trước.'
  };
}

export function cloneLuaNgoState(state: LuaNgoState): LuaNgoState {
  return {
    ...state,
    board: [...state.board],
    lastMove: state.lastMove
      ? {
          ...state.lastMove,
          path: [...state.lastMove.path]
        }
      : null
  };
}

function isValidPartialPath(state: LuaNgoState, path: number[]): boolean {
  if (path.length === 0 || path.length > 6) return false;
  if (state.board[path[0]] !== state.currentPlayer) return false;

  const seen = new Set<number>();
  for (let i = 0; i < path.length; i += 1) {
    const node = path[i];
    if (seen.has(node)) return false;
    seen.add(node);

    if (i === 0) continue;
    const previous = path[i - 1];
    if (!adjacency[previous].includes(node)) return false;

    const stepNumber = i;
    const cell = state.board[node];

    if (stepNumber < 5) {
      if (cell !== null) return false;
    } else {
      if (cell === state.currentPlayer) return false;
    }
  }

  return true;
}

export function nextLuaNgoSteps(
  state: LuaNgoState,
  path: number[]
): LuaNgoStepOption[] {
  if (state.winner !== null || !isValidPartialPath(state, path)) return [];

  const stepsTaken = path.length - 1;
  if (stepsTaken >= 5) return [];

  const current = path[path.length - 1];
  const player = state.currentPlayer;
  const opponent = otherLuaNgoPlayer(player);
  const visited = new Set(path);
  const fifthStep = stepsTaken === 4;

  const options: LuaNgoStepOption[] = [];

  for (const to of adjacency[current]) {
    if (visited.has(to)) continue;

    const cell = state.board[to];

    if (!fifthStep) {
      if (cell === null) options.push({ to, capture: false });
      continue;
    }

    if (cell === null) {
      options.push({ to, capture: false });
    } else if (cell === opponent) {
      options.push({ to, capture: true });
    }
  }

  return options;
}

function samePath(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function enumerateFromPath(
  state: LuaNgoState,
  path: number[],
  moves: LuaNgoMove[]
): void {
  const stepsTaken = path.length - 1;

  if (stepsTaken === 5) {
    const destination = path[path.length - 1];
    const capture =
      state.board[destination] === otherLuaNgoPlayer(state.currentPlayer)
        ? destination
        : null;

    moves.push({
      path: [...path],
      capture,
      blocked: false
    });
    return;
  }

  const options = nextLuaNgoSteps(state, path);

  if (options.length === 0) {
    if (stepsTaken > 0) {
      moves.push({
        path: [...path],
        capture: null,
        blocked: true
      });
    }
    return;
  }

  for (const option of options) {
    enumerateFromPath(state, [...path, option.to], moves);
  }
}

export function legalLuaNgoMoves(state: LuaNgoState): LuaNgoMove[] {
  if (state.winner !== null) return [];

  const moves: LuaNgoMove[] = [];
  for (let from = 0; from < state.board.length; from += 1) {
    if (state.board[from] !== state.currentPlayer) continue;
    enumerateFromPath(state, [from], moves);
  }

  return moves;
}

export function findLuaNgoMoveByPath(
  state: LuaNgoState,
  path: number[]
): LuaNgoMove | null {
  return legalLuaNgoMoves(state).find((move) => samePath(move.path, path)) ?? null;
}

export function previewLuaNgoBoard(
  state: LuaNgoState,
  path: number[]
): LuaNgoCell[] {
  const board = [...state.board];
  if (path.length <= 1) return board;

  const from = path[0];
  const to = path[path.length - 1];
  board[from] = null;

  for (let i = 1; i < path.length - 1; i += 1) {
    if (board[path[i]] === state.currentPlayer) board[path[i]] = null;
  }

  const fifthStep = path.length - 1 === 5;
  if (!(fifthStep && board[to] === otherLuaNgoPlayer(state.currentPlayer))) {
    board[to] = state.currentPlayer;
  }

  return board;
}

export function applyLuaNgoMove(input: LuaNgoState, move: LuaNgoMove): LuaNgoState {
  const legal = legalLuaNgoMoves(input).find((candidate) => samePath(candidate.path, move.path));
  if (!legal) return input;

  const state = cloneLuaNgoState(input);
  const player = state.currentPlayer;
  const opponent = otherLuaNgoPlayer(player);
  const from = legal.path[0];
  const to = legal.path[legal.path.length - 1];

  state.board[from] = null;

  if (legal.capture !== null) {
    state.board[legal.capture] = null;
  }

  state.board[to] = player;
  state.lastMove = {
    path: [...legal.path],
    capture: legal.capture,
    blocked: legal.blocked
  };

  if (countLuaNgoPieces(state, opponent) === 0) {
    state.winner = player;
    state.lastMessage = `Người chơi ${player + 1} đã ăn hết quân đối phương và thắng ván.`;
    return state;
  }

  state.currentPlayer = opponent;
  state.turn += 1;

  const opponentMoves = legalLuaNgoMoves(state);
  if (opponentMoves.length === 0) {
    state.winner = player;
    state.lastMessage = `Người chơi ${opponent + 1} không còn nước đi. Người chơi ${player + 1} thắng ván.`;
    return state;
  }

  if (legal.capture !== null) {
    state.lastMessage = `Đỗ! Người chơi ${player + 1} ăn 1 quân đối phương.`;
  } else if (legal.blocked) {
    state.lastMessage = `Đường đi bị chặn trước nhịp thứ 5. Quân dừng tại bước ${legal.path.length - 1}.`;
  } else {
    state.lastMessage = 'Đủ 5 nhịp nhưng không ăn quân. Đổi lượt.';
  }

  return state;
}

export function evaluateLuaNgoState(
  state: LuaNgoState,
  perspective: LuaNgoPlayer
): number {
  if (state.winner !== null) {
    return state.winner === perspective ? 100000 : -100000;
  }

  const opponent = otherLuaNgoPlayer(perspective);
  const mine = countLuaNgoPieces(state, perspective);
  const theirs = countLuaNgoPieces(state, opponent);

  const mineState = { ...state, currentPlayer: perspective };
  const opponentState = { ...state, currentPlayer: opponent };

  const mineMoves = legalLuaNgoMoves(mineState);
  const opponentMoves = legalLuaNgoMoves(opponentState);

  const mineCaptures = mineMoves.filter((move) => move.capture !== null).length;
  const opponentCaptures = opponentMoves.filter((move) => move.capture !== null).length;

  return (
    (mine - theirs) * 1000 +
    (mineCaptures - opponentCaptures) * 80 +
    (mineMoves.length - opponentMoves.length)
  );
}
