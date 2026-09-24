import { useEffect, useMemo, useRef, useState } from 'react';
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

interface ChantSegment {
  text: string;
  pitch: number;
  rate: number;
  pause: number;
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

const CHANT_PREVIEWS: Record<string, ChantSegment[]> = {
  'Ông Ầm': [
    { text: 'Nghe đâu… một tiếng vang rền…', pitch: 0.82, rate: 0.68, pause: 120 },
    { text: 'bước chân rộn rã…', pitch: 1.08, rate: 0.72, pause: 90 },
    { text: 'cả miền hội xuân…', pitch: 1.22, rate: 0.64, pause: 0 }
  ],
  'Ba Gà': [
    { text: 'Sáng ra… gà gáy ba hồi…', pitch: 1.18, rate: 0.7, pause: 110 },
    { text: 'giục người mở cửa…', pitch: 0.94, rate: 0.7, pause: 90 },
    { text: 'ra coi hội làng…', pitch: 1.12, rate: 0.62, pause: 0 }
  ],
  'Cửu Chùa': [
    { text: 'Chín hồi chuông vọng… mái chùa…', pitch: 0.78, rate: 0.64, pause: 130 },
    { text: 'người nghe câu hát…', pitch: 0.96, rate: 0.68, pause: 90 },
    { text: 'đón mùa an vui…', pitch: 1.14, rate: 0.6, pause: 0 }
  ]
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
  const [chantEnabled, setChantEnabled] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);

  const winner = useMemo(
    () => state.winnerHutId === null
      ? null
      : state.huts.find((hut) => hut.id === state.winnerHutId) ?? null,
    [state]
  );

  const voiceOptions = useMemo(() => {
    const vietnamese = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith('vi')
    );
    return vietnamese.length > 0 ? vietnamese : voices.slice(0, 12);
  }, [voices]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const next = window.speechSynthesis.getVoices();
      setVoices(next);

      if (!voiceURI && next.length > 0) {
        const vietnamese = next.find((voice) =>
          voice.lang.toLowerCase().startsWith('vi')
        );
        setVoiceURI((vietnamese ?? next[0]).voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [voiceURI]);

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

  const selectedVoice = () =>
    voices.find((voice) => voice.voiceURI === voiceURI) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('vi')) ??
    voices[0] ??
    null;

  const makeNoise = (context: AudioContext, duration: number) => {
    const length = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      const decay = Math.pow(1 - i / length, 2.4);
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    return buffer;
  };

  const playDrumHit = (offset = 0, strength = 1) => {
    const context = ensureAudio();
    if (!context) return;

    const start = context.currentTime + offset;

    const body = context.createOscillator();
    const bodyGain = context.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(165, start);
    body.frequency.exponentialRampToValueAtTime(54, start + .23);
    bodyGain.gain.setValueAtTime(.0001, start);
    bodyGain.gain.exponentialRampToValueAtTime(.42 * strength, start + .008);
    bodyGain.gain.exponentialRampToValueAtTime(.0001, start + .42);
    body.connect(bodyGain);
    bodyGain.connect(context.destination);
    body.start(start);
    body.stop(start + .45);

    const skin = context.createBufferSource();
    const skinFilter = context.createBiquadFilter();
    const skinGain = context.createGain();
    skin.buffer = makeNoise(context, .2);
    skinFilter.type = 'lowpass';
    skinFilter.frequency.setValueAtTime(950, start);
    skinFilter.Q.setValueAtTime(.7, start);
    skinGain.gain.setValueAtTime(.24 * strength, start);
    skinGain.gain.exponentialRampToValueAtTime(.0001, start + .18);
    skin.connect(skinFilter);
    skinFilter.connect(skinGain);
    skinGain.connect(context.destination);
    skin.start(start);
  };

  const playWoodKnock = (offset = 0) => {
    const context = ensureAudio();
    if (!context) return;

    const hit = (when: number, frequency: number) => {
      const start = context.currentTime + when;
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      source.buffer = makeNoise(context, .08);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency, start);
      filter.Q.setValueAtTime(9, start);
      gain.gain.setValueAtTime(.32, start);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .085);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      source.start(start);

