# MINIGAME — LIVE PROJECT STATE

> Canonical semantic handoff. Cập nhật file này sau mỗi mốc quan trọng.

## 1. Mục tiêu dự án

Xây một website chứa nhiều minigame theo mô hình **sảnh game đa danh mục**. Game dân gian Việt Nam là một bộ sưu tập lớn bên trong, bên cạnh game dân gian thế giới, game hiện đại, giải đố, chiến thuật, party... Mỗi game là module riêng nhưng dùng chung shell/registry.

### Game playable
1. **Ô ăn quan** — Game 01.
2. **Cờ Gánh** — Game 02, hoàn tất theo QC người dùng ở v0.2.
3. **Cờ Hùm** — Game 03, playable v0.2.
4. **Cờ Lúa Ngô** — Game 04, playable v0.1.
5. **Tam Cúc** — Game 05, playable v0.2 UX.
6. **Bài Chòi** — Game 06, playable v0.4 pre-rendered voice-pack baseline.
7. **Monster Chess** — Game 07, playable prototype v0.1.
8. **Cờ cá ngựa** — Game 08, playable v0.1.

Mốc đang active: **QC Game 08 — Cờ cá ngựa v0.1**. Monster Chess v0.1 và Bài Chòi v0.4 vẫn tạm dừng.

## 2. Repo / Deploy

- Repository: `momentum448-glitch/Minigame`
- Default branch: `main`
- Live URL: https://momentum448-glitch.github.io/Minigame/
- Stack: React + TypeScript + Vite
- Deploy: GitHub Pages qua GitHub Actions
- Backend / database / login / online multiplayer: chưa dùng

## 3. Kiến trúc website

### Home v2 / Sảnh game
- URL gốc mở **Sảnh game / Kho Minigame**, không mở thẳng danh sách game Việt.
- Branding hiển thị: **Kho Minigame**.
- Điều hướng chuẩn: **Sảnh game → Danh mục → Game**.
- Trang chủ gồm:
  - các card danh mục;
  - khu **Game nổi bật / Chơi nhanh**.
- Một game có thể thuộc nhiều danh mục thông qua registry trong `src/App.tsx`.

### Danh mục nền tảng
- `#/category/vietnamese-folk` — **Dân gian Việt Nam** — hiện có 7 game, gồm Cờ cá ngựa.
- `#/category/world-folk` — **Dân gian thế giới** — đang chuẩn bị.
- `#/category/modern` — **Game hiện đại** — hiện có Monster Chess.
- `#/category/puzzle` — **Giải đố & Logic** — đang chuẩn bị.
- `#/category/strategy` — **Chiến thuật** — hiện có Cờ Gánh, Cờ Hùm, Cờ Lúa Ngô, Monster Chess.
- `#/category/party` — **May rủi & Party** — hiện có Tam Cúc, Bài Chòi, Cờ cá ngựa.

### Route game giữ nguyên
- Ô ăn quan: `#/o-an-quan`.
- Cờ Gánh: `#/co-ganh`.
- Cờ Hùm: `#/co-hum`.
- Cờ Lúa Ngô: `#/co-lua-ngo`.
- Tam Cúc: `#/tam-cuc`.
- Bài Chòi: `#/bai-choi`.
- Monster Chess: `#/monster-chess`.
- Cờ cá ngựa: `#/co-ca-ngua`.
- Giữ route cũ để không phá link/bookmark.
- Khi mở game từ một danh mục trong cùng SPA, nút quay lại đưa về danh mục đó; nếu mở trực tiếp/reload route game thì fallback về Sảnh game.

### QC kỹ thuật Home v2
- Deploy workflow **#39**: success.
- Deployed source commit: `a574c289cc4b614025e5d8e1152a84b8a6afd680`.
- Test suite hiện tại: **45/45 pass**.
- Production build pass.
- GitHub Pages deploy pass.
- Handoff snapshot #29 success.
- Quyết định kiến trúc: `D-029`.

## 4. Ô ăn quan — trạng thái

