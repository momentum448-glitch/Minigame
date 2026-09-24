# MINIGAME — LIVE PROJECT STATE

> Canonical semantic handoff. Cập nhật file này sau mỗi mốc quan trọng.

## 1. Mục tiêu dự án

Xây một website chứa nhiều minigame Việt Nam. Mỗi game là module riêng nhưng dùng chung shell/kho game.

### Game playable
1. **Ô ăn quan** — Game 01.
2. **Cờ Gánh** — Game 02, hoàn tất theo QC người dùng ở v0.2.
3. **Cờ Hùm** — Game 03, playable v0.1.

Mốc đang active: **QC Cờ Hùm v0.1**.

## 2. Repo / Deploy

- Repository: `momentum448-glitch/Minigame`
- Default branch: `main`
- Live URL: https://momentum448-glitch.github.io/Minigame/
- Stack: React + TypeScript + Vite
- Deploy: GitHub Pages qua GitHub Actions
- Backend / database / login / online multiplayer: chưa dùng

## 3. Kiến trúc website

- URL gốc mở **Kho game**.
- Ô ăn quan: `#/o-an-quan`.
- Cờ Gánh: `#/co-ganh`.
- Cờ Hùm: `#/co-hum`.
- Mỗi game có nút **← Kho game**.
- Game chưa làm chỉ hiện `Sắp có`.

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
- Deploy #24 success.
- Người dùng xác nhận ngày 2026-09-24: **Cờ Gánh đã xong**.

Không tiếp tục chỉnh Cờ Gánh trừ khi người dùng chủ động mở lại.

## 6. Cờ Hùm — trạng thái Game 03

### Ruleset
Chi tiết nguồn và giả định tại `docs/CO_HUM_RULES.md`.

Nguồn chính là sách *100 trò chơi dân gian cho thiếu nhi* của NXB Kim Đồng, mục Cờ Hùm:
- 2 người;
- 1 Hùm + 15 Trâu;
- bàn chính 5×5 giao điểm, có ngang/dọc/chéo;
- Hang Hùm nối vào giữa cạnh phải;
- Hùm đi trước;
- mỗi lượt một quân đi một nước;
- Hùm vồ bằng cách nhảy qua Trâu nếu điểm phía sau còn trống;
- Hùm thắng khi ăn hết Trâu;
- Trâu thắng khi vây kín Hùm;
- không được lập tức đi lại nước vừa đi.

### Ruleset dự án v0.1
- 29 node tổng cộng: 25 node bàn chính + 4 node Hang bổ sung.
- 15 Trâu bắt đầu trên toàn bộ vành ngoài bàn chính trừ cửa Hang.
- Hùm bắt đầu ở đỉnh ngoài cùng của Hang.
- Hùm và Trâu đi 1 bước theo đường kẻ tới điểm trống.
- Hùm vồ 1 Trâu/lượt bằng một cú nhảy thẳng qua Trâu tới điểm trống phía sau.
- Bản v0.1 **không dùng multi-jump trong cùng lượt** vì nguồn đồng thời ghi mỗi lượt chỉ đi một quân một nước.
- Chặn exact immediate reversal của cùng bên ở lượt kế tiếp.
- Trâu thắng khi tới lượt Hùm mà Hùm không còn bất kỳ step/capture hợp lệ.
- Hùm thắng khi không còn Trâu.

### Đã triển khai
- Module riêng `src/cohum/`.
- Engine deterministic.
- AI:
  - Dễ: random;
  - Vừa: heuristic + ưu tiên capture;
  - Khó: minimax alpha-beta depth 4.
- Local 2 người.
- Đấu AI cho phép người chơi chọn **Hùm** hoặc **Trâu**.
- Hùm AI tự đi trước nếu người chơi chọn Trâu.
- Tap quân -> highlight nước đi.
- Nước vồ có marker riêng **Vồ**.
- Visual Hùm và Trâu khác nhau rõ.
- Board/Hang dựng bằng graph + SVG lines.
- Route `#/co-hum`.
- Cờ Hùm xuất hiện ở Kho game với trạng thái **Chơi ngay**.

### QC kỹ thuật
- Deploy workflow **#25**: success.
- Deployed commit: `be982a6789ae16666aa2a7e320317ab249b34989`.
- `npm test`: **21/21 pass**.
  - Ô ăn quan: 7.
  - Cờ Gánh: 6.
  - Cờ Hùm: 8.
- Cờ Hùm tests bao phủ:
  - bố trí 1 Hùm / 15 Trâu;
  - kết nối Hang;
  - Hùm vồ hợp lệ;
  - landing bị chặn thì không vồ;
  - Trâu chỉ đi không capture;
  - anti-reversal;
  - Trâu thắng khi vây kín;
  - Hùm thắng khi ăn Trâu cuối.
- `npm run build`: pass.
- GitHub Pages deploy: pass.

## 7. NEXT ACTION — ưu tiên cao nhất

### Task
**QC Cờ Hùm v0.1 trên bản live.**

### Checklist QC
1. Kho game phải hiện 3 game playable.
2. Bàn Cờ Hùm phải khớp sơ đồ 5×5 + Hang bên phải.
3. 15 Trâu phải nằm trên vành ngoài, cửa Hang để trống, Hùm ở đầu Hang.
4. Hùm đi trước.
5. Hùm chỉ vồ khi có Trâu liền kề và landing phía sau trống.
6. Marker `Vồ` phải làm nước capture dễ hiểu.
7. Trâu chỉ đi 1 bước, không ăn.
8. Vây kín Hùm phải kết thúc đúng.
9. Đổi vai người chơi Hùm/Trâu khi đấu AI hoạt động đúng.
10. Hard AI không lag đáng kể trên mobile.
11. Xác minh thực địa nếu người dùng biết dị bản multi-jump 2–3 Trâu/lượt.

### Nếu gameplay ổn
Ưu tiên polish:
- animation Hùm vồ Trâu;
- animation di chuyển Trâu/Hùm;
- hiệu ứng vòng vây khi Trâu thắng;
- tutorial ngắn về “hở lưng”;
- art direction đất/rừng/hang rõ hơn.

## 8. Rủi ro / giả định

- Cờ Hùm có dị bản và dễ bị nhầm với **Cờ Hùm Tôm**; dự án dùng biến thể 1 Hùm + 15 Trâu.
- Câu nguồn “ăn 2–3 Trâu cùng một lúc” mơ hồ so với quy định “mỗi lượt một nước”; v0.1 ưu tiên cách hiểu một capture/lượt cho tới khi có bằng chứng/feedback thực địa khác.
- Hard AI depth 4 cần theo dõi mobile.
- Anti-reversal cần QC để chắc không khóa nước ngoài ý muốn.

## 9. Việc chưa làm

- Sound design.
- Tutorial/onboarding hoàn chỉnh.
- Multiplayer online.
- Account / leaderboard.
- Game 04.
- QC nhiều thiết bị.

## 10. Quy tắc cập nhật state

Sau mỗi mốc:
- cập nhật **Đã có**;
- cập nhật **QC**;
- chuyển task hoàn thành khỏi **NEXT ACTION**;
- ghi task tiếp theo;
- thêm quyết định bền vững vào `docs/DECISIONS.md`.

Không ghi việc chưa làm vào mục đã hoàn thành.
