# Durable Decisions

Các quyết định trong file này được coi là đã chốt cho tới khi người dùng chủ động đổi.

## D-001 — Kiến trúc sản phẩm
- Một website chứa nhiều minigame.
- Một repo chung: `momentum448-glitch/Minigame`.
- Thêm từng game như module độc lập.
- Quyết định: CHỐT.

## D-002 — Nền tảng
- Web responsive PC + mobile.
- Mobile-first.
- React + TypeScript + Vite.
- GitHub Pages.
- Chưa cần backend.
- Quyết định: CHỐT.

## D-003 — Game đầu tiên
- Ô ăn quan.
- Art direction dân gian Việt Nam nhưng trình bày hiện đại.
- Quyết định: CHỐT.

## D-004 — Chế độ chơi
- 2 người local.
- Người vs AI.
- AI: Dễ / Vừa / Khó.
- Quyết định: CHỐT.

## D-005 — Tương tác cơ bản
- Chạm ô dân của mình.
- Sau đó chọn hướng trái/phải.
- Quyết định: CHỐT.

## D-006 — Luật chính
- Quan = 10 điểm.
- Có Quan non.
- Quan non không được ăn nếu ô Quan có dưới 5 dân đi kèm.
- Refill 5 ô dân khi bên mình trống.
- Thiếu dân refill thì vay và ghi nợ.
- Kết thúc khi cả hai Quan bị ăn.
- Quyết định: CHỐT.

## D-007 — Animation gameplay
- Trải nghiệm rải quân phải mô phỏng thao tác ngoài đời:
  - cầm toàn bộ quân trong ô;
  - rải từng quân một;
  - bốc tiếp rồi rải tiếp nếu luật yêu cầu;
  - capture/refill cũng có nhịp biểu diễn.
- Không được thay engine luật bằng logic animation.
- Quyết định: CHỐT ngày 2026-09-23.


## D-008 — Animation tempo
- Tốc độ rải mặc định khoảng **500 ms cho mỗi quân** để người chơi theo dõi rõ từng viên.
- Nhịp pickup / bốc tiếp chậm hơn drop một chút; capture có khoảng nghỉ riêng.
- Nếu sau QC thực tế cần đổi, ưu tiên giữ cảm giác rõ ràng ngoài đời hơn là tối đa tốc độ.
- Quyết định: CHỐT ngày 2026-09-23.


## D-009 — Flying pebble path
- Mỗi lần rải/refill phải thấy một viên sỏi **rời vùng tay và bay tới đúng ô đích** trước khi quân được cộng vào ô.
- Quỹ đạo cong nhẹ, có chuyển động xoay và nhịp landing; tổng nhịp vẫn khoảng 500 ms/quân.
- Engine và move trace vẫn là source of truth; quỹ đạo chỉ là lớp biểu diễn.
- Quyết định: CHỐT ngày 2026-09-23.


## D-010 — Game hub entry
- URL gốc của website mở **Kho game**, không mở thẳng một game.
- Mỗi game có route riêng; Ô ăn quan hiện dùng `#/o-an-quan` để tương thích GitHub Pages.
- Trang home hiển thị các game dưới dạng thẻ; game playable có CTA vào chơi, game chưa làm chỉ hiện `Sắp có`.
- Từ game phải có đường quay lại Kho game.
- Các tên game placeholder trên home không mặc định trở thành roadmap đã chốt.
- Quyết định: CHỐT ngày 2026-09-23.
