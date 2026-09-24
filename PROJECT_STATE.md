# MINIGAME — LIVE PROJECT STATE

> Canonical semantic handoff. Cập nhật file này sau mỗi mốc quan trọng.

## 1. Mục tiêu dự án

Xây một website chứa nhiều minigame Việt Nam. Mỗi game là module riêng nhưng dùng chung shell/kho game.

### Game playable
1. **Ô ăn quan** — Game 01.
2. **Cờ Gánh** — Game 02, hoàn tất theo QC người dùng ở v0.2.
3. **Cờ Hùm** — Game 03, playable v0.2.
4. **Cờ Lúa Ngô** — Game 04, playable v0.1.
5. **Tam Cúc** — Game 05, playable v0.2 UX.

Mốc đang active: **QC Tam Cúc v0.2 UX: luật rõ + selected-card feedback**.

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
- Tam Cúc: `#/tam-cuc`.
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
- Trong tự QC UI trước deploy đã bắt và sửa lỗi tap lá không thêm vào selection.
- v0.2 UX: test/build/deploy #31 success; handoff snapshot #21 success.

## 9. NEXT ACTION — ưu tiên cao nhất

### Task
**QC Tam Cúc v0.2 UX trên bản live.**

### Checklist QC
1. Kho game hiển thị 5 game playable.
2. Vào Tam Cúc, mỗi bên phải có 16 lá.
3. Chọn một lá phải nổi bật rõ ngay: nhấc cao + viền/glow + badge `✓ ĐÃ CHỌN`, và khu `ĐANG CHỌN` phải hiện đúng tên lá.
4. Chọn nhiều lá phải liệt kê đầy đủ, không khó phân biệt với lá chưa chọn.
5. Chọn đúng đôi / bộ ba phải Gọi được; bộ sai phải không Gọi được.
6. Lượt đầu Tướng/Sĩ phải bị khóa, Tượng vẫn dùng được.
7. Người đáp phải chọn đúng số lá.
8. Ngửa bài phải so đúng thứ tự Tướng > Sĩ > Tượng > Xe > Pháo > Mã > Tốt và đỏ > đen cùng tên.
9. Chui phải bỏ đúng số lá và cái ăn lượt.
10. Người thắng lượt phải giữ cái lượt sau.
11. Sau lượt phải nhìn rõ bài cái vs bài đáp trên chiếu.
12. Phần luật phải đọc được rõ trên mobile, không thành khối chữ dài khó theo dõi.
13. AI Dễ/Vừa/Khó đi hợp lệ.
14. QC thực tế các giả định: Tượng hồng là trần lượt đầu; cái thắng hòa; Chui vẫn mất số lá đã bỏ.

### Nếu gameplay core được duyệt
Ưu tiên v0.2:
- Trình làng Tứ tử / Ngũ tử;
- Ngũ tử cướp cái;
- Kết đôi / Kết ba;
- Kết Tốt đen / Đè Tốt đen;
- điểm thưởng truyền thống;
- animation úp/ngửa bài rõ hơn.

## 10. Rủi ro / giả định

- Cờ Lúa Ngô có dị bản và một số nguồn thay “Đỗ” bằng từ khác; dự án dùng chuỗi **Lúa · Ngô · Khoai · Sắn · Đỗ** theo Báo Nam Định và các nguồn giáo dục đối chiếu.
- Nguồn không nói rõ việc quay lại node đã đi trong cùng lượt; v0.1 cấm lặp node để tránh backtracking vô hạn.
- Cách “bị chặn thì dừng” cũng cần QC thực tế.
- Hard AI branching cao hơn các game trước, nên depth 3 và cắt ordering.
- Tam Cúc có mâu thuẫn nguồn ở trần lượt đầu (Tượng hồng vs Xe hồng); v0.1 chọn Tượng hồng.
- Tam Cúc v0.1 dùng scoring số hóa theo tổng lá ăn, chưa phải toàn bộ hệ điểm truyền thống.
- Trường hợp hai lá/bộ ngang sức hoàn toàn cho cái thắng hòa là fallback số hóa cần QC.

## 11. Việc chưa làm

- Sound design.
- Tutorial/onboarding hoàn chỉnh.
- Multiplayer online.
- Account / leaderboard.
- Game 06.
- QC nhiều thiết bị.

## 12. Quy tắc cập nhật state

Sau mỗi mốc:
- cập nhật **Đã có**;
- cập nhật **QC**;
- chuyển task hoàn thành khỏi **NEXT ACTION**;
- ghi task tiếp theo;
- thêm quyết định bền vững vào `docs/DECISIONS.md`.

Không ghi việc chưa làm vào mục đã hoàn thành.
