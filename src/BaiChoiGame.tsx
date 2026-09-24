import { useMemo, useRef, useState } from 'react';
import {
  createBaiChoiState,
  drawNextBaiChoiCard,
  hutHasCard,
  peekNextBaiChoiCard
} from './baichoi/engine';
import type {
  BaiChoiCard,
  BaiChoiHut,
  BaiChoiMode
} from './baichoi/types';

interface BaiChoiGameProps {
  onBack: () => void;
}

const HINTS: Record<string, string> = {
  'Ông Ầm': 'Nghe đâu một tiếng vang rền, bước chân rộn rã cả miền hội xuân.',
  'Tứ Cẳng': 'Bốn chân đứng vững giữa sân, nghe câu thai tới thì gần gõ mõ.',
  'Bạch Huê': 'Một nhành hoa trắng đầu mùa, gió đưa hương nhẹ qua chùa đầu năm.',
  'Chín Gối': 'Đêm dài kê gối nằm mong, nghe ai gọi khẽ bên song hội bài.',
  'Sáu Ghe': 'Ghe xuôi con nước miền Trung, chèo khua một nhịp tưng bừng bến xuân.',
  'Năm Dụm': 'Tay gom tay tụm cho gần, năm phen sum họp quây quần bên nhau.',
  'Tứ Xách': 'Xách giỏ qua ngõ đầu làng, chân vui theo tiếng trống vang hội chòi.',
  'Nhì Nghèo': 'Túi tuy mỏng vẫn vui xuân, nghe câu hô tới trong ngần tiếng cười.',
  'Ba Gà': 'Sáng ra gà gáy ba hồi, giục người mở cửa ra coi hội làng.',
  'Tứ Tượng': 'Bốn bề hình bóng uy nghi, quân bài vừa tới nhớ ghi trong lòng.',
  'Tám Dùng': 'Tám phương tụ lại một vùng, nghe anh Hiệu gọi thì cùng lắng tai.',
  'Ngũ Trợt': 'Chân trơn mà dạ chẳng sờn, năm phen trượt bước vẫn còn cuộc vui.',
  'Tứ Móc': 'Móc câu vướng sợi chỉ hồng, ai nghe tên gọi thì trông thẻ mình.',
  'Tam Quăng': 'Ba phen quăng lưới giữa dòng, bắt con nước bạc chờ mong cá về.',
  'Bánh Hai': 'Bánh thơm chia nửa làm hai, ngọt câu hội ngộ kéo dài mùa xuân.',
  'Cửu Điều': 'Sắc điều đỏ thắm đầu năm, chín phen may mắn ghé thăm chòi này.',
  'Ba Bụng': 'Ba vòng bụng vẫn cười vang, hội vui no tiếng chẳng màng hơn thua.',
  'Chín Cu': 'Chim cu gọi bạn trên đồng, chín hồi tiếng vọng bay vòng qua tre.',
  'Nhứt Nọc': 'Một cây đứng giữa đất trời, đầu xuân nghe gọi nhớ coi quân mình.',
  'Thất Vung': 'Vung nồi nghiêng ngả bếp xuân, bảy phen khói tỏa thơm gần thơm xa.',
  'Bát Bồng': 'Tay bồng tay bế đầu sân, tám câu hát nối bước chân hội làng.',
  'Lục Chạng': 'Sáu phen qua ngõ qua làng, nghe câu xướng tới rộn vang tiếng mõ.',
  'Tám Miểng': 'Tám mảnh ghép lại nên hình, quân bài hiện diện giữa đình đầu xuân.',
  'Nhứt Trò': 'Một trò mở hội đầu năm, ai nghe câu hát âm thầm đoán tên.',
  'Bảy Thưa': 'Bảy lần thưa gửi đôi lời, tiếng ca vừa dứt nụ cười lại vang.',
  'Bảy Liễu': 'Liễu nghiêng bảy nhánh bên hồ, gió lay như gọi câu hô sắp thành.',
  'Cửu Chùa': 'Chín hồi chuông vọng mái chùa, người nghe câu hát đón mùa an vui.'
};

function ownerLabel(hut: BaiChoiHut): string {
  if (hut.owner === 'human-1') return 'Bạn';
  if (hut.owner === 'human-2') return 'Người chơi 2';
  return `Chòi ${hut.id + 1}`;
}

