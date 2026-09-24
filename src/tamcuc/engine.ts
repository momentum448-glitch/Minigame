import type {
  TamCucCard,
  TamCucColor,
  TamCucPlayer,
  TamCucRank,
  TamCucState
} from './types';

export const TAM_CUC_RANKS: readonly TamCucRank[] = [
  'tuong',
  'si',
  'tuong-voi',
  'xe',
  'phao',
  'ma',
  'tot'
];

export const TAM_CUC_RANK_LABEL: Record<TamCucRank, string> = {
  tuong: 'Tướng',
  si: 'Sĩ',
  'tuong-voi': 'Tượng',
  xe: 'Xe',
  phao: 'Pháo',
  ma: 'Mã',
  tot: 'Tốt'
};

export const TAM_CUC_RANK_HAN: Record<TamCucRank, string> = {
  tuong: '將',
  si: '士',
  'tuong-voi': '象',
  xe: '車',
  phao: '砲',
  ma: '馬',
  tot: '卒'
};

const RANK_STRENGTH: Record<TamCucRank, number> = {
  tot: 0,
  ma: 1,
  phao: 2,
  xe: 3,
  'tuong-voi': 4,
  si: 5,
  tuong: 6
};

const COPIES: Record<TamCucRank, number> = {
  tuong: 1,
  si: 2,
  'tuong-voi': 2,
  xe: 2,
  phao: 2,
  ma: 2,
  tot: 5
};

export function otherTamCucPlayer(player: TamCucPlayer): TamCucPlayer {
  return player === 0 ? 1 : 0;
}

export function createTamCucDeck(): TamCucCard[] {
  const cards: TamCucCard[] = [];

  for (const color of ['red', 'black'] as const) {
    for (const rank of TAM_CUC_RANKS) {
      for (let copy = 0; copy < COPIES[rank]; copy += 1) {
        cards.push({
          id: `${color}-${rank}-${copy}`,
          color,
          rank,
          copy
        });
      }
    }
  }

  return cards;
}

export function shuffleTamCucDeck(
  deck: TamCucCard[],
  random: () => number = Math.random
): TamCucCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function sortHand(hand: TamCucCard[]): TamCucCard[] {
  return [...hand].sort((a, b) => {
    const rankDiff = RANK_STRENGTH[b.rank] - RANK_STRENGTH[a.rank];
    if (rankDiff !== 0) return rankDiff;
    if (a.color !== b.color) return a.color === 'red' ? -1 : 1;
    return a.copy - b.copy;
  });
}

export function createTamCucState(
  deck: TamCucCard[] = shuffleTamCucDeck(createTamCucDeck()),
  caller: TamCucPlayer = 0
): TamCucState {
  if (deck.length !== 32) {
    throw new Error('Tam Cúc cần đúng 32 lá.');
  }

  return {
    hands: [
      sortHand(deck.slice(0, 16)),
      sortHand(deck.slice(16))
    ],
    captured: [[], []],
    caller,
    round: 1,
    winner: null,
    lastResult: null,
    lastMessage: `Người chơi ${caller + 1} giữ cái và gọi lượt đầu.`
  };
}

export function cloneTamCucState(state: TamCucState): TamCucState {
  return {
    ...state,
    hands: [
      state.hands[0].map((card) => ({ ...card })),
      state.hands[1].map((card) => ({ ...card }))
    ],
    captured: [
      state.captured[0].map((card) => ({ ...card })),
      state.captured[1].map((card) => ({ ...card }))
    ],
    lastResult: state.lastResult
      ? {
          ...state.lastResult,
          lead: state.lastResult.lead.map((card) => ({ ...card })),
          response: state.lastResult.response.map((card) => ({ ...card }))
        }
      : null
  };
}

export function isFirstRoundAllowed(cards: TamCucCard[]): boolean {
  return cards.every((card) => card.rank !== 'tuong' && card.rank !== 'si');
}

export function isValidTamCucGroup(cards: TamCucCard[]): boolean {
  if (cards.length === 1) return true;

  if (cards.length === 2) {
    return (
      cards[0].rank === cards[1].rank &&
      cards[0].color === cards[1].color
    );
  }

  if (cards.length === 3) {
    const colors = new Set(cards.map((card) => card.color));
    if (colors.size !== 1) return false;

    const ranks = new Set(cards.map((card) => card.rank));
    const upper =
      ranks.has('tuong') &&
      ranks.has('si') &&
      ranks.has('tuong-voi') &&
      ranks.size === 3;
    const lower =
      ranks.has('xe') &&
      ranks.has('phao') &&
      ranks.has('ma') &&
      ranks.size === 3;

    return upper || lower;
  }

  return false;
}

function combinations<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];

  const walk = (start: number, chosen: T[]) => {
    if (chosen.length === size) {
      result.push([...chosen]);
      return;
    }

    for (let i = start; i <= items.length - (size - chosen.length); i += 1) {
      chosen.push(items[i]);
      walk(i + 1, chosen);
      chosen.pop();
    }
  };

  walk(0, []);
  return result;
}