- Local 2 người + AI Dễ/Vừa/Khó.
- Engine tách UI.
- Luật chính, Quan non, refill/nợ, tính điểm.
- Animation bốc/rải/capture/refill.
- Tempo ~500 ms/quân.
- Sỏi bay từ vùng tay tới đúng ô.
- Input khóa trong animation.
- AI dùng cùng animation.
- Route riêng trong Kho game.

Còn polish về hand visual, capture-to-score, mobile QC sâu hơn.

## 5. Cờ Gánh — trạng thái Game 02

- Ruleset tại `docs/CO_GANH_RULES.md`.
- Local 2 người + AI Dễ/Vừa/Khó.
- Gánh + Vây + Mở.
- Animation v0.2:
  - quân đi ~500 ms;
  - nghỉ ~200 ms;
  - Gánh flip + đổi màu + glow ~400 ms/quân;
  - Vây làn sóng riêng;
  - khóa input trong animation;
  - AI dùng cùng animation.
- Người dùng xác nhận: **Cờ Gánh đã xong**.

Không tiếp tục chỉnh Cờ Gánh trừ khi người dùng chủ động mở lại.

## 6. Cờ Hùm — trạng thái Game 03

- Ruleset tại `docs/CO_HUM_RULES.md`.
- Biến thể 1 Hùm + 15 Trâu.
- Local 2 người + AI Dễ/Vừa/Khó.
- Người chơi có thể chọn Hùm hoặc Trâu khi đấu AI.
- Hùm vồ bằng cú nhảy qua Trâu; Trâu thắng bằng vây kín.
- Animation v0.2:
  - Hùm/Trâu đi ~600 ms;
  - Vồ = nhảy -> nghỉ -> impact -> Trâu biến mất;
  - nhãn **VỒ!** + impact ring;
  - khóa input trong animation;
  - AI dùng cùng animation.
- Anti-reversal có feedback đỏ `↩ CẤM` + giải thích.
- Deploy #26 success.

Hiện không phải NEXT ACTION; chỉ mở lại nếu người dùng yêu cầu.

## 7. Cờ Lúa Ngô — trạng thái Game 04

### Nguồn / ruleset
Chi tiết tại `docs/CO_LUA_NGO_RULES.md`.

Nguồn đối chiếu chính:
- Báo Nam Định, “Cờ lúa ngô”, 09/12/2011.
- *100 trò chơi dân gian cho thiếu nhi*, NXB Kim Đồng.
- Tạp chí Khoa học số 57, 03/2023.
- Special Kid Việt Nam.

Các điểm nguồn thống nhất:
- 2 người.
- 8 quân, chia 4–4.
- Bàn gồm hai hình chữ nhật chồng vuông góc.
- Mỗi lượt đi một quân theo đường kẻ.
- Nhịp: **Lúa → Ngô → Khoai → Sắn → Đỗ**.
- Không được vượt qua quân.
- Bước 5 mới được ăn quân đối phương.
- Ăn hết quân đối phương thì thắng.

### Ruleset dự án v0.1
- Board graph: **12 giao điểm**.
- 4 quân mỗi bên; 4 điểm ngoài hai cánh để trống.
- Người chơi 1 đi trước trong bản số hóa.
- Một lượt chọn 1 quân và đi từng bước.
- Bước 1–4 chỉ vào giao điểm trống.
- Bước 5 (Đỗ):
  - vào điểm trống và hết lượt; hoặc
  - vào quân đối phương để ăn và thế chỗ.
- Không vượt qua quân.
- Nếu trước bước 5 không còn điểm trống hợp lệ, quân dừng và hết lượt.
- **Giả định số hóa cần QC:** không lặp lại giao điểm trong cùng lượt.
- Không dùng dị bản `Kim · Mộc · Thủy · Hỏa · Thổ` trong v0.1.
- Fallback: bên không còn nước đi thua để tránh treo game.

### Đã triển khai
- Module riêng `src/luango/`.
- Engine deterministic.
- AI:
  - Dễ: random;
  - Vừa: capture + heuristic;
  - Khó: minimax alpha-beta depth 3, giới hạn ordering để bảo vệ mobile.
