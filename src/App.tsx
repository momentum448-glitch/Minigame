import { useEffect, useMemo, useState } from 'react';
import OAnQuanGame from './OAnQuanGame';
import CoGanhGame from './CoGanhGame';
import CoHumGame from './CoHumGame';
import CoLuaNgoGame from './CoLuaNgoGame';
import TamCucGame from './TamCucGame';
import BaiChoiGame from './BaiChoiGame';
import MonsterChessGame from './MonsterChessGame';

type GameId =
  | 'o-an-quan'
  | 'co-ganh'
  | 'co-hum'
  | 'co-lua-ngo'
  | 'tam-cuc'
  | 'bai-choi'
  | 'monster-chess';

type CategoryId =
  | 'vietnamese-folk'
  | 'world-folk'
  | 'modern'
  | 'puzzle'
  | 'strategy'
  | 'party';

type AppRoute = 'home' | GameId | `category/${CategoryId}`;

interface GameMeta {
  id: GameId;
  title: string;
  description: string;
  cta: string;
  categories: CategoryId[];
  eyebrow?: string;
}

interface CategoryMeta {
  id: CategoryId;
  icon: string;
  title: string;
  description: string;
  accent: string;
  gameIds: GameId[];
  note: string;
}

const games: GameMeta[] = [
  {
    id: 'o-an-quan',
    title: 'Ô ăn quan',
    description: 'Rải từng viên sỏi, tính từng nhịp ăn quân, đấu bạn hoặc thử sức với AI.',
    cta: 'Vào bàn chơi',
    categories: ['vietnamese-folk']
  },
  {
    id: 'co-ganh',
    title: 'Cờ Gánh',
    description: 'Gánh, Vây và gài thế Mở trên bàn cờ 25 giao điểm của xứ Quảng.',
    cta: 'Vào bàn chơi',
    categories: ['vietnamese-folk', 'strategy']
  },
  {
    id: 'co-hum',
    title: 'Cờ Hùm',
    description: 'Một Hùm săn 15 Trâu, còn đàn Trâu thắng bằng cách khép kín mọi đường thoát.',
    cta: 'Vào bàn chơi',
    categories: ['vietnamese-folk', 'strategy']
  },
  {
    id: 'co-lua-ngo',
    title: 'Cờ Lúa Ngô',
    description: 'Đi đủ năm nhịp Lúa · Ngô · Khoai · Sắn · Đỗ và tính điểm rơi để ăn quân.',
    cta: 'Vào bàn chơi',
    categories: ['vietnamese-folk', 'strategy']
  },
  {
    id: 'tam-cuc',
    title: 'Tam Cúc',
    description: 'Gọi một, đôi hoặc ba cây, úp xuống chiếu rồi ngửa bài tranh cái.',
    cta: 'Vào chiếu bài',
    categories: ['vietnamese-folk', 'party']
  },
  {
    id: 'bai-choi',
    title: 'Bài Chòi',
    description: 'Nghe Anh Hiệu hô thai, chờ trúng đủ ba con bài và reo “Tới!” giữa hội 9 chòi.',
    cta: 'Vào hội chơi',
    categories: ['vietnamese-folk', 'party'],
    eyebrow: 'Đang hoàn thiện audio'
  },
  {
    id: 'monster-chess',
    title: 'Monster Chess',
    description: 'Draft đội quái bằng ngân sách sao, tiến hóa giữa trận và đấu chiến thuật trên bản đồ hex ngẫu nhiên.',
    cta: 'Vào prototype',
    categories: ['modern', 'strategy'],
    eyebrow: 'Prototype v0.1'
  }
];

