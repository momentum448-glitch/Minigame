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
