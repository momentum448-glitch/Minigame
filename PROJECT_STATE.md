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
8. **Cờ cá ngựa** — Game 08, playable v0.3 3D.
9. **Fanorona** — Game 09, playable v0.1.

Mốc đang active: **QC Game 09 — Fanorona v0.1**. Cờ cá ngựa v0.3 3D giữ nguyên mốc #73; Monster Chess v0.1 và Bài Chòi v0.4 vẫn tạm dừng.

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
- `#/category/world-folk` — **Dân gian thế giới** — hiện có Fanorona.
- `#/category/modern` — **Game hiện đại** — hiện có Monster Chess.
- `#/category/puzzle` — **Giải đố & Logic** — đang chuẩn bị.
- `#/category/strategy` — **Chiến thuật** — hiện có Cờ Gánh, Cờ Hùm, Cờ Lúa Ngô, Monster Chess, Fanorona.
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
- Fanorona: `#/fanorona`.
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
- **Playable v0.3 3D** trên route `#/co-ca-ngua`.
- Renderer chính đã chuyển sang **WebGL/Three.js thật**; ruleset D-037 giữ nguyên.
- SVG/CSS v0.2 không còn là renderer chính.
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

### v0.3 đã triển khai
- Stack 3D:
  - `three`;
  - `@react-three/fiber`;
  - `@types/three`.
- Scene chính: `src/cacngua/Horse3DScene.tsx`.
- Camera **3/4 isometric cố định**; deploy #73 nâng thêm từ `[7.0, 14.2, 8.4]` lên `[6.5, 15.4, 7.8]` sau QC mobile để lộ rõ hơn hai ô góc phía sau bàn.
- Board thật 3D:
  - base gỗ có chiều dày;
  - top board gỗ sáng;
  - 56 track tile là mesh riêng;
  - 4 yard màu là mesh 3D;
  - 4 lane chuồng 1→6 là mesh 3D;
  - center block có chiều cao.
- Lighting:
  - ambient + hemisphere + directional light;
  - cast/receive shadow;
  - fog/background riêng cho scene.
- Quân:
  - procedural stylized horse-head mesh bằng primitive 3D;
  - picking trực tiếp trên scene;
  - ring emissive cho quân có nước hợp lệ/đang chọn;
  - hướng đầu ngựa bám theo hướng di chuyển: trên track nhìn về ô kế tiếp, trong lane chuồng nhìn vào tâm, trong yard nhìn về cửa xuất phát; fly/deploy nhìn theo vector bay.
- Dice:
  - là cube mesh 3D thật trong world-space;
  - tung từ hai vùng phía sau bàn;
  - bay/nảy/xoay qua vùng board rồi đáp trên mặt bàn;
  - khi đang lăn, cả 6 mặt đều có pip chuẩn 1–6 và visual không tiết lộ kết quả engine;
  - chỉ khi animation settle mới xoay để mặt trên khớp kết quả engine;
  - thời lượng roll chuẩn mới là khoảng **1.68 giây** (+50% so với 1.12 giây trước);
  - settled dice có pip 3D và có thể tap để chọn.
- Move/fly/kick:
  - move thường dùng world positions qua geometry mapping;
  - fly/deploy/kick dùng horse mesh động trong world-space;
  - fly/kick có chiều cao thực trong trục Y;
  - kick victim có spin + arc về yard + impact torus 3D;
  - attacker có strike beat riêng khoảng **480 ms**: lùi lấy đà, surge về phía trước, nhô cao/tilt/scale nhẹ và vòng sáng dưới chân trước impact.
- UX **Bỏ lượt**:
  - thêm engine helper `batchHasNoPlayableActions()` và `skipDeadBatch()`;
  - nếu toàn batch vô hiệu, người chơi bấm **Bỏ lượt** một lần;
  - toàn batch được consume và bonus chưa tung bị hủy;
  - AI cũng dùng cùng rule.
- Thêm 3 regression tests cho dead-batch UX.

### Visual/animation v0.2 đã chốt
- Bàn đổi từ vòng tròn SVG sang **bàn vuông kiểu Cờ cá ngựa Việt Nam**.
- Ưu tiên cấu trúc quen thuộc: 4 sân/chuồng ở 4 góc, đường đua vuông, 4 cửa chuồng và lane 1→6 rõ.
- Xúc xắc phải là **khối lập phương có cảm giác 3D và animation lăn/quay thật**, không chỉ đổi số.
- Hoạt ảnh mặt 1 bay: **nhấc quân + cung bay + trail + highlight đích + đáp xuống rõ**.
- Hoạt ảnh đá: phong cách **vui nhộn**, có impact ring/flash, squash-bounce và quân bị đá bay về sân.
- Tempo: đi thường nhanh; bay và đá được nhấn mạnh hơn để tạo wow effect.
- Không thay engine/ruleset D-037; v0.2 là refactor presentation/animation + event metadata nếu cần.

