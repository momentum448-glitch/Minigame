# GAME 07 — MONSTER CHESS — INITIAL 8-MONSTER ROSTER

> DESIGN DRAFT. These monsters are not yet locked decisions. Numeric values are first-pass balance targets for prototype.

## Shared stat language

- **HP**: health.
- **MOV**: max hexes during optional movement.
- **RNG**: Basic Attack range.
- **DMG**: Basic Attack listed damage before miss/crit/cover.
- Active Skill replaces the Basic Attack for that activation unless stated otherwise.
- Evolution I unlocks at 3 XP; Evolution II at 7 total XP.
- Evolution choices are independent unless an option explicitly references another one.

---

## 1. Mầm Rêu — 1★

**Role:** support / sustain / cheap utility  
**HP 5 · MOV 3 · RNG 1 · DMG 1**

**Basic — Cắn Mầm:** melee 1 damage.

**Active — Mầm Sống · CD 2:** heal an adjacent ally for 2 HP. If used on self, heal 1 HP.

**Passive — Bám Đất:** first time each round Mầm Rêu enters Cover, gain 1 temporary shield until its next activation.

### Evolution I
- **Rễ Dày:** +2 max HP and heal 1 HP immediately.
- **Nhựa Sống:** Mầm Sống heals +1.
- **Tầm Gửi:** after healing an ally, that ally's next successful attack deals +1 damage.

### Evolution II
- **Tiểu Cổ Thụ:** while standing on Cover, adjacent allies also gain 10% extra ranged damage reduction.
- **Mầm Hồi Sinh:** Mầm Sống can target at range 2.
- **Rêu Ký Sinh:** Basic Attack marks target; next allied hit on that target heals attacker 1 HP.

**Why 1★:** low damage, but creates efficient sustain and positional value.

---

## 2. Chồn Chớp — 1★

**Role:** scout / pickup control / flanker  
**HP 4 · MOV 4 · RNG 1 · DMG 1**

**Active — Lướt Điện · CD 2:** dash up to 3 hexes in a straight hex-line, cannot cross Blockers. If ending adjacent to an enemy, deal 1 guaranteed damage that cannot crit.

**Passive — Nhanh Tay:** after normal movement, auto-pickups in one adjacent hex may also be collected once per activation.

### Evolution I
- **Bốn Chân Sét:** +1 MOV.
- **Giật Lùi:** after a successful Basic Attack, step 1 hex away if free.
- **Tích Điện:** collecting any pickup gives +1 damage to the next Basic Attack this round.

### Evolution II
- **Chớp Kép:** Lướt Điện may bend direction once.
- **Kẻ Trộm Sao:** EXP orb collected by Chồn Chớp grants +2 XP instead of +1, once per round.
- **Phản Xạ Điện:** first melee hit received each round deals 1 damage back to attacker.

**Why 1★:** wins resources and angles, not direct duels.

---

## 3. Giáp Tê — 2★

**Role:** tank / displacement / cover anchor  
**HP 8 · MOV 2 · RNG 1 · DMG 2**

**Active — Húc Khiên · CD 2:** deal 2 damage to adjacent enemy and push it 1 hex directly away if that hex is free.

**Passive — Mai Dày:** Cover reduces ranged damage to Giáp Tê by 40% instead of 25%.

### Evolution I
- **Pháo Đài:** +2 max HP.
- **Sừng Công Thành:** Húc Khiên deals +1 damage if the target cannot be pushed because of a Blocker.
- **Da Phản Chấn:** first melee hit received each round deals 1 damage back.

### Evolution II
- **Bất Động:** while on Cover, cannot be pushed or pulled.
- **Húc Dài:** Húc Khiên can target an enemy 2 hexes away in a straight line and moves Giáp Tê adjacent before impact if path is clear.
- **Giáp Hộ Vệ:** adjacent ally takes 1 less ranged damage, minimum 1.

**Why 2★:** protects space and alters positioning without high burst.

---

## 4. Bọ Hỏa Đao — 2★

**Role:** melee assassin / tempo attacker  
**HP 6 · MOV 3 · RNG 1 · DMG 3**

**Active — Xé Lửa · CD 2:** strike adjacent enemy for 2 damage, then move through it to the opposite adjacent hex if free. This skill ignores Cover because it is melee.

**Passive — Hơi Nóng:** if Bọ Hỏa Đao moved at least 2 hexes before its Main Action, its Basic Attack gains +1 listed damage.

### Evolution I
- **Lưỡi Đỏ:** Basic DMG +1, max HP -1.
- **Chân Than:** after Xé Lửa, may step 1 additional hex.
- **Tro Bám:** successful Active Skill applies Burn: target takes 1 damage at start of its next activation.

### Evolution II
- **Đao Bạo Kích:** crit chance on Basic Attack becomes 20%, taking 10% from Normal Hit.
- **Xuyên Hậu Tuyến:** Xé Lửa CD becomes 1.
- **Hỏa Tái Sinh:** first kill restores 3 HP and immediately clears Xé Lửa cooldown.

**Why 2★:** lethal if allowed to route correctly, fragile if trapped.

---

## 5. Lôi Nhãn — 3★

**Role:** ranged pressure / lane control  
**HP 6 · MOV 2 · RNG 4 · DMG 2**

**Active — Tia Xuyên · CD 2:** choose a straight hex-line up to range 4. Deal 2 damage to the first enemy hit and 1 damage to the next enemy behind it. Blockers stop the beam.

