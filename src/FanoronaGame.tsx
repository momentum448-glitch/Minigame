import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent
} from 'react';
import { chooseFanoronaAiAction } from './fanorona/ai';
import {
  FANORONA_BOARD_EDGES,
  FANORONA_NODE_COORDS,
  applyFanoronaStep,
  canStopFanoronaChain,
  captureModeLabel,
  countFanoronaPieces,
  createInitialFanoronaState,
  hasMandatoryFanoronaCapture,
  legalFanoronaSteps,
  stopFanoronaChain
} from './fanorona/engine';
import type {
  FanoronaAiLevel,
  FanoronaMode,
  FanoronaPlayer,
  FanoronaState,
  FanoronaStep
} from './fanorona/types';

interface FanoronaGameProps {
  onBack: () => void;
}

interface MovingStone {
  from: number;
  to: number;
  player: FanoronaPlayer;
  dx: number;
  dy: number;
}

const MOVE_MS = 300;
const CAPTURE_MS = 360;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function playerLabel(player: FanoronaPlayer, mode: FanoronaMode): string {
  if (player === 0) return 'Quân sáng';
  return mode === 'ai' ? 'Máy · quân tối' : 'Quân tối';
}

function levelLabel(level: FanoronaAiLevel): string {
  if (level === 'easy') return 'Dễ';
  if (level === 'hard') return 'Khó';
  return 'Vừa';
}

