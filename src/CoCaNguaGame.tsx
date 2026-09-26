import { useEffect, useMemo, useState } from 'react';
import {
  START_INDEX,
  TRACK_LENGTH,
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
import type { HorseAction, HorseGameState, HorsePiece, HorseSeat } from './cacngua/types';

interface CoCaNguaGameProps {
  onBack: () => void;
}

type AiDifficulty = 'easy' | 'medium' | 'hard';

const SEAT_NAMES: Record<HorseSeat, string> = {
  0: 'Đỏ',
  1: 'Xanh dương',
  2: 'Xanh lá',
  3: 'Vàng'
};

const BOARD_SIZE = 700;
const CENTER = BOARD_SIZE / 2;
const TRACK_RADIUS = 250;
const HOME_START_RADIUS = 205;
const HOME_STEP = 24;
const YARD_RADIUS = 308;
const STEP_MS = 190;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function polarPoint(index: number, radius: number) {
  const angle = -Math.PI / 2 + (index / TRACK_LENGTH) * Math.PI * 2;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius
  };
}

function homePoint(seat: HorseSeat, rank: number) {
  const gate = START_INDEX[seat];
  const radius = rank === 0 ? 222 : HOME_START_RADIUS - (rank - 1) * HOME_STEP;
  return polarPoint(gate, radius);
}

function yardPoint(seat: HorseSeat, horseIndex: number) {
  const anchor = polarPoint(START_INDEX[seat], YARD_RADIUS);
  const offsets = [[-17, -17],[17, -17],[-17, 17],[17, 17]];
  const [dx, dy] = offsets[horseIndex] ?? [0, 0];
  return { x: anchor.x + dx, y: anchor.y + dy };
}