const categories: CategoryMeta[] = [
  {
    id: 'vietnamese-folk',
    icon: '🇻🇳',
    title: 'Dân gian Việt Nam',
    description: 'Những trò chơi, bàn cờ và cuộc vui truyền thống được số hóa theo tinh thần Việt.',
    accent: 'viet',
    gameIds: games.filter((game) => game.categories.includes('vietnamese-folk')).map((game) => game.id),
    note: '6 game đang chơi được'
  },
  {
    id: 'world-folk',
    icon: '🌏',
    title: 'Dân gian thế giới',
    description: 'Khám phá trò chơi truyền thống từ nhiều nền văn hóa và nhiều thời đại.',
    accent: 'world',
    gameIds: [],
    note: 'Đang chuẩn bị'
  },
  {
    id: 'modern',
    icon: '🎮',
    title: 'Game hiện đại',
    description: 'Mini arcade, phản xạ, roguelite và những ý tưởng mới dành cho vài phút giải lao.',
    accent: 'modern',
    gameIds: games.filter((game) => game.categories.includes('modern')).map((game) => game.id),
    note: '1 game đang chơi được'
  },
  {
    id: 'puzzle',
    icon: '🧩',
    title: 'Giải đố & Logic',
    description: 'Những câu đố gọn, bàn chơi logic và thử thách tư duy có thể vào chơi ngay.',
    accent: 'puzzle',
    gameIds: [],
    note: 'Đang chuẩn bị'
  },
  {
    id: 'strategy',
    icon: '♟️',
    title: 'Chiến thuật',
    description: 'Các game thiên về đọc thế, tính đường đi và khóa không gian của đối thủ.',
    accent: 'strategy',
    gameIds: games.filter((game) => game.categories.includes('strategy')).map((game) => game.id),
    note: '3 game đang chơi được'
  },
  {
    id: 'party',
    icon: '🎲',
    title: 'May rủi & Party',
    description: 'Nhẹ luật, vui nhanh và hợp những ván chơi mang tính hội hè hoặc bất ngờ.',
    accent: 'party',
    gameIds: games.filter((game) => game.categories.includes('party')).map((game) => game.id),
    note: '2 game đang chơi được'
  }
];

const gameById = Object.fromEntries(games.map((game) => [game.id, game])) as Record<GameId, GameMeta>;
const categoryById = Object.fromEntries(categories.map((category) => [category.id, category])) as Record<CategoryId, CategoryMeta>;

