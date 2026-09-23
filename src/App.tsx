import { useEffect, useMemo, useRef, useState } from 'react';
import { chooseAiMove } from './game/ai';
import { createInitialState, PLAYER_PITS } from './game/engine';
import { createMoveTrace } from './game/trace';
import type { AiLevel, Direction, GameMode, GameState, Move, MoveEvent } from './game/types';
import { StonePile } from './components/StonePile';

const topOrder = [1, 2, 3, 4, 5];
const bottomOrder = [11, 10, 9, 8, 7];

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function eventDelay(event: MoveEvent, reducedMotion: boolean): number {
  if (reducedMotion) return 60;
  switch (event.type) {
    case 'pickup':
      return 650;
    case 'continue-pickup':
      return 650;
    case 'drop':
      return 500;
    case 'capture':
      return 750;
    case 'refill':
      return 500;
    case 'turn-end':
      return 320;
  }
}

function describeEvent(event: MoveEvent | null): string {
  if (!event) return 'Đang thực hiện nước đi…';
  switch (event.type) {
    case 'pickup':
      return `Nhấc cả ${event.count} quân lên tay.`;
    case 'continue-pickup':
      return `Bốc tiếp ${event.count} quân và tiếp tục rải.`;
    case 'drop':
      return event.hand > 0 ? `Rải 1 quân · còn ${event.hand} trên tay.` : 'Rải quân cuối trong tay.';
    case 'capture':
      return event.quan ? `Ăn Quan: +${event.points} điểm!` : `Ăn ${event.dan} quân: +${event.points} điểm.`;
    case 'refill':
      return event.borrowed > 0
        ? `Rải lại quân để tiếp tục · đang vay ${event.borrowed} quân.`
        : 'Rải lại 1 quân vào mỗi ô dân.';
    case 'turn-end':
      return event.gameOver ? 'Ván đấu kết thúc.' : 'Hoàn tất nước đi.';
  }
}

