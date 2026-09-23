# MINIGAME — LIVE PROJECT STATE

> Canonical semantic handoff. Cập nhật file này sau mỗi mốc quan trọng.

## 1. Mục tiêu dự án

Xây một website chứa nhiều minigame. Mỗi lần chỉ phát triển một game riêng biệt, nhưng dùng chung shell/kiến trúc website để có thể thêm game mới về sau.

Game đầu tiên: **Ô ăn quan**.

Outcome hiện tại: hoàn thiện Ô ăn quan thành một minigame web chơi vui, responsive PC + mobile, có trải nghiệm đủ gần trò chơi ngoài đời.

## 2. Repo / Deploy

- Repository: `momentum448-glitch/Minigame`
- Default branch: `main`
- Live URL: https://momentum448-glitch.github.io/Minigame/
- Stack: React + TypeScript + Vite
- Deploy: GitHub Pages qua GitHub Actions
- Backend: chưa dùng
- Database / login / leaderboard online: ngoài scope hiện tại

## 3. Quyết định sản phẩm đã chốt

### Website
- Một repo duy nhất cho toàn bộ website minigame.
- Mỗi game là module độc lập.
- Responsive PC + mobile.
- Mobile-first.
- Mục tiêu chính: chơi vui.

### Ô ăn quan
- Chế độ:
  - 2 người chơi trên cùng thiết bị.
  - Người chơi đấu máy.
- AI có 3 mức: Dễ / Vừa / Khó.
- Art direction: dân gian Việt Nam, đất/gỗ/sỏi, nhưng UI hiện đại và sạch.
- Tương tác: chạm ô dân -> chọn hướng trái/phải.
- Quan = 10 điểm.
- Có luật Quan non.
- Quan chỉ được ăn khi ô Quan có ít nhất **5 dân đi kèm**.
- Nếu đầu lượt 5 ô dân phía mình đều trống:
  - dùng 5 dân đã ăn để rải lại;
  - thiếu thì vay và ghi nợ.
- Ván kết thúc khi cả hai Quan đã bị ăn.
- Animation gameplay mô phỏng thao tác ngoài đời: bốc cả nắm -> rải từng quân -> bốc tiếp -> capture/refill theo nhịp.

## 4. Trạng thái triển khai hiện tại

### Đã có
- React/Vite app chạy được.
- Bàn Ô ăn quan responsive.
- Game engine tách khỏi UI.
- Luật rải quân / ăn quân / ăn liên hoàn.
- Luật Quan non.
- Cơ chế refill và nợ.
- Tính điểm / kết thúc ván.
- Chế độ local 2 người.
- AI Dễ / Vừa / Khó.
- GitHub Actions build/test/deploy.
- GitHub Pages live.
- Hệ thống handoff tự động trong repo.
- Move trace/event sequence tách khỏi UI.
- Animation `pickup`: nhấc toàn bộ quân khỏi ô vào "tay".
- Animation `drop`: rải từng quân một, số quân trên tay giảm dần; tempo hiện tại khoảng **500 ms/quân**.
- Mỗi quân `drop/refill` có **viên sỏi bay từ vùng tay tới đúng ô đích** theo quỹ đạo cong nhẹ (~390 ms), sau đó mới cập nhật cụm sỏi trong ô (~110 ms landing).
- Animation `continue-pickup`: bốc tiếp ô dân có quân rồi tiếp tục rải.
- Animation `capture`: nhịp ăn quân/Quan và hiển thị điểm ăn.
- Animation `refill`: rải lại từng quân khi bên mình hết dân.
- Khóa input trong toàn bộ chuỗi animation.
- AI cũng phát cùng chuỗi animation khi đi.
- Hỗ trợ `prefers-reduced-motion`.
- Sửa mapping nút trái/phải theo vị trí hiển thị của từng người chơi, tránh nhãn hướng bị ngược với đường rải trên bàn.

