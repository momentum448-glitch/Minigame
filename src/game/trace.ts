import { executeMove } from './engine';
import type { GameState, Move, MoveEvent } from './types';

export interface MoveTraceStep {
  event: MoveEvent;
  state: GameState;
}

export interface MoveTrace {
  steps: MoveTraceStep[];
  finalState: GameState;
}

export function createMoveTrace(state: GameState, move: Move): MoveTrace {
  const steps: MoveTraceStep[] = [];
  const finalState = executeMove(state, move, (event, snapshot) => {
    steps.push({ event, state: snapshot });
  });

  return { steps, finalState };
}
