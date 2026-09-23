import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { chooseAiMove } from './game/ai';
import { createInitialState, PLAYER_PITS } from './game/engine';
import { createMoveTrace } from './game/trace';
import type { AiLevel, Direction, GameMode, GameState, Move, MoveEvent } from './game/types';
import { StonePile } from './components/StonePile';

const topOrder = [1, 2, 3, 4, 5];
const bottomOrder = [11, 10, 9, 8, 7];
const STONE_FLIGHT_MS = 390;

interface FlyingStone {
  id: number;
  pit: number;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  duration: number;
}

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
  const [flyingStone, setFlyingStone] = useState<FlyingStone | null>(null);

  const animationToken = useRef(0);
  const flightSequence = useRef(0);
  const handOriginRef = useRef<HTMLDivElement | null>(null);
  const pitRefs = useRef<Array<HTMLElement | null>>(Array(12).fill(null));

  const aiThinking = mode === 'ai' && state.currentPlayer === 1 && !state.gameOver && !isAnimating;

  const flyStoneToPit = async (pit: number, token: number, duration: number) => {
    const origin = handOriginRef.current;
    const target = pitRefs.current[pit];

    if (!origin || !target) {
      await wait(duration);
      return;
    }

    const originRect = origin.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const id = ++flightSequence.current;

    const startX = originRect.left + originRect.width / 2 - 9;
    const startY = originRect.top + originRect.height / 2 - 8;

    const spreadX = ((id * 13) % 25) - 12;
    const spreadY = ((id * 7) % 15) - 7;
    const endX = targetRect.left + targetRect.width / 2 - 9 + spreadX;
    const endY = targetRect.top + targetRect.height / 2 - 8 + spreadY;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.hypot(dx, dy);
    const arc = Math.min(118, Math.max(46, distance * 0.18));

    setFlyingStone({
      id,
      pit,
      startX,
      startY,
      midX: dx * 0.52,
      midY: dy * 0.48 - arc,
      endX: dx,
      endY: dy,
      duration
    });

    await wait(duration);

    if (animationToken.current === token) {
      setFlyingStone(null);
    }
  };

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

      const delay = eventDelay(step.event, reducedMotion);

      if ((step.event.type === 'drop' || step.event.type === 'refill') && !reducedMotion) {
        setActiveEvent(step.event);
        await flyStoneToPit(step.event.pit, token, STONE_FLIGHT_MS);

        if (animationToken.current !== token) return;

        setState(step.state);
        await wait(Math.max(0, delay - STONE_FLIGHT_MS));
        continue;
      }

      setState(step.state);
      setActiveEvent(step.event);
      await wait(delay);
    }

    if (animationToken.current !== token) return;

    setState(trace.finalState);
    setActiveEvent(null);
    setFlyingStone(null);
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
    setFlyingStone(null);
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
    if (
      flyingStone?.pit === pit &&
      (activeEvent.type === 'drop' || activeEvent.type === 'refill')
    ) {
      return 'anim-flight-target';
    }
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
        ref={(node) => { pitRefs.current[pit] = node; }}
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

  const flyingStoneStyle = flyingStone
    ? ({
        left: flyingStone.startX,
        top: flyingStone.startY,
        animationDuration: `${flyingStone.duration}ms`,
        '--flight-mid-x': `${flyingStone.midX}px`,
        '--flight-mid-y': `${flyingStone.midY}px`,
        '--flight-end-x': `${flyingStone.endX}px`,
        '--flight-end-y': `${flyingStone.endY}px`
      } as CSSProperties & Record<string, string | number>)
    : undefined;

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

        <div
          ref={handOriginRef}
          className={`hand-zone ${handCount > 0 ? 'has-hand' : ''}`}
          aria-hidden="true"
        >
          {handCount > 0 && (
            <div className="hand-bundle">
              <StonePile count={handCount} />
              <span>trên tay</span>
              <strong>{handCount}</strong>
            </div>
          )}
        </div>

        {flyingStone && (
          <span
            key={flyingStone.id}
            className="flying-stone"
            style={flyingStoneStyle}
            aria-hidden="true"
          />
        )}

        <div className="board-wrap">
          <div className={`board ${isAnimating ? 'is-animating' : ''}`} aria-label="Bàn Ô ăn quan" aria-busy={isAnimating}>
            <div
              ref={(node) => { pitRefs.current[0] = node; }}
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
              ref={(node) => { pitRefs.current[6] = node; }}
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

      <footer>Minigame Việt · AI {difficultyText} · Bản thử nghiệm v0.2.2</footer>
    </main>
  );
}
