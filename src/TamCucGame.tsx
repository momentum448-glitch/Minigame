import { useEffect, useMemo, useState } from 'react';
import { chooseTamCucLead, chooseTamCucResponse } from './tamcuc/ai';
import {
  TAM_CUC_RANK_HAN,
  cardLabel,
  compareTamCucGroups,
  createTamCucDeck,
  createTamCucState,
  isFirstRoundAllowed,
  isValidTamCucGroup,
  legalTamCucLeadGroups,
  otherTamCucPlayer,
  resolveTamCucRound,
  shuffleTamCucDeck
} from './tamcuc/engine';
import type {
  TamCucAiLevel,
  TamCucCard,
  TamCucMode,
  TamCucPlayer,
  TamCucState
} from './tamcuc/types';

interface TamCucGameProps {
  onBack: () => void;
}

function freshState(): TamCucState {
  const caller: TamCucPlayer = Math.random() < .5 ? 0 : 1;
  return createTamCucState(shuffleTamCucDeck(createTamCucDeck()), caller);
}

function toggleSelection(cards: TamCucCard[], card: TamCucCard): TamCucCard[] {
  return cards.some((item) => item.id === card.id)
    ? cards.filter((item) => item.id !== card.id)
    : [...cards, card];
}

export default function TamCucGame({ onBack }: TamCucGameProps) {
  const [mode, setMode] = useState<TamCucMode>('ai');
  const [level, setLevel] = useState<TamCucAiLevel>('medium');
  const [state, setState] = useState<TamCucState>(() => freshState());
  const [lead, setLead] = useState<TamCucCard[] | null>(null);
  const [selected, setSelected] = useState<TamCucCard[]>([]);
  const [revealPulse, setRevealPulse] = useState(false);

  const phase = lead ? 'respond' : 'lead';
  const actor: TamCucPlayer = phase === 'lead'
    ? state.caller
    : otherTamCucPlayer(state.caller);
  const aiTurn = mode === 'ai' && actor === 1 && state.winner === null;

  const legalLeadIds = useMemo(() => {
    const groups = legalTamCucLeadGroups(state);
    return new Set(groups.flatMap((group) => group.map((card) => card.id)));
  }, [state]);

  const reset = (nextMode = mode) => {
    setMode(nextMode);
    setState(freshState());
    setLead(null);
    setSelected([]);
    setRevealPulse(false);
  };

  const selectionIsLeadValid =
    phase === 'lead' &&
    selected.length >= 1 &&
    selected.length <= 3 &&
    isValidTamCucGroup(selected) &&
    (state.round !== 1 || isFirstRoundAllowed(selected));

  const selectionMatchesResponse =
    phase === 'respond' &&
    lead !== null &&
    selected.length === lead.length;

  const responseCanReveal =
    selectionMatchesResponse &&
    isValidTamCucGroup(selected) &&
    (state.round !== 1 || isFirstRoundAllowed(selected));

  const finishRound = (
    response: TamCucCard[],
    revealed: boolean
  ) => {
    if (!lead) return;
    const next = resolveTamCucRound(state, lead, response, revealed);
    setRevealPulse(true);
    window.setTimeout(() => setRevealPulse(false), 420);
    setState(next);
    setLead(null);
    setSelected([]);
  };

  useEffect(() => {
    if (!aiTurn) return;

    const timer = window.setTimeout(() => {
      if (phase === 'lead') {
        const group = chooseTamCucLead(state, level, 1);
        if (group) {
          setLead(group);
          setSelected([]);
        }
        return;
      }

      if (lead) {
        const response = chooseTamCucResponse(state, lead, level, 1);
        const next = resolveTamCucRound(state, lead, response.cards, response.reveal);
        setRevealPulse(true);
        window.setTimeout(() => setRevealPulse(false), 420);
        setState(next);
        setLead(null);
        setSelected([]);
      }
    }, 620);

    return () => window.clearTimeout(timer);
  }, [aiTurn, phase, lead, level, state]);

  const toggleCard = (card: TamCucCard) => {
    if (aiTurn || state.winner !== null) return;

    const max = phase === 'lead' ? 3 : lead?.length ?? 0;
    const already = selected.some((item) => item.id === card.id);

    if (!already && selected.length >= max) return;
    setSelected(toggleSelection(selected, card));
  };

  const callLead = () => {
    if (!selectionIsLeadValid) return;
    setLead([...selected]);
    setSelected([]);
  };

  const responder = lead ? otherTamCucPlayer(state.caller) : null;
  const canBeat =
    responseCanReveal && lead
      ? compareTamCucGroups(lead, selected) > 0
      : false;

  const status = state.winner !== null
    ? state.lastMessage
    : aiTurn
      ? 'Máy đang tính bài…'
      : phase === 'lead'
        ? `Người chơi ${state.caller + 1} đang giữ cái: chọn 1, 2 hoặc 3 cây hợp lệ để gọi.`
        : `Người chơi ${responder! + 1} ra đúng ${lead!.length} cây, rồi Ngửa bài hoặc Chui.`;

  const renderCard = (card: TamCucCard, owner: TamCucPlayer) => {
    const isSelected = selected.some((item) => item.id === card.id);
    const actorOwns = owner === actor;
    const firstRoundBlocked =
      phase === 'lead' &&
      state.round === 1 &&
      !isFirstRoundAllowed([card]);
    const canClick =
      actorOwns &&
      !aiTurn &&
      state.winner === null &&
      (phase === 'respond' || legalLeadIds.has(card.id));

    return (
      <button
        key={card.id}
        type="button"
        className={[
          'tc-card',
          card.color === 'red' ? 'red' : 'black',
          isSelected ? 'selected' : '',
          firstRoundBlocked ? 'first-blocked' : ''
        ].filter(Boolean).join(' ')}
        disabled={!canClick}
        onClick={() => toggleCard(card)}
        aria-label={cardLabel(card)}
      >
        <span className="tc-han">{TAM_CUC_RANK_HAN[card.rank]}</span>
        <span className="tc-name">{cardLabel(card)}</span>
      </button>
    );
  };

  const handLabel = (player: TamCucPlayer) =>
    mode === 'ai' && player === 1 ? 'Máy' : `Người chơi ${player + 1}`;

  return (
    <main className="app-shell tc-shell">
      <header className="hero tc-hero">
        <div>
          <p className="eyebrow">MINIGAME VIỆT · GAME 05</p>
          <h1>Tam Cúc</h1>
          <p className="subtitle">
            Gọi một, đôi hay ba cây. Úp xuống chiếu, ngửa bài rồi giành cái bằng quân mạnh hơn.
          </p>
        </div>
        <div className="game-header-actions">
          <button className="back-home" type="button" onClick={onBack}>← Kho game</button>
          <button className="restart" type="button" onClick={() => reset()}>Ván mới</button>
        </div>
      </header>

      <section className="controls" aria-label="Thiết lập Tam Cúc">
        <label>
          Chế độ
          <select value={mode} onChange={(event) => reset(event.target.value as TamCucMode)}>
            <option value="ai">Đấu với máy</option>
            <option value="local">2 người cùng máy</option>
          </select>
        </label>

        <label className={mode === 'local' ? 'muted-control' : ''}>
          AI
          <select
            disabled={mode === 'local'}
            value={level}
            onChange={(event) => setLevel(event.target.value as TamCucAiLevel)}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Vừa</option>
            <option value="hard">Khó</option>
          </select>
        </label>

        <div className="rule-chip">32 lá · tay đôi 16–16</div>
      </section>

      <section className="tc-scorebar">
        <div className={state.caller === 0 && state.winner === null ? 'has-caller' : ''}>
          <span>{handLabel(0)}</span>
          <strong>{state.captured[0].length}</strong>
          <small>lá đã ăn</small>
        </div>
        <p>Vòng {state.round}</p>
        <div className={state.caller === 1 && state.winner === null ? 'has-caller' : ''}>
          <span>{handLabel(1)}</span>
          <strong>{state.captured[1].length}</strong>
          <small>lá đã ăn</small>
        </div>
      </section>

      <section className="game-card tc-table">
        <div className="status" role="status" aria-live="polite">{status}</div>
        <p className="tc-substatus">
          {state.round === 1
            ? 'Lượt đầu: cấm Tướng, cấm Sĩ; Tượng hồng là trần của bản v0.1.'
            : state.lastMessage}
        </p>

        <div className="tc-hand-block opponent">
          <div className="tc-hand-title">
            <span>{handLabel(1)}</span>
            <b>{state.hands[1].length} lá</b>
          </div>
          <div className="tc-hand">
            {state.hands[1].map((card) => renderCard(card, 1))}
          </div>
        </div>

        <div className={`tc-chiếu ${revealPulse ? 'reveal-pulse' : ''}`}>
          <div>
            <span className="tc-pile-label">Cái</span>
            <strong>{handLabel(state.caller)}</strong>
          </div>

          <div className="tc-played-cards">
            {lead
              ? lead.map((card) => (
                  <div className="tc-table-card face-down" key={card.id}>
                    <span>?</span>
                  </div>
                ))
              : state.lastResult
                ? (
                    <>
                      <div className="tc-result-group">
                        <span>Cái</span>
                        {state.lastResult.lead.map((card) => (
                          <div className={`tc-table-card ${card.color}`} key={`lead-${card.id}`}>
                            <b>{TAM_CUC_RANK_HAN[card.rank]}</b>
                            <small>{cardLabel(card)}</small>
                          </div>
                        ))}
                      </div>
                      <div className="tc-result-divider">VS</div>
                      <div className="tc-result-group">
                        <span>{state.lastResult.responseRevealed ? 'Ngửa' : 'Chui'}</span>
                        {state.lastResult.response.map((card) => (
                          state.lastResult?.responseRevealed
                            ? (
                                <div className={`tc-table-card ${card.color}`} key={`response-${card.id}`}>
                                  <b>{TAM_CUC_RANK_HAN[card.rank]}</b>
                                  <small>{cardLabel(card)}</small>
                                </div>
                              )
                            : (
                                <div className="tc-table-card face-down" key={`response-${card.id}`}>
                                  <span>?</span>
                                </div>
                              )
                        ))}
                      </div>
                    </>
                  )
                : <em>Chưa có bài trên chiếu</em>}
          </div>

          {lead && (
            <p className="tc-call-badge">GỌI {lead.length} CÂY</p>
          )}
        </div>

        <div className="tc-actions">
          {phase === 'lead' ? (
            <>
              <span>
                {selected.length === 0
                  ? 'Chọn bộ muốn gọi.'
                  : selectionIsLeadValid
                    ? `Bộ ${selected.length} cây hợp lệ.`
                    : 'Bộ đang chọn chưa hợp lệ.'}
              </span>
              <button
                type="button"
                disabled={!selectionIsLeadValid || aiTurn}
                onClick={callLead}
              >
                Gọi {selected.length || '…'} cây
              </button>
            </>
          ) : (
            <>
              <span>
                {selected.length !== lead!.length
                  ? `Chọn đủ ${lead!.length} cây để đáp.`
                  : responseCanReveal
                    ? canBeat ? 'Bộ này có thể bắt bài cái.' : 'Bộ hợp lệ nhưng không đè được bài cái.'
                    : 'Có thể Chui để chịu lượt này.'}
              </span>
              <div>
                <button
                  type="button"
                  disabled={!responseCanReveal || aiTurn}
                  onClick={() => finishRound(selected, true)}
                >
                  Ngửa bài
                </button>
                <button
                  type="button"
                  className="tc-fold"
                  disabled={!selectionMatchesResponse || aiTurn}
                  onClick={() => finishRound(selected, false)}
                >
                  Chui
                </button>
              </div>
            </>
          )}
        </div>

        <div className="tc-hand-block self">
          <div className="tc-hand-title">
            <span>{handLabel(0)}</span>
            <b>{state.hands[0].length} lá</b>
          </div>
          <div className="tc-hand">
            {state.hands[0].map((card) => renderCard(card, 0))}
          </div>
        </div>
      </section>

      <details className="rules">
        <summary>Luật Tam Cúc v0.1 đang dùng</summary>
        <p>
          Tay đôi chia đủ 32 lá, mỗi người 16 lá và hai bên biết bài của nhau.
          Thứ tự mạnh: <strong>Tướng &gt; Sĩ &gt; Tượng &gt; Xe &gt; Pháo &gt; Mã &gt; Tốt</strong>.
          Hai lá cùng tên thì đỏ mạnh hơn đen.
        </p>
        <p>
          Người giữ cái gọi 1, 2 hoặc 3 cây. Đôi phải cùng tên cùng màu.
          Bộ ba hợp lệ chỉ gồm <strong>Tướng–Sĩ–Tượng</strong> hoặc <strong>Xe–Pháo–Mã</strong>
          cùng màu. Người đáp ra cùng số cây rồi có thể Ngửa bài hoặc Chui.
        </p>
        <p>
          Lượt đầu bản v0.1 dùng luật “cấm Tướng, cấm Sĩ, lấy Tượng cầm đầu”.
          Người thắng lượt giữ cái cho lượt sau. Nếu hai bộ bằng hệt sức mạnh,
          người giữ cái thắng hòa.
        </p>
        <p>
          Bản v0.1 tính thắng bằng tổng số lá ăn được sau khi hết bài.
          Luật Trình làng, Kết đôi/Kết ba, Kết Tốt đen và Đè Tốt đen được để sang vòng mở rộng sau QC.
        </p>
      </details>

      <footer>
        Minigame Việt · Tam Cúc v0.1 · AI {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}
      </footer>
    </main>
  );
}