### Dice rolling-state Android hotfix
- Screenshot QC ngày 2026-09-27 xác nhận:
  - settled state sau #56 đã hiển thị đúng pip;
  - rolling state vẫn lỗi vì còn dùng full six-face CSS 3D cube.
- Fix #59:
  - bỏ full CSS 3D cube khỏi **rolling state**;
  - rolling dùng **2.5D shell + front pip frames** đổi nhanh 1→6;
  - motion dùng translate/rotate/scale 2D để tạo cảm giác tung/lăn;
  - settled state tiếp tục dùng mặt pip 2D ổn định + top/right faces 2.5D;
  - không còn phụ thuộc `preserve-3d` / `backface-visibility` ở bất kỳ trạng thái hiển thị kết quả nào.
- Không đổi RNG/engine/bonus-six logic.

### Dice3D settled-state hotfix
- Screenshot QC sau hotfix #54 cho thấy badge engine **5 + 3 đúng**, nhưng pip face vẫn nhìn gần như 1 chấm trên Android/WebView.
- Kết luận: ngay cả front-face DOM của cube 3D vẫn không đáng tin cậy khi đứng yên trên WebView này.
- Fix #56:
  - **rolling state** vẫn dùng cube 6 mặt CSS 3D;
  - **settled state** chuyển sang mặt pip 2D ổn định + cạnh trên/cạnh phải 2.5D;
  - số pip sau khi dừng không còn phụ thuộc `preserve-3d`, `backface-visibility` hay camera transform;
  - badge số vẫn giữ làm fallback.
- Đây là thay đổi presentation בלבד, không đổi RNG/engine.

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
- Deploy workflow **#73**: success.
- Run ID: `36513480107`.
- Deployed source commit: `d0e43194301842e8f29e53607627422d2a0442b1`.
- Thay đổi #73: nâng camera thêm một nấc sau QC mobile để giảm che khuất hai ô góc phía sau bàn; không đổi FOV, engine hay rules.
- Test suite: **76/76 pass**.
- Cờ cá ngựa:
  - engine: **16 tests**;
  - square-board geometry: **5 tests**.
- Production build: pass.
- GitHub Pages deploy: pass.
- Three.js dependency install/build: pass.
- Live: `https://momentum448-glitch.github.io/Minigame/#/co-ca-ngua`.
- Desktop Commander vẫn offline nên **chưa có assistant-side browser/mobile interaction QC trực tiếp** cho renderer WebGL v0.3.
- Người dùng cần QC thực tế: camera framing, touch picking, dice traversal, frame rate, horse readability, fly/kick feel.

### v0.3 visual lock
- Camera: **3/4 isometric cố định**, ưu tiên góc cao đủ để quân không che đường đi.
- Material board: **gỗ sơn màu kiểu Cờ cá ngựa Việt Nam**, polish hiện đại.
- Quân: **đầu ngựa stylized 3D**, phải quay đầu theo hướng di chuyển/đường đi thay vì giữ một hướng cố định theo màu.
- Dice rolling: phải nhìn như xúc xắc 6 mặt thật; không được để người chơi suy ra kết quả engine khi dice còn đang lăn. Roll baseline khoảng **1.68 giây**.
- Kick presentation: không chỉ victim bay; attacker phải có nhịp ra đòn riêng nhìn rõ trước impact.
- Giả định làm việc cho “Bỏ lượt”: nếu toàn bộ dice hiện tại đều không có nước hợp lệ, thao tác Bỏ lượt **consume toàn bộ dice còn lại và hủy bonus chưa tung của lượt đó**, rồi chuyển người chơi. Nếu người dùng sửa quyết định này thì cập nhật engine/test tương ứng.

### v0.3 3D architecture direction
- Người dùng chốt ngày 2026-09-27:
  - nếu **cả hai xúc xắc hiện tại đều không có nước hợp lệ**, UI chỉ cần **một nút bỏ cả batch/lượt** thay vì bỏ từng viên;
  - animation tung xúc xắc phải mượt hơn và **xúc xắc lăn trên toàn bàn**, không bị nhốt trong panel bên phải;
  - Cờ cá ngựa từ mốc tiếp theo phải là **game 3D thật**, không tiếp tục theo hướng board SVG 2D.
