import type {
  DiceBatch,
  HorseAction,
  HorseGameState,
  HorsePiece,
  HorseSeat
} from './types';

export const TRACK_LENGTH = 56;
export const GATE_SPACING = 14;
export const HORSES_PER_SEAT = 4;
export const HOME_WIN_RANKS = [3, 4, 5, 6] as const;

export const START_INDEX: Record<HorseSeat, number> = {
  0: 0,
  1: 14,
  2: 28,
  3: 42
};

export const GATE_INDICES = [0, 14, 28, 42] as const;

export function activeSeatsForCount(playerCount: 2 | 3 | 4): HorseSeat[] {
  if (playerCount === 2) return [0, 2];
  if (playerCount === 3) return [0, 1, 2];
  return [0, 1, 2, 3];
}

export function createHorseGame(playerCount: 2 | 3 | 4 = 2): HorseGameState {
  const activeSeats = activeSeatsForCount(playerCount);
  const horses: HorsePiece[] = activeSeats.flatMap((seat) =>
    Array.from({ length: HORSES_PER_SEAT }, (_, index) => ({
      id: `s${seat}-h${index}`,
      owner: seat,
      zone: 'yard' as const,
      progress: null,
      homeRank: null
    }))
  );

  return {
    activeSeats,
    horses,
    currentSeat: activeSeats[0],
    batch: null,
    bonusDiceToRoll: 0,
    winner: null,
    turn: 1,
    message: 'Tung 2 xúc xắc để bắt đầu.'
  };
}

export function rollDie(random: () => number = Math.random): number {
  return Math.floor(random() * 6) + 1;
}

export function createDiceBatch(values: number[]): DiceBatch {
  return { values: [...values], used: values.map(() => false) };
}

export function rollInitialDice(
  state: HorseGameState,
  random: () => number = Math.random
): HorseGameState {
  if (state.winner !== null || state.batch) return state;
  const values = [rollDie(random), rollDie(random)];
  const sixes = values.filter((value) => value === 6).length;
  return {
    ...state,
    batch: createDiceBatch(values),
    bonusDiceToRoll: state.bonusDiceToRoll + sixes,
    message: `Ra ${values.join(' + ')}.`
  };
}

export function rollBonusDice(
  state: HorseGameState,
  random: () => number = Math.random
): HorseGameState {
  if (state.winner !== null || state.batch || state.bonusDiceToRoll <= 0) return state;

  const count = state.bonusDiceToRoll;
  const values = Array.from({ length: count }, () => rollDie(random));
  const sixes = values.filter((value) => value === 6).length;

  return {
    ...state,
    batch: createDiceBatch(values),
    bonusDiceToRoll: sixes,
    message: `Tung bù ${count} xúc xắc: ${values.join(' + ')}.`
  };
}

export function trackIndexForHorse(horse: HorsePiece): number | null {
  if (horse.zone !== 'track' || horse.progress === null) return null;
  return (START_INDEX[horse.owner] + horse.progress) % TRACK_LENGTH;
}

function horseAtTrackIndex(
  state: HorseGameState,
  index: number,
  exceptHorseId?: string
): HorsePiece | undefined {
  return state.horses.find((horse) =>
    horse.id !== exceptHorseId &&
    horse.zone === 'track' &&
    trackIndexForHorse(horse) === index
  );
}

function ownHorseAtHomeRank(
  state: HorseGameState,
  owner: HorseSeat,
  rank: number,
  exceptHorseId?: string
): HorsePiece | undefined {
  return state.horses.find((horse) =>
    horse.id !== exceptHorseId &&
    horse.owner === owner &&
    horse.zone === 'home' &&
    horse.homeRank === rank
  );
}

function circularDistance(from: number, to: number): number {
  const raw = (to - from + TRACK_LENGTH) % TRACK_LENGTH;
  return raw === 0 ? TRACK_LENGTH : raw;
}

export function nextGateAhead(trackIndex: number): { gateIndex: number; distance: number } {
  let bestGate: number = GATE_INDICES[0];
  let bestDistance = TRACK_LENGTH + 1;

  for (const gate of GATE_INDICES) {
    const distance = circularDistance(trackIndex, gate);
    if (distance < bestDistance) {
      bestGate = gate;
      bestDistance = distance;
    }
  }

  return { gateIndex: bestGate, distance: bestDistance };
}

function pathTrackIndices(
  horse: HorsePiece,
  steps: number
): number[] {
  if (horse.zone !== 'track' || horse.progress === null) return [];
  const indices: number[] = [];
  for (let step = 1; step <= steps; step += 1) {
    const progress = horse.progress + step;
    if (progress >= TRACK_LENGTH) break;
    indices.push((START_INDEX[horse.owner] + progress) % TRACK_LENGTH);
  }
  return indices;
}

function pathBlocked(
  state: HorseGameState,
  horse: HorsePiece,
  steps: number,
  includeDestination = false
): boolean {
  const indices = pathTrackIndices(horse, steps);
  const relevant = includeDestination ? indices : indices.slice(0, -1);
  return relevant.some((index) => Boolean(horseAtTrackIndex(state, index, horse.id)));
}

