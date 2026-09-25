import { useMemo, useState } from 'react';
import {
  availableDraftMonsters,
  basicAttack,
  beginActivation,
  beginBattle,
  canDraftMonster,
  chooseEvolution,
  coordKey,
  createMonsterGame,
  draftComplete,
  draftMonster,
  evolutionOptions,
  hexDistance,
  moveActiveUnit,
  passDraft,
  pendingEvolution,
  reachableCells,
  resetDraft,
  sameCoord,
  unitAt,
  useActiveSkillOnHex,
  useActiveSkillOnUnit,
  useArtifact,
  waitAction
} from './monsterchess/engine';
import { MONSTER_BY_ID, MONSTER_ROSTER } from './monsterchess/roster';
import type { HexCoord, MonsterGameState, MonsterPlayer, MonsterUnit } from './monsterchess/types';

interface MonsterChessGameProps {
  onBack: () => void;
}

type ActionMode = 'basic' | 'skill';

const SQRT3 = Math.sqrt(3);
const SVG_W = 720;
const SVG_H = 650;
const HEX_SIZE = 33;

function pixelFor(coord: HexCoord) {
  return {
    x: SVG_W / 2 + HEX_SIZE * SQRT3 * (coord.q + coord.r / 2),
    y: SVG_H / 2 + HEX_SIZE * 1.5 * coord.r
  };
}

function hexPoints(coord: HexCoord): string {
  const { x, y } = pixelFor(coord);
  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 180 * (60 * index - 30);
    return `${x + HEX_SIZE * Math.cos(angle)},${y + HEX_SIZE * Math.sin(angle)}`;
  }).join(' ');
}

function playerLabel(player: MonsterPlayer) {
  return `Người chơi ${player + 1}`;
}

function hpPercent(unit: MonsterUnit) {
  return Math.max(0, Math.min(100, unit.hp / unit.maxHp * 100));
}

