import {
  compareTamCucGroups,
  legalTamCucLeadGroups,
  legalTamCucResponseGroups,
  tamCucGroupStrength
} from './engine';
import type {
  TamCucAiLevel,
  TamCucCard,
  TamCucPlayer,
  TamCucState
} from './types';

export interface TamCucAiResponse {
  cards: TamCucCard[];
  reveal: boolean;
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function cheapestCards(hand: TamCucCard[], count: number): TamCucCard[] {
  return [...hand]
    .sort((a, b) => {
      const aValue = tamCucGroupStrength([a]);
      const bValue = tamCucGroupStrength([b]);
      return aValue - bValue;
    })
    .slice(0, count);
}

export function chooseTamCucLead(
  state: TamCucState,
  level: TamCucAiLevel,
  aiPlayer: TamCucPlayer
): TamCucCard[] | null {
  if (state.caller !== aiPlayer || state.winner !== null) return null;

  const groups = legalTamCucLeadGroups(state, aiPlayer);
  if (groups.length === 0) return null;

  if (level === 'easy') return randomItem(groups);

  const opponent = aiPlayer === 0 ? 1 : 0;
  const ranked = groups
    .map((group) => {
      const responses = legalTamCucResponseGroups(state, group, opponent);
      const canBeBeaten = responses.some(
        (response) => compareTamCucGroups(group, response) > 0
      );
      const value =
        group.length * 150 +
        tamCucGroupStrength(group) * 8 +
        (canBeBeaten ? 0 : 500);

      return { group, value };
    })
    .sort((a, b) => b.value - a.value);

  if (level === 'medium') {
    const top = ranked.slice(0, Math.min(4, ranked.length));
    return Math.random() < 0.82 ? top[0].group : randomItem(top).group;
  }

  return ranked[0].group;
}

export function chooseTamCucResponse(
  state: TamCucState,
  lead: TamCucCard[],
  level: TamCucAiLevel,
  aiPlayer: TamCucPlayer
): TamCucAiResponse {
  const hand = state.hands[aiPlayer];
  const valid = legalTamCucResponseGroups(state, lead, aiPlayer);
  const winning = valid
    .filter((group) => compareTamCucGroups(lead, group) > 0)
    .sort((a, b) => tamCucGroupStrength(a) - tamCucGroupStrength(b));

  if (level === 'easy') {
    const sacrifice = cheapestCards(hand, lead.length);
    if (valid.length > 0 && Math.random() < 0.62) {
      return { cards: randomItem(valid), reveal: true };
    }
    return { cards: sacrifice, reveal: false };
  }

  if (winning.length > 0) {
    return { cards: winning[0], reveal: true };
  }

  if (level === 'medium' && valid.length > 0 && Math.random() < 0.2) {
    return { cards: valid[0], reveal: true };
  }

  return {
    cards: cheapestCards(hand, lead.length),
    reveal: false
  };
}
