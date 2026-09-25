# GAME 07 — MONSTER CHESS — RULESET v0.1 DRAFT

> Working title only. Core combat decisions through D-032 are locked; numeric balance remains tunable through playtest.

## 1. Match goal

- Two players draft monster teams, then fight on a randomized hex map.
- Win by eliminating **all enemy monsters**.
- Target match length: **3–5 minutes**.
- Primary input: tap monster -> optional move -> choose Basic Attack / Active Skill / Artifact.

## 2. Draft

- Default budget: **10★ per player**.
- Team total star cost must be <= budget.
- Maximum **5 monsters per team**.
- Draft is alternating.
- Once a monster species is drafted, it is locked and cannot be drafted by the opponent.
- A player may stop drafting voluntarily if satisfied or unable to fit another monster under the budget.
- Initial v0.1 roster is only a design/testing roster. Final public draft pool should be larger than 8 species so lockout drafting has enough variety.

## 3. Board and random map

- Board shape: regular hexagon, **radius 4 = 61 hexes**.
- Every match uses a generated map.
- Strategic terrain layout must be balanced through rotational/mirrored structure or equivalent compensation.
- Pickup placement may vary within fairness constraints.

### Terrain
- **Ground:** normal movement.
- **Blocker:** cannot enter; blocks line of sight.
- **Cover:** enter normally; does not block LOS; ranged damage received is reduced by 25%.
- Melee attacks ignore Cover reduction.

## 4. Round and activation flow

- Round 1 first player is decided by coin flip.
- The player with first activation **alternates every round**.
- Players alternate activating one unactivated monster at a time.
- Every living monster gets at most **one activation per round**.
- If one side has no unactivated monsters left, the other side may resolve its remaining activations.

### One activation
1. Resolve pending Evolution prompt, if any.
2. Optional **Move** up to the monster's Move stat.
3. Resolve auto-pickups crossed/entered during movement.
4. Take exactly one **Main Action**:
   - Basic Attack, or
   - Active Skill, or
   - activate held Artifact, or
   - Wait.
5. Mark monster activated for the round.

Movement happens before the Main Action. There is no normal post-attack movement unless a skill/evolution explicitly grants it.

## 5. Combat RNG

Every ordinary damaging attack resolves one combat outcome:
- **10% Miss**: 0 damage.
- **80% Normal Hit**: listed damage.
- **10% Critical Hit**: **150% listed damage**, rounded up.

Rules:
- No second separate crit roll.
- No default dodge/evasion stat in v0.1.
- Special units/skills may explicitly modify the roll or cause status RNG later, but default combat stays readable.
- Cover damage reduction applies after the hit/crit damage is determined.
- Damage cannot be reduced below 1 by Cover alone.

## 6. Range and line of sight

- Range is measured in hex distance.
- Range 1 attacks are melee.
- Ranged attacks require line of sight unless a skill says otherwise.
- Blockers break LOS.
- Other monsters do not block LOS in the first prototype unless later playtest shows body-blocking is needed.
- Cover does not block LOS.

## 7. Skill economy

Every monster has:
- **Basic Attack**
- **1 Active Skill**
- **1 Passive**
- two in-match Evolution tiers.

Active Skills use cooldown measured in future activations of that monster.
- Example: **CD 2** means after use, the skill cannot be used on the monster's next 2 activations.
- Cooldown decreases at the start of that monster's activation.
- Passive effects do not consume the Main Action unless explicitly written.

## 8. EXP and evolution

EXP belongs to each monster individually.

### EXP sources
- Deal damage during an activation: **+1 XP max once per activation**, even if an AoE hits multiple enemies.
- Deliver a kill: **+2 XP**.
- Auto-pick an EXP orb: **+1 XP**.

### Evolution thresholds
- **Evolution I:** 3 total XP.
- **Evolution II:** 7 total XP.

Evolution rules:
- When a monster has reached a threshold, its next activation starts with a mandatory Evolution choice.
- Each Evolution presents **3 options**, choose exactly 1.
- Maximum one Evolution prompt can resolve in one activation.
- Choices are permanent for the rest of the match.
- Evolution options may modify stats, attacks, skills, passives, range or tactical role.

## 9. Pickups and artifacts

### Auto-pickups
Small pickups trigger automatically when entered/crossed and do not consume the Main Action.
Prototype pool may include:
- EXP orb: +1 XP.
- Vital mote: restore small HP.
- Fury mote: buff next successful attack.
- Guard mote: temporary shield.

### Artifacts
- Powerful item class.
- A monster can hold at most **1 Artifact**.
- Picking up an Artifact does not consume the Main Action if inventory is empty.
- Activating an Artifact **does consume the Main Action**.
- Artifact design must not create permanent snowballing stronger than monster evolution itself.

## 10. Deployment — prototype assumption, not locked

For first engine prototype:
- Each player has a mirrored deployment zone near opposite edges.
- Players place drafted monsters alternately after draft.
- Exact zone size and placement order may change after first board readability test.

## 11. Local PvP and roguelite compatibility

The same combat engine must support:
- Local PvP draft matches.
- Future solo roguelite encounters.

Roguelite progression may alter available roster, relics, encounters or between-match choices, but should not require a separate combat ruleset.

## 12. Balance guardrails

- Star cost buys power, flexibility and durability, but must not erase action-economy tradeoffs.
- 1★ monsters must remain useful through role/utility, not raw stat equality.
- 5★ monsters may be individually powerful but should not casually defeat a full low-cost team alone.
- Max 5 monsters/team is a hard v0.1 guardrail against action spam.
- RNG should create tension, not decide the entire match by itself.