      const ring = context.createOscillator();
      const ringGain = context.createGain();
      ring.type = 'triangle';
      ring.frequency.setValueAtTime(frequency * .78, start);
      ringGain.gain.setValueAtTime(.13, start);
      ringGain.gain.exponentialRampToValueAtTime(.0001, start + .11);
      ring.connect(ringGain);
      ringGain.connect(context.destination);
      ring.start(start);
      ring.stop(start + .12);
    };

    hit(offset, 1220);
    hit(offset + .13, 980);
  };

  const playDrumCue = () => {
    playDrumHit(0, 1);
    playDrumHit(.34, .82);
  };

  const playWinnerFanfare = () => {
    playDrumHit(0, 1.05);
    playDrumHit(.25, 1);
    playDrumHit(.5, 1.12);
    playWoodKnock(.1);
    playWoodKnock(.62);
  };

  const speakText = (
    text: string,
    pitch: number,
    rate: number,
    onEnd?: () => void
  ) => {
    if (!soundEnabled || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = .96;

    const voice = selectedVoice();
    if (voice) utterance.voice = voice;
    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
  };

  const performThai = (card: BaiChoiCard) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const preview = chantEnabled ? CHANT_PREVIEWS[card.name] : undefined;

    if (!preview) {
      speakText(HINTS[card.name], 1.02, .76);
      return;
    }

    const singSegment = (index: number) => {
      const segment = preview[index];
      if (!segment) return;

      speakText(segment.text, segment.pitch, segment.rate, () => {
        if (index + 1 < preview.length) {
          window.setTimeout(() => singSegment(index + 1), segment.pause);
        }
      });
    };

    singSegment(0);
  };

  const speakCardName = (name: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    speakText(name, .9, .8);
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

    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 700;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(.12, start + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .09);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + .11);
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

    window.setTimeout(() => performThai(next), 430);
  };

  const revealCard = () => {
    if (!pending || phase !== 'thai') return;

    const nextState = drawNextBaiChoiCard(state);
    const owner = nextState.huts.find((hut) => hutHasCard(hut, pending.id)) ?? null;

    speakCardName(pending.name);
    if (owner) {
      window.setTimeout(() => playWoodKnock(), 240);
    }
    if (nextState.winnerHutId !== null) {
      window.setTimeout(() => playWinnerFanfare(), 620);
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

      <section className="controls bc-controls" aria-label="Thiết lập Bài Chòi">
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

        <label className="bc-voice-control">
          Giọng xướng
          <select
            value={voiceURI}
            disabled={voiceOptions.length === 0}
            onChange={(event) => setVoiceURI(event.target.value)}
          >
            {voiceOptions.length === 0 ? (
              <option value="">Giọng hệ thống</option>
            ) : (
              voiceOptions.map((voice) => (
                <option value={voice.voiceURI} key={voice.voiceURI}>
                  {voice.name} · {voice.lang}
                </option>
              ))
            )}
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

        <button
          className={`bc-chant-toggle ${chantEnabled ? 'on' : 'off'}`}
          type="button"
          aria-pressed={chantEnabled}
          disabled={!soundEnabled}
          onClick={() => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            setChantEnabled((value) => !value);
          }}
        >
          {chantEnabled ? '🎶 Diễn xướng thử: Bật' : '🎙️ Diễn xướng thử: Tắt'}
        </button>

        <div className="rule-chip">9 chòi · 27 con · đủ 3 là TỚI</div>
      </section>

      <p className="bc-audio-note">
        🎶 Ba câu đang có prototype diễn xướng nhiều nhịp: <strong>Ông Ầm · Ba Gà · Cửu Chùa</strong>.
        Các câu còn lại dùng giọng xướng đã chọn.
      </p>

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
                {CHANT_PREVIEWS[pending.name] && chantEnabled && (
                  <span className="bc-chant-badge">🎶 CÂU DIỄN XƯỚNG THỬ</span>
                )}
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
        <summary>Luật Bài Chòi v0.3 · cách chơi hội 9 chòi</summary>
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
          v0.3 nâng tiếng trống/mõ bằng tổng hợp noise + filter; ba câu diễn xướng thử dùng nhiều đoạn Speech Synthesis với nhịp, cao độ và tốc độ khác nhau.
          Đây vẫn là prototype kỹ thuật, chưa phải bản thu nghệ nhân.
        </p>
      </details>

      <footer>Minigame Việt · Bài Chòi v0.3 · Voice prototype</footer>
    </main>
  );
}
