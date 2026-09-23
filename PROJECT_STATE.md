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
- Unit test engine cơ bản.
- GitHub Actions build/test/deploy.
- GitHub Pages live.

### QC đã xác nhận
- `npm install`: pass trên GitHub Actions.
- `npm test`: 3/3 test pass ở mốc v0.1 ban đầu.
- `npm run build`: pass.
- Deploy GitHub Pages: pass.
- Xem `docs/AUTO_TECH_STATUS.md` để biết snapshot kỹ thuật mới nhất.

## 5. Pain / thiếu sót hiện tại

Gameplay hiện đang cập nhật trạng thái bàn gần như tức thì sau khi chọn hướng.

Điều này chưa đạt trải nghiệm ngoài đời mà người dùng yêu cầu:
- phải có cảm giác **cầm toàn bộ quân trong ô lên tay**;
- sau đó **rải từng quân một**;
- nhìn thấy từng viên di chuyển/rơi vào từng ô theo nhịp;
- nếu gặp ô dân có quân và tiếp tục bốc/rải, cũng phải biểu diễn bằng hoạt ảnh;
- nếu ăn quân, cần có nhịp capture riêng thay vì điểm nhảy tức thời.

## 6. NEXT ACTION — ưu tiên cao nhất

### Task
Xây **realistic sowing animation system** cho Ô ăn quan.

### Hướng kiến trúc đã chọn sơ bộ
Không nhét animation trực tiếp vào `applyMove()`.

Thay vào đó:
1. Giữ engine deterministic hiện tại phục vụ AI/test.
2. Thêm một lớp tạo **move trace / event sequence** từ một nước đi.
3. UI phát lần lượt các event để tạo animation.
4. Sau khi animation hoàn tất, state cuối phải giống kết quả engine hiện tại.

### Event dự kiến
- `pickup`: nhấc toàn bộ quân khỏi ô.
- `drop`: thả 1 quân vào một ô.
- `continue-pickup`: bốc quân ở ô tiếp theo để tiếp tục rải.
- `capture`: thu quân/Quan về phía người chơi.
- `refill`: rải lại 1 dân mỗi ô khi bên mình hết dân.
- `turn-end`: kết thúc animation và chuyển lượt.

### Yêu cầu UX
- Trong lúc animation chạy, khóa thao tác chọn nước mới.
- Quân phải rải **từng viên**, không teleport cả cụm.
- Tốc độ đủ nhìn rõ nhưng không lê thê.
- Mobile phải mượt.
- Respect `prefers-reduced-motion`: có thể rút ngắn/chuyển trạng thái nhanh hơn.
- AI cũng dùng cùng hệ animation khi đi.
- Không được làm thay đổi kết quả luật/AI.

### Acceptance criteria tối thiểu
- Chọn ô 5 dân -> nhìn thấy 5 lần rải riêng biệt.
- Nước đi nối chuỗi -> có animation bốc ô tiếp theo rồi rải tiếp.
- Ăn quân -> animation capture sau ô trống.
- Không thể click nước khác khi chuỗi chưa xong.
- State cuối animation = `applyMove()` cho cùng một nước.
- Test engine cũ vẫn pass.
- Bổ sung test cho event trace.
- CI build/test pass và Pages deploy thành công.

## 7. Rủi ro cần kiểm chứng

- Mapping chiều trái/phải trên UI phải khớp vòng index engine.
- Chuỗi rải dài có thể tạo nhiều event; cần giới hạn/đảm bảo không loop vô hạn.
- Hard AI depth 5 hiện chạy đồng bộ; trên máy yếu có thể cần tối ưu sau, nhưng chưa phải task hiện tại.
- Bộ test hiện còn mỏng, chưa bao phủ đủ Quan non/capture chain/refill/debt.

## 8. Việc chưa làm, không được tự coi là đã xong

- Hoạt ảnh rải quân thật.
- Hoạt ảnh cầm quân/ăn quân/refill.
- Tutorial/onboarding.
- Sound design.
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