function routeFromHash(): AppRoute {
  const raw = window.location.hash.replace(/^#\/?/, '');

  if (games.some((game) => game.id === raw)) return raw as GameId;

  if (raw.startsWith('category/')) {
    const categoryId = raw.slice('category/'.length) as CategoryId;
    if (categories.some((category) => category.id === categoryId)) {
      return `category/${categoryId}`;
    }
  }

  return 'home';
}

function renderGameArt(id: GameId) {
  if (id === 'o-an-quan') {
    return (
      <div className="game-art oan-art" aria-hidden="true">
        <div className="oan-mini-board">
          <span className="oan-mini-quan" />
          <span /><span /><span /><span /><span />
          <span /><span /><span /><span /><span />
          <span className="oan-mini-quan" />
        </div>
      </div>
    );
  }

  if (id === 'co-ganh') {
    return (
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
    );
  }

  if (id === 'co-hum') {
    return (
      <div className="game-art hum-art" aria-hidden="true">
        <div className="hum-mini-board">
          <span className="hum-mini-tiger" />
          {Array.from({ length: 10 }, (_, index) => (
            <span className="hum-mini-buffalo" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (id === 'co-lua-ngo') {
    return (
      <div className="game-art luango-art" aria-hidden="true">
        <div className="luango-mini-board">
          <span className="lnm p1 a" /><span className="lnm p1 b" />
          <span className="lnm p1 c" /><span className="lnm p1 d" />
          <span className="lnm p0 e" /><span className="lnm p0 f" />
          <span className="lnm p0 g" /><span className="lnm p0 h" />
        </div>
      </div>
    );
  }

  if (id === 'tam-cuc') {
    return (
      <div className="game-art tamcuc-art" aria-hidden="true">
        <div className="tamcuc-mini-fan">
          <span className="red">將</span>
          <span>車</span>
          <span className="red">馬</span>
          <span>卒</span>
        </div>
      </div>
    );
  }

  if (id === 'monster-chess') {
    return (
      <div className="game-art monsterchess-art" aria-hidden="true">
        <div className="mc-mini-hexes">
          {Array.from({ length: 19 }, (_, index) => <span key={index} />)}
          <b className="mc-mini-a">⚡</b>
          <b className="mc-mini-b">🐉</b>
        </div>
      </div>
    );
  }

  return (
    <div className="game-art baichoi-art" aria-hidden="true">
      <div className="baichoi-mini-stage">
        <span className="bc-mini-hut h1" />
        <span className="bc-mini-hut h2" />
        <span className="bc-mini-hut h3" />
        <span className="bc-mini-hut h4" />
        <span className="bc-mini-hut h5" />
        <span className="bc-mini-hut h6" />
        <span className="bc-mini-hut h7" />
        <span className="bc-mini-hut h8" />
        <span className="bc-mini-hut h9" />
        <span className="bc-mini-hieu">♪</span>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => routeFromHash());
  const [lastCategory, setLastCategory] = useState<CategoryId | null>(null);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: AppRoute) => {
    window.location.hash = next === 'home' ? '' : `/${next}`;
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategory = (categoryId: CategoryId) => {
    navigate(`category/${categoryId}`);
  };

  const openGame = (gameId: GameId, fromCategory?: CategoryId | null) => {
    setLastCategory(fromCategory ?? null);
    navigate(gameId);
  };

  const returnFromGame = () => {
    if (lastCategory) {
      openCategory(lastCategory);
      return;
    }
    navigate('home');
  };

  if (route === 'o-an-quan') return <OAnQuanGame onBack={returnFromGame} />;
  if (route === 'co-ganh') return <CoGanhGame onBack={returnFromGame} />;
  if (route === 'co-hum') return <CoHumGame onBack={returnFromGame} />;
  if (route === 'co-lua-ngo') return <CoLuaNgoGame onBack={returnFromGame} />;
  if (route === 'tam-cuc') return <TamCucGame onBack={returnFromGame} />;
  if (route === 'bai-choi') return <BaiChoiGame onBack={returnFromGame} />;
  if (route === 'monster-chess') return <MonsterChessGame onBack={returnFromGame} />;

  const currentCategoryId = route.startsWith('category/')
    ? route.slice('category/'.length) as CategoryId
    : null;
  const currentCategory = currentCategoryId ? categoryById[currentCategoryId] : null;

  if (currentCategory) {
    const categoryGames = currentCategory.gameIds.map((id) => gameById[id]);

    return (
      <main className="hub-shell category-shell">
        <header className={`category-hero category-${currentCategory.accent}`}>
          <button className="hub-back-button" type="button" onClick={() => navigate('home')}>
            ← Sảnh game
          </button>

          <div className="category-hero-icon" aria-hidden="true">{currentCategory.icon}</div>
          <p className="eyebrow">BỘ SƯU TẬP</p>
          <h1>{currentCategory.title}</h1>
          <p>{currentCategory.description}</p>
          <span className="category-count-chip">{currentCategory.note}</span>
        </header>

        <section className="game-library" aria-labelledby="category-games-title">
          <div className="library-heading">
            <div>
              <p className="eyebrow">{categoryGames.length > 0 ? 'CHƠI NGAY' : 'ĐANG XÂY KHO'}</p>
              <h2 id="category-games-title">
                {categoryGames.length > 0 ? 'Game trong danh mục' : 'Danh mục này sẽ sớm có game'}
              </h2>
            </div>
            <span className="library-count">{categoryGames.length} game</span>
          </div>

          {categoryGames.length > 0 ? (
            <div className="game-grid">
              {categoryGames.map((game) => (
                <button
                  className="game-tile game-tile-live"
                  type="button"
                  key={game.id}
                  onClick={() => openGame(game.id, currentCategory.id)}
                >
                  {renderGameArt(game.id)}
                  <div className="game-tile-copy">
                    <div className="game-tile-meta">
                      <span className="live-dot" />
                      <span>{game.eyebrow ?? 'Chơi ngay'}</span>
                    </div>
                    <h3>{game.title}</h3>
                    <p>{game.description}</p>
                    <span className="play-cta">{game.cta} <b>→</b></span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-category-card">
              <span className="empty-category-icon" aria-hidden="true">{currentCategory.icon}</span>
              <div>
                <h3>Chiếc kệ này còn trống.</h3>
                <p>
                  Kiến trúc đã sẵn sàng. Khi thêm game mới, chúng sẽ xuất hiện ở đây mà không cần đổi lại trang chủ.
                </p>
              </div>
              <button type="button" onClick={() => navigate('home')}>Khám phá danh mục khác</button>
            </div>
          )}
        </section>

        <footer className="hub-footer">
          Kho Minigame · một game có thể xuất hiện ở nhiều danh mục.
        </footer>
      </main>
    );
  }

  const featuredIds: GameId[] = ['monster-chess', 'o-an-quan', 'co-ganh'];
  const featuredGames = featuredIds.map((id) => gameById[id]);
  const playableCategories = categories.filter((category) => category.gameIds.length > 0);

  return (
    <main className="hub-shell lobby-shell">
      <header className="lobby-hero">
        <div className="hub-brand-row">
          <div className="hub-mark" aria-hidden="true">M</div>
          <div>
            <p className="eyebrow">KHO MINIGAME</p>
            <p className="hub-kicker">Một sảnh nhỏ, nhiều thế giới chơi.</p>
          </div>
        </div>

        <div className="lobby-title-grid">
          <div className="hub-title-block">
            <p className="hub-overline">SẢNH GAME</p>
            <h1>Hôm nay<br />chơi gì?</h1>
            <p className="hub-lead">
              Từ trò chơi dân gian Việt Nam đến game thế giới, giải đố, chiến thuật và những minigame hiện đại.
              Chọn một cánh cửa rồi bắt đầu.
            </p>
          </div>

          <div className="lobby-stat-panel">
            <div><strong>{games.length}</strong><span>game đang chơi được</span></div>
            <div><strong>{playableCategories.length}</strong><span>danh mục đã có game</span></div>
            <div><strong>∞</strong><span>chỗ cho game mới</span></div>
          </div>
        </div>
      </header>

      <section className="category-library" aria-labelledby="category-library-title">
        <div className="library-heading">
          <div>
            <p className="eyebrow">KHÁM PHÁ</p>
            <h2 id="category-library-title">Chọn một thế giới chơi</h2>
          </div>
          <span className="library-count">{categories.length} danh mục</span>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-tile category-tile-${category.accent} ${category.gameIds.length === 0 ? 'category-coming' : ''}`}
              onClick={() => openCategory(category.id)}
            >
              <span className="category-tile-icon" aria-hidden="true">{category.icon}</span>
              <span className="category-tile-status">
                {category.gameIds.length > 0 ? category.note : 'Mở rộng sau'}
              </span>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <span className="category-tile-cta">
                {category.gameIds.length > 0 ? 'Mở danh mục' : 'Xem trước'} <b>→</b>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="featured-library" aria-labelledby="featured-games-title">
        <div className="library-heading">
          <div>
            <p className="eyebrow">CHƠI NHANH</p>
            <h2 id="featured-games-title">Game nổi bật</h2>
          </div>
          <button className="text-link-button" type="button" onClick={() => openCategory('vietnamese-folk')}>
            Xem Dân gian Việt Nam →
          </button>
        </div>

        <div className="featured-game-row">
          {featuredGames.map((game) => (
            <button
              className="featured-game-card"
              type="button"
              key={game.id}
              onClick={() => openGame(game.id, null)}
            >
              {renderGameArt(game.id)}
              <div>
                <span>{game.eyebrow ?? 'Chơi ngay'}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <footer className="hub-footer">
        Kho Minigame · dân gian, hiện đại, chiến thuật, giải đố và còn nhiều nữa.
      </footer>
    </main>
  );
}