export default function MonsterChessGame({ onBack }: MonsterChessGameProps) {
  const [state, setState] = useState<MonsterGameState>(() => createMonsterGame());
  const [actionMode, setActionMode] = useState<ActionMode>('basic');

  const active = state.activeUnitId
    ? state.units.find((unit) => unit.id === state.activeUnitId) ?? null
    : null;

  const reachable = useMemo(
    () => active && !state.moved ? reachableCells(state, active.id) : {},
    [state, active]
  );

  const activeDef = active ? MONSTER_BY_ID[active.speciesId] : null;
  const evolveOptions = active ? evolutionOptions(active) : [];

  const startBattleNow = () => {
    setState(beginBattle(state.draft, Math.floor(Date.now() % 2147483647)));
    setActionMode('basic');
  };

  const handleRosterPick = (speciesId: string) => {
    setState((current) => ({
      ...current,
      draft: draftMonster(current.draft, speciesId),
      message: ''
    }));
  };

  const handlePass = () => {
    setState((current) => ({
      ...current,
      draft: passDraft(current.draft)
    }));
  };

  const handleUnitClick = (unit: MonsterUnit) => {
    if (state.phase !== 'battle') return;

    if (!active) {
      if (unit.owner === state.currentPlayer && !unit.activated && unit.hp > 0) {
        setState(beginActivation(state, unit.id));
        setActionMode('basic');
      }
      return;
    }

    if (unit.id === active.id) return;
    if (pendingEvolution(active)) return;

    if (actionMode === 'basic' && unit.owner !== active.owner) {
      setState(basicAttack(state, unit.id));
      return;
    }

    if (actionMode === 'skill') {
      setState(useActiveSkillOnUnit(state, unit.id));
    }
  };

  const handleHexClick = (coord: HexCoord) => {
    if (!active || pendingEvolution(active)) return;
    const occupant = unitAt(state, coord);
    if (occupant) {
      handleUnitClick(occupant);
      return;
    }

    if (actionMode === 'skill' && activeDef?.skillTarget === 'hex') {
      setState(useActiveSkillOnHex(state, coord));
      return;
    }

    if (!state.moved && reachable[coordKey(coord)] !== undefined) {
      setState(moveActiveUnit(state, coord));
    }
  };

  if (state.phase === 'draft') {
    const current = state.draft.currentPlayer;
    const available = availableDraftMonsters(state.draft, current);

    return (
      <main className="mc-shell">
        <header className="mc-hero">
          <button className="hub-back-button" type="button" onClick={onBack}>← Sảnh game</button>
          <p className="eyebrow">GAME 07 · PROTOTYPE</p>
          <h1>Monster Chess</h1>
          <p>
            Draft bằng ngân sách sao, khóa loài đối thủ đã chọn, rồi đưa đội quái lên chiến trường hex ngẫu nhiên.
          </p>
        </header>

        <section className="mc-draft-status">
          {[0, 1].map((player) => (
            <div className={current === player ? 'active' : ''} key={player}>
              <span>{playerLabel(player as MonsterPlayer)}</span>
              <strong>{state.draft.spent[player as MonsterPlayer]}/10★</strong>
              <small>{state.draft.picks[player as MonsterPlayer].length}/5 quái</small>
              <div className="mc-mini-picks">
                {state.draft.picks[player as MonsterPlayer].map((id) => (
                  <b key={id} title={MONSTER_BY_ID[id].name}>{MONSTER_BY_ID[id].glyph}</b>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="mc-draft-turn">
          <strong>{playerLabel(current)} đang chọn</strong>
          <span>
            {available.length > 0
              ? 'Chọn một quái vừa ngân sách hoặc Pass.'
              : 'Không còn quái phù hợp ngân sách, hãy Pass.'}
          </span>
        </div>

        <section className="mc-roster-grid">
          {MONSTER_ROSTER.map((monster) => {
            const locked = state.draft.locked.includes(monster.id);
            const canPick = canDraftMonster(state.draft, current, monster.id);
            return (
              <button
                key={monster.id}
                type="button"
                className={`mc-roster-card ${locked ? 'locked' : ''}`}
                disabled={!canPick}
                onClick={() => handleRosterPick(monster.id)}
              >
                <span className="mc-monster-glyph">{monster.glyph}</span>
                <span className="mc-star">{monster.stars}★</span>
                <h3>{monster.name}</h3>
                <p>{monster.role}</p>
                <div className="mc-stat-line">
                  <span>HP {monster.maxHp}</span>
                  <span>MOV {monster.move}</span>
                  <span>DMG {monster.damage}</span>
                  <span>RNG {monster.range}</span>
                </div>
                <small><b>{monster.skillName}:</b> {monster.skillDescription}</small>
                <em>{locked ? 'ĐÃ BỊ KHÓA' : canPick ? 'Chạm để draft' : 'Không đủ ngân sách / slot'}</em>
              </button>
            );
          })}
        </section>

        <div className="mc-draft-actions">
          <button type="button" onClick={handlePass} disabled={state.draft.passed[current]}>
            Pass lượt draft
          </button>
          <button
            className="primary"
            type="button"
            disabled={!draftComplete(state.draft)}
            onClick={startBattleNow}
          >
            Bắt đầu trận
          </button>
        </div>

        <details className="rules mc-rules">
          <summary>Luật prototype v0.1</summary>
          <p>10★ mỗi bên, tối đa 5 quái. Hai bên draft luân phiên, loài đã chọn bị khóa.</p>
          <p>Mỗi activation: di chuyển tùy chọn → Basic / Skill / Artifact / Chờ. Mỗi quái chỉ kích hoạt 1 lần/round.</p>
          <p>Combat: 10% hụt · 80% thường · 10% crit x1.5. EXP riêng từng quái, tiến hóa ở 3 XP và 7 XP.</p>
        </details>
      </main>
    );
  }

  const aliveP0 = state.units.filter((unit) => unit.owner === 0 && unit.hp > 0);
  const aliveP1 = state.units.filter((unit) => unit.owner === 1 && unit.hp > 0);

  return (
    <main className="mc-shell">
      <header className="mc-battle-head">
        <button className="hub-back-button" type="button" onClick={onBack}>← Sảnh game</button>
        <div>
          <p className="eyebrow">MONSTER CHESS · PROTOTYPE</p>
          <h1>Round {state.round}</h1>
          <p>{state.message}</p>
        </div>
        <div className="mc-score-strip">
          <span>P1 <b>{aliveP0.length}</b></span>
          <span className={state.currentPlayer === 0 ? 'turn' : ''}>●</span>
          <span className={state.currentPlayer === 1 ? 'turn' : ''}>●</span>
          <span><b>{aliveP1.length}</b> P2</span>
        </div>
      </header>

      {state.phase === 'gameover' && (
        <section className="mc-winner">
          <span>🏆</span>
          <div>
            <strong>{playerLabel(state.winner!)} thắng trận!</strong>
            <p>Đội đối phương đã bị tiêu diệt hoàn toàn.</p>
          </div>
          <button type="button" onClick={() => setState(resetDraft())}>Draft trận mới</button>
        </section>
      )}

      <section className="mc-battle-layout">
        <div className="mc-board-wrap">
          <svg
            className="mc-board"
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            role="img"
            aria-label="Bàn hex Monster Chess"
          >
            {Object.values(state.cells).map((cell) => {
              const key = coordKey(cell.coord);
              const { x, y } = pixelFor(cell.coord);
              const isReachable = Boolean(active && !state.moved && reachable[key] !== undefined);
              const spore = state.spores[key];
              return (
                <g
                  key={key}
                  className={[
                    'mc-hex',
                    `terrain-${cell.terrain}`,
                    isReachable ? 'reachable' : '',
                    spore ? 'spore' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleHexClick(cell.coord)}
                >
                  <polygon points={hexPoints(cell.coord)} />
                  {cell.pickup && (
                    <text x={x} y={y + 4} className="mc-pickup">
                      {cell.pickup === 'xp' ? '✦' :
                        cell.pickup === 'heal' ? '♥' :
                        cell.pickup === 'fury' ? '⚔' :
                        cell.pickup === 'guard' ? '◆' : '◇'}
                    </text>
                  )}
                  {spore && <text x={x} y={y + 5} className="mc-spore-mark">✺</text>}
                </g>
              );
            })}

            {state.units.filter((unit) => unit.hp > 0).map((unit) => {
              const def = MONSTER_BY_ID[unit.speciesId];
              const { x, y } = pixelFor(unit.pos);
              const selected = active?.id === unit.id;
              return (
                <g
                  key={unit.id}
                  className={`mc-unit p${unit.owner} ${selected ? 'selected' : ''} ${unit.activated ? 'spent' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleUnitClick(unit);
                  }}
                >
                  <circle cx={x} cy={y} r="23" />
                  <text x={x} y={y + 7} className="mc-unit-glyph">{def.glyph}</text>
                  <rect x={x - 22} y={y + 26} width="44" height="5" rx="2.5" className="mc-hp-bg" />
                  <rect x={x - 22} y={y + 26} width={44 * hpPercent(unit) / 100} height="5" rx="2.5" className="mc-hp-fill" />
                  {unit.shield > 0 && <text x={x + 18} y={y - 18} className="mc-shield">◆{unit.shield}</text>}
                  {unit.evolutionTier > 0 && <text x={x - 21} y={y - 18} className="mc-evo">E{unit.evolutionTier}</text>}
                </g>
              );
            })}
          </svg>

          <div className="mc-map-legend">
            <span><i className="ground" /> Ground</span>
            <span><i className="cover" /> Cover -25% ranged</span>
            <span><i className="blocker" /> Blocker / chặn LOS</span>
            <span>✦ EXP · ♥ Heal · ⚔ Fury · ◆ Guard · ◇ Artifact</span>
          </div>
        </div>

        <aside className="mc-side-panel">
          {!active ? (
            <>
              <div className="mc-turn-card">
                <span>LƯỢT HIỆN TẠI</span>
                <strong>{playerLabel(state.currentPlayer)}</strong>
                <p>Chạm một quái chưa hành động để kích hoạt.</p>
              </div>
              <div className="mc-team-list">
                {state.units
                  .filter((unit) => unit.owner === state.currentPlayer && unit.hp > 0)
                  .map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      disabled={unit.activated}
                      onClick={() => setState(beginActivation(state, unit.id))}
                    >
                      <span>{MONSTER_BY_ID[unit.speciesId].glyph}</span>
                      <div>
                        <b>{MONSTER_BY_ID[unit.speciesId].name}</b>
                        <small>HP {unit.hp}/{unit.maxHp} · XP {unit.xp} · {unit.activated ? 'Đã đi' : 'Sẵn sàng'}</small>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          ) : (
            <>
              <div className="mc-unit-card">
                <div className="mc-unit-card-head">
                  <span>{activeDef!.glyph}</span>
                  <div>
                    <p>{activeDef!.role} · {activeDef!.stars}★</p>
                    <h2>{activeDef!.name}</h2>
                  </div>
                </div>
                <div className="mc-unit-stats">
                  <span>HP <b>{active.hp}/{active.maxHp}</b></span>
                  <span>MOV <b>{active.move}</b></span>
                  <span>DMG <b>{active.damage}</b></span>
                  <span>RNG <b>{active.range}</b></span>
                  <span>XP <b>{active.xp}</b></span>
                  <span>CD <b>{active.skillCooldown}</b></span>
                </div>
                <p><b>Passive · {activeDef!.passiveName}</b><br />{activeDef!.passiveDescription}</p>
              </div>

              {pendingEvolution(active) && (
                <div className="mc-evolution-panel">
                  <span>🧬 EVOLUTION {pendingEvolution(active)}</span>
                  <h3>Chọn 1 hướng tăng tiến</h3>
                  {evolveOptions.map((option) => (
                    <button key={option.id} type="button" onClick={() => setState(chooseEvolution(state, option.id))}>
                      <b>{option.name}</b>
                      <small>{option.description}</small>
                    </button>
                  ))}
                </div>
              )}

              {!pendingEvolution(active) && state.phase === 'battle' && (
                <>
                  <div className="mc-action-toggle">
                    <button
                      className={actionMode === 'basic' ? 'active' : ''}
                      type="button"
                      onClick={() => setActionMode('basic')}
                    >
                      ⚔ Basic
                      <small>RNG {active.range} · DMG {active.damage}</small>
                    </button>
                    <button
                      className={actionMode === 'skill' ? 'active' : ''}
                      type="button"
                      disabled={active.skillCooldown > 0}
                      onClick={() => setActionMode('skill')}
                    >
                      ✦ {activeDef!.skillName}
                      <small>{active.skillCooldown > 0 ? `CD còn ${active.skillCooldown}` : activeDef!.skillDescription}</small>
                    </button>
                  </div>

                  <div className="mc-context-help">
                    {!state.moved && <p>① Có thể chạm ô viền sáng để di chuyển trước.</p>}
                    <p>
                      ② {actionMode === 'basic'
                        ? 'Chạm quái địch trong range để Basic Attack.'
                        : activeDef!.skillTarget === 'hex'
                          ? 'Chạm một ô hợp lệ để dùng skill.'
                          : activeDef!.skillTarget === 'ally'
                            ? 'Chạm đồng minh hợp lệ để dùng skill.'
                            : 'Chạm quái địch hợp lệ để dùng skill.'}
                    </p>
                  </div>

                  <div className="mc-secondary-actions">
                    <button type="button" disabled={!active.artifact} onClick={() => setState(useArtifact(state))}>
                      ◇ Artifact {active.artifact ? 'sẵn sàng' : 'trống'}
                    </button>
                    <button type="button" onClick={() => setState(waitAction(state))}>Chờ / hết activation</button>
                  </div>
                </>
              )}
            </>
          )}
        </aside>
      </section>

      <details className="rules mc-rules">
        <summary>Prototype này đang test gì?</summary>
        <p><b>Đã chạy thật:</b> draft 10★, khóa loài, hex 61 ô, map cân bằng ngẫu nhiên, Ground/Blocker/Cover, pickups, Move→Action, Basic/Skill, 10% miss + 10% crit, EXP, Evolution I/II, Artifact và điều kiện thắng.</p>
        <p><b>Chưa phải art cuối:</b> quân đang dùng glyph/emoji và animation tối giản. Mục tiêu vòng này là bắt lỗi luật và nhịp chiến thuật trước.</p>
      </details>
    </main>
  );
}
