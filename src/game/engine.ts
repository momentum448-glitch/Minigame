import type { Direction, GameState, Move, MoveEvent, Player } from './types';

export const QUAN_PITS = [0, 6] as const;
export const PLAYER_PITS: Record<Player, readonly number[]> = {
  0: [7, 8, 9, 10, 11],
  1: [1, 2, 3, 4, 5]
};
export const QUAN_VALUE = 10;
export const QUAN_NON_MIN_DAN = 5;

export type MoveObserver = (event: MoveEvent, state: GameState) => void;

const next = (index: number, direction: Direction) => (index + direction + 12) % 12;
const isQuanPit = (index: number) => index === 0 || index === 6;
const pitValue = (pit: GameState['pits'][number]) => pit.dan + (pit.quan ? QUAN_VALUE : 0);

export function createInitialState(): GameState {
  return {
    pits: Array.from({ length: 12 }, (_, index) => ({
      dan: isQuanPit(index) ? 0 : 5,
      quan: isQuanPit(index)
    })),
    currentPlayer: 0,
    score: [0, 0],
    debt: [0, 0],
    winner: null,
    gameOver: false,
    turn: 1,
    lastMessage: 'Người chơi 1 đi trước.'
  };
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    pits: state.pits.map((pit) => ({ ...pit })),
    score: [...state.score] as [number, number],
    debt: [...state.debt] as [number, number]
  };
}

function emit(observer: MoveObserver | undefined, event: MoveEvent, state: GameState) {
  observer?.(event, cloneState(state));
}

export function legalMoves(state: GameState, player: Player = state.currentPlayer): Move[] {
  if (state.gameOver) return [];
  const moves: Move[] = [];
  for (const pit of PLAYER_PITS[player]) {
    if (state.pits[pit].dan > 0) moves.push({ pit, direction: -1 }, { pit, direction: 1 });
  }
  return moves;
}

export function needsRefill(state: GameState, player: Player = state.currentPlayer): boolean {
  return PLAYER_PITS[player].every((index) => state.pits[index].dan === 0);
}

function refillSideCore(state: GameState, player: Player, observer?: MoveObserver): GameState {
  if (!needsRefill(state, player) || state.gameOver) return state;

  const nextState = cloneState(state);
  const paid = Math.min(5, Math.max(0, nextState.score[player]));
  const borrowed = 5 - paid;
  nextState.score[player] -= paid;
  nextState.debt[player] += borrowed;

  let hand = 5;
  for (const index of PLAYER_PITS[player]) {
    nextState.pits[index].dan = 1;
    hand -= 1;
    emit(observer, { type: 'refill', player, pit: index, borrowed, hand }, nextState);
  }

  nextState.lastMessage = borrowed > 0
    ? `Người chơi ${player + 1} vay ${borrowed} dân để tiếp tục.`
    : `Người chơi ${player + 1} dùng 5 dân đã ăn để rải lại.`;

  return nextState;
}

export function refillSide(state: GameState, player: Player): GameState {
  return refillSideCore(state, player);
}

function canCaptureQuan(pit: GameState['pits'][number]): boolean {
  return pit.quan && pit.dan >= QUAN_NON_MIN_DAN;
}

function canCapturePit(index: number, state: GameState): boolean {
  const pit = state.pits[index];
  if (pit.dan === 0 && !pit.quan) return false;
  if (isQuanPit(index) && pit.quan) return canCaptureQuan(pit);
  return pit.dan > 0 || pit.quan;
}

function bothQuanCaptured(state: GameState): boolean {
  return QUAN_PITS.every((index) => !state.pits[index].quan);
}

export function finalizeGame(state: GameState): GameState {
  const nextState = cloneState(state);
  for (const player of [0, 1] as const) {
    for (const pit of PLAYER_PITS[player]) {
      nextState.score[player] += nextState.pits[pit].dan;
      nextState.pits[pit].dan = 0;
    }
  }
  const final: [number, number] = [...nextState.score] as [number, number];
  final[0] -= nextState.debt[0];
  final[1] += nextState.debt[0];
  final[1] -= nextState.debt[1];
  final[0] += nextState.debt[1];
  nextState.score = final;
  nextState.gameOver = true;
  nextState.winner = final[0] === final[1] ? 'draw' : final[0] > final[1] ? 0 : 1;
  nextState.lastMessage = nextState.winner === 'draw'
    ? `Hòa ${final[0]} - ${final[1]}.`
    : `Người chơi ${nextState.winner + 1} thắng ${final[nextState.winner]} - ${final[nextState.winner === 0 ? 1 : 0]}.`;
  return nextState;
}

