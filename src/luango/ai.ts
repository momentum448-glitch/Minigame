import {
  applyLuaNgoMove,
  evaluateLuaNgoState,
  legalLuaNgoMoves
} from './engine';
import type {
  LuaNgoAiLevel,
  LuaNgoMove,
  LuaNgoPlayer,
  LuaNgoState
} from './types';

function randomMove(moves: LuaNgoMove[]): LuaNgoMove {
  return moves[Math.floor(Math.random() * moves.length)];
}

function priority(move: LuaNgoMove): number {
  return move.capture !== null ? 1000 : move.blocked ? -20 : 0;
}

function minimax(
  state: LuaNgoState,
  depth: number,
  perspective: LuaNgoPlayer,
  alpha: number,
  beta: number
): number {
  if (depth <= 0 || state.winner !== null) {
    return evaluateLuaNgoState(state, perspective);
  }

  const moves = legalLuaNgoMoves(state);
  if (moves.length === 0) {
    return evaluateLuaNgoState(state, perspective);
  }

  const maximizing = state.currentPlayer === perspective;
  let best = maximizing ? -Infinity : Infinity;

  const ordered = [...moves]
    .sort((a, b) => priority(b) - priority(a))
    .slice(0, 28);

  for (const move of ordered) {
    const value = minimax(
      applyLuaNgoMove(state, move),
      depth - 1,
      perspective,
      alpha,
      beta
    );

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

export function chooseLuaNgoAiMove(
  state: LuaNgoState,
  level: LuaNgoAiLevel,
  aiPlayer: LuaNgoPlayer = 1
): LuaNgoMove | null {
  if (state.currentPlayer !== aiPlayer || state.winner !== null) return null;

  const moves = legalLuaNgoMoves(state);
  if (moves.length === 0) return null;

  if (level === 'easy') return randomMove(moves);

  if (level === 'medium') {
    const ranked = moves
      .map((move) => ({
        move,
        value:
          (move.capture !== null ? 500 : 0) +
          evaluateLuaNgoState(applyLuaNgoMove(state, move), aiPlayer) * 0.2
      }))
      .sort((a, b) => b.value - a.value);

    const top = ranked.slice(0, Math.min(5, ranked.length));
    return Math.random() < 0.82
      ? top[0].move
      : randomMove(top.map((item) => item.move));
  }

  return moves
    .map((move) => ({
      move,
      value: minimax(
        applyLuaNgoMove(state, move),
        3,
        aiPlayer,
        -Infinity,
        Infinity
      )
    }))
    .sort((a, b) => b.value - a.value)[0].move;
}
