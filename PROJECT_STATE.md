# MINIGAME — LIVE PROJECT STATE

> Canonical semantic handoff. Cập nhật file này sau mỗi mốc quan trọng.

## 1. Mục tiêu dự án

Xây một website chứa nhiều minigame Việt Nam. Mỗi game là module riêng nhưng dùng chung shell/kho game.

### Game playable
1. **Ô ăn quan** — Game 01.
2. **Cờ Gánh** — Game 02, hoàn tất theo QC người dùng ở v0.2.
3. **Cờ Hùm** — Game 03, playable v0.2.
4. **Cờ Lúa Ngô** — Game 04, playable v0.1.

Mốc đang active: **QC Cờ Lúa Ngô v0.1**.

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
- Cờ Lúa Ngô: `#/co-lua-ngo`.
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
- Kho game hiện **4 game chơi được**.

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

## 8. NEXT ACTION — ưu tiên cao nhất

### Task
**QC Cờ Lúa Ngô v0.1 trên bản live.**

### Checklist QC
1. Kho game hiển thị 4 game playable.
2. Bàn phải nhìn đúng dạng hai hình chữ nhật chồng vuông góc.
3. Bố trí 4 quân trên / 4 quân dưới hợp lý.
4. Chọn quân -> đi từng nhịp Lúa, Ngô, Khoai, Sắn, Đỗ.
5. Nhịp 1–4 tuyệt đối không ăn được quân.
6. Nhịp Đỗ phải hiện rõ mục tiêu ăn.
7. Ăn quân xong phải đổi lượt và cập nhật số quân.
8. Khi hết đường trước bước 5, quân phải dừng và đổi lượt.
9. Xác nhận giả định **không lặp lại giao điểm trong cùng lượt** có đúng cảm giác trò chơi thực tế không.
10. AI Dễ/Vừa/Khó đi hợp lệ và Hard không lag đáng kể trên mobile.
11. Nhịp 390 ms/bước đủ rõ hay cần chậm hơn.

### Nếu gameplay được duyệt
Ưu tiên polish:
- animation bắt quân ở nhịp Đỗ rõ hơn;
- hiệu ứng đọc nhịp / nhấn từng từ;
- tutorial 1 lượt mẫu;
- art direction hạt giống / ruộng đồng / bàn vẽ phấn.

## 9. Rủi ro / giả định

- Cờ Lúa Ngô có dị bản và một số nguồn thay “Đỗ” bằng từ khác; dự án dùng chuỗi **Lúa · Ngô · Khoai · Sắn · Đỗ** theo Báo Nam Định và các nguồn giáo dục đối chiếu.
- Nguồn không nói rõ việc quay lại node đã đi trong cùng lượt; v0.1 cấm lặp node để tránh backtracking vô hạn.
- Cách “bị chặn thì dừng” cũng cần QC thực tế.
- Hard AI branching cao hơn các game trước, nên depth 3 và cắt ordering.

## 10. Việc chưa làm

- Sound design.
- Tutorial/onboarding hoàn chỉnh.
- Multiplayer online.
- Account / leaderboard.
- Game 05.
- QC nhiều thiết bị.

## 11. Quy tắc cập nhật state

Sau mỗi mốc:
- cập nhật **Đã có**;
- cập nhật **QC**;
- chuyển task hoàn thành khỏi **NEXT ACTION**;
- ghi task tiếp theo;
- thêm quyết định bền vững vào `docs/DECISIONS.md`.

Không ghi việc chưa làm vào mục đã hoàn thành.
