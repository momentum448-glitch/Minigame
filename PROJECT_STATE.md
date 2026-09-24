# MINIGAME — LIVE PROJECT STATE

> Canonical semantic handoff. Cập nhật file này sau mỗi mốc quan trọng.

## 1. Mục tiêu dự án

Xây một website chứa nhiều minigame Việt Nam. Mỗi game là module riêng nhưng dùng chung shell/kho game.

### Game playable
1. **Ô ăn quan** — Game 01.
2. **Cờ Gánh** — Game 02, playable v0.1.

Mốc đang active: **QC Cờ Gánh v0.1**.

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
- Mỗi game có nút **← Kho game**.
- Game chưa làm chỉ hiện `Sắp có`.
- Tên placeholder trên home không phải roadmap đã chốt.

## 4. Ô ăn quan — trạng thái

### Đã có
- Local 2 người + đấu AI Dễ/Vừa/Khó.
- Engine tách UI.
- Luật rải / ăn / ăn liên hoàn / Quan non / refill / nợ / tính điểm.
- Animation bốc quân, rải từng viên, bốc tiếp, capture, refill.
- Tempo rải ~500 ms/quân.
- Viên sỏi bay từ vùng tay tới đúng ô đích trước khi nhập cụm sỏi.
- Input khóa trong animation.
- AI dùng cùng animation.
- `prefers-reduced-motion`.
- Route riêng trong kho game.

### Còn cần QC/polish
- Visual bàn tay/cup tự nhiên hơn.
- Animation thu quân về vùng điểm.
- Mobile board vẫn cần QC thật.
- Bộ test luật chưa toàn diện.

## 5. Cờ Gánh — trạng thái Game 02

### Ruleset dự án
Xem chi tiết và nguồn tại `docs/CO_GANH_RULES.md`.

- 2 người, 16 quân, mỗi bên 8.
- Bàn 25 giao điểm 5x5, đi một bước theo đường kẻ ngang/dọc/chéo.
- **Gánh**: chủ động đi vào giữa cặp quân đối phương -> cặp đổi màu.
- Có thể Gánh nhiều cặp trong một nước.
- **Vây**: nhóm quân đối phương không còn giao điểm trống kề -> cả nhóm đổi màu.
- **Mở**: nếu điểm vừa bỏ trống tạo thế bắt buộc Gánh hợp lệ, lượt kế tiếp phải đi vào điểm Mở đó.
- Thắng khi không còn quân màu đối phương trong tổng 16 quân.
- Không dùng các biến thể `chém` / `ăn xong đi tiếp` trong v0.1.

### Đã triển khai
- Module riêng `src/coganh/`.
- Engine deterministic.
- AI 3 mức:
  - Dễ: random.
  - Vừa: immediate gain + heuristic.
  - Khó: minimax alpha-beta depth 4.
- Local 2 người.
- Tap quân -> highlight điểm đến -> tap đích.
- Điểm **Mở** bắt buộc được highlight riêng.
- Quân bị Gánh/Vây có animation đổi màu.
- Hiển thị số quân mỗi bên.
- Route `#/co-ganh`.
- Thẻ Cờ Gánh trên Kho game đổi từ `Sắp có` thành `Chơi ngay`.

### QC kỹ thuật
- Deploy workflow **#23**: success.
- Deployed commit: `35b90033524186026c7205b40981e31183dbc607`.
- `npm test`: **13/13 pass**.
  - Ô ăn quan: 7 tests.
  - Cờ Gánh: 6 tests.
- Cờ Gánh tests bao phủ:
  - bố trí 8/8 quân;
  - pattern đường chéo;
  - Gánh;
  - Vây;
  - Mở bắt buộc;
  - điều kiện thắng.
- `npm run build`: pass.
- GitHub Pages deploy: pass.
- `docs/AUTO_TECH_STATUS.md` là snapshot deploy tự động mới nhất.

### Lịch sử lỗi đã bắt
- Run #20: test bắt 2 vấn đề; một fixture Thế Mở sai tọa độ và một bug thật ở điều kiện thắng.
- Bug thắng đã sửa từ kiểm 25 điểm thành kiểm không còn quân đối phương.
- Run #22: 13/13 test pass nhưng TypeScript bắt lỗi reduce typing.
- Run #23: test + build + deploy đều pass.

## 6. NEXT ACTION — ưu tiên cao nhất

### Task
**QC Cờ Gánh v0.1 trên bản live rồi chỉnh gameplay/UX nếu cần.**

### Checklist QC
1. Kho game hiển thị cả Ô ăn quan và Cờ Gánh là playable.
2. Vào `#/co-ganh`, bố trí ban đầu phải đúng bàn truyền thống.
3. Đường chéo trên bàn phải đúng pattern cờ Gánh thực tế.
4. Tap quân chỉ hiện đúng các điểm đến theo đường kẻ.
5. Gánh 2 quân đổi màu đúng.
6. Thử thế chầu 4/chầu 6.
7. Vây một nhóm nhiều quân phải đổi toàn nhóm.
8. Thế Mở phải ép đích, nhưng cho chọn quân nào đi vào nếu có nhiều quân hợp lệ.
9. AI Dễ/Vừa/Khó đi hợp lệ và không gây lag đáng kể trên mobile.
10. Mobile: bàn không bị cắt, điểm bấm đủ lớn, text không tràn.

### Nếu QC gameplay ổn
Ưu tiên tiếp theo:
- animation di chuyển quân rõ hơn;
- animation lật quân Gánh/Vây có nhịp;
- tutorial ngắn minh họa Gánh / Vây / Mở;
- polish art direction xứ Quảng / gỗ / đất / vỏ sò.

## 7. Rủi ro / giả định cần nhớ

- Cờ Gánh có dị bản. v0.1 cố ý dùng lõi Gánh + Vây + Mở, không trộn luật app khác.
- Pattern đường chéo được mã hóa theo bàn truyền thống: nút có `row + col` chẵn có các nối chéo kề.
- Cần QC với người quen Cờ Gánh nếu có để xác nhận cảm giác luật địa phương.
- Hard AI depth 4 cần theo dõi hiệu năng trên điện thoại yếu.

## 8. Việc chưa làm

- Sound design.
- Tutorial/onboarding hoàn chỉnh.
- Multiplayer online.
- Account / leaderboard.
- Game 03.
- QC đầy đủ trên nhiều thiết bị.

## 9. Quy tắc cập nhật state

Sau mỗi mốc:
- cập nhật **Đã có**;
- cập nhật **QC**;
- chuyển task hoàn thành khỏi **NEXT ACTION**;
- ghi task tiếp theo;
- thêm quyết định bền vững vào `docs/DECISIONS.md`.

Không ghi việc chưa làm vào mục đã hoàn thành.
