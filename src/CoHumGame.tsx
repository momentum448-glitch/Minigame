import { useEffect, useMemo, useState } from 'react';
import { chooseHumAiMove } from './cohum/ai';
import {
  HUM_BOARD_EDGES,
  HUM_NODE_COORDS,
  applyHumMove,
  countHumPieces,
  createInitialHumState,
  legalHumMoves
} from './cohum/engine';
import type { HumAiLevel, HumMode, HumMove, HumSide } from './cohum/types';

interface CoHumGameProps {
  onBack: () => void;
}

export default function CoHumGame({ onBack }: CoHumGameProps) {
  const [mode, setMode] = useState<HumMode>('ai');
  const [level, setLevel] = useState<HumAiLevel>('medium');
  const [humanSide, setHumanSide] = useState<HumSide>('hum');
  const [state, setState] = useState(() => createInitialHumState());
  const [selected, setSelected] = useState<number | null>(null);

  const aiSide: HumSide = humanSide === 'hum' ? 'trau' : 'hum';
  const aiThinking =
    mode === 'ai' &&
    state.currentPlayer === aiSide &&
    state.winner === null;

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

  useEffect(() => {
    if (!aiThinking) return;

    const snapshot = state;
    const timer = window.setTimeout(() => {
      const move = chooseHumAiMove(snapshot, level, aiSide);
      if (move) setState((current) => applyHumMove(current, move));
      setSelected(null);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [aiThinking, aiSide, level, state]);

  const restart = () => {
    setState(createInitialHumState());
    setSelected(null);
  };

  const changeMode = (nextMode: HumMode) => {
    setMode(nextMode);
    setState(createInitialHumState());
    setSelected(null);
  };

  const changeHumanSide = (side: HumSide) => {
    setHumanSide(side);
    setState(createInitialHumState());
    setSelected(null);
  };

  const handleNode = (index: number) => {
    if (aiThinking || state.winner !== null) return;
    if (mode === 'ai' && state.currentPlayer !== humanSide) return;

    const cell = state.board[index];

    if (cell === state.currentPlayer && selectableSources.has(index)) {
      setSelected((current) => current === index ? null : index);
      return;
    }

    if (selected !== null && cell === null) {
      const move = selectedMoves.find((candidate) => candidate.to === index);
      if (move) {
        setState((current) => applyHumMove(current, move));
        setSelected(null);
      }
    }
  };

  const sideLabel = (side: HumSide) => side === 'hum' ? 'Hùm' : 'Trâu';
  const playerLabel = (side: HumSide) => {
    if (mode === 'local') return sideLabel(side);
    return side === humanSide ? `Bạn · ${sideLabel(side)}` : `Máy · ${sideLabel(side)}`;
  };

  const status = state.winner !== null
    ? state.lastMessage
    : aiThinking
      ? `Máy đang tính nước cho ${sideLabel(aiSide)}…`
      : `${playerLabel(state.currentPlayer)} chọn quân để đi.`;

  const capturedCount = 15 - countHumPieces(state, 'trau');

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
          <button className="back-home" type="button" onClick={onBack}>← Kho game</button>
          <button className="restart" type="button" onClick={restart}>Ván mới</button>
        </div>
      </header>

      <section className="controls" aria-label="Thiết lập ván Cờ Hùm">
        <label>
          Chế độ
          <select value={mode} onChange={(event) => changeMode(event.target.value as HumMode)}>
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>

        <label className={mode === 'local' ? 'muted-control' : ''}>
          Bạn chơi
          <select
            disabled={mode === 'local'}
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
            disabled={mode === 'local'}
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
          <strong>{countHumPieces(state, 'trau')}</strong>
          <small>Trâu còn lại</small>
        </div>
      </section>

      <section className="game-card ch-card">
        <div className="status" role="status" aria-live="polite">{status}</div>
        <p className="ch-substatus">{state.lastMessage}</p>

        <div className="ch-board-frame">
          <div className="ch-board" aria-label="Bàn Cờ Hùm">
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

            {state.board.map((cell, index) => {
              const [x, y] = HUM_NODE_COORDS[index];
              const isSelected = selected === index;
              const targetMove = selectedMoves.find((move) => move.to === index);
              const isMoveTarget = Boolean(targetMove);
              const isCaptureTarget = Boolean(targetMove?.capture !== null);
              const isLastTo = state.lastMove?.to === index;

              const canInteract =
                !aiThinking &&
                state.winner === null &&
                (mode === 'local' || state.currentPlayer === humanSide) &&
                (
                  (cell === state.currentPlayer && selectableSources.has(index)) ||
                  (cell === null && isMoveTarget)
                );

              const classes = [
                'ch-node',
                cell === 'hum' ? 'hum-piece-node' : '',
                cell === 'trau' ? 'trau-piece-node' : '',
                cell === null ? 'empty' : '',
                isSelected ? 'selected' : '',
                isMoveTarget ? 'move-target' : '',
                isCaptureTarget ? 'capture-target' : '',
                isLastTo ? 'last-to' : ''
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={index}
                  type="button"
                  className={classes}
                  style={{ left: `${(x / 6) * 100}%`, top: `${(y / 4) * 100}%` }}
                  disabled={!canInteract}
                  onClick={() => handleNode(index)}
                  aria-label={
                    cell === 'hum'
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

        <div className="ch-help">
          {selected === null
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
        <p>Không được lập tức đi ngược lại đúng nước mà cùng bên vừa đi ở lượt trước.</p>
      </details>

      <footer>Minigame Việt · Cờ Hùm v0.1 · AI {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}</footer>
    </main>
  );
}