- Local 2 người.
- Đấu AI Dễ / Vừa / Khó.
- UI đi **từng bước**, không chọn luôn điểm cuối.
- Thanh nhịp hiển thị 5 từ Lúa / Ngô / Khoai / Sắn / Đỗ.
- Mục tiêu ăn ở bước Đỗ có marker riêng **ĂN**.
- Quân di chuyển từng bước ~390 ms.
- AI cũng phát lại toàn bộ đường đi để người chơi theo dõi.
- Route `#/co-lua-ngo`.
- Kho game hiện **5 game chơi được**.

### QC kỹ thuật
- Deploy workflow **#27**: success.
- Deployed commit: `a0fa2c0dda7052d0c0abb07ad1a4029235c6674a`.
- `npm test`: **30/30 pass**.
  - Ô ăn quan: 7.
  - Cờ Gánh: 6.
  - Cờ Hùm: 9.
  - Cờ Lúa Ngô: 8.
- Cờ Lúa Ngô tests bao phủ:
  - bố trí 4/4;
  - graph hai hình chữ nhật chồng nhau;
  - không lặp node trong cùng lượt;
  - không ăn trước bước 5;
  - ăn đúng ở bước Đỗ;
  - dừng sớm khi bị chặn;
  - điều kiện thắng;
  - có nước mở màn hợp lệ.
- `npm run build`: pass.
- GitHub Pages deploy: pass.

## 8. Tam Cúc — trạng thái Game 05

### Nguồn / ruleset
Chi tiết tại `docs/TAM_CUC_RULES.md`.

Nguồn đối chiếu chính:
- Từ điển Văn hóa / cơ quan nhà nước về bộ bài Tam Cúc.
- VietnamChess về cấu trúc bộ 32 lá.
- GameVH và Thủ Thuật Chơi về luật tay đôi, gọi bài, đôi/bộ ba, Chui và luật lượt đầu.

### Ruleset dự án v0.1
- Bộ 32 lá: 16 đỏ + 16 đen.
- Tay đôi: 16 lá/người, hai bên biết bài nhau.
- Thứ tự: **Tướng > Sĩ > Tượng > Xe > Pháo > Mã > Tốt**.
- Cùng tên: đỏ mạnh hơn đen.
- Gọi 1 / 2 / 3 cây.
- Đôi: cùng tên + cùng màu.
- Bộ ba: chỉ **Tướng–Sĩ–Tượng** hoặc **Xe–Pháo–Mã** cùng màu.
- Người đáp bỏ đúng số cây, có thể **Ngửa bài** hoặc **Chui**.
- Lượt đầu dùng “cấm Tướng, cấm Sĩ, lấy Tượng cầm đầu”.
- Nếu hai bộ ngang sức hoàn toàn, cái thắng hòa trong v0.1.
- Khi hết bài, v0.1 so tổng số lá ăn được.
- Chưa triển khai Trình làng / Kết / Đè / điểm thưởng truyền thống.

### Đã triển khai
- Module riêng `src/tamcuc/`.
- Engine deterministic.
- AI Dễ / Vừa / Khó.
- Local 2 người.
- Hai tay bài hiển thị công khai.
- Chọn trực tiếp 1/2/3 lá.
- Gọi bài -> bài cái úp xuống chiếu.
- Người đáp chọn đủ số lá rồi Ngửa hoặc Chui.
- Sau lượt, chiếu hiển thị bài cái vs bài đáp; nếu Chui thì bài đáp vẫn úp.
- UX v0.2:
  - phần luật mở sẵn, chia thành mục tiêu, thứ tự quân, flow 4 bước, đôi/bộ ba, Ngửa/Chui, lượt đầu và kết thúc;
  - có thang sức mạnh trực quan;
  - lá được chọn nhấc cao, đổi nền, viền/glow mạnh và badge **✓ ĐÃ CHỌN**;
  - khu hành động liệt kê chính xác các lá đang chọn;
  - khi đáp, UI nhắc đúng số lá cần chọn.
- Route `#/tam-cuc`.
- Kho game hiện **5 game playable**.