function destinationStatus(
  state: HorseGameState,
  horse: HorsePiece,
  index: number
): 'empty' | 'own' | 'enemy' {
  const occupying = horseAtTrackIndex(state, index, horse.id);
  if (!occupying) return 'empty';
  return occupying.owner === horse.owner ? 'own' : 'enemy';
}

function unusedDieValue(state: HorseGameState, dieIndex: number): number | null {
  if (!state.batch) return null;
  if (dieIndex < 0 || dieIndex >= state.batch.values.length) return null;
  if (state.batch.used[dieIndex]) return null;
  return state.batch.values[dieIndex];
}

export function canDeploy(
  state: HorseGameState,
  horse: HorsePiece,
  dieValue: number
): boolean {
  if (horse.owner !== state.currentSeat || horse.zone !== 'yard' || dieValue !== 6) return false;
  const start = START_INDEX[horse.owner];
  return destinationStatus(state, horse, start) !== 'own';
}

export function canMoveTrack(
  state: HorseGameState,
  horse: HorsePiece,
  dieValue: number
): boolean {
  if (horse.owner !== state.currentSeat || horse.zone !== 'track' || horse.progress === null) return false;
  const nextProgress = horse.progress + dieValue;
  if (nextProgress > TRACK_LENGTH) return false;

  if (nextProgress === TRACK_LENGTH) {
    return !pathBlocked(state, horse, dieValue, true);
  }

  if (pathBlocked(state, horse, dieValue, false)) return false;
  const destination = (START_INDEX[horse.owner] + nextProgress) % TRACK_LENGTH;
  return destinationStatus(state, horse, destination) !== 'own';
}

export function canFlyNextGate(
  state: HorseGameState,
  horse: HorsePiece,
  dieValue: number
): { valid: boolean; distance: number } {
  if (
    dieValue !== 1 ||
    horse.owner !== state.currentSeat ||
    horse.zone !== 'track' ||
    horse.progress === null
  ) return { valid: false, distance: 0 };

  const currentIndex = trackIndexForHorse(horse)!;
  const { gateIndex, distance } = nextGateAhead(currentIndex);
  if (horse.progress + distance > TRACK_LENGTH) return { valid: false, distance };

  const intermediate = pathTrackIndices(horse, distance).slice(0, -1);
  if (intermediate.some((index) => Boolean(horseAtTrackIndex(state, index, horse.id)))) {
    return { valid: false, distance };
  }

  if (horse.progress + distance === TRACK_LENGTH) {
    return { valid: true, distance };
  }

  return {
    valid: destinationStatus(state, horse, gateIndex) !== 'own',
    distance
  };
}

export function canClimbHome(
  state: HorseGameState,
  horse: HorsePiece,
  dieValue: number
): boolean {
  if (horse.owner !== state.currentSeat || horse.zone !== 'home' || horse.homeRank === null) return false;
  const nextRank = horse.homeRank + 1;
  if (nextRank > 6 || dieValue !== nextRank) return false;
  return !ownHorseAtHomeRank(state, horse.owner, nextRank, horse.id);
}

export function legalActionsForDie(
  state: HorseGameState,
  dieIndex: number
): HorseAction[] {
  const dieValue = unusedDieValue(state, dieIndex);
  if (dieValue === null || state.winner !== null) return [];

  const actions: HorseAction[] = [];
  const ownHorses = state.horses.filter((horse) => horse.owner === state.currentSeat);

  for (const horse of ownHorses) {
    if (canDeploy(state, horse, dieValue)) {
      actions.push({ type: 'deploy', horseId: horse.id, dieIndex });
    }

    if (canMoveTrack(state, horse, dieValue)) {
      actions.push({ type: 'move', horseId: horse.id, dieIndex, steps: dieValue });
    }

    const flight = canFlyNextGate(state, horse, dieValue);
    if (flight.valid) {
      actions.push({
        type: 'fly-next-gate',
        horseId: horse.id,
        dieIndex,
        distance: flight.distance
      });
    }

    if (canClimbHome(state, horse, dieValue)) {
      actions.push({
        type: 'climb-home',
        horseId: horse.id,
        dieIndex,
        toRank: (horse.homeRank ?? 0) + 1
      });
    }
  }

  if (actions.length === 0) actions.push({ type: 'discard-die', dieIndex });
  return actions;
}

function kickEnemyAt(
  horses: HorsePiece[],
  mover: HorsePiece,
  destinationIndex: number
): HorsePiece[] {
  return horses.map((horse) => {
    if (
      horse.id !== mover.id &&
      horse.zone === 'track' &&
      trackIndexForHorse(horse) === destinationIndex &&
      horse.owner !== mover.owner
    ) {
      return { ...horse, zone: 'yard', progress: null, homeRank: null };
    }
    return horse;
  });
}

function markDieUsed(batch: DiceBatch, dieIndex: number): DiceBatch {
  const used = [...batch.used];
  used[dieIndex] = true;
  return { ...batch, used };
}