**Passive — Dư Điện:** when Lôi Nhãn crits, target gets -1 MOV on its next activation.

### Evolution I
- **Mắt Ngắm:** Basic RNG +1.
- **Điện Chuỗi:** Tia Xuyên's second target takes 2 damage instead of 1.
- **Phá Công Sự:** ranged damage from Lôi Nhãn treats Cover as 10% reduction instead of 25%.

### Evolution II
- **Thiên Lôi:** Basic DMG +1 against targets 4+ hexes away.
- **Quá Tải:** Tia Xuyên CD becomes 1, but Lôi Nhãn takes 1 self-damage when using it.
- **Mù Sét:** enemy hit by Tia Xuyên has its Active Skill locked on its next activation.

**Why 3★:** strong sightline threat, vulnerable to flankers and Blockers.

---

## 6. Mộng Nấm — 3★

**Role:** controller / terrain denial  
**HP 7 · MOV 2 · RNG 3 · DMG 2**

**Active — Bào Tử Dính · CD 3:** place a Spore hex within range 3 and LOS. It lasts until the start of Mộng Nấm's next activation. The first enemy entering it immediately ends remaining movement for that activation.

**Passive — Thân Bào Tử:** Mộng Nấm is unaffected by its own Spore hex and can stand on it.

### Evolution I
- **Nấm Độc:** trapped enemy also takes 1 damage.
- **Nấm Dày:** Bào Tử Dính creates 2 adjacent Spore hexes instead of 1.
- **Nấm Lành:** ally entering a Spore hex heals 1 HP and consumes that Spore.

### Evolution II
- **Mạng Nấm:** CD becomes 2.
- **Mê Hương:** enemy stopped by Spore also suffers -1 RNG on its next Main Action.
- **Bào Tử Nổ:** when a Spore expires untriggered, it deals 1 damage to enemies adjacent to it.

**Why 3★:** shapes routes without adding extra units to action economy.

---

## 7. Thiết Ngạc — 4★

**Role:** bruiser / duelist / finisher  
**HP 10 · MOV 2 · RNG 1 · DMG 4**

**Active — Ngoạm Khóa · CD 2:** deal 3 damage to adjacent enemy. On hit, that enemy cannot use normal movement on its next activation, but may still use movement granted by a skill.

**Passive — Ngửi Máu:** when moving toward an enemy at 50% HP or lower, Thiết Ngạc gets +1 MOV for that activation.

### Evolution I
- **Hàm Máy:** Basic DMG +1.
- **Thân Sắt:** +2 max HP.
- **Xích Hàm:** Ngoạm Khóa may pull a target from range 2 into an adjacent free hex before dealing damage, if LOS is clear.

### Evolution II
- **Kết Liễu:** Basic Attack deals +2 damage to targets at 25% HP or lower.
- **Tự Hàn:** after any kill, heal 3 HP.
- **Khóa Chặt:** target hit by Ngoạm Khóa also cannot be pushed/pulled by its allies until after its next activation.

**Why 4★:** dominant in close combat, but slow and can be kited.

---

## 8. Long Lăng Kính — 5★

**Role:** premium flexible boss / adaptive centerpiece  
**HP 12 · MOV 2 · RNG 3 · DMG 3**

**Active — Khúc Xạ · CD 3:** target a hex within range 3 and LOS. Deal 2 damage to the target on that hex and 1 damage to enemies on up to two adjacent hexes chosen by the caster.

**Passive — Lõi Quang Phổ:** first time each round Long Lăng Kính enters a different terrain type than where it started activation, gain 1 temporary shield until its next activation.

### Evolution I
- **Phổ Đỏ:** Basic DMG +1.
- **Phổ Lam:** RNG +1 and MOV +1.
- **Phổ Lục:** +3 max HP.

### Evolution II
- **Tán Sắc:** Khúc Xạ may affect up to 4 adjacent enemy hexes for 1 splash damage.
- **Hội Tụ:** Khúc Xạ loses splash but deals 5 listed damage to its primary target.
- **Quang Giáp:** after using Khúc Xạ, gain 2 temporary shield until next activation.

**Why 5★:** versatile and durable, but consumes half the default star budget and only contributes one activation per round.

---

## Draft composition examples at 10★

- **Swarm-control:** Mầm Rêu 1 + Chồn Chớp 1 + Giáp Tê 2 + Bọ Hỏa Đao 2 + Thiết Ngạc 4 = 10★ / 5 monsters.
- **Balanced:** Giáp Tê 2 + Bọ Hỏa Đao 2 + Lôi Nhãn 3 + Mộng Nấm 3 = 10★ / 4 monsters.
- **Elite:** Long Lăng Kính 5 + Thiết Ngạc 4 + Mầm Rêu 1 = 10★ / 3 monsters.
- **Control core:** Long Lăng Kính 5 + Mộng Nấm 3 + Giáp Tê 2 = 10★ / 3 monsters.

## Balance risks to test first

1. Whether 5-unit teams overpower 3-unit elite teams through activation count.
2. Whether 10% miss feels exciting or frustrating on high-value attacks.
3. Whether EXP thresholds 3/7 allow Evolution II inside a 3–5 minute match.
4. Whether Mầm Rêu can gain XP often enough despite support role.
5. Whether Long Lăng Kính is worth 5★ without becoming mandatory.
6. Whether Cover at -25% ranged damage creates enough map value without stalling.
7. Whether random pickups create meaningful contests rather than lucky snowballing.
