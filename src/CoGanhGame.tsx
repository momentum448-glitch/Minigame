import { useEffect, useMemo, useState } from 'react';
import { chooseGanhAiMove } from './coganh/ai';
import {
  GANH_BOARD_EDGES,
  applyGanhMove,
  coordOf,
  countPieces,
  createInitialGanhState,
  legalGanhMoves
} from './coganh/engine';
import type { GanhAiLevel, GanhMode, GanhPlayer } from './coganh/types';

interface CoGanhGameProps {
  onBack: () => void;
}

export default function CoGanhGame({ onBack }: CoGanhGameProps) {
  const [mode, setMode] = useState<GanhMode>('ai');
  const [level, setLevel] = useState<GanhAiLevel>('medium');
  const [state, setState] = useState(() => createInitialGanhState());
  const [selected, setSelected] = useState<number | null>(null);

  const aiThinking = mode === 'ai' && state.currentPlayer === 1 && state.winner === null;
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

  useEffect(() => {
    if (!aiThinking) return;

    const snapshot = state;
    const timer = window.setTimeout(() => {
      const move = chooseGanhAiMove(snapshot, level, 1);
      if (move) setState((current) => applyGanhMove(current, move));
      setSelected(null);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [aiThinking, level, state]);

  const playerLabel = (player: GanhPlayer) =>
    mode === 'ai' && player === 1 ? 'Máy' : `Người chơi ${player + 1}`;

  const restart = () => {
    setState(createInitialGanhState());
    setSelected(null);
  };

  const changeMode = (nextMode: GanhMode) => {
    setMode(nextMode);
    setState(createInitialGanhState());
    setSelected(null);
  };

  const handleNode = (index: number) => {
    if (aiThinking || state.winner !== null) return;

    const cell = state.board[index];

    if (cell === state.currentPlayer && movableSources.has(index)) {
      setSelected((current) => current === index ? null : index);
      return;
    }

    if (cell === null && selected !== null && destinations.has(index)) {
      setState((current) => applyGanhMove(current, { from: selected, to: index }));
      setSelected(null);
    }
  };

  const status = state.winner !== null
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
          <button className="back-home" type="button" onClick={onBack}>← Kho game</button>
          <button className="restart" type="button" onClick={restart}>Ván mới</button>
        </div>
      </header>

      <section className="controls" aria-label="Thiết lập ván Cờ Gánh">
        <label>
          Chế độ
          <select value={mode} onChange={(event) => changeMode(event.target.value as GanhMode)}>
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>
        <label className={mode === 'local' ? 'muted-control' : ''}>
          AI
          <select
            disabled={mode === 'local'}
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
          <strong>{countPieces(state, 0)}</strong>
          <small>Nâu tre</small>
        </div>
        <p>Lượt {state.turn}</p>
        <div className={state.currentPlayer === 1 && state.winner === null ? 'active-player' : ''}>
          <span>{mode === 'ai' ? 'Máy' : 'Người chơi 2'}</span>
          <strong>{countPieces(state, 1)}</strong>
          <small>Đỏ son</small>
        </div>
      </section>

      <section className="game-card cg-card">
        <div className="status" role="status" aria-live="polite">{status}</div>
        <p className="cg-substatus">{state.lastMessage}</p>

        <div className="cg-board-frame">
          <div className="cg-board-grid" aria-label="Bàn Cờ Gánh">
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

            {state.board.map((cell, index) => {
              const [row, col] = coordOf(index);
              const isSelected = selected === index;
              const isDestination = destinations.has(index);
              const isForced = state.forcedGanhAt === index;
              const isConverted = state.lastConverted.includes(index);
              const isLastTo = state.lastMove?.to === index;
              const canInteract =
                !aiThinking &&
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
                isConverted ? 'converted' : '',
                isLastTo ? 'last-to' : ''
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={index}
                  type="button"
                  className={classes}
                  style={{ left: `${col * 25}%`, top: `${row * 25}%` }}
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
          {selected === null
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

      <footer>Minigame Việt · Cờ Gánh v0.1 · AI {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}</footer>
    </main>
  );
}