function seatHasWon(horses: HorsePiece[], seat: HorseSeat): boolean {
  const ranks = horses
    .filter((horse) => horse.owner === seat && horse.zone === 'home')
    .map((horse) => horse.homeRank)
    .filter((rank): rank is number => rank !== null)
    .sort((a, b) => a - b);

  return HOME_WIN_RANKS.every((rank) => ranks.includes(rank));
}

function finishAction(
  state: HorseGameState,
  horses: HorsePiece[],
  dieIndex: number,
  message: string
): HorseGameState {
  if (!state.batch) return state;
  const batch = markDieUsed(state.batch, dieIndex);
  const winner = seatHasWon(horses, state.currentSeat) ? state.currentSeat : null;

  return {
    ...state,
    horses,
    batch,
    winner,
    message: winner !== null
      ? `${message} Người chơi ${winner + 1} thắng!`
      : message
  };
}

export function applyHorseAction(
  state: HorseGameState,
  action: HorseAction
): HorseGameState {
  const dieValue = unusedDieValue(state, action.dieIndex);
  if (dieValue === null || !state.batch) return state;

  const legal = legalActionsForDie(state, action.dieIndex).some((candidate) =>
    candidate.type === action.type &&
    ('horseId' in candidate ? candidate.horseId === ('horseId' in action ? action.horseId : '') : true)
  );
  if (!legal) return state;

  if (action.type === 'discard-die') {
    return finishAction(state, state.horses, action.dieIndex, `Bỏ viên ${dieValue} vì không có nước hợp lệ.`);
  }

  const horse = state.horses.find((candidate) => candidate.id === action.horseId);
  if (!horse) return state;

  if (action.type === 'deploy') {
    const destination = START_INDEX[horse.owner];
    let horses = kickEnemyAt(state.horses, horse, destination);
    horses = horses.map((candidate) =>
      candidate.id === horse.id
        ? { ...candidate, zone: 'track', progress: 0, homeRank: null }
        : candidate
    );
    return finishAction(state, horses, action.dieIndex, `Xuất ${horse.id} bằng mặt 6.`);
  }

  if (action.type === 'move') {
    const nextProgress = (horse.progress ?? 0) + action.steps;
    let horses = state.horses;

    if (nextProgress === TRACK_LENGTH) {
      horses = horses.map((candidate) =>
        candidate.id === horse.id
          ? { ...candidate, zone: 'home', progress: null, homeRank: 0 }
          : candidate
      );
      return finishAction(state, horses, action.dieIndex, `${horse.id} tới cửa chuồng của mình.`);
    }

    const destination = (START_INDEX[horse.owner] + nextProgress) % TRACK_LENGTH;
    horses = kickEnemyAt(horses, horse, destination);
    horses = horses.map((candidate) =>
      candidate.id === horse.id
        ? { ...candidate, progress: nextProgress }
        : candidate
    );
    return finishAction(state, horses, action.dieIndex, `${horse.id} đi ${action.steps} ô.`);
  }

  if (action.type === 'fly-next-gate') {
    const nextProgress = (horse.progress ?? 0) + action.distance;
    let horses = state.horses;

    if (nextProgress === TRACK_LENGTH) {
      horses = horses.map((candidate) =>
        candidate.id === horse.id
          ? { ...candidate, zone: 'home', progress: null, homeRank: 0 }
          : candidate
      );
      return finishAction(state, horses, action.dieIndex, `${horse.id} bay tới cửa chuồng của mình.`);
    }

    const destination = (START_INDEX[horse.owner] + nextProgress) % TRACK_LENGTH;
    horses = kickEnemyAt(horses, horse, destination);
    horses = horses.map((candidate) =>
      candidate.id === horse.id
        ? { ...candidate, progress: nextProgress }
        : candidate
    );
    return finishAction(state, horses, action.dieIndex, `${horse.id} bay tới cửa chuồng kế tiếp.`);
  }

  if (action.type === 'climb-home') {
    const horses = state.horses.map((candidate) =>
      candidate.id === horse.id
        ? { ...candidate, homeRank: action.toRank }
        : candidate
    );
    return finishAction(state, horses, action.dieIndex, `${horse.id} leo lên bậc ${action.toRank}.`);
  }

  return state;
}

export function batchComplete(state: HorseGameState): boolean {
  return Boolean(state.batch && state.batch.used.every(Boolean));
}

export function clearCompletedBatch(state: HorseGameState): HorseGameState {
  if (!batchComplete(state)) return state;
  return { ...state, batch: null };
}

export function endTurnIfReady(state: HorseGameState): HorseGameState {
  if (state.winner !== null || state.batch || state.bonusDiceToRoll > 0) return state;

  const currentIndex = state.activeSeats.indexOf(state.currentSeat);
  const nextSeat = state.activeSeats[(currentIndex + 1) % state.activeSeats.length];
  return {
    ...state,
    currentSeat: nextSeat,
    turn: state.turn + 1,
    message: `Tới lượt người chơi ${nextSeat + 1}.`
  };
}