### QC kỹ thuật
- Deploy workflow **#31**: success.
- Deployed commit: `d6f20d8714331b98c3f95699ea8b268b4e3d97d8`.
- `npm test`: **38/38 pass**.
  - Ô ăn quan: 7.
  - Cờ Gánh: 6.
  - Cờ Hùm: 9.
  - Cờ Lúa Ngô: 8.
  - Tam Cúc: 8.
- Tam Cúc tests bao phủ:
  - cấu trúc bộ 32 lá;
  - đôi và hai loại bộ ba;
  - thứ tự quân và đỏ/đen;
  - bộ ba trên/bộ ba dưới;
  - cấm Tướng/Sĩ lượt đầu;
  - chia 16–16;
  - Chui;
  - người đáp chỉ lấy lượt khi bộ ngửa mạnh hơn.
- Production build pass.
- GitHub Pages deploy pass.
- Handoff snapshot #23 success.
- Trong tự QC UI trước deploy đã bắt và sửa lỗi tap lá không thêm vào selection.
- v0.2 UX: test/build/deploy #31 success; handoff snapshot #21 success.

## 9. Bài Chòi — trạng thái Game 06

### Nguồn / ruleset
Chi tiết tại `docs/BAI_CHOI_RULES.md`.

Nguồn đối chiếu:
- UNESCO: Nghệ thuật Bài Chòi Trung Bộ Việt Nam, ghi danh năm 2017.
- Cổng thông tin Đà Nẵng / Hòa Vang: bộ bài, hội 9 chòi, 27 cặp.
- Báo Đà Nẵng: Anh Hiệu hô thai, chòi trúng gõ mõ, đủ 3 con thì “Tới”.
- Nguồn Bình Định: hệ 27 tên con bài dùng trong hội.

### Ruleset dự án v0.1
- Hội **9 chòi**.
- Bộ chia gồm **27 con**, chia hết 3 con/chòi, không trùng.
- Bộ bài tỳ là một bộ trùng 27 con, xáo độc lập.
- Một lượt: Anh Hiệu hô thai minh họa -> xướng tên -> chòi sở hữu con đó được đánh dấu.
- Chòi đầu tiên đủ 3 con thì **TỚI** và thắng hội.
- Solo: 1 người + 8 chòi máy.
- Local: 2 người + 7 chòi máy.
- Không có AI Dễ/Vừa/Khó vì không có quyết định chiến thuật ở phía chòi; máy không được sửa xác suất.
- Câu hô thai là câu mới do dự án biên soạn, không giả là lời cổ truyền chuẩn.

### Đã triển khai
- Module riêng `src/baichoi/`.
- Engine deterministic.
- Danh sách 27 con Bài Chòi.
- Hai chế độ Solo / Local.
- UI Anh Hiệu + ống bài tỳ.
- Flow 2 nhịp: **Hô thai -> Xướng tên con bài**.
- Chòi người chơi hiển thị đủ 3 con và trạng thái trúng.
- Chòi máy hiển thị tiến độ 0/3, 1/3, 2/3.
- Khi chòi trúng có hiệu ứng **CỐC! CỐC!**.
- v0.2 audio:
  - nút **Âm thanh Bật/Tắt**, mặc định bật;
  - trống ngắn khi bắt đầu Hô thai;
  - tiếng mõ khi chòi trúng;
  - nhịp trống thắng hội khi TỚI;
  - khi Xướng tên, thử đọc tên con bằng Speech Synthesis `vi-VN`; nếu thiết bị không có voice Việt thì mõ/trống vẫn hoạt động.
- v0.2 mobile:
  - chòi người chơi chiếm trọn một hàng ở <=760px;
  - 3 thẻ người chơi tăng chiều cao, font và viền;
  - chòi máy vẫn giữ layout gọn.
- v0.3 audio/voice:
  - trống/mõ nâng từ oscillator đơn giản lên tổng hợp **noise + filter + body oscillator** để tiếng rõ và dày hơn.
