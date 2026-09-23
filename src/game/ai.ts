import { applyMove, evaluateState, legalMoves } from './engine';
import type { AiLevel, GameState, Move, Player } from './types';

function randomMove(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)];
}

function immediateGain(state: GameState, move: Move, player: Player): number {
  const next = applyMove(state, move);
  return next.score[player] - state.score[player];
}

function minimax(state: GameState, depth: number, perspective: Player, alpha: number, beta: number): number {
  if (depth <= 0 || state.gameOver) return evaluateState(state, perspective);
  const moves = legalMoves(state);
  if (!moves.length) return evaluateState(state, perspective);
  const maximizing = state.currentPlayer === perspective;
  let best = maximizing ? -Infinity : Infinity;
  const ordered = [...moves].sort((a, b) => immediateGain(state, b, state.currentPlayer) - immediateGain(state, a, state.currentPlayer));

  for (const move of ordered) {
    const value = minimax(applyMove(state, move), depth - 1, perspective, alpha, beta);
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

export function chooseAiMove(state: GameState, level: AiLevel, aiPlayer: Player = 1): Move | null {
  const moves = legalMoves(state, aiPlayer);
  if (!moves.length) return null;
  if (level === 'easy') return randomMove(moves);

  if (level === 'medium') {
    const ranked = moves.map((move) => ({
      move,
      value: immediateGain(state, move, aiPlayer) * 10 + evaluateState(applyMove(state, move), aiPlayer) * 0.1
    })).sort((a, b) => b.value - a.value);
    const top = ranked.slice(0, Math.min(3, ranked.length));
    return Math.random() < 0.78 ? top[0].move : randomMove(top.map((item) => item.move));
  }

  const scored = moves.map((move) => ({
    move,
    value: minimax(applyMove(state, move), 5, aiPlayer, -Infinity, Infinity)
  })).sort((a, b) => b.value - a.value);
  return scored[0].move;
}