export default function App() {
  const [mode, setMode] = useState<GameMode>('ai');
  const [level, setLevel] = useState<AiLevel>('medium');
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [selectedPit, setSelectedPit] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeEvent, setActiveEvent] = useState<MoveEvent | null>(null);
  const animationToken = useRef(0);

  const aiThinking = mode === 'ai' && state.currentPlayer === 1 && !state.gameOver && !isAnimating;

  const animateMove = async (baseState: GameState, move: Move) => {
    if (isAnimating) return;

    const trace = createMoveTrace(baseState, move);
    if (trace.steps.length === 0) return;

    const token = ++animationToken.current;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    setSelectedPit(null);
    setIsAnimating(true);

    for (const step of trace.steps) {
      if (animationToken.current !== token) return;
      setState(step.state);
      setActiveEvent(step.event);
      await wait(eventDelay(step.event, reducedMotion));
    }

    if (animationToken.current !== token) return;
    setState(trace.finalState);
    setActiveEvent(null);
    setIsAnimating(false);
  };

  useEffect(() => {
    if (!aiThinking) return;

    const snapshot = state;
    const timer = window.setTimeout(() => {
      const move = chooseAiMove(snapshot, level, 1);
      if (move) void animateMove(snapshot, move);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [aiThinking, level, state]);

  const canSelect = (pit: number) => {
    if (state.gameOver || aiThinking || isAnimating) return false;
    if (!PLAYER_PITS[state.currentPlayer].includes(pit)) return false;
    return state.pits[pit].dan > 0;
  };

  const directionForScreen = (side: 'left' | 'right'): Direction => {
    if (state.currentPlayer === 0) return side === 'left' ? 1 : -1;
    return side === 'left' ? -1 : 1;
  };

  const play = (side: 'left' | 'right') => {
    if (selectedPit === null || isAnimating) return;
    void animateMove(state, { pit: selectedPit, direction: directionForScreen(side) });
  };

  const cancelAnimation = () => {
    animationToken.current += 1;
    setIsAnimating(false);
    setActiveEvent(null);
  };

  const restart = () => {
    cancelAnimation();
    setState(createInitialState());
    setSelectedPit(null);
  };

  const changeMode = (nextMode: GameMode) => {
    cancelAnimation();
    setMode(nextMode);
    setState(createInitialState());
    setSelectedPit(null);
  };

  const currentLabel = mode === 'ai' && state.currentPlayer === 1 ? 'Máy' : `Người chơi ${state.currentPlayer + 1}`;
  const status = isAnimating
    ? describeEvent(activeEvent)
    : state.gameOver
      ? state.lastMessage
      : aiThinking
        ? 'Máy đang tính nước…'
        : `${currentLabel} chọn một ô dân.`;

  const animationClass = (pit: number) => {
    if (!activeEvent || !('pit' in activeEvent) || activeEvent.pit !== pit) return '';
    return `anim-${activeEvent.type}`;
  };

  const captureLabel = (pit: number) => {
    if (activeEvent?.type !== 'capture' || activeEvent.pit !== pit) return '';
    return `+${activeEvent.points}`;
  };

  const pitButton = (pit: number) => {
    const data = state.pits[pit];
    const selectable = canSelect(pit);
    return (
      <button
        key={pit}
        type="button"
        className={`pit ${selectedPit === pit ? 'selected' : ''} ${animationClass(pit)}`}
        disabled={!selectable}
        onClick={() => setSelectedPit(pit)}
        aria-label={`Ô dân, ${data.dan} quân`}
        data-capture={captureLabel(pit)}
      >
        <StonePile count={data.dan} />
        <strong>{data.dan}</strong>
      </button>
    );
  };

  const score2Label = mode === 'ai' ? 'Máy' : 'Người chơi 2';
  const difficultyText = useMemo(() => ({ easy: 'Dễ', medium: 'Vừa', hard: 'Khó' }[level]), [level]);
  const handCount = activeEvent?.hand ?? 0;

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">MINIGAME VIỆT · GAME 01</p>
          <h1>Ô ăn quan</h1>
          <p className="subtitle">Một bàn đất, vài viên sỏi, và đủ chiến thuật để hai bên quên mất giờ cơm.</p>
        </div>
        <button className="restart" type="button" onClick={restart}>Ván mới</button>
      </header>

      <section className="controls" aria-label="Thiết lập ván chơi">
        <label>
          Chế độ
          <select disabled={isAnimating} value={mode} onChange={(e) => changeMode(e.target.value as GameMode)}>
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>
        <label className={mode === 'local' ? 'muted-control' : ''}>
          AI
          <select
            disabled={mode === 'local' || isAnimating}
            value={level}
            onChange={(e) => setLevel(e.target.value as AiLevel)}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Vừa</option>
            <option value="hard">Khó</option>
          </select>
        </label>
        <div className="rule-chip">Quan non: cần ≥ 5 dân</div>
      </section>

      <section className="scorebar">
        <div className={state.currentPlayer === 0 && !state.gameOver ? 'active-player' : ''}>
          <span>Người chơi 1</span><strong>{state.score[0]}</strong><small>Nợ {state.debt[0]}</small>
        </div>
        <p>Lượt {state.turn}</p>
        <div className={state.currentPlayer === 1 && !state.gameOver ? 'active-player' : ''}>
          <span>{score2Label}</span><strong>{state.score[1]}</strong><small>Nợ {state.debt[1]}</small>
        </div>
      </section>

      <section className="game-card">
        <div className="status" role="status" aria-live="polite">{status}</div>

        <div className={`hand-zone ${handCount > 0 ? 'has-hand' : ''}`} aria-hidden="true">
          {handCount > 0 && (
            <div className="hand-bundle">
              <StonePile count={handCount} />
              <span>trên tay</span>
              <strong>{handCount}</strong>
            </div>
          )}
        </div>

        <div className="board-wrap">
          <div className={`board ${isAnimating ? 'is-animating' : ''}`} aria-label="Bàn Ô ăn quan" aria-busy={isAnimating}>
            <div
              className={`quan pit quan-left ${animationClass(0)}`}
              data-capture={captureLabel(0)}
            >
              <StonePile count={state.pits[0].dan} quan={state.pits[0].quan} />
              <strong>{state.pits[0].dan + (state.pits[0].quan ? 10 : 0)}</strong>
              <span>Quan</span>
            </div>
            <div className="small-pits top-row">{topOrder.map(pitButton)}</div>
            <div className="small-pits bottom-row">{bottomOrder.map(pitButton)}</div>
            <div
              className={`quan pit quan-right ${animationClass(6)}`}
              data-capture={captureLabel(6)}
            >
              <StonePile count={state.pits[6].dan} quan={state.pits[6].quan} />
              <strong>{state.pits[6].dan + (state.pits[6].quan ? 10 : 0)}</strong>
              <span>Quan</span>
            </div>
          </div>
        </div>

        <div className="direction-panel">
          <span>
            {selectedPit === null
              ? isAnimating ? 'Đang rải quân…' : 'Chọn một ô để bắt đầu'
              : `Đã chọn ô có ${state.pits[selectedPit].dan} quân`}
          </span>
          <div>
            <button type="button" disabled={selectedPit === null || aiThinking || isAnimating} onClick={() => play('left')}>
              ← Rải trái
            </button>
            <button type="button" disabled={selectedPit === null || aiThinking || isAnimating} onClick={() => play('right')}>
              Rải phải →
            </button>
          </div>
        </div>
      </section>

      <details className="rules">
        <summary>Luật đang dùng</summary>
        <p>Chọn một ô dân phía mình, rồi rải từng dân theo một hướng. Gặp ô dân có quân sau khi rải hết thì bốc tiếp. Gặp ô trống rồi đến ô có quân thì ăn. Có thể ăn liên hoàn.</p>
        <p>Quan chỉ được ăn khi ô Quan có ít nhất 5 dân đi kèm. Quan trị giá 10 điểm. Khi cả hai Quan đã bị ăn, dân còn lại trên phần sân của ai thuộc về người đó.</p>
        <p>Nếu đầu lượt cả 5 ô dân đều trống, người chơi dùng 5 dân đã ăn để rải lại; thiếu thì ghi nợ và trừ khi kết thúc ván.</p>
      </details>

      <footer>Minigame Việt · AI {difficultyText} · Bản thử nghiệm v0.2.1</footer>
    </main>
  );
}