function horseIndexInOwner(horse: HorsePiece) {
  const match = horse.id.match(/-h(\d+)$/);
  return match ? Number(match[1]) : 0;
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
  const beforeOppYard = state.horses.filter((horse) => horse.owner !== state.currentSeat && horse.zone === 'yard').length;
  const beforeHorse = 'horseId' in action ? state.horses.find((horse) => horse.id === action.horseId) : undefined;
  const next = applyHorseAction(state, action);
  if (next.winner === state.currentSeat) return 100000;
  const afterOppYard = next.horses.filter((horse) => horse.owner !== state.currentSeat && horse.zone === 'yard').length;
  const afterHorse = beforeHorse ? next.horses.find((horse) => horse.id === beforeHorse.id) : undefined;
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

function pickAiAction(state: HorseGameState, dieIndex: number, difficulty: AiDifficulty): HorseAction {
  const actions = legalActionsForDie(state, dieIndex);
  if (actions.length === 1) return actions[0];
  const playable = actions.filter((action) => action.type !== 'discard-die');
  if (playable.length === 0) return actions[0];
  if (difficulty === 'easy') return playable[Math.floor(Math.random() * playable.length)];
  const scored = playable.map((action) => {
    let score = scoreAiAction(state, action);
    if (difficulty === 'hard') {
      const next = applyHorseAction(state, action);
      const nextDie = next.batch?.used.findIndex((used) => !used) ?? -1;
      if (nextDie >= 0) {
        const followUps = legalActionsForDie(next, nextDie).filter((candidate) => candidate.type !== 'discard-die');
        if (followUps.length > 0) score += Math.max(...followUps.map((candidate) => scoreAiAction(next, candidate))) * 0.55;
      }
    }
    return { action, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].action;
}

export default function CoCaNguaGame({ onBack }: CoCaNguaGameProps) {
  const [started, setStarted] = useState(false);
  const [game, setGame] = useState<HorseGameState>(() => createHorseGame(2));
  const [aiSeats, setAiSeats] = useState<HorseSeat[]>([]);
  const [difficulty, setDifficulty] = useState<AiDifficulty>('medium');
  const [selectedDie, setSelectedDie] = useState<number | null>(null);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [visualProgress, setVisualProgress] = useState<Record<string, number>>({});

  const batchKey = game.batch ? `${game.batch.values.join(',')}|${game.batch.used.join(',')}` : 'none';

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
    setVisualProgress({});
    setStarted(true);
  };

  const rollCurrentDice = async () => {
    if (rolling || animating || game.batch || game.winner !== null) return;
    setRolling(true);
    setAnimating(true);
    await sleep(650);
    setGame((current) => current.bonusDiceToRoll > 0 ? rollBonusDice(current) : rollInitialDice(current));
    setRolling(false);
    setAnimating(false);
  };

  const animateAction = async (state: HorseGameState, action: HorseAction) => {
    if (!('horseId' in action)) {
      await sleep(160);
      return;
    }
    const horse = state.horses.find((candidate) => candidate.id === action.horseId);
    if (!horse) return;
    if (action.type === 'move' && horse.zone === 'track' && horse.progress !== null) {
      for (let step = 1; step <= action.steps; step += 1) {
        setVisualProgress({ [horse.id]: horse.progress + step });
        await sleep(STEP_MS);
      }
      return;
    }
    if (action.type === 'fly-next-gate') {
      setVisualProgress({ [horse.id]: (horse.progress ?? 0) + action.distance });
      await sleep(520);
      return;
    }
    if (action.type === 'deploy') {
      await sleep(380);
      return;
    }
    if (action.type === 'climb-home') await sleep(320);
  };

  const performAction = async (action: HorseAction) => {
    if (animating || game.winner !== null) return;
    setAnimating(true);
    setSelectedHorse(null);
    await animateAction(game, action);
    setGame(normalizeAfterAction(applyHorseAction(game, action)));
    setVisualProgress({});
    setAnimating(false);
  };

  useEffect(() => {
    if (!started || !currentIsAi || game.winner !== null || animating || rolling) return;
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

  const horseScreenPoint = (horse: HorsePiece) => {
    const animated = visualProgress[horse.id];
    if (animated !== undefined) return polarPoint((START_INDEX[horse.owner] + animated) % TRACK_LENGTH, TRACK_RADIUS);
    if (horse.zone === 'track') return polarPoint(trackIndexForHorse(horse) ?? START_INDEX[horse.owner], TRACK_RADIUS);
    if (horse.zone === 'home') return homePoint(horse.owner, horse.homeRank ?? 0);
    return yardPoint(horse.owner, horseIndexInOwner(horse));
  };

  const actionsForHorse = (horseId: string) => selectedActions.filter(
    (action) => 'horseId' in action && action.horseId === horseId
  );

  const handleHorseClick = (horseId: string) => {
    if (selectedDie === null || currentIsAi || animating || rolling || game.winner !== null) return;
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
          <p>Hai xúc xắc, bốn chú ngựa mỗi màu, những cú đá về sân và luật mặt 1 bay tới cửa chuồng kế tiếp.</p>
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
                <button key={level} type="button" className={difficulty === level ? 'active' : ''} onClick={() => setDifficulty(level)}>
                  {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}
                </button>
              ))}
            </div>
          </div>

          <div className="ccn-mode-grid">
            <button type="button" onClick={() => startMatch(2, 0)}><b>2 người</b><span>Local · hai màu đối diện</span></button>
            <button type="button" onClick={() => startMatch(3, 0)}><b>3 người</b><span>Local · chuyền máy theo lượt</span></button>
            <button type="button" onClick={() => startMatch(4, 0)}><b>4 người</b><span>Local · đủ bốn màu</span></button>
            <button type="button" onClick={() => startMatch(2, 1)}><b>1 vs 1 AI</b><span>Người Đỏ đấu một máy</span></button>
            <button type="button" onClick={() => startMatch(3, 2)}><b>1 vs 2 AI</b><span>Một người, hai đối thủ máy</span></button>
            <button type="button" onClick={() => startMatch(4, 3)}><b>1 vs 3 AI</b><span>Đủ bốn màu, ba máy</span></button>
          </div>
        </section>

        <details className="rules ccn-rules" open>
          <summary>Luật v0.1 đã chốt</summary>
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
  const onlyDiscard = selectedActions.length === 1 && selectedActions[0].type === 'discard-die';

  return (
    <main className="ccn-shell">
      <header className="ccn-game-head">
        <button className="hub-back-button" type="button" onClick={onBack}>← Sảnh game</button>
        <div>
          <p className="eyebrow">CỜ CÁ NGỰA · v0.1</p>
          <h1>Lượt {game.turn}</h1>
          <p>{game.message}</p>
        </div>
        <button className="ccn-new-game" type="button" onClick={() => setStarted(false)}>Bàn mới</button>
      </header>

      {game.winner !== null && (
        <section className={`ccn-winner seat-${game.winner}`}>
          <span>🏆</span>
          <div><b>{SEAT_NAMES[game.winner]} thắng!</b><p>Bốn ngựa đã chiếm đủ bậc 3 · 4 · 5 · 6.</p></div>
          <button type="button" onClick={() => setStarted(false)}>Chơi bàn khác</button>
        </section>
      )}

      <section className="ccn-layout">
        <div className="ccn-board-wrap">
          <svg className="ccn-board" viewBox="0 0 700 700" aria-label="Bàn Cờ cá ngựa">
            <circle cx={CENTER} cy={CENTER} r="279" className="ccn-track-ring" />
            {Array.from({ length: TRACK_LENGTH }, (_, index) => {
              const point = polarPoint(index, TRACK_RADIUS);
              const gateSeat = ([0, 1, 2, 3] as HorseSeat[]).find((seat) => START_INDEX[seat] === index);
              return (
                <g key={index} className={`ccn-track-cell ${gateSeat !== undefined ? `gate seat-${gateSeat}` : ''}`}>
                  <circle cx={point.x} cy={point.y} r={gateSeat !== undefined ? 13 : 9} />
                  {gateSeat !== undefined && <text x={point.x} y={point.y + 4}>⌂</text>}
                </g>
              );
            })}
            {([0, 1, 2, 3] as HorseSeat[]).map((seat) => (
              <g key={seat} className={`ccn-home-lane seat-${seat} ${game.activeSeats.includes(seat) ? 'active' : 'inactive'}`}>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((rank) => {
                  const point = homePoint(seat, rank);
                  return (
                    <g key={rank}>
                      <circle cx={point.x} cy={point.y} r="13" />
                      <text x={point.x} y={point.y + 4}>{rank}</text>
                    </g>
                  );
                })}
              </g>
            ))}
            <circle cx={CENTER} cy={CENTER} r="55" className="ccn-center" />
            <text x={CENTER} y={CENTER - 5} className="ccn-center-title">CỜ CÁ NGỰA</text>
            <text x={CENTER} y={CENTER + 18} className="ccn-center-sub">2 XÚC XẮC</text>
            {game.horses.map((horse) => {
              const point = horseScreenPoint(horse);
              const actionable = actionsForHorse(horse.id).length > 0;
              const selected = selectedHorse === horse.id;
              return (
                <g
                  key={horse.id}
                  className={['ccn-horse', `seat-${horse.owner}`, actionable ? 'actionable' : '', selected ? 'selected' : '', visualProgress[horse.id] !== undefined ? 'moving' : ''].filter(Boolean).join(' ')}
                  onClick={(event) => { event.stopPropagation(); handleHorseClick(horse.id); }}
                >
                  <circle cx={point.x} cy={point.y} r="17" />
                  <text x={point.x} y={point.y + 6}>♞</text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="ccn-panel">
          <div className={`ccn-turn-card seat-${currentSeat}`}>
            <span>{currentIsAi ? 'MÁY ĐANG CHƠI' : 'LƯỢT HIỆN TẠI'}</span>
            <strong>{currentName}</strong>
            <small>{currentIsAi ? `AI ${difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Vừa' : 'Khó'}` : 'Người chơi'}</small>
          </div>

          <div className="ccn-dice-panel">
            <div className="ccn-dice-title"><b>Xúc xắc</b>{game.bonusDiceToRoll > 0 && !game.batch && <span>+{game.bonusDiceToRoll} viên tung bù</span>}</div>
            {!game.batch && game.winner === null ? (
              <button className={`ccn-roll-button ${rolling ? 'rolling' : ''}`} type="button" disabled={rolling || animating || currentIsAi} onClick={() => void rollCurrentDice()}>
                <span>🎲</span>{rolling ? 'Đang lắc...' : game.bonusDiceToRoll > 0 ? `Tung bù ${game.bonusDiceToRoll} xúc xắc` : 'Tung 2 xúc xắc'}
              </button>
            ) : (
              <div className="ccn-dice-row">
                {game.batch?.values.map((value, index) => (
                  <button
                    key={index}
                    type="button"
                    className={['ccn-die', selectedDie === index ? 'selected' : '', game.batch?.used[index] ? 'used' : '', value === 6 ? 'six' : ''].filter(Boolean).join(' ')}
                    disabled={game.batch?.used[index] || currentIsAi || animating}
                    onClick={() => { setSelectedDie(index); setSelectedHorse(null); }}
                  >
                    <b>{value}</b>{value === 6 && <small>+1 🎲</small>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!currentIsAi && game.batch && selectedDie !== null && !game.batch.used[selectedDie] && (
            <div className="ccn-action-panel">
              <span>ĐANG DÙNG MẶT {selectedDieValue}</span>
              {onlyDiscard ? (
                <button type="button" onClick={() => void performAction(selectedActions[0])}>Không có nước hợp lệ · bỏ viên</button>
              ) : selectedHorseActions.length > 1 ? (
                <>
                  <p>Ngựa này có nhiều lựa chọn:</p>
                  {selectedHorseActions.map((action, index) => <button key={index} type="button" onClick={() => void performAction(action)}>{actionLabel(action)}</button>)}
                </>
              ) : <p>Chạm ngựa đang phát sáng để dùng viên xúc xắc này.</p>}
            </div>
          )}

          <div className="ccn-status-panel">
            {game.activeSeats.map((seat) => {
              const horses = game.horses.filter((horse) => horse.owner === seat);
              return (
                <div key={seat} className={`seat-${seat}`}>
                  <b>{SEAT_NAMES[seat]}</b>
                  <span>Sân {horses.filter((horse) => horse.zone === 'yard').length} · Đua {horses.filter((horse) => horse.zone === 'track').length} · Chuồng {horses.filter((horse) => horse.zone === 'home').length}</span>
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
