import { describe, expect, it } from 'vitest';
import {
  compareTamCucGroups,
  createTamCucDeck,
  createTamCucState,
  isFirstRoundAllowed,
  isValidTamCucGroup,
  legalTamCucLeadGroups,
  resolveTamCucRound
} from './engine';
import type { TamCucCard } from './types';

function card(
  color: 'red' | 'black',
  rank: TamCucCard['rank'],
  copy = 0
): TamCucCard {
  return { id: `${color}-${rank}-${copy}`, color, rank, copy };
}

describe('Tam Cúc engine', () => {
  it('builds the traditional 32-card deck', () => {
    const deck = createTamCucDeck();
    expect(deck).toHaveLength(32);
    expect(deck.filter((c) => c.color === 'red')).toHaveLength(16);
    expect(deck.filter((c) => c.color === 'black')).toHaveLength(16);
    expect(deck.filter((c) => c.color === 'red' && c.rank === 'tot')).toHaveLength(5);
    expect(deck.filter((c) => c.color === 'black' && c.rank === 'tuong')).toHaveLength(1);
  });

  it('recognizes pairs and the two legal triples', () => {
    expect(isValidTamCucGroup([
      card('red', 'xe', 0),
      card('red', 'xe', 1)
    ])).toBe(true);

    expect(isValidTamCucGroup([
      card('red', 'tuong'),
      card('red', 'si'),
      card('red', 'tuong-voi')
    ])).toBe(true);

    expect(isValidTamCucGroup([
      card('black', 'xe'),
      card('black', 'phao'),
      card('black', 'ma')
    ])).toBe(true);

    expect(isValidTamCucGroup([
      card('red', 'si'),
      card('red', 'tuong-voi'),
      card('red', 'xe')
    ])).toBe(false);
  });

  it('uses rank before color when comparing singles', () => {
    expect(compareTamCucGroups(
      [card('red', 'phao')],
      [card('black', 'tuong-voi')]
    )).toBeGreaterThan(0);

    expect(compareTamCucGroups(
      [card('black', 'xe')],
      [card('red', 'xe')]
    )).toBeGreaterThan(0);
  });

  it('upper triple beats lower triple and red wins same triple class', () => {
    const upperBlack = [
      card('black', 'tuong'),
      card('black', 'si'),
      card('black', 'tuong-voi')
    ];
    const lowerRed = [
      card('red', 'xe'),
      card('red', 'phao'),
      card('red', 'ma')
    ];

    expect(compareTamCucGroups(lowerRed, upperBlack)).toBeGreaterThan(0);
  });

  it('first round blocks Tướng and Sĩ but permits Tượng', () => {
    expect(isFirstRoundAllowed([card('red', 'tuong')])).toBe(false);
    expect(isFirstRoundAllowed([card('black', 'si')])).toBe(false);
    expect(isFirstRoundAllowed([card('red', 'tuong-voi')])).toBe(true);
  });

  it('deals 16 cards per side and exposes legal first-round calls', () => {
    const state = createTamCucState(createTamCucDeck(), 0);
    expect(state.hands[0]).toHaveLength(16);
    expect(state.hands[1]).toHaveLength(16);
    expect(legalTamCucLeadGroups(state).every(isFirstRoundAllowed)).toBe(true);
  });

  it('chui still sacrifices the required number of cards and caller takes the trick', () => {
    const deck = createTamCucDeck();
    const state = createTamCucState(deck, 0);
    state.round = 2;

    const lead = [state.hands[0][0]];
    const response = [state.hands[1][0]];
    const next = resolveTamCucRound(state, lead, response, false);

    expect(next.hands[0]).toHaveLength(15);
    expect(next.hands[1]).toHaveLength(15);
    expect(next.captured[0]).toHaveLength(2);
    expect(next.caller).toBe(0);
  });

  it('responder takes the trick only when the revealed group is strictly stronger', () => {
    const deck = [
      card('black', 'xe', 0),
      ...createTamCucDeck().filter((c) => c.id !== 'black-xe-0' && c.id !== 'red-xe-0').slice(0, 15),
      card('red', 'xe', 0),
      ...createTamCucDeck().filter((c) => c.id !== 'black-xe-0' && c.id !== 'red-xe-0').slice(15, 30)
    ];

    const unique = [...new Map(deck.map((c) => [c.id, c])).values()];
    while (unique.length < 32) {
      const extra = createTamCucDeck().find((c) => !unique.some((u) => u.id === c.id));
      if (!extra) break;
      unique.push(extra);
    }

    const state = createTamCucState(unique, 0);
    state.round = 2;

    const lead = state.hands[0].find((c) => c.id === 'black-xe-0')!;
    const response = state.hands[1].find((c) => c.id === 'red-xe-0')!;
    const next = resolveTamCucRound(state, [lead], [response], true);

    expect(next.caller).toBe(1);
    expect(next.captured[1]).toHaveLength(2);
  });
});
