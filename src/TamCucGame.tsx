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
        aria-pressed={isSelected}
      >
        {isSelected && <span className="tc-selected-badge">✓ ĐÃ CHỌN</span>}
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

        <div className={`tc-selection-summary ${selected.length > 0 ? 'active' : ''}`}>
          <span>ĐANG CHỌN</span>
          <strong>
            {selected.length > 0
              ? selected.map((card) => cardLabel(card)).join(' · ')
              : 'Chưa chọn lá nào'}
          </strong>
          <small>
            {phase === 'lead'
              ? 'Chọn 1 lá, một đôi cùng tên cùng màu, hoặc một bộ ba hợp lệ.'
              : `Cần chọn đúng ${lead?.length ?? 0} lá để đáp.`}
          </small>
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

      <details className="rules tc-rules-guide" open>
        <summary>Luật Tam Cúc chi tiết · đọc 2 phút là chơi được</summary>

        <section className="tc-rule-intro">
          <div>
            <span className="tc-rule-number">1</span>
            <h3>Mục tiêu</h3>
            <p>
              Bản tay đôi dùng đủ <strong>32 lá</strong>, mỗi người <strong>16 lá</strong>.
              Hai bên nhìn thấy bài của nhau. Mỗi lượt tranh một chồng bài trên chiếu;
              ai thắng lượt thì ăn toàn bộ số lá của lượt đó và giữ quyền <strong>cái</strong>.
            </p>
          </div>

          <div>
            <span className="tc-rule-number">2</span>
            <h3>Ai mạnh hơn?</h3>
            <p>Thứ tự từ mạnh xuống yếu:</p>
            <div className="tc-rank-ladder" aria-label="Thứ tự sức mạnh Tam Cúc">
              <b>Tướng</b><i>›</i><b>Sĩ</b><i>›</i><b>Tượng</b><i>›</i>
              <b>Xe</b><i>›</i><b>Pháo</b><i>›</i><b>Mã</b><i>›</i><b>Tốt</b>
            </div>
            <p>
              Nếu cùng tên quân thì <strong>đỏ thắng đen</strong>.
              Ví dụ: Xe đỏ thắng Xe đen, nhưng Xe đỏ vẫn thua Tượng đen vì cấp quân thấp hơn.
            </p>
          </div>
        </section>

        <section className="tc-rule-flow">
          <h3>Một lượt diễn ra thế nào?</h3>
          <div className="tc-flow-grid">
            <div><b>① Cái gọi bài</b><span>Chọn 1, 2 hoặc 3 lá hợp lệ rồi bấm “Gọi”.</span></div>
            <div><b>② Bài cái úp xuống</b><span>Người đáp chỉ biết số lượng lá được gọi.</span></div>
            <div><b>③ Người đáp chọn</b><span>Chọn đúng số lá tương ứng, sau đó Ngửa bài hoặc Chui.</span></div>
            <div><b>④ So bài</b><span>Nếu Ngửa, bộ mạnh hơn ăn lượt. Nếu Chui, cái ăn lượt. Người thắng giữ cái.</span></div>
          </div>
        </section>

        <section className="tc-rule-groups">
          <h3>Chọn 1, 2 hay 3 cây thế nào?</h3>
          <div className="tc-rule-cards">
            <div>
              <strong>1 cây</strong>
              <p>Một lá bất kỳ được phép dùng ở lượt hiện tại. So trực tiếp theo thứ tự quân và màu.</p>
            </div>
            <div>
              <strong>2 cây · Đôi</strong>
              <p>Hai lá phải <strong>cùng tên + cùng màu</strong>. Ví dụ: 2 Xe đỏ là đôi; Xe đỏ + Xe đen không phải đôi.</p>
            </div>
            <div>
              <strong>3 cây · Bộ ba</strong>
              <p>Chỉ có hai dạng: <strong>Tướng–Sĩ–Tượng</strong> cùng màu hoặc <strong>Xe–Pháo–Mã</strong> cùng màu.</p>
            </div>
          </div>
        </section>

        <section className="tc-rule-special">
          <div>
            <h3>Ngửa bài và Chui</h3>
            <p>
              <strong>Ngửa bài:</strong> bộ đã chọn phải hợp lệ. Game sẽ so với bộ của cái.
              Người đáp chỉ thắng khi bộ của mình <strong>mạnh hơn</strong>.
            </p>
            <p>
              <strong>Chui:</strong> người đáp vẫn phải bỏ đúng số lá được gọi nhưng không cần tạo bộ hợp lệ.
              Các lá đó bị bỏ vào lượt và <strong>cái mặc định thắng</strong>.
            </p>
          </div>

          <div>
            <h3>Luật lượt đầu</h3>
            <p>
              Bản dự án hiện dùng câu <strong>“cấm Tướng, cấm Sĩ, lấy Tượng cầm đầu”</strong>:
              lượt đầu không được dùng Tướng hoặc Sĩ trong bộ ngửa; Tượng đỏ là quân cao nhất được phép dùng.
            </p>
            <p className="tc-rule-note">
              Đây là điểm có dị bản trong nguồn Tam Cúc. Dự án đang dùng biến thể này cho v0.1.
            </p>
          </div>
        </section>

        <section className="tc-rule-ending">
          <h3>Kết thúc ván trong bản hiện tại</h3>
          <p>
            Khi hai người hết bài, game đếm tổng số lá đã ăn. Người có nhiều lá hơn thắng;
            nếu mỗi bên 16 lá thì hòa. Nếu hai bộ có sức mạnh bằng hệt nhau trong một lượt,
            <strong>người đang giữ cái thắng hòa</strong>.
          </p>
          <p>
            <strong>Chưa dùng ở bản này:</strong> Trình làng Tứ tử/Ngũ tử, Ngũ tử cướp cái,
            Kết đôi/Kết ba, Kết Tốt đen, Đè Tốt đen và hệ điểm thưởng truyền thống.
          </p>
        </section>
      </details>

      <footer>
        Minigame Việt · Tam Cúc v0.2 UX · AI {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Vừa' : 'Khó'}
      </footer>
    </main>
  );
}
