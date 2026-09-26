import { useEffect, useMemo, useRef, useState } from 'react';
import {
  START_INDEX,
  applyHorseAction,
  batchComplete,
  clearCompletedBatch,
  createHorseGame,
  endTurnIfReady,
  legalActionsForDie,
  rollBonusDice,
  rollInitialDice,
  trackIndexForHorse
} from './cacngua/engine';
import Dice3D from './cacngua/Dice3D';
import {
  BOARD_CENTER,
  BOARD_SIZE,
  GATE_SEAT_BY_INDEX,
  TRACK_CELL_SIZE,
  YARD_RECTS,
  homeLanePoint,
  quadraticArcPath,
  trackPoint,
  yardPoint
} from './cacngua/geometry';
import type { BoardPoint } from './cacngua/geometry';
import type { HorseAction, HorseGameState, HorsePiece, HorseSeat } from './cacngua/types';

interface CoCaNguaGameProps {
  onBack: () => void;
}

type AiDifficulty = 'easy' | 'medium' | 'hard';
type MotionKind = 'fly' | 'kick' | 'deploy';

interface MotionFx {
  id: number;
  kind: MotionKind;
  horseId: string;
  seat: HorseSeat;
  path: string;
  durationMs: number;
}

const SEAT_NAMES: Record<HorseSeat, string> = {
  0: 'Đỏ',
  1: 'Xanh dương',
  2: 'Xanh lá',
  3: 'Vàng'
};

