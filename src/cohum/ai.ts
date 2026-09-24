import { applyHumMove, evaluateHumState, legalHumMoves } from './engine';
import type { HumAiLevel, HumMove, HumSide, HumState } from './types';

function randomMove(moves: HumMove[]): HumMove {
  return moves[Math.floor(Math.random() * moves.length)];
}

function movePriority(move: HumMove): number {
  return move.capture !== null ? 100 : 0;
}

function minimax(
  state: HumState,
  depth: number,
  perspective: HumSide,
  alpha: number,
  beta: number
): number {
  if (depth <= 0 || state.winner !== null) {
    return evaluateHumState(state, perspective);
  }

  const moves = legalHumMoves(state);
  if (moves.length === 0) return evaluateHumState(state, perspective);

  const maximizing = state.currentPlayer === perspective;
  let best = maximizing ? -Infinity : Infinity;
  const ordered = [...moves].sort((a, b) => movePriority(b) - movePriority(a));

  for (const move of ordered) {
    const value = minimax(applyHumMove(state, move), depth - 1, perspective, alpha, beta);

    if (maximizing) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, value);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, value);
    }

    if (beta <= alpha) break;
  }

  return best;
}

export function chooseHumAiMove(
  state: HumState,
  level: HumAiLevel,
  aiSide: HumSide
): HumMove | null {
  if (state.currentPlayer !== aiSide || state.winner !== null) return null;

  const moves = legalHumMoves(state);
  if (moves.length === 0) return null;

  if (level === 'easy') return randomMove(moves);

  const ranked = moves
    .map((move) => {
      const next = applyHumMove(state, move);
      const bonus = move.capture !== null ? 240 : 0;
      return { move, value: evaluateHumState(next, aiSide) + bonus };
    })
    .sort((a, b) => b.value - a.value);

  if (level === 'medium') {
    const top = ranked.slice(0, Math.min(4, ranked.length));
    return Math.random() < 0.82 ? top[0].move : randomMove(top.map((item) => item.move));
  }

  return moves
    .map((move) => ({
      move,
      value: minimax(applyHumMove(state, move), 4, aiSide, -Infinity, Infinity)
    }))
    .sort((a, b) => b.value - a.value)[0].move;
}