- Hướng kiến trúc đề xuất:
  - giữ engine/ruleset hiện tại làm source of truth;
  - thay lớp board/horse/dice presentation bằng **WebGL 3D scene**;
  - React chỉ giữ shell, HUD, nút và overlay;
  - dice là rigid-body visual/physics nhưng kết quả cuối vẫn phải khớp RNG/engine;
  - board, horse pieces, gates, home lanes đều có geometry 3D;
  - fly/kick animation chuyển sang world-space 3D.
- Không tiếp tục đầu tư thêm vào renderer SVG v0.2 ngoài bugfix chặn việc bàn giao.

## 12. Game 09 — Fanorona

### Trạng thái
- **Playable v0.1** trên route `#/fanorona`.
- Game đầu tiên của danh mục **Dân gian thế giới**.
- Đồng thời thuộc danh mục **Chiến thuật**.
- Biến thể: **Fanoron-Tsivy 5×9** của Madagascar.
- Rules chi tiết: `docs/FANORONA_RULES.md`.

### Ruleset đã chốt
- 2 người, bàn **5×9 = 45 giao điểm**.
- **22 quân mỗi bên**, chỉ giao điểm chính giữa để trống; quân sáng đi trước.
- Di chuyển một bước tới giao điểm trống liền kề theo đường kẻ.
- Nếu có nước ăn ở bất kỳ đâu thì **bắt buộc phải ăn**; paika chỉ hợp lệ khi không có nước ăn.
- Hai kiểu ăn:
  - **Tiến ăn / approach**: đi về phía hàng quân địch và ăn toàn bộ dãy liên tiếp phía trước.
  - **Lùi ăn / withdrawal**: đi ra xa hàng quân địch và ăn toàn bộ dãy liên tiếp phía sau.
- Nếu một bước tạo cả approach và withdrawal, người chơi phải **chọn một kiểu**, không ăn cả hai phía cùng lúc.
- Sau một lần ăn, cùng quân đó có thể tiếp tục chuỗi hoặc **dừng tự nguyện**.
- Trong chuỗi:
  - không được tới lại giao điểm đã đi qua trong chuỗi;
  - không được đi hai bước capture liên tiếp cùng một hướng;
  - mọi bước tiếp theo đều phải là bước ăn.
- Quy ước số hóa v0.1:
  - không còn nước hợp lệ = thua;
  - cùng thế cờ + cùng người tới lượt lặp 3 lần = hòa.

### Đã triển khai
- Engine deterministic: `src/fanorona/engine.ts`.
- Types: `src/fanorona/types.ts`.
- AI: `src/fanorona/ai.ts`.
- Tests: `src/fanorona/engine.test.ts`.
- UI: `src/FanoronaGame.tsx`.
- Local 2 người.
- AI Dễ / Vừa / Khó:
  - Dễ: lựa chọn ngẫu nhiên có kiểm soát;
  - Vừa: heuristic ưu tiên capture/material/position;
  - Khó: alpha-beta nông có cắt branching để bảo vệ mobile.
- UX capture:
  - chỉ quân có nước hợp lệ được highlight;
  - khi bắt buộc ăn, các paika bị khóa;
  - destination marker hiển thị số quân sẽ ăn;
  - nếu cùng destination có cả approach/withdrawal, hiện lựa chọn riêng **Tiến ăn / Lùi ăn**;
  - capture line pulse rồi biến mất;
  - trong capture chain chỉ cùng quân đó tiếp tục;
  - có nút **Dừng chuỗi**.
- Visual v0.1:
  - bàn **2.5D gỗ khắc**, không dùng WebGL;
  - quân sáng dạng ivory/stone;
  - quân tối dạng basalt/charcoal;
  - board giữ toàn bộ orthogonal + diagonal connection rõ trên mobile.
- Lobby:
  - đăng ký vào **Dân gian thế giới** + **Chiến thuật**;
  - Fanorona được đưa vào khu Game nổi bật.

### QC kỹ thuật
- Deploy workflow **#74**: success.
- Run ID: `36522379950`.
- Deployed source commit: `80d1286953b1c68f015e2e0b91a408aac0a72e09`.
- Test suite: **85/85 pass**.
- Test files: **11/11 pass**.
- Fanorona engine: **9 regression tests**.
- Production build: pass.
- GitHub Pages deploy: pass.
- Live: `https://momentum448-glitch.github.io/Minigame/#/fanorona`.
- Chưa có mobile interaction QC thực tế sau deploy #74.