const STEP_MS = 175;
const FLY_MS = 820;
const KICK_MS = 780;
const DEPLOY_MS = 430;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function horseIndexInOwner(horse: HorsePiece) {
  const match = horse.id.match(/-h(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function horseBasePoint(horse: HorsePiece): BoardPoint {
  if (horse.zone === 'track') {
    return trackPoint(trackIndexForHorse(horse) ?? START_INDEX[horse.owner]);
  }
  if (horse.zone === 'home') {
    return homeLanePoint(horse.owner, horse.homeRank ?? 0);
  }
  return yardPoint(horse.owner, horseIndexInOwner(horse));
}

function actionLabel(action: HorseAction) {
  if (action.type === 'deploy') return 'Xuất quân bằng 6';
  if (action.type === 'move') return `Đi ${action.steps} ô`;
  if (action.type === 'fly-next-gate') return `Bay tới cửa chuồng kế tiếp · ${action.distance} ô`;
  if (action.type === 'climb-home') return `Leo lên bậc ${action.toRank}`;
  return 'Bỏ viên xúc xắc';
}

function normalizeAfterAction(state: HorseGameState): HorseGameState {
  if (!batchComplete(state)) return state;
  const cleared = clearCompletedBatch(state);
  return cleared.bonusDiceToRoll > 0 ? cleared : endTurnIfReady(cleared);
}

function scoreAiAction(state: HorseGameState, action: HorseAction): number {
  if (action.type === 'discard-die') return -1000;
  const beforeOppYard = state.horses.filter(
    (horse) => horse.owner !== state.currentSeat && horse.zone === 'yard'
  ).length;
  const beforeHorse = 'horseId' in action
    ? state.horses.find((horse) => horse.id === action.horseId)
    : undefined;

  const next = applyHorseAction(state, action);
  if (next.winner === state.currentSeat) return 100000;

  const afterOppYard = next.horses.filter(
    (horse) => horse.owner !== state.currentSeat && horse.zone === 'yard'
  ).length;
  const afterHorse = beforeHorse
    ? next.horses.find((horse) => horse.id === beforeHorse.id)
    : undefined;

  let score = (afterOppYard - beforeOppYard) * 220;
  if (action.type === 'deploy') score += 55;
  if (action.type === 'fly-next-gate') score += 70 + action.distance;
  if (action.type === 'climb-home') score += 100 + action.toRank * 18;
  if (action.type === 'move') score += 20 + action.steps * 3;

  if (beforeHorse && afterHorse) {
    const beforeProgress = beforeHorse.progress ?? 0;
    const afterProgress = afterHorse.progress ?? beforeProgress;
    score += Math.max(0, afterProgress - beforeProgress);
    if (afterHorse.zone === 'home') score += 95 + (afterHorse.homeRank ?? 0) * 20;
  }

  return score;
}

function pickAiAction(
  state: HorseGameState,
  dieIndex: number,
  difficulty: AiDifficulty
): HorseAction {
  const actions = legalActionsForDie(state, dieIndex);
  if (actions.length === 1) return actions[0];

  const playable = actions.filter((action) => action.type !== 'discard-die');
  if (playable.length === 0) return actions[0];

  if (difficulty === 'easy') {
    return playable[Math.floor(Math.random() * playable.length)];
  }

  const scored = playable.map((action) => {
    let score = scoreAiAction(state, action);

    if (difficulty === 'hard') {
      const next = applyHorseAction(state, action);
      const nextDie = next.batch?.used.findIndex((used) => !used) ?? -1;
      if (nextDie >= 0) {
        const followUps = legalActionsForDie(next, nextDie)
          .filter((candidate) => candidate.type !== 'discard-die');
        if (followUps.length > 0) {
          score += Math.max(
            ...followUps.map((candidate) => scoreAiAction(next, candidate))
          ) * 0.55;
        }
      }
    }

    return { action, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].action;
}

function findKickedHorse(
  before: HorseGameState,
  after: HorseGameState,
  attackerId: string
): HorsePiece | undefined {
  return before.horses.find((horse) => {
    if (horse.id === attackerId || horse.zone !== 'track') return false;
    const nextHorse = after.horses.find((candidate) => candidate.id === horse.id);
    return nextHorse?.zone === 'yard';
  });
}

export default function CoCaNguaGame({ onBack }: CoCaNguaGameProps) {
  const [started, setStarted] = useState(false);
  const [game, setGame] = useState<HorseGameState>(() => createHorseGame(2));
  const [aiSeats, setAiSeats] = useState<HorseSeat[]>([]);
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium');
  const [selectedDie, setSelectedDie] = useState<number | null>(null);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollingValues, setRollingValues] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);
  const [visualPoints, setVisualPoints] = useState<Record<string, BoardPoint>>({});
  const [hiddenHorseIds, setHiddenHorseIds] = useState<string[]>([]);
  const [motionFx, setMotionFx] = useState<MotionFx | null>(null);
  const [impactPoint, setImpactPoint] = useState<BoardPoint | null>(null);
  const fxSerial = useRef(0);

  const batchKey = game.batch
    ? `${game.batch.values.join(',')}|${game.batch.used.join(',')}`
    : 'none';

  useEffect(() => {
    if (!game.batch) {
      setSelectedDie(null);
      setSelectedHorse(null);
      return;
    }
    const nextUnused = game.batch.used.findIndex((used) => !used);
    setSelectedDie(nextUnused >= 0 ? nextUnused : null);
    setSelectedHorse(null);
  }, [batchKey]);

  const selectedActions = useMemo(
    () => selectedDie === null ? [] : legalActionsForDie(game, selectedDie),
    [game, selectedDie]
  );

  const currentIsAi = aiSeats.includes(game.currentSeat);

  const startMatch = (playerCount: 2 | 3 | 4, aiCount: number) => {
    const next = createHorseGame(playerCount);
    const ais = aiCount > 0 ? next.activeSeats.slice(1, aiCount + 1) : [];
    setGame(next);
    setAiSeats(ais);
    setSelectedDie(null);
    setSelectedHorse(null);
    setVisualPoints({});
    setHiddenHorseIds([]);
    setMotionFx(null);
    setImpactPoint(null);
    setStarted(true);
  };

  const rollCurrentDice = async () => {
    if (rolling || animating || game.batch || game.winner !== null) return;

    const rolledState = game.bonusDiceToRoll > 0
      ? rollBonusDice(game)
      : rollInitialDice(game);
    const values = rolledState.batch?.values ?? [];

    setRollingValues(values);
    setRolling(true);
    setAnimating(true);
    await sleep(960);
    setGame(rolledState);
    setRolling(false);
    setRollingValues([]);
    setAnimating(false);
  };

  const playMotion = async (
    kind: MotionKind,
    horse: HorsePiece,
    from: BoardPoint,
    to: BoardPoint,
    durationMs: number,
    lift: number
  ) => {
    const id = ++fxSerial.current;
    setHiddenHorseIds((current) => [...new Set([...current, horse.id])]);
    setMotionFx({
      id,
      kind,
      horseId: horse.id,
      seat: horse.owner,
      path: quadraticArcPath(from, to, lift),
      durationMs
    });
    await sleep(durationMs);
    setVisualPoints((current) => ({ ...current, [horse.id]: to }));
    setMotionFx(null);
    setHiddenHorseIds((current) => current.filter((horseId) => horseId !== horse.id));
  };

  const animateAction = async (
    before: HorseGameState,
    after: HorseGameState,
    action: HorseAction
  ) => {
    if (!('horseId' in action)) {
      await sleep(130);
      return;
    }

    const horse = before.horses.find((candidate) => candidate.id === action.horseId);
    const resolvedHorse = after.horses.find((candidate) => candidate.id === action.horseId);
    if (!horse || !resolvedHorse) return;

    if (action.type === 'move' && horse.zone === 'track' && horse.progress !== null) {
      for (let step = 1; step <= action.steps; step += 1) {
        const nextProgress = horse.progress + step;
        const point = nextProgress >= 56
          ? homeLanePoint(horse.owner, 0)
          : trackPoint(START_INDEX[horse.owner] + nextProgress);
        setVisualPoints((current) => ({ ...current, [horse.id]: point }));
        await sleep(STEP_MS);
      }
    }

    if (action.type === 'fly-next-gate') {
      await playMotion(
        'fly',
        horse,
        horseBasePoint(horse),
        horseBasePoint(resolvedHorse),
        FLY_MS,
        132
      );
    }

    if (action.type === 'deploy') {
      await playMotion(
        'deploy',
        horse,
        horseBasePoint(horse),
        horseBasePoint(resolvedHorse),
        DEPLOY_MS,
        72
      );
    }

    if (action.type === 'climb-home') {
      setVisualPoints((current) => ({
        ...current,
        [horse.id]: horseBasePoint(resolvedHorse)
      }));
      await sleep(330);
    }

    const kickedHorse = findKickedHorse(before, after, horse.id);
    if (kickedHorse) {
      const kickedAfter = after.horses.find((candidate) => candidate.id === kickedHorse.id)!;
      const hitPoint = horseBasePoint(kickedHorse);
      setImpactPoint(hitPoint);
      await sleep(120);
      await playMotion(
        'kick',
        kickedHorse,
        hitPoint,
        horseBasePoint(kickedAfter),
        KICK_MS,
        152
      );
      setImpactPoint(null);
    }
  };

  const performAction = async (action: HorseAction) => {
    if (animating || game.winner !== null) return;

    const resolved = applyHorseAction(game, action);
    if (resolved === game) return;

    setAnimating(true);
    setSelectedHorse(null);
    await animateAction(game, resolved, action);
    setGame(normalizeAfterAction(resolved));
    setVisualPoints({});
    setHiddenHorseIds([]);
    setMotionFx(null);
    setImpactPoint(null);
    setAnimating(false);
  };

  useEffect(() => {
    if (
      !started ||
      !currentIsAi ||
      game.winner !== null ||
      animating ||
      rolling
    ) return;

    const timer = window.setTimeout(() => {
      if (!game.batch) {
        void rollCurrentDice();
        return;
      }

      const dieIndex = game.batch.used.findIndex((used) => !used);
      if (dieIndex < 0) {
        setGame(normalizeAfterAction(game));
        return;
      }

      void performAction(pickAiAction(game, dieIndex, difficulty));
    }, 620);

    return () => window.clearTimeout(timer);
  }, [started, currentIsAi, game, animating, rolling, difficulty]);

  const horseScreenPoint = (horse: HorsePiece) =>
    visualPoints[horse.id] ?? horseBasePoint(horse);

  const actionsForHorse = (horseId: string) => selectedActions.filter(
    (action) => 'horseId' in action && action.horseId === horseId
  );

  const handleHorseClick = (horseId: string) => {
    if (
      selectedDie === null ||
      currentIsAi ||
      animating ||
      rolling ||
      game.winner !== null
    ) return;

    const actions = actionsForHorse(horseId);
    if (actions.length === 1) {
      void performAction(actions[0]);
      return;
    }

    if (actions.length > 1) setSelectedHorse(horseId);
  };

  if (!started) {
    return (
      <main className="ccn-shell">
        <header className="ccn-hero">
          <button className="hub-back-button" type="button" onClick={onBack}>← Sảnh game</button>
          <p className="eyebrow">GAME 08 · DÂN GIAN VIỆT NAM</p>
          <h1>Cờ cá ngựa</h1>
          <p>
            Bàn vuông kiểu Việt Nam, hai xúc xắc lập phương và những cú bay/đá vui nhộn trên đường đua.
          </p>
        </header>

        <section className="ccn-mode-panel">
          <div className="ccn-mode-heading">
            <div>
              <p className="eyebrow">CHỌN BÀN</p>
              <h2>Chơi cùng người hay đấu máy?</h2>
            </div>
            <div className="ccn-difficulty">
              <span>AI</span>
              {(['easy', 'medium', 'hard'] as AiDifficulty[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={difficulty === level ? 'active' : ''}
                  onClick={() => setDifficulty(level)}
                >
                  {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}
                </button>
              ))}
            </div>
          </div>

          <div className="ccn-mode-grid">
            <button type="button" onClick={() => startMatch(2, 0)}>
              <b>2 người</b><span>Local · hai màu đối diện</span>
            </button>
            <button type="button" onClick={() => startMatch(3, 0)}>
              <b>3 người</b><span>Local · chuyền máy theo lượt</span>
            </button>
            <button type="button" onClick={() => startMatch(4, 0)}>
              <b>4 người</b><span>Local · đủ bốn màu</span>
            </button>
            <button type="button" onClick={() => startMatch(2, 1)}>
              <b>1 vs 1 AI</b><span>Người Đỏ đấu một máy</span>
            </button>
            <button type="button" onClick={() => startMatch(3, 2)}>
              <b>1 vs 2 AI</b><span>Một người, hai đối thủ máy</span>
            </button>
            <button type="button" onClick={() => startMatch(4, 3)}>
              <b>1 vs 3 AI</b><span>Đủ bốn màu, ba máy</span>
            </button>
          </div>
        </section>

        <details className="rules ccn-rules" open>
          <summary>Luật v0.1 giữ nguyên</summary>
          <p><b>Hai xúc xắc dùng riêng:</b> có thể dùng cho hai ngựa khác nhau hoặc nối tiếp trên cùng một ngựa.</p>
          <p><b>Mặt 6:</b> có thể xuất quân; mỗi viên 6 cho thêm đúng một xúc xắc tung bù.</p>
          <p><b>Mặt 1:</b> ngoài đi 1 ô, ngựa trên đường đua có thể bay tới cửa chuồng kế tiếp nếu đường không bị cản.</p>
          <p><b>Đích:</b> hoàn thành vòng, leo chuồng 1→6 và thắng khi bốn ngựa đứng ở 3·4·5·6.</p>
        </details>
      </main>
    );
  }

  const currentSeat = game.currentSeat;
  const currentName = SEAT_NAMES[currentSeat];
  const selectedHorseActions = selectedHorse ? actionsForHorse(selectedHorse) : [];
  const selectedDieValue = selectedDie !== null ? game.batch?.values[selectedDie] : null;
  const onlyDiscard =
    selectedActions.length === 1 && selectedActions[0].type === 'discard-die';

  return (
    <main className="ccn-shell ccn-v2">
      <header className="ccn-game-head">
        <button className="hub-back-button" type="button" onClick={onBack}>← Sảnh game</button>
        <div>
          <p className="eyebrow">CỜ CÁ NGỰA · v0.2</p>
          <h1>Lượt {game.turn}</h1>
          <p>{game.message}</p>
        </div>
        <button className="ccn-new-game" type="button" onClick={() => setStarted(false)}>
          Bàn mới
        </button>
      </header>

      {game.winner !== null && (
        <section className={`ccn-winner seat-${game.winner}`}>
          <span>🏆</span>
          <div>
            <b>{SEAT_NAMES[game.winner]} thắng!</b>
            <p>Bốn ngựa đã chiếm đủ bậc 3 · 4 · 5 · 6.</p>
          </div>
          <button type="button" onClick={() => setStarted(false)}>Chơi bàn khác</button>
        </section>
      )}

      <section className="ccn-layout">
        <div className="ccn-board-wrap">
          <svg
            className="ccn-board ccn-square-board"
            viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
            aria-label="Bàn Cờ cá ngựa vuông kiểu Việt Nam"
          >
            <rect x="60" y="60" width="580" height="580" rx="28" className="ccn-board-paper" />

            {([0, 1, 2, 3] as HorseSeat[]).map((seat) => {
              const yard = YARD_RECTS[seat];
              return (
                <g
                  key={seat}
                  className={`ccn-yard seat-${seat} ${game.activeSeats.includes(seat) ? 'active' : 'inactive'}`}
                >
                  <rect
                    x={yard.x}
                    y={yard.y}
                    width={yard.width}
                    height={yard.height}
                    rx="26"
                  />
                  <text
                    x={yard.x + yard.width / 2}
                    y={yard.y + 24}
                    className="ccn-yard-label"
                  >
                    SÂN {SEAT_NAMES[seat].toUpperCase()}
                  </text>
                  {[0, 1, 2, 3].map((horseIndex) => {
                    const point = yardPoint(seat, horseIndex);
                    return <circle key={horseIndex} cx={point.x} cy={point.y} r="23" className="ccn-yard-slot" />;
                  })}
                </g>
              );
            })}

            {Array.from({ length: 56 }, (_, index) => {
              const point = trackPoint(index);
              const gateSeat = GATE_SEAT_BY_INDEX[index];
              return (
                <g
                  key={index}
                  className={`ccn-track-cell square ${gateSeat !== undefined ? `gate seat-${gateSeat}` : ''}`}
                >
                  <rect
                    x={point.x - TRACK_CELL_SIZE / 2}
                    y={point.y - TRACK_CELL_SIZE / 2}
                    width={TRACK_CELL_SIZE}
                    height={TRACK_CELL_SIZE}
                    rx="7"
                  />
                  {gateSeat !== undefined && (
                    <text x={point.x} y={point.y + 4}>⌂</text>
                  )}
                </g>
              );
            })}

            {([0, 1, 2, 3] as HorseSeat[]).map((seat) => (
              <g
                key={seat}
                className={`ccn-home-lane seat-${seat} ${game.activeSeats.includes(seat) ? 'active' : 'inactive'}`}
              >
                {Array.from({ length: 6 }, (_, i) => i + 1).map((rank) => {
                  const point = homeLanePoint(seat, rank);
                  return (
                    <g key={rank}>
                      <rect
                        x={point.x - 15}
                        y={point.y - 15}
                        width="30"
                        height="30"
                        rx="8"
                      />
                      <text x={point.x} y={point.y + 4}>{rank}</text>
                    </g>
                  );
                })}
              </g>
            ))}

            <rect
              x={BOARD_CENTER - 48}
              y={BOARD_CENTER - 48}
              width="96"
              height="96"
              rx="18"
              className="ccn-center"
              transform={`rotate(45 ${BOARD_CENTER} ${BOARD_CENTER})`}
            />
            <text x={BOARD_CENTER} y={BOARD_CENTER - 4} className="ccn-center-title">CỜ CÁ NGỰA</text>
            <text x={BOARD_CENTER} y={BOARD_CENTER + 18} className="ccn-center-sub">VIỆT NAM · 2 XÚC XẮC</text>

            {motionFx?.kind === 'fly' && (
              <path
                key={`trail-${motionFx.id}`}
                d={motionFx.path}
                className="ccn-flight-trail"
              />
            )}

            {impactPoint && (
              <g
                className="ccn-impact-fx"
                transform={`translate(${impactPoint.x} ${impactPoint.y})`}
              >
                <circle r="18" />
                <circle r="34" />
                <text x="0" y="-28">BỐP!</text>
              </g>
            )}

            {game.horses.map((horse) => {
              const point = horseScreenPoint(horse);
              const actionable = actionsForHorse(horse.id).length > 0;
              const selected = selectedHorse === horse.id;
              const hidden = hiddenHorseIds.includes(horse.id);
              return (
                <g
                  key={horse.id}
                  className={[
                    'ccn-horse',
                    `seat-${horse.owner}`,
                    actionable ? 'actionable' : '',
                    selected ? 'selected' : '',
                    visualPoints[horse.id] ? 'moving' : '',
                    hidden ? 'fx-hidden' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleHorseClick(horse.id);
                  }}
                >
                  <circle cx={point.x} cy={point.y} r="18" />
                  <text x={point.x} y={point.y + 7}>♞</text>
                </g>
              );
            })}

            {motionFx && (
              <g
                key={motionFx.id}
                className={`ccn-fx-horse seat-${motionFx.seat} ${motionFx.kind}`}
              >
                <animateMotion
                  dur={`${motionFx.durationMs}ms`}
                  path={motionFx.path}
                  fill="freeze"
                />
                <circle r="20" />
                <text x="0" y="7">♞</text>
              </g>
            )}
          </svg>

          <div className="ccn-board-caption">
            <span>⌂ Cửa chuồng</span>
            <span>1→6 Leo chuồng</span>
            <span>♞ Ô sáng = có nước hợp lệ</span>
          </div>
        </div>

        <aside className="ccn-panel">
          <div className={`ccn-turn-card seat-${currentSeat}`}>
            <span>{currentIsAi ? 'MÁY ĐANG CHƠI' : 'LƯỢT HIỆN TẠI'}</span>
            <strong>{currentName}</strong>
            <small>
              {currentIsAi
                ? `AI ${difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Vừa' : 'Khó'}`
                : 'Người chơi'}
            </small>
          </div>

          <div className="ccn-dice-panel">
            <div className="ccn-dice-title">
              <b>Hai xúc xắc lập phương</b>
              {game.bonusDiceToRoll > 0 && !game.batch && !rolling && (
                <span>+{game.bonusDiceToRoll} viên tung bù</span>
              )}
            </div>

            {rolling ? (
              <div className="ccn-cube-row rolling-now">
                {rollingValues.map((value, index) => (
                  <Dice3D key={index} value={value} rolling disabled />
                ))}
              </div>
            ) : game.batch ? (
              <div className="ccn-cube-row">
                {game.batch.values.map((value, index) => (
                  <Dice3D
                    key={index}
                    value={value}
                    selected={selectedDie === index}
                    used={game.batch?.used[index]}
                    bonus={value === 6}
                    disabled={Boolean(game.batch?.used[index]) || currentIsAi || animating}
                    onClick={() => {
                      setSelectedDie(index);
                      setSelectedHorse(null);
                    }}
                  />
                ))}
              </div>
            ) : game.winner === null ? (
              <>
                <div className="ccn-cube-row idle">
                  <Dice3D value={1} disabled />
                  <Dice3D value={6} disabled />
                </div>
                <button
                  className="ccn-roll-button"
                  type="button"
                  disabled={animating || currentIsAi}
                  onClick={() => void rollCurrentDice()}
                >
                  {game.bonusDiceToRoll > 0
                    ? `Tung bù ${game.bonusDiceToRoll} xúc xắc`
                    : 'Lắc và tung 2 xúc xắc'}
                </button>
              </>
            ) : null}
          </div>

          {!currentIsAi &&
            game.batch &&
            selectedDie !== null &&
            !game.batch.used[selectedDie] && (
              <div className="ccn-action-panel">
                <span>ĐANG DÙNG MẶT {selectedDieValue}</span>
                {onlyDiscard ? (
                  <button
                    type="button"
                    onClick={() => void performAction(selectedActions[0])}
                  >
                    Không có nước hợp lệ · bỏ viên
                  </button>
                ) : selectedHorseActions.length > 1 ? (
                  <>
                    <p>Ngựa này có nhiều lựa chọn:</p>
                    {selectedHorseActions.map((action, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => void performAction(action)}
                      >
                        {actionLabel(action)}
                      </button>
                    ))}
                  </>
                ) : (
                  <p>Chạm ngựa đang phát sáng để dùng viên xúc xắc này.</p>
                )}
              </div>
            )}

          <div className="ccn-status-panel">
            {game.activeSeats.map((seat) => {
              const horses = game.horses.filter((horse) => horse.owner === seat);
              const yard = horses.filter((horse) => horse.zone === 'yard').length;
              const track = horses.filter((horse) => horse.zone === 'track').length;
              const home = horses.filter((horse) => horse.zone === 'home').length;
              return (
                <div key={seat} className={`seat-${seat}`}>
                  <b>{SEAT_NAMES[seat]}</b>
                  <span>Sân {yard} · Đua {track} · Chuồng {home}</span>
                </div>
              );
            })}
          </div>

          <details className="rules ccn-rules">
            <summary>Nhắc luật nhanh</summary>
            <p>Hai viên dùng riêng. Có thể dùng cả hai cho cùng một ngựa nếu từng nước đều hợp lệ.</p>
            <p>Mỗi mặt 6 cho một viên tung bù. Mặt 1 có thể đi 1 hoặc bay tới cửa chuồng kế tiếp nếu đường trống.</p>
            <p>Không vượt quân cản. Đáp đúng quân địch thì đá về sân. Vào chuồng phải leo đúng 1→6.</p>
          </details>
        </aside>
      </section>
    </main>
  );
}
