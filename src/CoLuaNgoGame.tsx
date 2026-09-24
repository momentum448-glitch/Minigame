import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from 'react';
import { chooseLuaNgoAiMove } from './luango/ai';
import {
  LUA_NGO_BOARD_EDGES,
  LUA_NGO_NODE_COORDS,
  LUA_NGO_WORDS,
  applyLuaNgoMove,
  countLuaNgoPieces,
  createInitialLuaNgoState,
  findLuaNgoMoveByPath,
  legalLuaNgoMoves,
  nextLuaNgoSteps,
  previewLuaNgoBoard
} from './luango/engine';
import type {
  LuaNgoAiLevel,
  LuaNgoCell,
  LuaNgoMode,
  LuaNgoMove,
  LuaNgoPlayer,
  LuaNgoState
} from './luango/types';

interface CoLuaNgoGameProps {
  onBack: () => void;
}

interface MovingSeed {
  from: number;
  to: number;
  player: LuaNgoPlayer;
  dx: number;
  dy: number;
}

const STEP_MS = 390;
const CAPTURE_MS = 420;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export default function CoLuaNgoGame({ onBack }: CoLuaNgoGameProps) {
  const initial = useMemo(() => createInitialLuaNgoState(), []);
  const [mode, setMode] = useState<LuaNgoMode>('ai');
  const [level, setLevel] = useState<LuaNgoAiLevel>('medium');
  const [state, setState] = useState(initial);
  const [displayBoard, setDisplayBoard] = useState<LuaNgoCell[]>([...initial.board]);
  const [path, setPath] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [movingSeed, setMovingSeed] = useState<MovingSeed | null>(null);
  const [captureNode, setCaptureNode] = useState<number | null>(null);
  const [animationLabel, setAnimationLabel] = useState<string | null>(null);

  const nodeRefs = useRef<Array<HTMLButtonElement | null>>(Array(12).fill(null));
  const animationToken = useRef(0);

  const aiThinking =
    mode === 'ai' &&
    state.currentPlayer === 1 &&
    state.winner === null &&
    !isAnimating &&
    path.length === 0;

  const fullMoves = useMemo(() => legalLuaNgoMoves(state), [state]);

  const selectableSources = useMemo(
    () => new Set(fullMoves.map((move) => move.path[0])),
    [fullMoves]
  );

  const stepOptions = useMemo(
    () => path.length === 0 ? [] : nextLuaNgoSteps(state, path),
    [state, path]
  );

  const getMovement = (from: number, to: number, player: LuaNgoPlayer): MovingSeed => {
    const source = nodeRefs.current[from];
    const target = nodeRefs.current[to];

    if (!source || !target) {
      return { from, to, player, dx: 0, dy: 0 };
    }

    const fromRect = source.getBoundingClientRect();
    const toRect = target.getBoundingClientRect();

    return {
      from,
      to,
      player,
      dx: toRect.left - fromRect.left,
      dy: toRect.top - fromRect.top
    };
  };

  const finalizePath = async (baseState: LuaNgoState, finalPath: number[]) => {
    const move = findLuaNgoMoveByPath(baseState, finalPath);
    if (!move) return;

    if (move.capture !== null) {
      setCaptureNode(move.capture);
      setAnimationLabel('Đỗ! Ăn quân đối phương.');
      await wait(CAPTURE_MS);
      setCaptureNode(null);
    }

    const next = applyLuaNgoMove(baseState, move);
    setState(next);
    setDisplayBoard([...next.board]);
    setPath([]);
    setAnimationLabel(null);
  };

  const animateOneStep = async (
    baseState: LuaNgoState,
    currentPath: number[],
    to: number
  ) => {
    if (isAnimating) return;

    const from = currentPath[currentPath.length - 1];
    const nextPath = [...currentPath, to];
    const stepIndex = nextPath.length - 2;
    const token = ++animationToken.current;
    const reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    setIsAnimating(true);
    setAnimationLabel(LUA_NGO_WORDS[stepIndex] ?? null);

    if (!reducedMotion) {
      setMovingSeed(getMovement(from, to, baseState.currentPlayer));
      await wait(STEP_MS);
      if (animationToken.current !== token) return;
    }

    setMovingSeed(null);
    setPath(nextPath);
    setDisplayBoard(previewLuaNgoBoard(baseState, nextPath));
    setIsAnimating(false);

    const completed = findLuaNgoMoveByPath(baseState, nextPath);
    if (completed) {
      await finalizePath(baseState, nextPath);
      return;
    }

    const options = nextLuaNgoSteps(baseState, nextPath);
    if (options.length === 0) {
      await finalizePath(baseState, nextPath);
    }
  };

  const playAiMove = async (baseState: LuaNgoState, move: LuaNgoMove) => {
    if (isAnimating) return;

    const token = ++animationToken.current;
    setPath([move.path[0]]);
    setDisplayBoard([...baseState.board]);
    setIsAnimating(true);

    let visualPath = [move.path[0]];

    for (let i = 1; i < move.path.length; i += 1) {
      const from = move.path[i - 1];
      const to = move.path[i];
      setAnimationLabel(LUA_NGO_WORDS[i - 1] ?? null);

      const reducedMotion =
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

      if (!reducedMotion) {
        setMovingSeed(getMovement(from, to, baseState.currentPlayer));
        await wait(STEP_MS);
        if (animationToken.current !== token) return;
      }

      setMovingSeed(null);
      visualPath = [...visualPath, to];
      setPath([...visualPath]);
      setDisplayBoard(previewLuaNgoBoard(baseState, visualPath));
    }

    if (move.capture !== null) {
      setCaptureNode(move.capture);
      setAnimationLabel('Đỗ! Ăn quân đối phương.');
      await wait(CAPTURE_MS);
      if (animationToken.current !== token) return;
      setCaptureNode(null);
    }

    const next = applyLuaNgoMove(baseState, move);
    setState(next);
    setDisplayBoard([...next.board]);
    setPath([]);
    setAnimationLabel(null);
    setIsAnimating(false);
  };

  useEffect(() => {
    if (!aiThinking) return;

    const snapshot = state;
    const timer = window.setTimeout(() => {
      const move = chooseLuaNgoAiMove(snapshot, level, 1);
      if (move) void playAiMove(snapshot, move);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [aiThinking, level, state]);

  useEffect(
    () => () => {
      animationToken.current += 1;
    },
    []
  );

  const reset = (nextMode = mode) => {
    animationToken.current += 1;
    const next = createInitialLuaNgoState();
    setMode(nextMode);
    setState(next);
    setDisplayBoard([...next.board]);
    setPath([]);
    setMovingSeed(null);
    setCaptureNode(null);
    setAnimationLabel(null);
    setIsAnimating(false);
  };

  const handleNode = (index: number) => {
    if (isAnimating || aiThinking || state.winner !== null) return;

    if (path.length === 0) {
      if (state.board[index] === state.currentPlayer && selectableSources.has(index)) {
        setPath([index]);
        setDisplayBoard([...state.board]);
      }
      return;
    }

    const option = stepOptions.find((candidate) => candidate.to === index);
    if (option) {
      void animateOneStep(state, path, index);
      return;
    }

    if (
      path.length === 1 &&
      state.board[index] === state.currentPlayer &&
      selectableSources.has(index)
    ) {
      setPath([index]);
      setDisplayBoard([...state.board]);
    }
  };

  const playerName = (player: LuaNgoPlayer) =>
    mode === 'ai' && player === 1 ? 'Máy' : `Người chơi ${player + 1}`;

  const stepCount = Math.max(0, path.length - 1);
  const nextWord = LUA_NGO_WORDS[stepCount] ?? null;

  const status = state.winner !== null
    ? state.lastMessage
    : isAnimating
      ? animationLabel ?? 'Đang đi quân…'
      : aiThinking
        ? 'Máy đang tính đường 5 nhịp…'
        : path.length === 0
          ? `${playerName(state.currentPlayer)} chọn một quân.`
          : nextWord
            ? `Nhịp tiếp theo: ${nextWord}`
            : 'Hoàn tất lượt.';

  return (
    <main className="app-shell ln-shell">
      <header className="hero ln-hero">
        <div>
          <p className="eyebrow">MINIGAME VIỆT · GAME 04</p>
          <h1>Cờ Lúa Ngô</h1>
          <p className="subtitle">
            Tính đúng năm nhịp trên bàn cờ chữ thập: Lúa, Ngô, Khoai, Sắn, Đỗ.
          </p>
        </div>
        <div className="game-header-actions">
          <button className="back-home" type="button" onClick={onBack}>← Kho game</button>
          <button className="restart" type="button" onClick={() => reset()}>Ván mới</button>
        </div>
      </header>

      <section className="controls" aria-label="Thiết lập ván Cờ Lúa Ngô">
        <label>
          Chế độ
          <select
            disabled={isAnimating || path.length > 0}
            value={mode}
            onChange={(event) => reset(event.target.value as LuaNgoMode)}
          >
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>

        <label className={mode === 'local' ? 'muted-control' : ''}>
          AI
          <select
            disabled={mode === 'local' || isAnimating || path.length > 0}
            value={level}
            onChange={(event) => setLevel(event.target.value as LuaNgoAiLevel)}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Vừa</option>
            <option value="hard">Khó</option>
          </select>
        </label>

        <div className="rule-chip">Lúa · Ngô · Khoai · Sắn · Đỗ</div>
      </section>

      <section className="ln-scorebar">
        <div className={state.currentPlayer === 0 && state.winner === null ? 'active-player' : ''}>
          <span>Người chơi 1</span>
          <strong>{displayBoard.filter((cell) => cell === 0).length}</strong>
          <small>Quân vàng</small>
        </div>
        <p>Lượt {state.turn}</p>
        <div className={state.currentPlayer === 1 && state.winner === null ? 'active-player' : ''}>
          <span>{mode === 'ai' ? 'Máy' : 'Người chơi 2'}</span>
          <strong>{displayBoard.filter((cell) => cell === 1).length}</strong>
          <small>Quân xanh</small>
        </div>
      </section>

      <section className="game-card ln-card">
        <div className="status" role="status" aria-live="polite">{status}</div>

        <div className="ln-rhythm" aria-label="Năm nhịp Cờ Lúa Ngô">
          {LUA_NGO_WORDS.map((word, index) => (
            <span
              key={word}
              className={
                index < stepCount
                  ? 'done'
                  : index === stepCount && path.length > 0
                    ? 'current'
                    : ''
              }
            >
              <b>{index + 1}</b>{word}
            </span>
          ))}
        </div>

        <div className="ln-board-frame">
          <div className="ln-board" aria-label="Bàn Cờ Lúa Ngô" aria-busy={isAnimating}>
            <svg className="ln-lines" viewBox="0 0 100 75" aria-hidden="true">
              {LUA_NGO_BOARD_EDGES.map(([from, to]) => {
                const [fromX, fromY] = LUA_NGO_NODE_COORDS[from];
                const [toX, toY] = LUA_NGO_NODE_COORDS[to];
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

            {displayBoard.map((cell, index) => {
              const [x, y] = LUA_NGO_NODE_COORDS[index];
              const isSelected = path[path.length - 1] === index && path.length > 0;
              const option = stepOptions.find((candidate) => candidate.to === index);
              const isTarget = Boolean(option);
              const isCaptureTarget = Boolean(option?.capture);
              const isMovingSource = movingSeed?.from === index;
              const isCapture = captureNode === index;

              const canInteract =
                !isAnimating &&
                !aiThinking &&
                state.winner === null &&
                (
                  (path.length === 0 &&
                    cell === state.currentPlayer &&
                    selectableSources.has(index)) ||
                  isTarget ||
                  (path.length === 1 &&
                    cell === state.currentPlayer &&
                    selectableSources.has(index))
                );

              const classes = [
                'ln-node',
                cell === 0 ? 'player-zero' : '',
                cell === 1 ? 'player-one' : '',
                cell === null ? 'empty' : '',
                isSelected ? 'selected' : '',
                isTarget ? 'step-target' : '',
                isCaptureTarget ? 'capture-target' : '',
                isMovingSource ? 'moving-source' : '',
                isCapture ? 'capture-impact' : ''
              ].filter(Boolean).join(' ');

              const moveStyle =
                isMovingSource && movingSeed
                  ? ({
                      '--ln-dx': `${movingSeed.dx}px`,
                      '--ln-dy': `${movingSeed.dy}px`
                    } as CSSProperties & Record<string, string>)
                  : {};

              return (
                <button
                  key={index}
                  ref={(node) => { nodeRefs.current[index] = node; }}
                  type="button"
                  className={classes}
                  style={{
                    left: `${(x / 4) * 100}%`,
                    top: `${(y / 3) * 100}%`,
                    ...moveStyle
                  }}
                  disabled={!canInteract}
                  onClick={() => handleNode(index)}
                  aria-label={
                    isCaptureTarget
                      ? 'Bước Đỗ, ăn quân đối phương'
                      : cell === 0
                        ? 'Quân vàng'
                        : cell === 1
                          ? 'Quân xanh'
                          : 'Giao điểm trống'
                  }
                >
                  {cell !== null && <span className="ln-piece" />}
                  {cell === null && <span className="ln-dot" />}
                  {isCaptureTarget && <span className="ln-capture-tag">ĂN</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ln-help">
          {path.length === 0
            ? 'Chọn một quân. Sau đó đi từng bước theo đúng nhịp.'
            : stepOptions.length > 0
              ? `Chọn điểm cho nhịp “${nextWord}”. Chỉ nhịp Đỗ mới được ăn.`
              : 'Không còn đường trống hợp lệ, quân dừng và đổi lượt.'}
        </div>
      </section>

      <details className="rules">
        <summary>Luật Cờ Lúa Ngô đang dùng</summary>
        <p>
          Hai bên có 4 quân. Mỗi lượt chọn một quân rồi đi theo đường kẻ tối đa 5 bước,
          đọc lần lượt <strong>Lúa · Ngô · Khoai · Sắn · Đỗ</strong>.
        </p>
        <p>
          Bốn bước đầu chỉ đi vào giao điểm trống. Ở bước thứ năm, nếu giao điểm đích có
          quân đối phương thì được ăn quân đó và thế quân mình vào vị trí ấy.
        </p>
        <p>
          Không được vượt qua quân đang chắn đường. Bản số hóa v0.1 không cho lặp lại
          một giao điểm trong cùng lượt; nếu trước bước thứ năm không còn điểm trống chưa
          đi qua để tiếp tục thì quân dừng tại đó và hết lượt.
        </p>
        <p>Ăn hết 4 quân đối phương trước thì thắng.</p>
      </details>

      <footer>
        Minigame Việt · Cờ Lúa Ngô v0.1 · AI {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}
      </footer>
    </main>
  );
}
