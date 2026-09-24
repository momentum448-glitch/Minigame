import type {
  BaiChoiCard,
  BaiChoiHut,
  BaiChoiMode,
  BaiChoiState
} from './types';

export const BAI_CHOI_CARD_NAMES = [
  'Ông Ầm',
  'Tứ Cẳng',
  'Bạch Huê',
  'Chín Gối',
  'Sáu Ghe',
  'Năm Dụm',
  'Tứ Xách',
  'Nhì Nghèo',
  'Ba Gà',
  'Tứ Tượng',
  'Tám Dùng',
  'Ngũ Trợt',
  'Tứ Móc',
  'Tam Quăng',
  'Bánh Hai',
  'Cửu Điều',
  'Ba Bụng',
  'Chín Cu',
  'Nhứt Nọc',
  'Thất Vung',
  'Bát Bồng',
  'Lục Chạng',
  'Tám Miểng',
  'Nhứt Trò',
  'Bảy Thưa',
  'Bảy Liễu',
  'Cửu Chùa'
] as const;

export function createBaiChoiDeck(): BaiChoiCard[] {
  return BAI_CHOI_CARD_NAMES.map((name, index) => ({
    id: `bc-${index + 1}`,
    name
  }));
}

export function shuffleBaiChoiCards(
  cards: BaiChoiCard[],
  random: () => number = Math.random
): BaiChoiCard[] {
  const next = [...cards];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function ownerForHut(index: number, mode: BaiChoiMode): BaiChoiHut['owner'] {
  if (index === 0) return 'human-1';
  if (mode === 'local' && index === 1) return 'human-2';
  return 'bot';
}

export function createBaiChoiState(
  mode: BaiChoiMode = 'solo',
  dealOrder: BaiChoiCard[] = shuffleBaiChoiCards(createBaiChoiDeck()),
  drawOrder: BaiChoiCard[] = shuffleBaiChoiCards(createBaiChoiDeck())
): BaiChoiState {
  if (dealOrder.length !== 27 || drawOrder.length !== 27) {
    throw new Error('Hội 9 chòi cần đúng 27 con bài.');
  }

  const dealIds = new Set(dealOrder.map((card) => card.id));
  const drawIds = new Set(drawOrder.map((card) => card.id));
  if (dealIds.size !== 27 || drawIds.size !== 27) {
    throw new Error('Bộ Bài Chòi không được có quân trùng id.');
  }

  const huts: BaiChoiHut[] = Array.from({ length: 9 }, (_, index) => ({
    id: index,
    owner: ownerForHut(index, mode),
    cards: dealOrder.slice(index * 3, index * 3 + 3),
    hits: []
  }));

  return {
    huts,
    drawPile: [...drawOrder],
    drawn: [],
    lastDraw: null,
    winnerHutId: null,
    turn: 0,
    mode
  };
}

export function peekNextBaiChoiCard(state: BaiChoiState): BaiChoiCard | null {
  if (state.winnerHutId !== null) return null;
  return state.drawPile[state.turn] ?? null;
}

export function drawNextBaiChoiCard(state: BaiChoiState): BaiChoiState {
  if (state.winnerHutId !== null) return state;

  const card = peekNextBaiChoiCard(state);
  if (!card) return state;

  let winnerHutId: number | null = null;
  const huts = state.huts.map((hut) => {
    const ownsCard = hut.cards.some((item) => item.id === card.id);
    if (!ownsCard || hut.hits.includes(card.id)) {
      return {
        ...hut,
        cards: hut.cards.map((item) => ({ ...item })),
        hits: [...hut.hits]
      };
    }

    const hits = [...hut.hits, card.id];
    if (hits.length === 3) winnerHutId = hut.id;

    return {
      ...hut,
      cards: hut.cards.map((item) => ({ ...item })),
      hits
    };
  });

  return {
    ...state,
    huts,
    drawn: [...state.drawn, card.id],
    lastDraw: { ...card },
    winnerHutId,
    turn: state.turn + 1
  };
}

export function hutHasCard(hut: BaiChoiHut, cardId: string): boolean {
  return hut.cards.some((card) => card.id === cardId);
}