- v0.4 voice-pack:
  - dừng hướng cố uốn browser Speech Synthesis thành hát;
  - 3 câu **Ông Ầm, Ba Gà, Cửu Chùa** dùng MP3 render sẵn bằng neural TTS tiếng Việt Piper `vi_VN-vais1000-medium`, hậu kỳ pitch/tempo/reverb;
  - audio nằm tại `public/audio/bai-choi/`, mọi thiết bị nghe cùng một bản;
  - GitHub Actions có pipeline `Generate Bai Choi Voice Pack` để render lại asset;
  - câu chưa có voice-pack và phần xướng tên vẫn fallback Speech Synthesis;
  - selector giọng đổi nhãn thành **Giọng xướng tên**;
  - Android voice list có retry nhiều mốc + `voiceschanged` + refresh trong user gesture + nút **Nạp lại giọng**;
  - nếu thiết bị không trả danh sách voice, UI hiện **Giọng mặc định của máy**, không để dropdown rỗng;
  - baseline neural TTS được ghi rõ chưa phải bản thu nghệ nhân.
- Khi đủ 3 con có banner **TỚI! TỚI!**.
- Lịch sử các con đã xướng.
- Luật 4 bước mở sẵn trong game.
- Route `#/bai-choi`.
- Kho game hiện **6 game playable**.

### QC kỹ thuật
- Deploy workflow **#38**: success.
- Deployed commit: `b7945e7ba54edef6babc6025ef9c8db86acd6ba8`.
- `npm test`: **45/45 pass**.
  - Bài Chòi: 7 tests.
- Bài Chòi tests bao phủ:
  - bộ 27 con unique;
  - 9 chòi x 3 con, không trùng;
  - Solo 1 human / Local 2 human;
  - draw order không lặp;
  - đúng chòi nhận hit;
  - đủ 3 hit thì TỚI;
  - dừng rút sau khi có winner.
- Production build pass.
- GitHub Pages deploy pass.
- Voice-pack generator workflow #2 success; 3 MP3 + license file present on main.
- Handoff snapshot #28 success.

### Trạng thái tạm dừng
- Người dùng chốt ngày 2026-09-24: **tạm dừng hoàn thiện Bài Chòi tại đây để chuyển sang việc khác**.
- Mốc lưu: **v0.4 pre-rendered voice-pack baseline**.
- Gameplay core đã playable; phần audio/diễn xướng chưa được coi là hoàn thiện cuối.
- Khi quay lại, KHÔNG làm lại từ đầu và KHÔNG hỏi lại các quyết định D-023 → D-027.
- Việc tiếp tục ưu tiên:
  1. QC trực tiếp 3 MP3 Ông Ầm / Ba Gà / Cửu Chùa trên mobile thực tế.
  2. Nếu baseline vẫn “máy”, thay bằng voice-pack hát/render hoặc bản thu chất lượng cao.
  3. Mở rộng voice-pack từ 3 lên đủ 27 quân sau khi chốt chất giọng.
  4. Sau audio mới tới hình thẻ truyền thống, animation Anh Hiệu và art direction hội xuân.

## 10. Game 07 — cờ quái vật hiện đại

### Trạng thái
- Tên làm việc: **Monster Chess**.
- **Prototype v0.1 playable** trên route `#/monster-chess`.
- Thuộc cả danh mục **Game hiện đại** và **Chiến thuật**.
- Mục tiêu hiện tại: QC gameplay/nhịp chiến thuật trước khi làm art/animation cuối.

### Đã triển khai
- Local PvP end-to-end.
- Draft luân phiên:
  - 10★ mỗi bên;
  - tối đa 5 quái;
  - quái đã chọn bị khóa cho đối thủ;
  - có Pass và bắt đầu trận sau khi cả hai pass.
- Roster prototype 8 quái:
  - Mầm Rêu 1★;
  - Chồn Chớp 1★;
  - Giáp Tê 2★;
  - Bọ Hỏa Đao 2★;
  - Lôi Nhãn 3★;
  - Mộng Nấm 3★;
  - Thiết Ngạc 4★;
  - Long Lăng Kính 5★.
