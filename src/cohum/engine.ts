import type { HumCell, HumMove, HumSide, HumState } from './types';

export const HUM_MAIN_SIZE = 5;
export const HUM_GATE = 14;
export const HUM_HANG_TOP = 25;
export const HUM_HANG_RIGHT = 26;
export const HUM_HANG_BOTTOM = 27;
export const HUM_HANG_CENTER = 28;
export const HUM_NODE_COUNT = 29;

export const HUM_NODE_COORDS: readonly [number, number][] = [
  [0,0],[1,0],[2,0],[3,0],[4,0],
  [0,1],[1,1],[2,1],[3,1],[4,1],
  [0,2],[1,2],[2,2],[3,2],[4,2],
  [0,3],[1,3],[2,3],[3,3],[4,3],
  [0,4],[1,4],[2,4],[3,4],[4,4],
  [5,1],[6,2],[5,3],[5,2]
];

const edgeSet = new Set<string>();
const addEdge = (a: number, b: number) => {
  const key = a < b ? `${a}-${b}` : `${b}-${a}`;
  edgeSet.add(key);
};

const mainIndex = (x: number, y: number) => y * HUM_MAIN_SIZE + x;

for (let y = 0; y < HUM_MAIN_SIZE; y += 1) {
  for (let x = 0; x < HUM_MAIN_SIZE; x += 1) {
    const here = mainIndex(x, y);
    if (x < HUM_MAIN_SIZE - 1) addEdge(here, mainIndex(x + 1, y));
    if (y < HUM_MAIN_SIZE - 1) addEdge(here, mainIndex(x, y + 1));

    if ((x + y) % 2 === 0 && y < HUM_MAIN_SIZE - 1) {
      if (x > 0) addEdge(here, mainIndex(x - 1, y + 1));
      if (x < HUM_MAIN_SIZE - 1) addEdge(here, mainIndex(x + 1, y + 1));
    }
  }
}

[
  [HUM_GATE, HUM_HANG_TOP],
  [HUM_HANG_TOP, HUM_HANG_RIGHT],
  [HUM_HANG_RIGHT, HUM_HANG_BOTTOM],
  [HUM_HANG_BOTTOM, HUM_GATE],
  [HUM_GATE, HUM_HANG_CENTER],
  [HUM_HANG_CENTER, HUM_HANG_RIGHT],
  [HUM_HANG_TOP, HUM_HANG_CENTER],
  [HUM_HANG_CENTER, HUM_HANG_BOTTOM]
].forEach(([a, b]) => addEdge(a, b));

export const HUM_BOARD_EDGES: readonly [number, number][] = [...edgeSet]
  .map((key) => key.split('-').map(Number) as [number, number]);

const adjacency: number[][] = Array.from({ length: HUM_NODE_COUNT }, () => []);
for (const [a, b] of HUM_BOARD_EDGES) {
  adjacency[a].push(b);
  adjacency[b].push(a);
}

const coordinateIndex = new Map(
  HUM_NODE_COORDS.map(([x, y], index) => [`${x},${y}`, index])
);

const initialBuffalo = [
  0,1,2,3,4,
  5,9,
  10,
  15,19,
  20,21,22,23,24
];

export function humNeighbors(index: number): number[] {
  return [...adjacency[index]];
}

export function humOtherSide(side: HumSide): HumSide {
  return side === 'hum' ? 'trau' : 'hum';
}

export function countHumPieces(state: HumState, side: HumSide): number {
  return state.board.reduce<number>((sum, cell) => sum + (cell === side ? 1 : 0), 0);
}

export function createInitialHumState(): HumState {
  const board: HumCell[] = Array(HUM_NODE_COUNT).fill(null);
  for (const index of initialBuffalo) board[index] = 'trau';
  board[HUM_HANG_RIGHT] = 'hum';

  return {
    board,
    currentPlayer: 'hum',
    winner: null,
    turn: 1,
    lastMove: null,
    lastMoveByPlayer: { hum: null, trau: null },
    lastCaptured: null,
    lastMessage: 'Hùm đi trước.'
  };
}

export function cloneHumState(state: HumState): HumState {
  return {
    ...state,
    board: [...state.board],
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    lastMoveByPlayer: {
      hum: state.lastMoveByPlayer.hum ? { ...state.lastMoveByPlayer.hum } : null,
      trau: state.lastMoveByPlayer.trau ? { ...state.lastMoveByPlayer.trau } : null
    }
  };
}