export function legalTamCucLeadGroups(
  state: TamCucState,
  player: TamCucPlayer = state.caller
): TamCucCard[][] {
  if (state.winner !== null || player !== state.caller) return [];

  const hand = state.hands[player];
  const groups: TamCucCard[][] = [];

  for (const size of [1, 2, 3]) {
    for (const cards of combinations(hand, size)) {
      if (!isValidTamCucGroup(cards)) continue;
      if (state.round === 1 && !isFirstRoundAllowed(cards)) continue;
      groups.push(cards);
    }
  }

  return groups;
}

export function legalTamCucResponseGroups(
  state: TamCucState,
  lead: TamCucCard[],
  player: TamCucPlayer = otherTamCucPlayer(state.caller)
): TamCucCard[][] {
  if (state.winner !== null) return [];

  return combinations(state.hands[player], lead.length).filter((cards) => {
    if (!isValidTamCucGroup(cards)) return false;
    if (state.round === 1 && !isFirstRoundAllowed(cards)) return false;
    return true;
  });
}

function groupKind(cards: TamCucCard[]): number {
  if (cards.length !== 3) return 0;
  return cards.some((card) => card.rank === 'tuong') ? 1 : 0;
}

export function tamCucGroupStrength(cards: TamCucCard[]): number {
  if (!isValidTamCucGroup(cards)) return -Infinity;

  const colorBonus = cards[0].color === 'red' ? 1 : 0;

  if (cards.length === 3) {
    return groupKind(cards) * 10 + colorBonus;
  }

  return RANK_STRENGTH[cards[0].rank] * 2 + colorBonus;
}

export function compareTamCucGroups(
  lead: TamCucCard[],
  response: TamCucCard[]
): number {
  if (lead.length !== response.length) {
    throw new Error('Hai bên phải ra cùng số cây.');
  }
  if (!isValidTamCucGroup(lead) || !isValidTamCucGroup(response)) {
    throw new Error('Chỉ so sánh bộ Tam Cúc hợp lệ.');
  }

  return tamCucGroupStrength(response) - tamCucGroupStrength(lead);
}

function ids(cards: TamCucCard[]): Set<string> {
  return new Set(cards.map((card) => card.id));
}

function cardsBelongToHand(hand: TamCucCard[], cards: TamCucCard[]): boolean {
  const handIds = new Set(hand.map((card) => card.id));
  const cardIds = ids(cards);
  return cardIds.size === cards.length && cards.every((card) => handIds.has(card.id));
}

function removeCards(hand: TamCucCard[], cards: TamCucCard[]): TamCucCard[] {
  const removing = ids(cards);
  return hand.filter((card) => !removing.has(card.id));
}

export function resolveTamCucRound(
  input: TamCucState,
  lead: TamCucCard[],
  response: TamCucCard[],
  responseRevealed: boolean
): TamCucState {
  if (input.winner !== null) return input;

  const caller = input.caller;
  const responder = otherTamCucPlayer(caller);

  if (!cardsBelongToHand(input.hands[caller], lead)) return input;
  if (!cardsBelongToHand(input.hands[responder], response)) return input;
  if (!isValidTamCucGroup(lead)) return input;
  if (lead.length < 1 || lead.length > 3 || response.length !== lead.length) return input;
  if (input.round === 1 && !isFirstRoundAllowed(lead)) return input;

  if (responseRevealed) {
    if (!isValidTamCucGroup(response)) return input;
    if (input.round === 1 && !isFirstRoundAllowed(response)) return input;
  }

  const state = cloneTamCucState(input);
  state.hands[caller] = removeCards(state.hands[caller], lead);
  state.hands[responder] = removeCards(state.hands[responder], response);

  const responseWins =
    responseRevealed &&
    compareTamCucGroups(lead, response) > 0;

  const roundWinner: TamCucPlayer = responseWins ? responder : caller;
  state.captured[roundWinner].push(...lead, ...response);
  state.caller = roundWinner;
  state.lastResult = {
    lead: lead.map((card) => ({ ...card })),
    response: response.map((card) => ({ ...card })),
    responseRevealed,
    winner: roundWinner
  };

  const handEmpty = state.hands[0].length === 0 && state.hands[1].length === 0;
  if (handEmpty) {
    const score0 = state.captured[0].length;
    const score1 = state.captured[1].length;
    state.winner = score0 === score1 ? 'draw' : score0 > score1 ? 0 : 1;
    state.lastMessage =
      state.winner === 'draw'
        ? `Hòa ${score0}–${score1} lá ăn được.`
        : `Người chơi ${state.winner + 1} thắng ${Math.max(score0, score1)}–${Math.min(score0, score1)} lá.`;
    return state;
  }

  state.round += 1;
  state.lastMessage = responseRevealed
    ? `Người chơi ${roundWinner + 1} ăn lượt và giữ cái.`
    : `Người chơi ${responder + 1} chui. Người chơi ${caller + 1} ăn lượt và giữ cái.`;

  return state;
}

export function cardLabel(card: TamCucCard): string {
  const color = card.color === 'red' ? 'Đỏ' : 'Đen';
  if (card.rank === 'tuong') return card.color === 'red' ? 'Tướng Ông' : 'Tướng Bà';
  if (card.rank === 'si' && card.color === 'red') return 'Sĩ Điều';
  return `${TAM_CUC_RANK_LABEL[card.rank]} ${color}`;
}
