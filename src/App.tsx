import { useEffect, useMemo, useState } from 'react';
import { chooseAiMove } from './game/ai';
import { applyMove, createInitialState, PLAYER_PITS } from './game/engine';
import type { AiLevel, Direction, GameMode, GameState } from './game/types';
import { StonePile } from './components/StonePile';

const topOrder = [1, 2, 3, 4, 5];
const bottomOrder = [11, 10, 9, 8, 7];

export default function App() {
  const [mode, setMode] = useState<GameMode>('ai');
  const [level, setLevel] = useState<AiLevel>('medium');
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [selectedPit, setSelectedPit] = useState<number | null>(null);
  const aiThinking = mode === 'ai' && state.currentPlayer === 1 && !state.gameOver;

  useEffect(() => {
    if (!aiThinking) return;
    const timer = window.setTimeout(() => {
      const move = chooseAiMove(state, level, 1);
      if (move) setState((current) => applyMove(current, move));
      setSelectedPit(null);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [aiThinking, level, state]);

  const canSelect = (pit: number) => {
    if (state.gameOver || aiThinking) return false;
    if (!PLAYER_PITS[state.currentPlayer].includes(pit)) return false;
    return state.pits[pit].dan > 0;
  };

  const play = (direction: Direction) => {
    if (selectedPit === null) return;
    setState((current) => applyMove(current, { pit: selectedPit, direction }));
    setSelectedPit(null);
  };

  const restart = () => {
    setState(createInitialState());
    setSelectedPit(null);
  };

  const changeMode = (nextMode: GameMode) => {
    setMode(nextMode);
    setState(createInitialState());
    setSelectedPit(null);
  };

  const currentLabel = mode === 'ai' && state.currentPlayer === 1 ? 'Máy' : `Người chơi ${state.currentPlayer + 1}`;
  const status = state.gameOver ? state.lastMessage : aiThinking ? 'Máy đang tính nước…' : `${currentLabel} chọn một ô dân.`;

  const pitButton = (pit: number) => {
    const data = state.pits[pit];
    const selectable = canSelect(pit);
    return (
      <button
        key={pit}
        type="button"
        className={`pit ${selectedPit === pit ? 'selected' : ''}`}
        disabled={!selectable}
        onClick={() => setSelectedPit(pit)}
        aria-label={`Ô dân ${pit}, ${data.dan} quân`}
      >
        <StonePile count={data.dan} />
        <strong>{data.dan}</strong>
      </button>
    );
  };

  const score2Label = mode === 'ai' ? 'Máy' : 'Người chơi 2';
  const difficultyText = useMemo(() => ({ easy: 'Dễ', medium: 'Vừa', hard: 'Khó' }[level]), [level]);

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
          <select value={mode} onChange={(e) => changeMode(e.target.value as GameMode)}>
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>
        <label className={mode === 'local' ? 'muted-control' : ''}>
          AI
          <select disabled={mode === 'local'} value={level} onChange={(e) => setLevel(e.target.value as AiLevel)}>
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
        <div className="board-wrap">
          <div className="board" aria-label="Bàn Ô ăn quan">
            <div className="quan pit quan-left">
              <StonePile count={state.pits[0].dan} quan={state.pits[0].quan} />
              <strong>{state.pits[0].dan + (state.pits[0].quan ? 10 : 0)}</strong>
              <span>Quan</span>
            </div>
            <div className="small-pits top-row">{topOrder.map(pitButton)}</div>
            <div className="small-pits bottom-row">{bottomOrder.map(pitButton)}</div>
            <div className="quan pit quan-right">
              <StonePile count={state.pits[6].dan} quan={state.pits[6].quan} />
              <strong>{state.pits[6].dan + (state.pits[6].quan ? 10 : 0)}</strong>
              <span>Quan</span>
            </div>
          </div>
        </div>

        <div className="direction-panel">
          <span>{selectedPit === null ? 'Chọn một ô để bắt đầu' : `Đã chọn ô ${selectedPit}`}</span>
          <div>
            <button type="button" disabled={selectedPit === null || aiThinking} onClick={() => play(-1)}>← Rải trái</button>
            <button type="button" disabled={selectedPit === null || aiThinking} onClick={() => play(1)}>Rải phải →</button>
          </div>
        </div>
      </section>

      <details className="rules">
        <summary>Luật đang dùng</summary>
        <p>Chọn một ô dân phía mình, rồi rải từng dân theo một hướng. Gặp ô dân có quân sau khi rải hết thì bốc tiếp. Gặp ô trống rồi đến ô có quân thì ăn. Có thể ăn liên hoàn.</p>
        <p>Quan chỉ được ăn khi ô Quan có ít nhất 5 dân đi kèm. Quan trị giá 10 điểm. Khi cả hai Quan đã bị ăn, dân còn lại trên phần sân của ai thuộc về người đó.</p>
        <p>Nếu đầu lượt cả 5 ô dân đều trống, người chơi dùng 5 dân đã ăn để rải lại; thiếu thì ghi nợ và trừ khi kết thúc ván.</p>
      </details>

      <footer>Minigame Việt · AI {difficultyText} · Bản thử nghiệm v0.1</footer>
    </main>
  );
}
