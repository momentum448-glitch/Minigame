import { useEffect, useState } from 'react';
import OAnQuanGame from './OAnQuanGame';
import CoGanhGame from './CoGanhGame';

type AppRoute = 'home' | 'o-an-quan' | 'co-ganh';

function routeFromHash(): AppRoute {
  if (window.location.hash === '#/o-an-quan') return 'o-an-quan';
  if (window.location.hash === '#/co-ganh') return 'co-ganh';
  return 'home';
}

const plannedGames = [
  {
    id: 'bau-cua',
    title: 'Bầu cua',
    description: 'Một góc may rủi vui nhộn cho kho game sau này.',
    glyph: '◉'
  },
  {
    id: 'co-ca-ngua',
    title: 'Cờ cá ngựa',
    description: 'Đường đua bàn cờ quen thuộc, đang chờ đến lượt.',
    glyph: '♞'
  }
];

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => routeFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openOAnQuan = () => {
    window.location.hash = '/o-an-quan';
    setRoute('o-an-quan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCoGanh = () => {
    window.location.hash = '/co-ganh';
    setRoute('co-ganh');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    window.location.hash = '';
    setRoute('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (route === 'o-an-quan') {
    return <OAnQuanGame onBack={goHome} />;
  }

  if (route === 'co-ganh') {
    return <CoGanhGame onBack={goHome} />;
  }

  return (
    <main className="hub-shell">
      <header className="hub-hero">
        <div className="hub-brand-row">
          <div className="hub-mark" aria-hidden="true">M</div>
          <div>
            <p className="eyebrow">MINIGAME VIỆT</p>
            <p className="hub-kicker">Một góc nhỏ cho những ván chơi lớn.</p>
          </div>
        </div>

        <div className="hub-title-block">
          <p className="hub-overline">KHO TRÒ CHƠI</p>
          <h1>Chọn một trò,<br />bắt đầu một ván.</h1>
          <p className="hub-lead">
            Mỗi game là một bàn chơi riêng. Hôm nay mở Ô ăn quan, những ô còn lại sẽ dần sáng đèn.
          </p>
        </div>
      </header>

      <section className="game-library" aria-labelledby="game-library-title">
        <div className="library-heading">
          <div>
            <p className="eyebrow">ĐANG CÓ</p>
            <h2 id="game-library-title">Kho game</h2>
          </div>
          <span className="library-count">2 game chơi được</span>
        </div>

        <div className="game-grid">
          <button className="game-tile game-tile-live" type="button" onClick={openOAnQuan}>
            <div className="game-art oan-art" aria-hidden="true">
              <div className="oan-mini-board">
                <span className="oan-mini-quan" />
                <span /><span /><span /><span /><span />
                <span /><span /><span /><span /><span />
                <span className="oan-mini-quan" />
              </div>
            </div>

            <div className="game-tile-copy">
              <div className="game-tile-meta">
                <span className="live-dot" />
                <span>Chơi ngay</span>
              </div>
              <h3>Ô ăn quan</h3>
              <p>Rải từng viên sỏi, tính từng nhịp ăn quân, đấu bạn hoặc thử sức với AI.</p>
              <span className="play-cta">Vào bàn chơi <b>→</b></span>
            </div>
          </button>

          <button className="game-tile game-tile-live" type="button" onClick={openCoGanh}>
            <div className="game-art ganh-art" aria-hidden="true">
              <div className="ganh-mini-board">
                {Array.from({ length: 25 }, (_, index) => (
                  <span
                    key={index}
                    className={
                      [0, 1, 2, 3, 4, 5, 9, 14].includes(index)
                        ? 'ganh-mini-piece red'
                        : [10, 15, 19, 20, 21, 22, 23, 24].includes(index)
                          ? 'ganh-mini-piece brown'
                          : 'ganh-mini-point'
                    }
                  />
                ))}
              </div>
            </div>
            <div className="game-tile-copy">
              <div className="game-tile-meta">
                <span className="live-dot" />
                <span>Chơi ngay</span>
              </div>
              <h3>Cờ Gánh</h3>
              <p>Gánh, Vây và gài thế Mở trên bàn cờ 25 giao điểm của xứ Quảng.</p>
              <span className="play-cta">Vào bàn chơi <b>→</b></span>
            </div>
          </button>

          {plannedGames.map((game) => (
            <article className="game-tile game-tile-coming" key={game.id} aria-disabled="true">
              <div className="game-art coming-art" aria-hidden="true">
                <span className="coming-glyph">{game.glyph}</span>
              </div>
              <div className="game-tile-copy">
                <div className="game-tile-meta"><span>Sắp có</span></div>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <span className="coming-cta">Chưa mở</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="hub-footer">
        Minigame Việt · xây từng game một, giữ mỗi game một cá tính riêng.
      </footer>
    </main>
  );
}