## 13. NEXT ACTION — ưu tiên cao nhất

### Task
**QC tương tác Fanorona v0.1 trên mobile thực tế, rồi tune UX/AI nếu cần.**

### Checklist QC Fanorona v0.1
1. Route `#/fanorona` mở ổn trên Android, không layout overflow ngang.
2. Bàn 5×9 và toàn bộ đường chéo/đường thẳng phải đọc rõ ở kích thước mobile.
3. Initial setup hiển thị đúng 22 sáng + 22 tối + tâm trống.
4. Khi có capture, paika phải bị khóa và chỉ các quân có nước ăn được highlight.
5. **Tiến ăn** phải ăn đúng toàn bộ hàng liên tiếp phía trước.
6. **Lùi ăn** phải ăn đúng toàn bộ hàng liên tiếp phía sau.
7. Nếu một destination có cả hai kiểu ăn, UI phải hiện lựa chọn **Tiến ăn / Lùi ăn** rõ ràng.
8. Capture animation phải cho thấy quân di chuyển trước, hàng bị ăn pulse rồi biến mất.
9. Capture chain chỉ cho phép tiếp tục bằng cùng quân, không quay lại node cũ và không lặp cùng hướng.
10. Nút **Dừng chuỗi** phải kết thúc lượt ngay và giữ trạng thái đúng.
11. Local 2 người phải hoàn thành được ván.
12. AI Dễ/Vừa/Khó phải đi hợp lệ; AI Khó không được làm treo/khựng mobile rõ rệt.
13. Fanorona phải xuất hiện đúng ở **Dân gian thế giới** và **Chiến thuật**.
14. Touch target, trạng thái selected/target và số quân capture phải dễ đọc trên màn hình nhỏ.
15. Quy ước hết nước = thua và lặp thế 3 lần = hòa không được làm regress engine.

### Sau QC
- Tune kích thước quân/target marker nếu bàn quá dày trên mobile.
- Tune animation MOVE_MS/CAPTURE_MS nếu chuỗi ăn quá nhanh hoặc quá chậm.
- Nếu AI Khó gây khựng, giảm branch cap/depth trước khi tăng sức mạnh.
- Sau khi gameplay/UX pass mới cân nhắc sound, tutorial minh họa approach/withdrawal và art polish cao hơn.

## 14. Rủi ro / giả định

- Cờ Lúa Ngô có dị bản và một số nguồn thay “Đỗ” bằng từ khác; dự án dùng chuỗi **Lúa · Ngô · Khoai · Sắn · Đỗ** theo Báo Nam Định và các nguồn giáo dục đối chiếu.
- Nguồn không nói rõ việc quay lại node đã đi trong cùng lượt; v0.1 cấm lặp node để tránh backtracking vô hạn.
- Cách “bị chặn thì dừng” cũng cần QC thực tế.
- Hard AI branching cao hơn các game trước, nên depth 3 và cắt ordering.
- Tam Cúc có mâu thuẫn nguồn ở trần lượt đầu (Tượng hồng vs Xe hồng); v0.1 chọn Tượng hồng.
- Tam Cúc v0.1 dùng scoring số hóa theo tổng lá ăn, chưa phải toàn bộ hệ điểm truyền thống.
- Trường hợp hai lá/bộ ngang sức hoàn toàn cho cái thắng hòa là fallback số hóa cần QC.
- Tên con Bài Chòi có dị bản địa phương; v0.1 khóa một bộ 27 tên theo nguồn Bình Định.
- Hô thai thật là nghệ thuật ứng khẩu và có nhiều dị bản; v0.1 dùng câu minh họa mới, không coi là corpus truyền thống chuẩn.

## 15. Việc chưa làm

- Sound design.
- Tutorial/onboarding hoàn chỉnh.
- Multiplayer online.
- Account / leaderboard.
- Game 07.
- QC nhiều thiết bị.

## 16. Quy tắc cập nhật state

Sau mỗi mốc:
- cập nhật **Đã có**;
- cập nhật **QC**;
- chuyển task hoàn thành khỏi **NEXT ACTION**;
- ghi task tiếp theo;
- thêm quyết định bền vững vào `docs/DECISIONS.md`.

Không ghi việc chưa làm vào mục đã hoàn thành.