export default function BaiChoiGame({ onBack }: BaiChoiGameProps) {
  const [mode, setMode] = useState<BaiChoiMode>('solo');
  const [state, setState] = useState(() => createBaiChoiState('solo'));
  const [pending, setPending] = useState<BaiChoiCard | null>(null);
  const [phase, setPhase] = useState<'ready' | 'thai'>('ready');
  const [revealFlash, setRevealFlash] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  const winner = useMemo(
    () => state.winnerHutId === null
      ? null
      : state.huts.find((hut) => hut.id === state.winnerHutId) ?? null,
    [state]
  );

  const ensureAudio = () => {
    if (!soundEnabled) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      void context.resume();
    }

    return context;
  };

  const playTone = (
    frequency: number,
    duration: number,
    offset = 0,
    type: OscillatorType = 'sine',
    volume = .18
  ) => {
    const context = ensureAudio();
    if (!context) return;

    const start = context.currentTime + offset;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(40, frequency * .72),
      start + duration
    );

    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  };

  const playDrumCue = () => {
    playTone(128, .18, 0, 'sine', .24);
    playTone(92, .22, .18, 'sine', .2);
  };

  const playWoodKnock = () => {
    playTone(720, .075, 0, 'triangle', .18);
    playTone(520, .09, .11, 'triangle', .16);
  };

  const playWinnerFanfare = () => {
    playTone(105, .2, 0, 'sine', .25);
    playTone(132, .2, .22, 'sine', .25);
    playTone(168, .32, .44, 'sine', .27);
    playTone(720, .07, .06, 'triangle', .14);
    playTone(720, .07, .28, 'triangle', .14);
    playTone(720, .07, .5, 'triangle', .14);
  };

  const speakCardName = (name: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(name);
    utterance.lang = 'vi-VN';
    utterance.rate = .86;
    utterance.pitch = .94;
    utterance.volume = .9;

    const vietnameseVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith('vi'));

    if (vietnameseVoice) utterance.voice = vietnameseVoice;
    window.speechSynthesis.speak(utterance);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);

    if (!next) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    const context = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = context;
    if (context.state === 'suspended') void context.resume();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 640;
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.13, context.currentTime + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .09);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .11);
  };

  const reset = (nextMode = mode) => {
    setMode(nextMode);
    setState(createBaiChoiState(nextMode));
    setPending(null);
    setPhase('ready');
    setRevealFlash(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const beginThai = () => {
    if (state.winnerHutId !== null || phase !== 'ready') return;
    const next = peekNextBaiChoiCard(state);
    if (!next) return;

    playDrumCue();
    setPending(next);
    setPhase('thai');
  };

  const revealCard = () => {
    if (!pending || phase !== 'thai') return;

    const nextState = drawNextBaiChoiCard(state);
    const owner = nextState.huts.find((hut) => hutHasCard(hut, pending.id)) ?? null;

    speakCardName(pending.name);
    if (owner) {
      window.setTimeout(() => playWoodKnock(), 180);
    }
    if (nextState.winnerHutId !== null) {
      window.setTimeout(() => playWinnerFanfare(), 520);
    }

    setState(nextState);
    setRevealFlash(true);
    window.setTimeout(() => setRevealFlash(false), 520);
    setPending(null);
    setPhase('ready');
  };

  const status = winner
    ? `${ownerLabel(winner)} TỚI! Đủ 3 con bài trước tiên.`
    : phase === 'thai' && pending
      ? 'Anh Hiệu đang hô thai. Nghe câu hát rồi xướng tên con bài.'
      : `Đã rút ${state.turn}/27 con. Bấm “Hô thai” để tiếp tục hội.`;

  const lastOwner = state.lastDraw
    ? state.huts.find((hut) => hutHasCard(hut, state.lastDraw!.id)) ?? null
    : null;

  return (
    <main className="app-shell bc-shell">
      <header className="hero bc-hero">
        <div>
          <p className="eyebrow">MINIGAME VIỆT · GAME 06</p>
          <h1>Bài Chòi</h1>
          <p className="subtitle">
            Một hội xuân 9 chòi: nghe Anh Hiệu hô thai, chờ đúng con bài và đủ ba quân để “Tới!”.
          </p>
        </div>
        <div className="game-header-actions">
          <button className="back-home" type="button" onClick={onBack}>← Kho game</button>
          <button className="restart" type="button" onClick={() => reset()}>Hội mới</button>
        </div>
      </header>

      <section className="controls" aria-label="Thiết lập Bài Chòi">
        <label>
          Chế độ
          <select
            value={mode}
            onChange={(event) => reset(event.target.value as BaiChoiMode)}
          >
            <option value="solo">1 người · 8 chòi máy</option>
            <option value="local">2 người local · 7 chòi máy</option>
          </select>
        </label>

        <button
          className={`bc-sound-toggle ${soundEnabled ? 'on' : 'off'}`}
          type="button"
          aria-pressed={soundEnabled}
          onClick={toggleSound}
        >
          {soundEnabled ? '🔊 Âm thanh: Bật' : '🔇 Âm thanh: Tắt'}
        </button>

        <div className="rule-chip">9 chòi · 27 con · đủ 3 là TỚI</div>
      </section>

      <section className="game-card bc-stage">
        <div className="status" role="status" aria-live="polite">{status}</div>

        <div className={`bc-hieu-stage ${revealFlash ? 'reveal-flash' : ''}`}>
          <div className="bc-hieu-avatar" aria-hidden="true">
            <span className="bc-head" />
            <span className="bc-hat" />
            <span className="bc-body" />
          </div>

          <div className="bc-callout">
            <span className="bc-callout-label">ANH HIỆU</span>
            {phase === 'thai' && pending ? (
              <>
                <p className="bc-thai">“{HINTS[pending.name]}”</p>
                <button className="bc-reveal-button" type="button" onClick={revealCard}>
                  Xướng tên con bài
                </button>
              </>
            ) : state.lastDraw ? (
              <>
                <p className="bc-card-name">{state.lastDraw.name}</p>
                <small>
                  {lastOwner ? `${ownerLabel(lastOwner)} trúng quân này · ${lastOwner.hits.length}/3` : 'Không có chòi trúng.'}
                </small>
                {!winner && (
                  <button className="bc-draw-button" type="button" onClick={beginThai}>
                    Hô thai tiếp
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="bc-welcome">Chín chòi lẳng lặng mà nghe…</p>
                <button className="bc-draw-button" type="button" onClick={beginThai}>
                  Hô thai
                </button>
              </>
            )}
          </div>

          <div className="bc-tube" aria-hidden="true">
            <span>{Math.max(0, 27 - state.turn)}</span>
            <small>thẻ còn lại</small>
          </div>
        </div>

        {winner && (
          <div className="bc-winner-banner" role="alert">
            <span>🎋</span>
            <div>
              <strong>TỚI! TỚI!</strong>
              <p>{ownerLabel(winner)} đã đủ cả 3 con bài.</p>
            </div>
            <button type="button" onClick={() => reset()}>Mở hội mới</button>
          </div>
        )}

        <div className="bc-huts" aria-label="Chín chòi Bài Chòi">
          {state.huts.map((hut) => {
            const human = hut.owner !== 'bot';
            const won = hut.id === state.winnerHutId;

            return (
              <article
                className={[
                  'bc-hut',
                  human ? 'human' : 'bot',
                  won ? 'winner' : ''
                ].filter(Boolean).join(' ')}
                key={hut.id}
              >
                <div className="bc-roof" aria-hidden="true" />
                <div className="bc-hut-title">
                  <span>{ownerLabel(hut)}</span>
                  <b>{hut.hits.length}/3</b>
                </div>

                {human ? (
                  <div className="bc-ticket-row">
                    {hut.cards.map((card) => {
                      const hit = hut.hits.includes(card.id);
                      return (
                        <div className={`bc-ticket ${hit ? 'hit' : ''}`} key={card.id}>
                          <span>{card.name}</span>
                          {hit && <b>✓ TRÚNG</b>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bc-bot-progress" aria-label={`${ownerLabel(hut)} trúng ${hut.hits.length} trên 3`}>
                    {[0, 1, 2].map((slot) => (
                      <span className={slot < hut.hits.length ? 'hit' : ''} key={slot}>
                        {slot < hut.hits.length ? '✓' : '?'}
                      </span>
                    ))}
                  </div>
                )}

                {state.lastDraw && hutHasCard(hut, state.lastDraw.id) && (
                  <div className="bc-knock">CỐC! CỐC!</div>
                )}
              </article>
            );
          })}
        </div>

        <div className="bc-history">
          <div className="bc-history-head">
            <strong>Các con đã xướng</strong>
            <span>{state.drawn.length}/27</span>
          </div>
          <div className="bc-history-list">
            {state.drawn.length === 0 ? (
              <em>Chưa rút con bài nào.</em>
            ) : (
              state.drawn.map((id, index) => {
                const card = state.drawPile.find((item) => item.id === id)!;
                return <span key={id}>{index + 1}. {card.name}</span>;
              })
            )}
          </div>
        </div>
      </section>

      <details className="rules bc-rules" open>
        <summary>Luật Bài Chòi v0.2 · cách chơi hội 9 chòi</summary>
        <div className="bc-rule-grid">
          <section>
            <b>1 · Chia bài</b>
            <p>Hội có 9 chòi. Mỗi chòi nhận 3 con bài khác nhau, dùng hết 27 con của bộ đang chơi.</p>
          </section>
          <section>
            <b>2 · Hô thai</b>
            <p>Anh Hiệu xóc ống bài tỳ, rút một con rồi hô câu thai. Sau đó tên con bài mới được xướng lên.</p>
          </section>
          <section>
            <b>3 · Gõ mõ</b>
            <p>Chòi có đúng con bài vừa xướng được ghi một lần trúng, đồng thời phát tiếng mõ nếu âm thanh đang bật.</p>
          </section>
          <section>
            <b>4 · Tới</b>
            <p>Chòi nào trúng đủ cả 3 con bài trước tiên sẽ “TỚI!”, phát nhịp trống thắng hội và dừng ván.</p>
          </section>
        </div>
        <p className="bc-cultural-note">
          Bài Chòi vừa là trò chơi vừa là nghệ thuật diễn xướng. Các câu hô thai trong bản web là
          <strong> câu minh họa mới do dự án biên soạn</strong>, không phải lời cổ truyền nguyên bản.
          Âm thanh v0.2 được tổng hợp trực tiếp bằng trình duyệt; phần đọc tên quân dùng giọng tiếng Việt của thiết bị nếu có.
        </p>
      </details>

      <footer>Minigame Việt · Bài Chòi v0.2 · Hội 9 chòi</footer>
    </main>
  );
}
