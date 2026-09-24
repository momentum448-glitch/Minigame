import {
  applyGanhMove,
  countPieces,
  evaluateGanhState,
  legalGanhMoves,
  otherPlayer
} from './engine';
import type { GanhAiLevel, GanhMove, GanhPlayer, GanhState } from './types';

function randomMove(moves: GanhMove[]): GanhMove {
  return moves[Math.floor(Math.random() * moves.length)];
}

function immediateGain(state: GanhState, move: GanhMove, player: GanhPlayer): number {
  const before = countPieces(state, player);
  const next = applyGanhMove(state, move);
  return countPieces(next, player) - before;
}

function minimax(
  state: GanhState,
  depth: number,
  perspective: GanhPlayer,
  alpha: number,
  beta: number
): number {
  if (depth <= 0 || state.winner !== null) return evaluateGanhState(state, perspective);

  const moves = legalGanhMoves(state);
  if (moves.length === 0) return evaluateGanhState(state, perspective);

  const maximizing = state.currentPlayer === perspective;
  let best = maximizing ? -Infinity : Infinity;

  const ordered = [...moves].sort(
    (a, b) =>
      immediateGain(state, b, state.currentPlayer) -
      immediateGain(state, a, state.currentPlayer)
  );

  for (const move of ordered) {
    const value = minimax(applyGanhMove(state, move), depth - 1, perspective, alpha, beta);

    if (maximizing) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, best);
    }

    if (beta <= alpha) break;
  }

  return best;
}

export function chooseGanhAiMove(
  state: GanhState,
  level: GanhAiLevel,
  aiPlayer: GanhPlayer = 1
): GanhMove | null {
  if (state.currentPlayer !== aiPlayer) return null;

  const moves = legalGanhMoves(state);
  if (moves.length === 0) return null;

  if (level === 'easy') return randomMove(moves);

  if (level === 'medium') {
    const ranked = moves
      .map((move) => {
        const next = applyGanhMove(state, move);
        return {
          move,
          value:
            immediateGain(state, move, aiPlayer) * 50 +
            evaluateGanhState(next, aiPlayer) * 0.2
        };
      })
      .sort((a, b) => b.value - a.value);

    const top = ranked.slice(0, Math.min(3, ranked.length));
    return Math.random() < 0.82 ? top[0].move : randomMove(top.map((item) => item.move));
  }

  return moves
    .map((move) => ({
      move,
      value: minimax(applyGanhMove(state, move), 4, aiPlayer, -Infinity, Infinity)
    }))
    .sort((a, b) => b.value - a.value)[0].move;
}