- Battle:
  - hex board bán kính 4 = 61 ô;
  - map random đối xứng/cân bằng;
  - Ground / Blocker / Cover;
  - pickup EXP / heal / fury / guard / artifact;
  - auto deploy hai phía;
  - round luân phiên quyền đi trước;
  - mỗi activation: optional Move -> 1 Main Action;
  - Basic / Active Skill / Artifact / Wait;
  - Cover giảm ranged damage;
  - Blocker chặn LOS;
  - combat 10% miss / 80% normal / 10% crit;
  - crit x1.5;
  - EXP riêng từng quái;
  - Evolution I ở 3 XP, Evolution II ở 7 XP;
  - mỗi tier chọn 1/3 option;
  - thắng khi tiêu diệt hết quái đối phương.
- Active Skill đã có tác dụng gameplay riêng theo loài ở mức prototype.
- UI dùng SVG hex + emoji/glyph placeholder; chưa phải art cuối.

### Source
- `src/monsterchess/types.ts`
- `src/monsterchess/roster.ts`
- `src/monsterchess/engine.ts`
- `src/monsterchess/engine.test.ts`
- `src/MonsterChessGame.tsx`
- Rules: `docs/MONSTER_CHESS_RULES.md`
- Roster design: `docs/MONSTER_CHESS_ROSTER_V01.md`

### QC kỹ thuật
- Deploy workflow **#41**: success.
- Deployed commit: `5a607adc62a2d7a59b99eba639c39cfbf6007063`.
- Test suite: **55/55 pass**.
- Monster Chess engine: **10 tests**.
- Production build: pass.
- GitHub Pages deploy: pass.
- Handoff snapshot #31: success.
- Chưa có browser interaction QC trực tiếp trên mobile/desktop trong chat này.

### Trạng thái tạm dừng Monster Chess
- Người dùng chốt ngày 2026-09-26: **tạm lưu dự án Game 07 tại đây để chuyển sang việc khác**.
- Mốc lưu: **Monster Chess prototype v0.1 playable**.
- Deploy kỹ thuật gần nhất vẫn là **#41**, commit `5a607adc62a2d7a59b99eba639c39cfbf6007063`, 55/55 tests pass.
- Ruleset nền D-030 → D-033 giữ nguyên; không hỏi lại khi tiếp tục.
- Balance của roster/stat/star/cooldown/evolution **chưa khóa**.
- Chưa có QC tương tác trực tiếp trên bản live sau deploy.
- Khi quay lại, ưu tiên:
  1. QC draft 10★ + species lock + Pass.
  2. QC map hex random/cân bằng, Cover/Blocker/LOS.
  3. QC Move → Main Action, skill, pickup, Artifact, EXP/Evolution.
  4. Đánh giá action economy giữa đội 5 unit và đội 3 unit.
  5. Sau khi gameplay ổn mới làm animation/art quái và roguelite.

## 11. Game 08 — Cờ cá ngựa

### Trạng thái
- **Playable v0.2** trên route `#/co-ca-ngua`.
- v0.2 tập trung board vuông kiểu Việt Nam + xúc xắc 3D + fly/kick FX; ruleset D-037 giữ nguyên.
- Thuộc **Dân gian Việt Nam** và **May rủi & Party**.
- Ruleset dự án là biến thể đã chốt với người dùng, không mặc định đại diện cho mọi luật Cờ cá ngựa.

### Ruleset đã chốt
- Local 2–4 người + đấu AI.
- Dùng **2 xúc xắc**, xử lý từng viên riêng.
- Hai viên có thể dùng cho hai ngựa khác nhau hoặc nối tiếp cùng một ngựa.
- Mỗi mặt 6:
  - có thể dùng để xuất quân;
  - sinh đúng **1 viên xúc xắc tung bù**.
- 6+4 -> tung bù 1 viên; 6+6 -> tung bù 2 viên; lượt bù ra 6 tiếp tục sinh lượt bù.
- Mặt 1:
  - đi 1 ô bình thường; hoặc
  - bay tới **cửa chuồng kế tiếp phía trước** nếu không có quân cản giữa đường.