function isReverseOfLast(state: HumState, side: HumSide, move: HumMove): boolean {
  const last = state.lastMoveByPlayer[side];
  return Boolean(last && last.from === move.to && last.to === move.from);
}

function jumpLanding(from: number, over: number): number | null {
  const [fx, fy] = HUM_NODE_COORDS[from];
  const [ox, oy] = HUM_NODE_COORDS[over];
  const dx = ox - fx;
  const dy = oy - fy;
  const landing = coordinateIndex.get(`${ox + dx},${oy + dy}`);
  if (landing === undefined) return null;
  if (!adjacency[over].includes(landing)) return null;
  return landing;
}

function legalTigerMoves(state: HumState): HumMove[] {
  const from = state.board.findIndex((cell) => cell === 'hum');
  if (from < 0) return [];

  const moves: HumMove[] = [];

  for (const next of adjacency[from]) {
    if (state.board[next] === null) {
      const move: HumMove = { from, to: next, capture: null };
      if (!isReverseOfLast(state, 'hum', move)) moves.push(move);
      continue;
    }

    if (state.board[next] !== 'trau') continue;

    const landing = jumpLanding(from, next);
    if (landing === null || state.board[landing] !== null) continue;

    const move: HumMove = { from, to: landing, capture: next };
    if (!isReverseOfLast(state, 'hum', move)) moves.push(move);
  }

  return moves;
}

function legalBuffaloMoves(state: HumState): HumMove[] {
  const moves: HumMove[] = [];

  for (let from = 0; from < state.board.length; from += 1) {
    if (state.board[from] !== 'trau') continue;

    for (const to of adjacency[from]) {
      if (state.board[to] !== null) continue;
      const move: HumMove = { from, to, capture: null };
      if (!isReverseOfLast(state, 'trau', move)) moves.push(move);
    }
  }

  return moves;
}

export function legalHumMoves(
  state: HumState,
  side: HumSide = state.currentPlayer
): HumMove[] {
  if (state.winner !== null) return [];
  return side === 'hum' ? legalTigerMoves(state) : legalBuffaloMoves(state);
}

function sameMove(a: HumMove, b: HumMove): boolean {
  return a.from === b.from && a.to === b.to && a.capture === b.capture;
}

export function applyHumMove(input: HumState, move: HumMove): HumState {
  const legal = legalHumMoves(input).some((candidate) => sameMove(candidate, move));
  if (!legal) return input;

  const state = cloneHumState(input);
  const side = state.currentPlayer;
  const nextSide = humOtherSide(side);

  state.board[move.from] = null;
  state.board[move.to] = side;
  if (move.capture !== null) state.board[move.capture] = null;

  state.lastMove = { ...move };
  state.lastMoveByPlayer[side] = { ...move };
  state.lastCaptured = move.capture;

  if (side === 'hum' && countHumPieces(state, 'trau') === 0) {
    state.winner = 'hum';
    state.lastMessage = 'Hùm đã vồ hết Trâu và thắng ván.';
    return state;
  }

  state.currentPlayer = nextSide;
  state.turn += 1;

  if (nextSide === 'hum' && legalHumMoves(state, 'hum').length === 0) {
    state.winner = 'trau';
    state.lastMessage = 'Đàn Trâu đã vây kín Hùm và thắng ván.';
    return state;
  }

  if (side === 'hum') {
    state.lastMessage = move.capture !== null
      ? `Hùm vồ 1 Trâu. Còn ${countHumPieces(state, 'trau')} Trâu.`
      : 'Hùm đổi vị trí. Đến lượt Trâu.';
  } else {
    state.lastMessage = 'Trâu khép vòng vây. Đến lượt Hùm.';
  }

  return state;
}

export function evaluateHumState(state: HumState, perspective: HumSide): number {
  if (state.winner !== null) {
    return state.winner === perspective ? 100000 : -100000;
  }

  const buffalo = countHumPieces(state, 'trau');
  const tigerMoves = legalHumMoves({ ...state, currentPlayer: 'hum' }, 'hum');
  const tigerCaptures = tigerMoves.filter((move) => move.capture !== null).length;
  const buffaloMoves = legalHumMoves({ ...state, currentPlayer: 'trau' }, 'trau').length;

  const tigerScore =
    (15 - buffalo) * 520 +
    tigerMoves.length * 18 +
    tigerCaptures * 130 -
    Math.min(buffaloMoves, 30) * 2;

  return perspective === 'hum' ? tigerScore : -tigerScore;
}
