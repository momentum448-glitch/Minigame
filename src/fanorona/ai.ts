import {
  applyFanoronaStep,
  canStopFanoronaChain,
  evaluateFanoronaState,
  legalFanoronaSteps,
  stopFanoronaChain
} from './engine';
import type {
  FanoronaAiAction,
  FanoronaAiLevel,
  FanoronaPlayer,
  FanoronaState,
  FanoronaStep
} from './types';

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function immediateStepScore(step: FanoronaStep): number {
  return step.captured.length * 120 + (step.captureMode === null ? 0 : 25);
}

function legalActions(state: FanoronaState): FanoronaAiAction[] {
  const actions: FanoronaAiAction[] = legalFanoronaSteps(state).map((step) => ({ kind: 'step', step }));
  if (canStopFanoronaChain(state)) actions.push({ kind: 'stop' });
  return actions;
}

function applyAction(state: FanoronaState, action: FanoronaAiAction): FanoronaState {
  return action.kind === 'stop'
    ? stopFanoronaChain(state)
    : applyFanoronaStep(state, action.step);
}

function actionPriority(state: FanoronaState, action: FanoronaAiAction, perspective: FanoronaPlayer): number {
  if (action.kind === 'stop') return evaluateFanoronaState(stopFanoronaChain(state), perspective) - 8;
  const next = applyFanoronaStep(state, action.step);
  return immediateStepScore(action.step) + evaluateFanoronaState(next, perspective) * 0.2;
}

function search(
  state: FanoronaState,
  depthTurns: number,
  perspective: FanoronaPlayer,
  alpha: number,
  beta: number
): number {
  if (state.winner !== null || state.drawReason !== null || depthTurns <= 0) {
    return evaluateFanoronaState(state, perspective);
  }

  const actions = legalActions(state);
  if (actions.length === 0) return evaluateFanoronaState(state, perspective);

  const maximizing = state.currentPlayer === perspective;
  let best = maximizing ? -Infinity : Infinity;
  const ordered = [...actions]
    .sort((a, b) => actionPriority(state, b, perspective) - actionPriority(state, a, perspective))
    .slice(0, 12);

  for (const action of ordered) {
    const beforePlayer = state.currentPlayer;
    const next = applyAction(state, action);
    const changedTurn = next.currentPlayer !== beforePlayer || next.winner !== null || next.drawReason !== null;
    const nextDepth = changedTurn ? depthTurns - 1 : depthTurns;
    const value = search(next, nextDepth, perspective, alpha, beta);

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

export function chooseFanoronaAiAction(
  state: FanoronaState,
  level: FanoronaAiLevel,
  aiPlayer: FanoronaPlayer = 1
): FanoronaAiAction | null {
  if (state.currentPlayer !== aiPlayer || state.winner !== null || state.drawReason !== null) return null;
  const actions = legalActions(state);
  if (actions.length === 0) return null;

  if (level === 'easy') {
    if (state.chain && canStopFanoronaChain(state) && Math.random() < 0.35) return { kind: 'stop' };
    const stepActions = actions.filter((action): action is Extract<FanoronaAiAction, { kind: 'step' }> => action.kind === 'step');
    return stepActions.length > 0 ? randomItem(stepActions) : randomItem(actions);
  }

  const ranked = actions
    .map((action) => ({
      action,
      value: actionPriority(state, action, aiPlayer)
    }))
    .sort((a, b) => b.value - a.value);

  if (level === 'medium') {
    const top = ranked.slice(0, Math.min(4, ranked.length));
    return Math.random() < 0.82 ? top[0].action : randomItem(top).action;
  }

  return ranked
    .slice(0, 10)
    .map(({ action }) => {
      const beforePlayer = state.currentPlayer;
      const next = applyAction(state, action);
      const changedTurn = next.currentPlayer !== beforePlayer || next.winner !== null || next.drawReason !== null;
      return {
        action,
        value: search(next, changedTurn ? 1 : 2, aiPlayer, -Infinity, Infinity)
      };
    })
    .sort((a, b) => b.value - a.value)[0].action;
}