- Engine dùng đường đua **56 ô**, 4 cửa chuồng cách nhau 14 ô.
- Không vượt quân cản; đáp đúng quân đối phương thì đá về sân; không vào ô quân mình.
- Phải đi đúng số để hoàn thành vòng và tới cửa chuồng mình.
- Chuồng leo 1→6; mỗi lần chỉ lên bậc kế tiếp nếu xúc xắc đúng số bậc đó.
- Thắng khi 4 ngựa chiếm đủ **3,4,5,6**.
- Không dùng thầu mạ/sập hầm ở v0.1.
- Chi tiết: `docs/CO_CA_NGUA_RULES.md`.

### Đã triển khai
- Engine riêng: `src/cacngua/engine.ts`.
- Types: `src/cacngua/types.ts`.
- Engine test: `src/cacngua/engine.test.ts`.
- UI: `src/CoCaNguaGame.tsx`.
- Local:
  - 2 người đối diện;
  - 3 người;
  - 4 người.
- AI:
  - 1 vs 1 AI;
  - 1 vs 2 AI;
  - 1 vs 3 AI;
  - Dễ / Vừa / Khó.
- UI chọn từng viên xúc xắc rồi chọn ngựa; khi mặt 1 có cả đi thường và bay, game hiện lựa chọn riêng.
- Geometry board tách riêng tại `src/cacngua/geometry.ts`.
- Bàn SVG vuông 56 ô:
  - 4 sân màu ở 4 góc;
  - 4 cửa chuồng ở trung điểm bốn cạnh;
  - 4 lane 1→6 hướng vào trung tâm.
- Xúc xắc tách component `src/cacngua/Dice3D.tsx`:
  - khối lập phương 6 mặt bằng CSS 3D;
  - animation shake/throw/roll trước khi snap đúng kết quả engine;
  - mặt 6 hiện +1 xúc xắc.
- Ngựa đi thường phát từng ô khoảng **175 ms/ô**.
- Bay mặt 1:
  - đường cong quadratic;
  - trail sáng;
  - quân bay bằng SVG animateMotion;
  - duration khoảng **820 ms**.
- Đá quân:
  - impact flash/ring + nhãn **BỐP!**;
  - quân bị đá bay theo cung về sân;
  - duration khoảng **780 ms**.
- Layer motion và layer squash/rotate được tách để tránh tranh SVG transform.
- Có flow xuất quân, đi, bay mặt 1, đá quân, leo chuồng, tung bù và thắng.
- Game đã đăng ký trong lobby và category registry.

### Visual/animation v0.2 đã chốt
- Bàn đổi từ vòng tròn SVG sang **bàn vuông kiểu Cờ cá ngựa Việt Nam**.
- Ưu tiên cấu trúc quen thuộc: 4 sân/chuồng ở 4 góc, đường đua vuông, 4 cửa chuồng và lane 1→6 rõ.
- Xúc xắc phải là **khối lập phương có cảm giác 3D và animation lăn/quay thật**, không chỉ đổi số.
- Hoạt ảnh mặt 1 bay: **nhấc quân + cung bay + trail + highlight đích + đáp xuống rõ**.
- Hoạt ảnh đá: phong cách **vui nhộn**, có impact ring/flash, squash-bounce và quân bị đá bay về sân.
- Tempo: đi thường nhanh; bay và đá được nhấn mạnh hơn để tạo wow effect.
- Không thay engine/ruleset D-037; v0.2 là refactor presentation/animation + event metadata nếu cần.

### Dice3D Android hotfix
- QC ảnh người dùng ngày 2026-09-26 phát hiện Android/WebView hiển thị sai: cả hai dice đều hiện mặt 1.
- Nguyên nhân: face-selection dựa trên xoay cả cube + `backface-visibility` không ổn định trên trình duyệt Android.
- Fix:
  - mặt trước luôn render **giá trị thật của engine**;
  - 5 mặt còn lại chỉ tạo thể tích khi roll;
  - bỏ phụ thuộc `show-1…show-6` để chọn physical face;
  - sau roll cube snap về front-face ổn định;
  - thêm numeric badge nhỏ làm fallback nhận diện.
- Roll animation 3D vẫn giữ nguyên.

