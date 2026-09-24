import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from 'react';
import { chooseGanhAiMove } from './coganh/ai';
import {
  GANH_BOARD_EDGES,
  coordOf,
  createInitialGanhState,
  legalGanhMoves,
  resolveGanhMove
} from './coganh/engine';
import type {
  GanhAiLevel,
  GanhCell,
  GanhMode,
  GanhMove,
  GanhPlayer
} from './coganh/types';

interface CoGanhGameProps {
  onBack: () => void;
}

interface MovingPiece {
  from: number;
  to: number;
  player: GanhPlayer;
  dx: number;
  dy: number;
  liftX: number;
  liftY: number;
  midX: number;
  midY: number;
}

const MOVE_MS = 500;
const POST_MOVE_PAUSE_MS = 200;
const GANH_FLIP_MS = 400;
const VAY_STEP_MS = 180;
const VAY_COLOR_SWITCH_MS = 120;
const VAY_TAIL_MS = 320;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export default function CoGanhGame({ onBack }: CoGanhGameProps) {
  const initial = useMemo(() => createInitialGanhState(), []);
  const [mode, setMode] = useState<GanhMode>('ai');
  const [level, setLevel] = useState<GanhAiLevel>('medium');
  const [state, setState] = useState(initial);
  const [displayBoard, setDisplayBoard] = useState<GanhCell[]>([...initial.board]);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationLabel, setAnimationLabel] = useState<string | null>(null);
  const [movingPiece, setMovingPiece] = useState<MovingPiece | null>(null);
  const [activeGanh, setActiveGanh] = useState<number | null>(null);
  const [vayWave, setVayWave] = useState<number[]>([]);

  const nodeRefs = useRef<Array<HTMLButtonElement | null>>(Array(25).fill(null));
  const animationToken = useRef(0);

  const aiThinking =
    mode === 'ai' &&
    state.currentPlayer === 1 &&
    state.winner === null &&
    !isAnimating;

  const moves = useMemo(() => legalGanhMoves(state), [state]);

  const movableSources = useMemo(
    () => new Set(moves.map((move) => move.from)),
    [moves]
  );

  const destinations = useMemo(
    () => new Set(
      selected === null
        ? []
        : moves.filter((move) => move.from === selected).map((move) => move.to)
    ),
    [moves, selected]
  );

  const countDisplayPieces = (player: GanhPlayer) =>
    displayBoard.reduce<number>((sum, cell) => sum + (cell === player ? 1 : 0), 0);

  const resetAnimationVisuals = () => {
    setMovingPiece(null);
    setActiveGanh(null);
    setVayWave([]);
    setAnimationLabel(null);
  };

  const cancelAnimation = () => {
    animationToken.current += 1;
    setIsAnimating(false);
    resetAnimationVisuals();
  };

  const getMovementGeometry = (move: GanhMove, player: GanhPlayer): MovingPiece => {
    const source = nodeRefs.current[move.from];
    const target = nodeRefs.current[move.to];

    if (!source || !target) {
      return {
        from: move.from,
        to: move.to,
        player,
        dx: 0,
        dy: 0,
        liftX: 0,
        liftY: -10,
        midX: 0,
        midY: -8
      };
    }

    const fromRect = source.getBoundingClientRect();
    const toRect = target.getBoundingClientRect();
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;

    return {
      from: move.from,
      to: move.to,
      player,
      dx,
      dy,
      liftX: dx * 0.12,
      liftY: dy * 0.12 - 11,
      midX: dx * 0.58,
      midY: dy * 0.58 - 8
    };
  };

  const sortVayWave = (targets: number[], origin: number) => {
    const [originRow, originCol] = coordOf(origin);
    return [...targets].sort((a, b) => {
      const [aRow, aCol] = coordOf(a);
      const [bRow, bCol] = coordOf(b);
      const aDistance = Math.hypot(aRow - originRow, aCol - originCol);
      const bDistance = Math.hypot(bRow - originRow, bCol - originCol);
      return aDistance - bDistance;
    });
  };

  const animateMove = async (baseState: typeof state, move: GanhMove) => {
    if (isAnimating) return;

    const resolution = resolveGanhMove(baseState, move);
    if (!resolution) return;

    const reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (reducedMotion) {
      setState(resolution.finalState);
      setDisplayBoard([...resolution.finalState.board]);
      setSelected(null);
      return;
    }

    const token = ++animationToken.current;
    setSelected(null);
    setIsAnimating(true);
    setAnimationLabel('Nhấc quân và di chuyển…');

    const movement = getMovementGeometry(move, resolution.player);
    setMovingPiece(movement);

    await wait(MOVE_MS);
    if (animationToken.current !== token) return;

    setDisplayBoard([...resolution.movedBoard]);
    setMovingPiece(null);
    setAnimationLabel('Quân đã tới đích.');
    await wait(POST_MOVE_PAUSE_MS);

    if (animationToken.current !== token) return;

    for (const index of resolution.ganhTargets) {
      setAnimationLabel('Gánh! Quân bị kẹp đang đổi phe…');
      setActiveGanh(index);

      await wait(GANH_FLIP_MS / 2);
      if (animationToken.current !== token) return;

      setDisplayBoard((board) => {
        const next = [...board];
        next[index] = resolution.player;
        return next;
      });

      await wait(GANH_FLIP_MS / 2);
      if (animationToken.current !== token) return;
      setActiveGanh(null);
    }

    if (resolution.vayTargets.length > 0) {
      setAnimationLabel('Vây! Làn sóng đổi phe đang chạy qua nhóm bị khóa…');
      const orderedVay = sortVayWave(resolution.vayTargets, move.to);

      for (const index of orderedVay) {
        setVayWave((current) => current.includes(index) ? current : [...current, index]);

        await wait(VAY_COLOR_SWITCH_MS);
        if (animationToken.current !== token) return;

        setDisplayBoard((board) => {
          const next = [...board];
          next[index] = resolution.player;
          return next;
        });

        await wait(Math.max(0, VAY_STEP_MS - VAY_COLOR_SWITCH_MS));
        if (animationToken.current !== token) return;
      }

      await wait(VAY_TAIL_MS);
      if (animationToken.current !== token) return;
      setVayWave([]);
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
      const move = chooseGanhAiMove(snapshot, level, 1);
      if (move) void animateMove(snapshot, move);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [aiThinking, level, state]);

  useEffect(
    () => () => {
      animationToken.current += 1;
    },
    []
  );

  const playerLabel = (player: GanhPlayer) =>
    mode === 'ai' && player === 1 ? 'Máy' : `Người chơi ${player + 1}`;

  const restart = () => {
    cancelAnimation();
    const next = createInitialGanhState();
    setState(next);
    setDisplayBoard([...next.board]);
    setSelected(null);
  };

  const changeMode = (nextMode: GanhMode) => {
    cancelAnimation();
    const next = createInitialGanhState();
    setMode(nextMode);
    setState(next);
    setDisplayBoard([...next.board]);
    setSelected(null);
  };

  const goHome = () => {
    cancelAnimation();
    onBack();
  };

  const handleNode = (index: number) => {
    if (aiThinking || isAnimating || state.winner !== null) return;

    const cell = state.board[index];

    if (cell === state.currentPlayer && movableSources.has(index)) {
      setSelected((current) => current === index ? null : index);
      return;
    }

    if (cell === null && selected !== null && destinations.has(index)) {
      void animateMove(state, { from: selected, to: index });
    }
  };

  const status = isAnimating
    ? animationLabel ?? 'Đang thực hiện nước đi…'
    : state.winner !== null
      ? state.lastMessage
      : aiThinking
        ? 'Máy đang tính thế Gánh…'
        : state.forcedGanhAt !== null
          ? `${playerLabel(state.currentPlayer)} phải đi vào điểm Mở đang sáng.`
          : `${playerLabel(state.currentPlayer)} chọn một quân để đi.`;

  return (
    <main className="app-shell cg-shell">
      <header className="hero cg-hero">
        <div>
          <p className="eyebrow">MINIGAME VIỆT · GAME 02</p>
          <h1>Cờ Gánh</h1>
          <p className="subtitle">
            Kẹp để Gánh, khóa để Vây, mở một khe nhỏ rồi chờ đối thủ bước vào bẫy.
          </p>
        </div>
        <div className="game-header-actions">
          <button className="back-home" type="button" onClick={goHome}>← Kho game</button>
          <button className="restart" type="button" onClick={restart}>Ván mới</button>
        </div>
      </header>

      <section className="controls" aria-label="Thiết lập ván Cờ Gánh">
        <label>
          Chế độ
          <select
            disabled={isAnimating}
            value={mode}
            onChange={(event) => changeMode(event.target.value as GanhMode)}
          >
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>
        <label className={mode === 'local' ? 'muted-control' : ''}>
          AI
          <select
            disabled={mode === 'local' || isAnimating}
            value={level}
            onChange={(event) => setLevel(event.target.value as GanhAiLevel)}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Vừa</option>
            <option value="hard">Khó</option>
          </select>
        </label>
        <div className="rule-chip">Gánh · Vây · Mở</div>
      </section>

      <section className="cg-scorebar">
        <div className={state.currentPlayer === 0 && state.winner === null ? 'active-player' : ''}>
          <span>Người chơi 1</span>
          <strong>{countDisplayPieces(0)}</strong>
          <small>Nâu tre</small>
        </div>
        <p>Lượt {state.turn}</p>
        <div className={state.currentPlayer === 1 && state.winner === null ? 'active-player' : ''}>
          <span>{mode === 'ai' ? 'Máy' : 'Người chơi 2'}</span>
          <strong>{countDisplayPieces(1)}</strong>
          <small>Đỏ son</small>
        </div>
      </section>

      <section className="game-card cg-card">
        <div className="status" role="status" aria-live="polite">{status}</div>
        <p className="cg-substatus">
          {isAnimating ? 'Đang khóa thao tác để bạn theo dõi trọn nước đi.' : state.lastMessage}
        </p>

        <div className="cg-board-frame">
          <div className={`cg-board-grid ${isAnimating ? 'is-animating' : ''}`} aria-label="Bàn Cờ Gánh" aria-busy={isAnimating}>
            <svg className="cg-lines" viewBox="0 0 100 100" aria-hidden="true">
              {GANH_BOARD_EDGES.map(([from, to]) => {
                const [fromRow, fromCol] = coordOf(from);
                const [toRow, toCol] = coordOf(to);
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={fromCol * 25}
                    y1={fromRow * 25}
                    x2={toCol * 25}
                    y2={toRow * 25}
                  />
                );
              })}
            </svg>

            {displayBoard.map((cell, index) => {
              const [row, col] = coordOf(index);
              const isSelected = selected === index;
              const isDestination = destinations.has(index);
              const isForced = state.forcedGanhAt === index;
              const isLastTo = state.lastMove?.to === index;
              const isMovingSource = movingPiece?.from === index;
              const isMovingTarget = movingPiece?.to === index;
              const isGanhFlipping = activeGanh === index;
              const isVayWave = vayWave.includes(index);

              const canInteract =
                !aiThinking &&
                !isAnimating &&
                state.winner === null &&
                ((cell === state.currentPlayer && movableSources.has(index)) || isDestination);

              const classes = [
                'cg-node',
                cell === 0 ? 'player-zero' : '',
                cell === 1 ? 'player-one' : '',
                cell === null ? 'empty' : '',
                isSelected ? 'selected' : '',
                isDestination ? 'destination' : '',
                isForced ? 'forced' : '',
                isMovingSource ? 'moving-source' : '',
                isMovingTarget ? 'moving-target' : '',
                isGanhFlipping ? 'ganh-flipping' : '',
                isVayWave ? 'vay-wave' : '',
                isLastTo ? 'last-to' : ''
              ].filter(Boolean).join(' ');

              const movementStyle =
                isMovingSource && movingPiece
                  ? ({
                      '--cg-move-x': `${movingPiece.dx}px`,
                      '--cg-move-y': `${movingPiece.dy}px`,
                      '--cg-lift-x': `${movingPiece.liftX}px`,
                      '--cg-lift-y': `${movingPiece.liftY}px`,
                      '--cg-mid-x': `${movingPiece.midX}px`,
                      '--cg-mid-y': `${movingPiece.midY}px`
                    } as CSSProperties & Record<string, string>)
                  : {};

              return (
                <button
                  key={index}
                  ref={(node) => { nodeRefs.current[index] = node; }}
                  type="button"
                  className={classes}
                  style={{
                    left: `${col * 25}%`,
                    top: `${row * 25}%`,
                    ...movementStyle
                  }}
                  disabled={!canInteract}
                  onClick={() => handleNode(index)}
                  aria-label={
                    cell === null
                      ? `Giao điểm trống hàng ${row + 1}, cột ${col + 1}`
                      : `${cell === 0 ? 'Quân nâu' : 'Quân đỏ'} hàng ${row + 1}, cột ${col + 1}`
                  }
                >
                  {cell !== null && <span className="cg-piece" />}
                  {cell === null && <span className="cg-empty-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="cg-help">
          {isAnimating
            ? animationLabel
            : selected === null
              ? state.forcedGanhAt !== null
                ? 'Thế Mở đang bật: chọn một quân có thể đi vào điểm sáng.'
                : 'Chạm một quân của mình. Các giao điểm có thể đi sẽ sáng lên.'
              : `Đã chọn quân. Có ${destinations.size} điểm đến hợp lệ.`}
        </div>
      </section>

      <details className="rules">
        <summary>Luật Cờ Gánh đang dùng</summary>
        <p>
          Hai bên có 8 quân trên 25 giao điểm. Mỗi lượt đi một quân sang giao điểm trống liền kề theo đúng đường kẻ.
        </p>
        <p>
          <strong>Gánh:</strong> chủ động đi vào giữa một cặp quân đối phương trên cùng đường thẳng thì cặp đó đổi sang màu của mình.
          Một nước có thể Gánh nhiều cặp.
        </p>
        <p>
          <strong>Vây:</strong> một nhóm quân đối phương không còn giao điểm trống nào để thoát sẽ bị đổi màu.
          <strong> Mở:</strong> nếu người chơi chủ động bỏ trống một điểm tạo đúng thế buộc đối thủ Gánh, đối thủ phải đi vào điểm đó.
        </p>
        <p>Thắng khi cả 16 quân trên bàn đều trở thành quân của mình.</p>
      </details>

      <footer>Minigame Việt · Cờ Gánh v0.2 · AI {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}</footer>
    </main>
  );
}
