import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from 'react';
import { chooseHumAiMove } from './cohum/ai';
import {
  HUM_BOARD_EDGES,
  HUM_NODE_COORDS,
  createInitialHumState,
  legalHumMoves,
  resolveHumMove,
  reverseForbiddenTarget
} from './cohum/engine';
import type {
  HumAiLevel,
  HumCell,
  HumMode,
  HumMove,
  HumSide,
  HumState
} from './cohum/types';

interface CoHumGameProps {
  onBack: () => void;
}

interface MovingHumPiece {
  from: number;
  to: number;
  side: HumSide;
  capture: number | null;
  dx: number;
  dy: number;
  midX: number;
  midY: number;
}

const MOVE_MS = 600;
const VO_PAUSE_MS = 200;
const VO_HIT_BEFORE_REMOVE_MS = 260;
const VO_HIT_AFTER_REMOVE_MS = 360;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export default function CoHumGame({ onBack }: CoHumGameProps) {
  const initial = useMemo(() => createInitialHumState(), []);
  const [mode, setMode] = useState<HumMode>('ai');
  const [level, setLevel] = useState<HumAiLevel>('medium');
  const [humanSide, setHumanSide] = useState<HumSide>('hum');
  const [state, setState] = useState(initial);
  const [displayBoard, setDisplayBoard] = useState<HumCell[]>([...initial.board]);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationLabel, setAnimationLabel] = useState<string | null>(null);
  const [movingPiece, setMovingPiece] = useState<MovingHumPiece | null>(null);
  const [captureImpact, setCaptureImpact] = useState<number | null>(null);
  const [blockedNode, setBlockedNode] = useState<number | null>(null);
  const [ruleWarning, setRuleWarning] = useState<string | null>(null);

  const nodeRefs = useRef<Array<HTMLButtonElement | null>>(Array(29).fill(null));
  const animationToken = useRef(0);

  const aiSide: HumSide = humanSide === 'hum' ? 'trau' : 'hum';
  const aiThinking =
    mode === 'ai' &&
    state.currentPlayer === aiSide &&
    state.winner === null &&
    !isAnimating;

  const moves = useMemo(() => legalHumMoves(state), [state]);

  const selectableSources = useMemo(
    () => new Set(
      moves
        .filter(() => mode === 'local' || state.currentPlayer === humanSide)
        .map((move) => move.from)
    ),
    [moves, mode, state.currentPlayer, humanSide]
  );

  const selectedMoves = useMemo(
    () => selected === null ? [] : moves.filter((move) => move.from === selected),
    [moves, selected]
  );

  const forbiddenTarget = useMemo(
    () => selected === null
      ? null
      : reverseForbiddenTarget(state, state.currentPlayer, selected),
    [selected, state]
  );

  const displayBuffalo = displayBoard.reduce<number>(
    (sum, cell) => sum + (cell === 'trau' ? 1 : 0),
    0
  );

  const getMoveGeometry = (move: HumMove, side: HumSide): MovingHumPiece => {
    const source = nodeRefs.current[move.from];
    const target = nodeRefs.current[move.to];

    if (!source || !target) {
      return {
        from: move.from,
        to: move.to,
        side,
        capture: move.capture,
        dx: 0,
        dy: 0,
        midX: 0,
        midY: move.capture !== null ? -20 : -9
      };
    }

    const fromRect = source.getBoundingClientRect();
    const toRect = target.getBoundingClientRect();
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;

    return {
      from: move.from,
      to: move.to,
      side,
      capture: move.capture,
      dx,
      dy,
      midX: dx * 0.52,
      midY: dy * 0.52 - (move.capture !== null ? 24 : 10)
    };
  };

  const resetVisualEffects = () => {
    setMovingPiece(null);
    setCaptureImpact(null);
    setAnimationLabel(null);
  };

  const cancelAnimation = () => {
    animationToken.current += 1;
    setIsAnimating(false);
    resetVisualEffects();
  };

  const animateMove = async (baseState: HumState, move: HumMove) => {
    if (isAnimating) return;

    const resolution = resolveHumMove(baseState, move);
    if (!resolution) return;

    const reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    setSelected(null);
    setBlockedNode(null);
    setRuleWarning(null);

    if (reducedMotion) {
      setState(resolution.finalState);
      setDisplayBoard([...resolution.finalState.board]);
      return;
    }

    const token = ++animationToken.current;
    setIsAnimating(true);
    setAnimationLabel(
      move.capture !== null
        ? 'Hùm lấy đà và lao qua Trâu…'
        : `${resolution.side === 'hum' ? 'Hùm' : 'Trâu'} đang di chuyển…`
    );
    setMovingPiece(getMoveGeometry(move, resolution.side));

    await wait(MOVE_MS);
    if (animationToken.current !== token) return;

    setDisplayBoard([...resolution.movedBoard]);
    setMovingPiece(null);

    if (move.capture !== null) {
      setAnimationLabel('Hùm đã đáp xuống. Chuẩn bị Vồ!');
      await wait(VO_PAUSE_MS);
      if (animationToken.current !== token) return;

      setCaptureImpact(move.capture);
      setAnimationLabel('VỒ! Trâu bị bắt.');
      await wait(VO_HIT_BEFORE_REMOVE_MS);
      if (animationToken.current !== token) return;

      setDisplayBoard((board) => {
        const next = [...board];
        next[move.capture!] = null;
        return next;
      });

      await wait(VO_HIT_AFTER_REMOVE_MS);
      if (animationToken.current !== token) return;
      setCaptureImpact(null);
    }

    setState(resolution.finalState);
    setDisplayBoard([...resolution.finalState.board]);
    setAnimationLabel(null);
    setIsAnimating(false);
  };

  useEffect(() => {
    if (!aiThinking) return;

    const snapshot = state;
    const timer = window.setTimeout(() => {
      const move = chooseHumAiMove(snapshot, level, aiSide);
      if (move) void animateMove(snapshot, move);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [aiThinking, aiSide, level, state]);

  useEffect(
    () => () => {
      animationToken.current += 1;
    },
    []
  );

  const restart = () => {
    cancelAnimation();
    const next = createInitialHumState();
    setState(next);
    setDisplayBoard([...next.board]);
    setSelected(null);
    setBlockedNode(null);
    setRuleWarning(null);
  };

  const changeMode = (nextMode: HumMode) => {
    cancelAnimation();
    const next = createInitialHumState();
    setMode(nextMode);
    setState(next);
    setDisplayBoard([...next.board]);
    setSelected(null);
    setBlockedNode(null);
    setRuleWarning(null);
  };

  const changeHumanSide = (side: HumSide) => {
    cancelAnimation();
    const next = createInitialHumState();
    setHumanSide(side);
    setState(next);
    setDisplayBoard([...next.board]);
    setSelected(null);
    setBlockedNode(null);
    setRuleWarning(null);
  };

  const goHome = () => {
    cancelAnimation();
    onBack();
  };

  const handleNode = (index: number) => {
    if (aiThinking || isAnimating || state.winner !== null) return;
    if (mode === 'ai' && state.currentPlayer !== humanSide) return;

    const cell = state.board[index];

    if (cell === state.currentPlayer && selectableSources.has(index)) {
      setSelected((current) => current === index ? null : index);
      setBlockedNode(null);
      setRuleWarning(null);
      return;
    }

    if (selected !== null && cell === null) {
      const move = selectedMoves.find((candidate) => candidate.to === index);
      if (move) {
        void animateMove(state, move);
        return;
      }

      if (forbiddenTarget === index) {
        setBlockedNode(index);
        setRuleWarning('Không được đi ngược lại đúng nước mà bên này vừa di chuyển.');
      }
    }
  };

  const sideLabel = (side: HumSide) => side === 'hum' ? 'Hùm' : 'Trâu';
  const playerLabel = (side: HumSide) => {
    if (mode === 'local') return sideLabel(side);
    return side === humanSide ? `Bạn · ${sideLabel(side)}` : `Máy · ${sideLabel(side)}`;
  };

  const status = isAnimating
    ? animationLabel ?? 'Đang thực hiện nước đi…'
    : state.winner !== null
      ? state.lastMessage
      : aiThinking
        ? `Máy đang tính nước cho ${sideLabel(aiSide)}…`
        : ruleWarning ?? `${playerLabel(state.currentPlayer)} chọn quân để đi.`;

  const capturedCount = 15 - displayBuffalo;

  return (
    <main className="app-shell ch-shell">
      <header className="hero ch-hero">
        <div>
          <p className="eyebrow">MINIGAME VIỆT · GAME 03</p>
          <h1>Cờ Hùm</h1>
          <p className="subtitle">
            Một Hùm đối đầu cả đàn Trâu: Hùm tìm lưng hở để vồ, Trâu khép dần vòng vây.
          </p>
        </div>
        <div className="game-header-actions">
          <button className="back-home" type="button" onClick={goHome}>← Kho game</button>
          <button className="restart" type="button" onClick={restart}>Ván mới</button>
        </div>
      </header>

      <section className="controls" aria-label="Thiết lập ván Cờ Hùm">
        <label>
          Chế độ
          <select
            disabled={isAnimating}
            value={mode}
            onChange={(event) => changeMode(event.target.value as HumMode)}
          >
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>

        <label className={mode === 'local' ? 'muted-control' : ''}>
          Bạn chơi
          <select
            disabled={mode === 'local' || isAnimating}
            value={humanSide}
            onChange={(event) => changeHumanSide(event.target.value as HumSide)}
          >
            <option value="hum">Hùm</option>
            <option value="trau">Trâu</option>
          </select>
        </label>

        <label className={mode === 'local' ? 'muted-control' : ''}>
          AI
          <select
            disabled={mode === 'local' || isAnimating}
            value={level}
            onChange={(event) => setLevel(event.target.value as HumAiLevel)}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Vừa</option>
            <option value="hard">Khó</option>
          </select>
        </label>

        <div className="rule-chip">1 Hùm · 15 Trâu</div>
      </section>

      <section className="ch-scorebar">
        <div className={state.currentPlayer === 'hum' && state.winner === null ? 'active-player' : ''}>
          <span>{playerLabel('hum')}</span>
          <strong>{capturedCount}</strong>
          <small>Trâu đã vồ</small>
        </div>
        <p>Lượt {state.turn}</p>
        <div className={state.currentPlayer === 'trau' && state.winner === null ? 'active-player' : ''}>
          <span>{playerLabel('trau')}</span>
          <strong>{displayBuffalo}</strong>
          <small>Trâu còn lại</small>
        </div>
      </section>

      <section className="game-card ch-card">
        <div className={`status ${ruleWarning ? 'ch-rule-warning' : ''}`} role="status" aria-live="polite">
          {status}
        </div>
        <p className="ch-substatus">
          {isAnimating
            ? 'Đang khóa thao tác để bạn theo dõi trọn nước đi.'
            : state.lastMessage}
        </p>

        <div className="ch-board-frame">
          <div className={`ch-board ${isAnimating ? 'is-animating' : ''}`} aria-label="Bàn Cờ Hùm" aria-busy={isAnimating}>
            <svg className="ch-lines" viewBox="0 0 150 100" aria-hidden="true">
              {HUM_BOARD_EDGES.map(([from, to]) => {
                const [fromX, fromY] = HUM_NODE_COORDS[from];
                const [toX, toY] = HUM_NODE_COORDS[to];
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={fromX * 25}
                    y1={fromY * 25}
                    x2={toX * 25}
                    y2={toY * 25}
                  />
                );
              })}
            </svg>

            <div className="ch-hang-label" aria-hidden="true">HANG HÙM</div>

            {displayBoard.map((cell, index) => {
              const [x, y] = HUM_NODE_COORDS[index];
              const isSelected = selected === index;
              const targetMove = selectedMoves.find((move) => move.to === index);
              const isMoveTarget = Boolean(targetMove);
              const isCaptureTarget = Boolean(targetMove?.capture !== null);
              const isLastTo = state.lastMove?.to === index;
              const isMovingSource = movingPiece?.from === index;
              const isMovingTarget = movingPiece?.to === index;
              const isCaptureImpact = captureImpact === index;
              const isBlocked = blockedNode === index;
              const isForbiddenTarget = forbiddenTarget === index;

              const canInteract =
                !aiThinking &&
                !isAnimating &&
                state.winner === null &&
                (mode === 'local' || state.currentPlayer === humanSide) &&
                (
                  (cell === state.currentPlayer && selectableSources.has(index)) ||
                  (cell === null && (isMoveTarget || isForbiddenTarget))
                );

              const classes = [
                'ch-node',
                cell === 'hum' ? 'hum-piece-node' : '',
                cell === 'trau' ? 'trau-piece-node' : '',
                cell === null ? 'empty' : '',
                isSelected ? 'selected' : '',
                isMoveTarget ? 'move-target' : '',
                isCaptureTarget ? 'capture-target' : '',
                isLastTo ? 'last-to' : '',
                isMovingSource ? 'moving-source' : '',
                isMovingTarget ? 'moving-target' : '',
                movingPiece?.capture !== null && isMovingSource ? 'capture-flight' : '',
                isCaptureImpact ? 'capture-impact' : '',
                isBlocked ? 'reverse-blocked' : ''
              ].filter(Boolean).join(' ');

              const movementStyle =
                isMovingSource && movingPiece
                  ? ({
                      '--ch-move-x': `${movingPiece.dx}px`,
                      '--ch-move-y': `${movingPiece.dy}px`,
                      '--ch-mid-x': `${movingPiece.midX}px`,
                      '--ch-mid-y': `${movingPiece.midY}px`
                    } as CSSProperties & Record<string, string>)
                  : {};

              return (
                <button
                  key={index}
                  ref={(node) => { nodeRefs.current[index] = node; }}
                  type="button"
                  className={classes}
                  style={{
                    left: `${(x / 6) * 100}%`,
                    top: `${(y / 4) * 100}%`,
                    ...movementStyle
                  }}
                  disabled={!canInteract}
                  onClick={() => handleNode(index)}
                  aria-label={
                    isForbiddenTarget
                      ? 'Điểm bị cấm vì đi ngược lại nước vừa đi'
                      : cell === 'hum'
                        ? 'Quân Hùm'
                        : cell === 'trau'
                          ? 'Quân Trâu'
                          : isCaptureTarget
                            ? 'Điểm đáp để Hùm vồ Trâu'
                            : 'Giao điểm trống'
                  }
                >
                  {cell === 'hum' && <span className="ch-piece ch-tiger"><i /><i /><i /></span>}
                  {cell === 'trau' && <span className="ch-piece ch-buffalo" />}
                  {cell === null && <span className="ch-dot" />}
                  {isCaptureTarget && <span className="ch-capture-tag">Vồ</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`ch-help ${ruleWarning ? 'has-warning' : ''}`}>
          {isAnimating
            ? animationLabel
            : ruleWarning
              ? `⛔ ${ruleWarning}`
              : selected === null
                ? state.currentPlayer === 'hum'
                  ? 'Chọn Hùm. Điểm vàng là nước đi; điểm đỏ “Vồ” là cú nhảy ăn Trâu.'
                  : 'Chọn một Trâu rồi chọn giao điểm kề còn trống để khép vòng vây.'
                : `Đã chọn quân. Có ${selectedMoves.length} nước hợp lệ.`}
        </div>
      </section>

      <details className="rules">
        <summary>Luật Cờ Hùm đang dùng</summary>
        <p>
          Hùm đi trước. Mỗi lượt chỉ di chuyển một quân một nước theo đường kẻ. Cả Hùm và Trâu đều có thể đi trong bàn chính và Hang Hùm.
        </p>
        <p>
          <strong>Hùm vồ:</strong> nếu một Trâu đứng sát Hùm trên cùng đường và điểm ngay phía sau Trâu còn trống, Hùm có thể nhảy qua, đáp xuống điểm trống và loại Trâu đó khỏi bàn.
        </p>
        <p>
          <strong>Trâu thắng</strong> khi vây kín để Hùm không còn nước đi hoặc nước vồ. <strong>Hùm thắng</strong> khi vồ hết 15 Trâu.
        </p>
        <p><strong>Nước cấm:</strong> cùng một bên không được lập tức đi ngược lại đúng nước mà bên đó vừa di chuyển. Nếu thử chạm điểm cũ, game sẽ báo đỏ lý do.</p>
      </details>

      <footer>Minigame Việt · Cờ Hùm v0.2 · AI {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}</footer>
    </main>
  );
}