export function executeMove(input: GameState, move: Move, observer?: MoveObserver): GameState {
  let state = refillSideCore(input, input.currentPlayer, observer);
  if (state.gameOver) return state;

  const player = state.currentPlayer;
  if (!PLAYER_PITS[player].includes(move.pit) || state.pits[move.pit].dan <= 0) return state;

  state = cloneState(state);
  let hand = state.pits[move.pit].dan;
  state.pits[move.pit].dan = 0;
  let cursor = move.pit;
  let captured = 0;

  emit(observer, { type: 'pickup', pit: move.pit, count: hand, hand }, state);

  while (true) {
    while (hand > 0) {
      cursor = next(cursor, move.direction);
      state.pits[cursor].dan += 1;
      hand -= 1;
      emit(observer, { type: 'drop', pit: cursor, hand }, state);
    }

    const after = next(cursor, move.direction);
    const afterPit = state.pits[after];

    if (!isQuanPit(after) && afterPit.dan > 0) {
      hand = afterPit.dan;
      afterPit.dan = 0;
      cursor = after;
      emit(observer, { type: 'continue-pickup', pit: after, count: hand, hand }, state);
      continue;
    }

    if (afterPit.dan === 0 && !afterPit.quan) {
      let emptyCursor = after;
      while (true) {
        const target = next(emptyCursor, move.direction);
        if (!canCapturePit(target, state)) break;

        const targetPit = state.pits[target];
        const capturedDan = targetPit.dan;
        const capturedQuan = targetPit.quan;
        const points = pitValue(targetPit);

        captured += points;
        state.score[player] += points;
        targetPit.dan = 0;
        targetPit.quan = false;

        emit(observer, {
          type: 'capture',
          pit: target,
          dan: capturedDan,
          quan: capturedQuan,
          points,
          hand: 0
        }, state);

        const following = next(target, move.direction);
        const followingPit = state.pits[following];
        if (followingPit.dan !== 0 || followingPit.quan) break;
        emptyCursor = following;
      }
    }
    break;
  }

  if (bothQuanCaptured(state)) {
    state = finalizeGame(state);
    emit(observer, {
      type: 'turn-end',
      player,
      nextPlayer: null,
      captured,
      gameOver: true,
      hand: 0
    }, state);
    return state;
  }

  state.currentPlayer = player === 0 ? 1 : 0;
  state.turn += 1;
  state.lastMessage = captured > 0
    ? `Người chơi ${player + 1} ăn ${captured} điểm.`
    : `Đến lượt người chơi ${state.currentPlayer + 1}.`;

  state = refillSideCore(state, state.currentPlayer, observer);

  emit(observer, {
    type: 'turn-end',
    player,
    nextPlayer: state.currentPlayer,
    captured,
    gameOver: false,
    hand: 0
  }, state);

  return state;
}

export function applyMove(input: GameState, move: Move): GameState {
  return executeMove(input, move);
}

export function evaluateState(state: GameState, perspective: Player): number {
  const opponent: Player = perspective === 0 ? 1 : 0;
  const boardMine = PLAYER_PITS[perspective].reduce((sum, i) => sum + state.pits[i].dan, 0);
  const boardOpp = PLAYER_PITS[opponent].reduce((sum, i) => sum + state.pits[i].dan, 0);
  const quanPotential = QUAN_PITS.reduce<number>((sum, i) => sum + (state.pits[i].quan ? state.pits[i].dan : 0), 0);
  const scoreDelta = state.score[perspective] - state.score[opponent];
  const debtDelta = state.debt[opponent] - state.debt[perspective];
  const terminal = state.gameOver
    ? state.winner === perspective ? 10000 : state.winner === 'draw' ? 0 : -10000
    : 0;
  return terminal + scoreDelta * 12 + (boardMine - boardOpp) * 1.2 + debtDelta * 6 + quanPotential * 0.05;
}