export default function FanoronaGame({ onBack }: FanoronaGameProps) {
  const [mode, setMode] = useState<FanoronaMode>('ai');
  const [level, setLevel] = useState<FanoronaAiLevel>('medium');
  const [state, setState] = useState<FanoronaState>(() => createInitialFanoronaState());
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [captureChoice, setCaptureChoice] = useState<FanoronaStep[] | null>(null);
  const [movingStone, setMovingStone] = useState<MovingStone | null>(null);
  const [captureFx, setCaptureFx] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const animationToken = useRef(0);

  const legalSteps = useMemo(() => legalFanoronaSteps(state), [state]);
  const selectableSources = useMemo(
    () => new Set(legalSteps.map((step) => step.from)),
    [legalSteps]
  );
  const selectedSteps = useMemo(
    () => selectedSource === null ? [] : legalSteps.filter((step) => step.from === selectedSource),
    [legalSteps, selectedSource]
  );
  const targetOptions = useMemo(() => {
    const map = new Map<number, FanoronaStep[]>();
    for (const step of selectedSteps) {
      const current = map.get(step.to) ?? [];
      current.push(step);
      map.set(step.to, current);
    }
    return map;
  }, [selectedSteps]);
  const mandatoryCapture = useMemo(() => hasMandatoryFanoronaCapture(state), [state]);
  const currentIsAi = mode === 'ai' && state.currentPlayer === 1;

  const reset = (nextMode = mode) => {
    animationToken.current += 1;
    setMode(nextMode);
    setState(createInitialFanoronaState());
    setSelectedSource(null);
    setCaptureChoice(null);
    setMovingStone(null);
    setCaptureFx([]);
    setIsAnimating(false);
    setAiThinking(false);
  };

  useEffect(() => {
    if (state.chain) {
      setSelectedSource(state.chain.piece);
      setCaptureChoice(null);
    } else if (selectedSource !== null && state.board[selectedSource] !== state.currentPlayer) {
      setSelectedSource(null);
      setCaptureChoice(null);
    }
  }, [state, selectedSource]);

  const animateStep = async (baseState: FanoronaState, step: FanoronaStep) => {
    if (isAnimating) return;
    const token = ++animationToken.current;
    const fromNode = nodeRefs.current[step.from];
    const toNode = nodeRefs.current[step.to];
    const fromRect = fromNode?.getBoundingClientRect();
    const toRect = toNode?.getBoundingClientRect();
    const dx = fromRect && toRect
      ? (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2)
      : 0;
    const dy = fromRect && toRect
      ? (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2)
      : 0;

    setIsAnimating(true);
    setCaptureChoice(null);
    setMovingStone({ from: step.from, to: step.to, player: baseState.currentPlayer, dx, dy });
    await wait(MOVE_MS);
    if (animationToken.current !== token) return;

    if (step.captured.length > 0) {
      setCaptureFx(step.captured);
      await wait(CAPTURE_MS);
      if (animationToken.current !== token) return;
    }

    const next = applyFanoronaStep(baseState, step);
    setState(next);
    setMovingStone(null);
    setCaptureFx([]);
    setIsAnimating(false);
    if (!next.chain) setSelectedSource(null);
  };

  useEffect(() => {
    if (
      mode !== 'ai' ||
      state.currentPlayer !== 1 ||
      state.winner !== null ||
      state.drawReason !== null ||
      isAnimating
    ) {
      return;
    }

    setAiThinking(true);
    const timer = window.setTimeout(() => {
      const action = chooseFanoronaAiAction(state, level, 1);
      if (!action) {
        setAiThinking(false);
        return;
      }

      if (action.kind === 'stop') {
        setState(stopFanoronaChain(state));
        setSelectedSource(null);
        setAiThinking(false);
        return;
      }

      setAiThinking(false);
      void animateStep(state, action.step);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [mode, level, state, isAnimating]);

  const handleNode = (index: number) => {
    if (isAnimating || aiThinking || currentIsAi || state.winner !== null || state.drawReason !== null) return;

    if (selectedSource === null) {
      if (selectableSources.has(index)) setSelectedSource(index);
      return;
    }

    const options = targetOptions.get(index) ?? [];
    if (options.length === 1) {
      void animateStep(state, options[0]);
      return;
    }
    if (options.length > 1) {
      setCaptureChoice(options);
      return;
    }

    if (selectableSources.has(index) && !state.chain) {
      setSelectedSource(index);
      setCaptureChoice(null);
    }
  };

  const stopChain = () => {
    if (!canStopFanoronaChain(state) || isAnimating || aiThinking || currentIsAi) return;
    setState(stopFanoronaChain(state));
    setSelectedSource(null);
    setCaptureChoice(null);
  };

  const lightCount = countFanoronaPieces(state, 0);
  const darkCount = countFanoronaPieces(state, 1);
  const status = state.winner !== null
    ? `${playerLabel(state.winner, mode)} thắng ván.`
    : state.drawReason
      ? `Hòa · ${state.drawReason}`
      : isAnimating
        ? captureFx.length > 0
          ? `Ăn ${captureFx.length} quân!`
          : 'Đang di chuyển…'
        : aiThinking
          ? `Máy đang tính nước ${levelLabel(level)}…`
          : state.chain
            ? `Chuỗi ăn: đã ăn ${state.chain.captures} quân. Có thể ăn tiếp hoặc dừng.`
            : mandatoryCapture
              ? 'Có nước ăn bắt buộc. Chọn một quân phát sáng.'
              : selectedSource !== null
                ? 'Chọn giao điểm đích.'
                : `${playerLabel(state.currentPlayer, mode)} chọn quân.`;

  return (
    <main className="app-shell fan-shell">
      <header className="hero fan-hero">
        <div>
          <p className="eyebrow">DÂN GIAN THẾ GIỚI · GAME 09 · MADAGASCAR</p>
          <h1>Fanorona</h1>
          <p className="subtitle">
            Tiến để ăn, lùi cũng để ăn. Đọc cả một hàng quân trước khi đặt viên đá xuống.
          </p>
        </div>
        <div className="game-header-actions">
          <button className="back-home" type="button" onClick={onBack}>← Sảnh game</button>
          <button className="restart" type="button" onClick={() => reset()}>Ván mới</button>
        </div>
      </header>

      <section className="controls fan-controls" aria-label="Thiết lập ván Fanorona">
        <label>
          Chế độ
          <select
            disabled={isAnimating || aiThinking}
            value={mode}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => reset(event.target.value as FanoronaMode)}
          >
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>

        <label className={mode === 'local' ? 'muted-control' : ''}>
          AI
          <select
            disabled={mode === 'local' || isAnimating || aiThinking}
            value={level}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setLevel(event.target.value as FanoronaAiLevel)}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Vừa</option>
            <option value="hard">Khó</option>
          </select>
        </label>

        <div className={`rule-chip fan-rule-chip ${mandatoryCapture ? 'capture-on' : ''}`}>
          {mandatoryCapture ? '⚔ Ăn bắt buộc' : 'Paika nếu không có nước ăn'}
        </div>
      </section>

      <section className="fan-scorebar">
        <div className={state.currentPlayer === 0 && state.winner === null && !state.drawReason ? 'active-player' : ''}>
          <span>Quân sáng</span>
          <strong>{lightCount}</strong>
          <small>{mode === 'ai' ? 'Bạn' : 'Người chơi 1'}</small>
        </div>
        <p>Lượt {state.turn}</p>
        <div className={state.currentPlayer === 1 && state.winner === null && !state.drawReason ? 'active-player' : ''}>
          <span>Quân tối</span>
          <strong>{darkCount}</strong>
          <small>{mode === 'ai' ? `AI ${levelLabel(level)}` : 'Người chơi 2'}</small>
        </div>
      </section>

      <section className="game-card fan-card">
        <div className="status fan-status" role="status" aria-live="polite">{status}</div>

        <div className="fan-board-frame">
          <div className="fan-board" aria-label="Bàn Fanorona 5 hàng 9 cột" aria-busy={isAnimating || aiThinking}>
            <svg className="fan-lines" viewBox="0 0 100 100" aria-hidden="true">
              {FANORONA_BOARD_EDGES.map(([from, to]) => {
                const [fromX, fromY] = FANORONA_NODE_COORDS[from];
                const [toX, toY] = FANORONA_NODE_COORDS[to];
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={fromX * 12.5}
                    y1={fromY * 25}
                    x2={toX * 12.5}
                    y2={toY * 25}
                  />
                );
              })}
            </svg>

            {state.board.map((cell, index) => {
              const [x, y] = FANORONA_NODE_COORDS[index];
              const target = targetOptions.get(index) ?? [];
              const isTarget = target.length > 0;
              const dualCapture = target.length > 1;
              const isSelected = selectedSource === index;
              const isSelectable = selectableSources.has(index);
              const isMovingSource = movingStone?.from === index;
              const isCapturedFx = captureFx.includes(index);
              const disabled =
                isAnimating ||
                aiThinking ||
                currentIsAi ||
                state.winner !== null ||
                state.drawReason !== null ||
                (!isTarget && !isSelectable);

              const moveStyle = isMovingSource && movingStone
                ? ({
                    '--fan-dx': `${movingStone.dx}px`,
                    '--fan-dy': `${movingStone.dy}px`
                  } as CSSProperties & Record<string, string>)
                : {};

              const classes = [
                'fan-node',
                isSelected ? 'selected' : '',
                isSelectable ? 'selectable' : '',
                isTarget ? 'target' : '',
                dualCapture ? 'dual-capture' : '',
                isCapturedFx ? 'capture-fx' : ''
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={index}
                  ref={(node: HTMLButtonElement | null) => { nodeRefs.current[index] = node; }}
                  type="button"
                  className={classes}
                  style={{ left: `${x * 12.5}%`, top: `${y * 25}%`, ...moveStyle }}
                  disabled={disabled}
                  onClick={() => handleNode(index)}
                  aria-label={
                    isTarget
                      ? dualCapture
                        ? 'Điểm đến có cả tiến ăn và lùi ăn'
                        : `${captureModeLabel(target[0]?.captureMode ?? null)} tới điểm này`
                      : cell === 0
                        ? 'Quân sáng'
                        : cell === 1
                          ? 'Quân tối'
                          : 'Giao điểm trống'
                  }
                >
                  {cell !== null && (
                    <span
                      className={[
                        'fan-piece',
                        cell === 0 ? 'light' : 'dark',
                        isMovingSource ? 'moving' : '',
                        isCapturedFx ? 'being-captured' : ''
                      ].filter(Boolean).join(' ')}
                    />
                  )}
                  {cell === null && <span className="fan-dot" />}
                  {isTarget && (
                    <span className="fan-target-ring">
                      {dualCapture ? '2' : target[0]?.captured.length || '·'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="fan-action-strip">
          <div>
            <b>{state.chain ? 'Chuỗi ăn đang mở' : mandatoryCapture ? 'Bắt buộc ăn' : 'Nước tự do'}</b>
            <span>
              {state.chain
                ? 'Cùng quân đó có thể tiếp tục theo hướng khác, hoặc dừng lượt.'
                : mandatoryCapture
                  ? 'Các quân không tạo nước ăn đã bị khóa.'
                  : 'Không có nước ăn, có thể đi một bước paika.'}
            </span>
          </div>
          {canStopFanoronaChain(state) && !currentIsAi && (
            <button type="button" className="fan-stop-chain" onClick={stopChain} disabled={isAnimating || aiThinking}>
              Dừng chuỗi
            </button>
          )}
        </div>

        {captureChoice && captureChoice.length > 1 && (
          <div className="fan-capture-choice" role="dialog" aria-label="Chọn kiểu ăn quân">
            <div>
              <span>CHỌN CÁCH ĂN</span>
              <b>Một bước đi, hai hàng quân có thể bị bắt.</b>
            </div>
            {captureChoice.map((step) => (
              <button
                type="button"
                key={step.captureMode}
                onClick={() => void animateStep(state, step)}
              >
                <strong>{captureModeLabel(step.captureMode)}</strong>
                <small>Ăn {step.captured.length} quân</small>
              </button>
            ))}
            <button type="button" className="fan-cancel-choice" onClick={() => setCaptureChoice(null)}>
              Hủy
            </button>
          </div>
        )}
      </section>

      <details className="rules fan-rules" open>
        <summary>Luật Fanoron-Tsivy đang dùng</summary>
        <p><strong>Bàn 5×9:</strong> mỗi bên 22 quân, để trống giao điểm chính giữa. Quân sáng đi trước.</p>
        <p>
          Mỗi nước đi sang một giao điểm trống liền kề theo đường kẻ. Nếu có bất kỳ nước ăn nào,
          <strong> bắt buộc phải ăn</strong>, không được đi paika.
        </p>
        <p>
          <strong>Tiến ăn:</strong> đi về phía một hàng quân địch và ăn toàn bộ dãy liên tiếp phía trước.
          <strong> Lùi ăn:</strong> rời xa một hàng quân địch và ăn toàn bộ dãy liên tiếp phía sau.
          Nếu cùng một bước có cả hai kiểu, phải chọn một.
        </p>
        <p>
          Sau khi ăn, cùng quân đó có thể tiếp tục chuỗi hoặc dừng. Trong chuỗi không được quay lại
          giao điểm đã tới và không được đi hai bước liên tiếp cùng một hướng.
        </p>
        <p>
          Bản web quy ước: hết nước hợp lệ là thua; cùng thế cờ và cùng người tới lượt lặp 3 lần thì hòa.
        </p>
      </details>

      <footer>
        Fanorona · Madagascar · Game 09 · {mode === 'ai' ? `AI ${levelLabel(level)}` : 'Local 2 người'}
      </footer>
    </main>
  );
}
