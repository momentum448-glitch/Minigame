import { describe, expect, it } from 'vitest';
import {
  createBaiChoiDeck,
  createBaiChoiState,
  drawNextBaiChoiCard,
  hutHasCard,
  peekNextBaiChoiCard
} from './engine';

describe('Bài Chòi engine', () => {
  it('builds exactly 27 unique cards', () => {
    const deck = createBaiChoiDeck();
    expect(deck).toHaveLength(27);
    expect(new Set(deck.map((card) => card.id)).size).toBe(27);
    expect(new Set(deck.map((card) => card.name)).size).toBe(27);
  });

  it('deals nine huts with three unique cards each', () => {
    const deck = createBaiChoiDeck();
    const state = createBaiChoiState('solo', deck, deck);

    expect(state.huts).toHaveLength(9);
    expect(state.huts.every((hut) => hut.cards.length === 3)).toBe(true);

    const dealt = state.huts.flatMap((hut) => hut.cards.map((card) => card.id));
    expect(new Set(dealt).size).toBe(27);
  });

  it('assigns one human hut in solo and two in local mode', () => {
    const deck = createBaiChoiDeck();
    const solo = createBaiChoiState('solo', deck, deck);
    const local = createBaiChoiState('local', deck, deck);

    expect(solo.huts.filter((hut) => hut.owner.startsWith('human'))).toHaveLength(1);
    expect(local.huts.filter((hut) => hut.owner.startsWith('human'))).toHaveLength(2);
  });

  it('reveals cards in draw order without repeats', () => {
    const deck = createBaiChoiDeck();
    let state = createBaiChoiState('solo', deck, [...deck].reverse());

    expect(peekNextBaiChoiCard(state)?.id).toBe(deck[26].id);

    state = drawNextBaiChoiCard(state);
    state = drawNextBaiChoiCard(state);

    expect(state.drawn).toEqual([deck[26].id, deck[25].id]);
    expect(new Set(state.drawn).size).toBe(2);
  });

  it('marks exactly the hut that owns a drawn card', () => {
    const deck = createBaiChoiDeck();
    const state = createBaiChoiState('solo', deck, deck);
    const next = drawNextBaiChoiCard(state);
    const owners = next.huts.filter((hut) => hut.hits.includes(deck[0].id));

    expect(owners).toHaveLength(1);
    expect(hutHasCard(owners[0], deck[0].id)).toBe(true);
  });

  it('declares TỚI when a hut receives its third matching card', () => {
    const deck = createBaiChoiDeck();
    const drawOrder = [
      deck[0],
      deck[3],
      deck[1],
      deck[6],
      deck[2],
      ...deck.filter((card) => ![deck[0].id, deck[1].id, deck[2].id, deck[3].id, deck[6].id].includes(card.id))
    ];

    let state = createBaiChoiState('solo', deck, drawOrder);
    for (let i = 0; i < 5; i += 1) state = drawNextBaiChoiCard(state);

    expect(state.huts[0].hits).toHaveLength(3);
    expect(state.winnerHutId).toBe(0);
  });

  it('stops drawing after a winner is declared', () => {
    const deck = createBaiChoiDeck();
    let state = createBaiChoiState('solo', deck, deck);
    state = drawNextBaiChoiCard(state);
    state = drawNextBaiChoiCard(state);
    state = drawNextBaiChoiCard(state);

    const afterWin = drawNextBaiChoiCard(state);
    expect(afterWin.turn).toBe(state.turn);
    expect(afterWin.winnerHutId).toBe(0);
  });
});