### QC kỹ thuật
- Deploy workflow **#54**: success.
- Run ID: `36252593872`.
- Deployed source commit: `57ae65ad3dfe14d3a7f957c284385742218d0810`.
- Test suite: **73/73 pass**.
- Cờ cá ngựa:
  - engine: **13 tests**;
  - square-board geometry: **5 tests**.
- Production build: pass.
- GitHub Pages deploy: pass.
- Live: `https://momentum448-glitch.github.io/Minigame/#/co-ca-ngua`.
- Desktop Commander hiện offline nên **chưa có assistant-side browser/mobile interaction QC trực tiếp** sau deploy #54. Người dùng đã cung cấp screenshot QC cho bug dice trước hotfix; cần reload và xác nhận sau hotfix.

## 12. NEXT ACTION — ưu tiên cao nhất

### Task
**QC tương tác Cờ cá ngựa v0.2 trên bản live, sau đó tune visual/tempo theo feedback.**

### Checklist QC v0.2
1. Bàn phải đọc ngay là **bàn Cờ cá ngựa vuông kiểu Việt Nam**.
2. 4 sân màu, 4 cửa chuồng và lane 1→6 phải dễ hiểu trên mobile.
3. 2 xúc xắc phải nhìn như **khối lập phương thật**, có roll/quay trước khi dừng.
4. Dice result phải khớp engine; 6 vẫn sinh đúng bonus die.
5. Move thường phải đi từng ô, không teleport.
6. Mặt 1 bay:
   - source/target rõ;
   - thấy cung bay và trail;
   - landing rõ.
7. Đá thường:
   - attacker tới đích trước;
   - impact rõ;
   - victim bay về sân, không biến mất tức thì.
8. Bay + đá nối sequence tự nhiên.
9. Input khóa trong animation; AI không đi chồng animation.
10. Không regress Local 2/3/4 và AI 1/2/3.
11. Mobile không bị panel/dice che board; ô/ngựa đủ lớn để tap.
12. Reduced motion không gây lỗi trạng thái.

### Sau QC
- Sửa mismatch board/animation nếu có.
- Tune fly/kick duration nếu quá nhanh hoặc quá chậm.
- Chỉ khi visual pass mới thêm sound impact/dice/horse.

## 13. Rủi ro / giả định

- Cờ Lúa Ngô có dị bản và một số nguồn thay “Đỗ” bằng từ khác; dự án dùng chuỗi **Lúa · Ngô · Khoai · Sắn · Đỗ** theo Báo Nam Định và các nguồn giáo dục đối chiếu.
- Nguồn không nói rõ việc quay lại node đã đi trong cùng lượt; v0.1 cấm lặp node để tránh backtracking vô hạn.
- Cách “bị chặn thì dừng” cũng cần QC thực tế.
- Hard AI branching cao hơn các game trước, nên depth 3 và cắt ordering.
- Tam Cúc có mâu thuẫn nguồn ở trần lượt đầu (Tượng hồng vs Xe hồng); v0.1 chọn Tượng hồng.
- Tam Cúc v0.1 dùng scoring số hóa theo tổng lá ăn, chưa phải toàn bộ hệ điểm truyền thống.
- Trường hợp hai lá/bộ ngang sức hoàn toàn cho cái thắng hòa là fallback số hóa cần QC.
- Tên con Bài Chòi có dị bản địa phương; v0.1 khóa một bộ 27 tên theo nguồn Bình Định.
- Hô thai thật là nghệ thuật ứng khẩu và có nhiều dị bản; v0.1 dùng câu minh họa mới, không coi là corpus truyền thống chuẩn.

## 14. Việc chưa làm

- Sound design.
- Tutorial/onboarding hoàn chỉnh.
- Multiplayer online.
- Account / leaderboard.
- Game 07.
- QC nhiều thiết bị.

## 15. Quy tắc cập nhật state

Sau mỗi mốc:
- cập nhật **Đã có**;
- cập nhật **QC**;
- chuyển task hoàn thành khỏi **NEXT ACTION**;
- ghi task tiếp theo;
- thêm quyết định bền vững vào `docs/DECISIONS.md`.

Không ghi việc chưa làm vào mục đã hoàn thành.