### QC đã xác nhận
- Deploy workflow #18 cho commit `23d29fdc295e8a2a56fc86beda16b82f93021eb0`: success.
- Run #17 từng fail do TypeScript narrowing ở lớp visual bay sỏi; đã sửa ở run #18, test/build/deploy đều pass.
- `npm install`: pass trên GitHub Actions.
- `npm test`: **7/7 pass**.
  - 3 test engine cũ.
  - 4 test move trace mới.
- Test xác nhận `trace.finalState === applyMove(...)` cho các nước mở đầu và case capture.
- `npm run build`: pass.
- GitHub Pages deploy: pass.
- Xem `docs/AUTO_TECH_STATUS.md` để biết snapshot kỹ thuật mới nhất.

## 5. Pain / thiếu sót hiện tại

Hệ animation đã có về mặt logic và UX cơ bản, nhưng **cảm giác thực tế** cần QC trực tiếp trên điện thoại/PC:
- tempo đã tăng từ ~175 ms lên **~500 ms/quân** theo QC người dùng; cần xác nhận cảm giác thực tế đã đủ rõ chưa;
- viên sỏi đã bay từ vùng tay tới ô thật; **visual bàn tay** vẫn đang là UI tượng trưng, chưa phải bàn tay/cup tự nhiên;
- capture hiện dùng highlight + điểm nổi, có thể cần cảm giác thu quân rõ hơn;
- cần kiểm tra chuỗi nước rất dài xem có cảm giác lê thê không;
- cần QC touch/scroll trên mobile vì bàn hiện có thể cuộn ngang ở màn hẹp.

## 6. NEXT ACTION — ưu tiên cao nhất

### Task
**QC thực tế animation v0.2.2: viên sỏi bay từ tay vào từng ô, giữ tempo ~500 ms/quân.**

### Cần kiểm tra
1. Chọn ô 5 dân: có thấy rõ từng viên sỏi rời vùng tay, bay theo quỹ đạo và đáp đúng từng ô không.
2. Chuỗi bốc tiếp/rải tiếp: người chơi có theo kịp diễn biến không.
3. Capture: có hiểu rõ ô nào vừa bị ăn và bao nhiêu điểm không.
4. Tốc độ rải hiện tại (~500 ms mỗi quân) đã đủ chậm và rõ chưa, hay cần tinh chỉnh tiếp.
5. Mobile: thao tác chọn ô, chọn hướng, cuộn bàn có ổn không.
6. AI: khi máy đi, animation có đủ rõ để người chơi hiểu nước máy vừa thực hiện không.

### Hướng cải tiến nếu QC yêu cầu
- thay "tay tượng trưng" bằng hand/cup visual tự nhiên hơn;
- easing/squash và glow khi viên quân rơi đã được tăng độ rõ ở v0.2.1; tiếp tục tinh chỉnh nếu QC thực tế yêu cầu.
- thêm animation thu quân về vùng điểm;
- cho phép tốc độ animation Nhanh / Thường / Chậm nếu thật sự cần.

## 7. Rủi ro cần kiểm chứng

- Chuỗi rải dài có thể tạo nhiều event và kéo dài cảm giác chờ.
- Hard AI depth 5 hiện chạy đồng bộ; trên máy yếu có thể cần tối ưu sau.
- Bộ test luật vẫn chưa bao phủ đủ Quan non/capture chain/refill/debt.
- Cần test mobile thật để xác nhận scroll + touch trong animation.

## 8. Việc chưa làm, không được tự coi là đã xong

- Visual bàn tay/cup ở mức tự nhiên hơn; quỹ đạo viên sỏi đã có.
- Sound design.
- Tutorial/onboarding.
- QC đầy đủ trên nhiều kích thước mobile.
- Bộ test luật toàn diện.
- Trang home chứa nhiều game.
- Minigame thứ 2.

## 9. Quy tắc cập nhật state

Sau mỗi mốc:
- cập nhật **Đã có**;
- cập nhật **QC**;
- chuyển task hoàn thành khỏi **NEXT ACTION**;
- ghi task kế tiếp;
- thêm quyết định mới vào `docs/DECISIONS.md` nếu đó là quyết định bền vững.

Không xóa lịch sử quyết định quan trọng chỉ vì code đã thay đổi.
