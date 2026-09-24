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


## D-011 — Game 02
- Game thứ hai của kho Minigame là **Cờ Gánh**.
- Cờ Gánh là game playable riêng, không phải placeholder.
- Route: `#/co-ganh`.
- Quyết định: CHỐT ngày 2026-09-24.

## D-012 — Cờ Gánh ruleset v0.1
- 16 quân đổi màu, không loại quân khỏi bàn.
- Đi một bước sang giao điểm kề theo đúng đường kẻ.
- Dùng ba cơ chế lõi: **Gánh + Vây + Mở**.
- Gánh chỉ phát sinh khi người chơi chủ động đi vào giữa cặp quân đối phương.
- Vây áp dụng cho cả nhóm liên thông không còn giao điểm trống kề.
- Thế Mở ép đối phương đi vào điểm vừa được tạo nếu đó là nước Gánh hợp lệ bắt buộc.
- Thắng khi không còn quân màu đối phương.
- Không dùng biến thể `chém` hoặc `ăn xong đi tiếp` trong v0.1.
- Chi tiết nguồn và mapping bàn: `docs/CO_GANH_RULES.md`.
- Quyết định: CHỐT ngày 2026-09-24.


## D-013 — Cờ Gánh animation language
- Mục tiêu animation: cân bằng nhưng **nghiêng về rõ ràng** hơn hiệu ứng phô diễn.
- Nhịp di chuyển quân mục tiêu: khoảng **450–550 ms**, lấy mốc làm việc ~500 ms.
- Kiểu di chuyển: **nhấc nhẹ rồi lướt sang điểm đích và đáp xuống**, không bay cong như Ô ăn quan.
- Quân bị Gánh: **flip/lật + đổi màu + glow/pulse** để nhấn mạnh việc đổi phe.
- Nếu nhiều quân bị Gánh trong một nước: hiệu ứng **lần lượt từng quân** thay vì đổi đồng thời.
- Quyết định: CHỐT ngày 2026-09-24.


## D-014 — Cờ Gánh capture timing
- **Vây dùng hiệu ứng riêng** dạng làn sóng qua nhóm bị khóa, không dùng cùng hiệu ứng flip của Gánh.
- Quân bị **Gánh đổi phe lần lượt**, lấy nhịp khoảng **400 ms/quân** để đọc rõ từng quân.
- Sau khi quân di chuyển đáp xuống, nghỉ khoảng **200 ms** trước khi bắt đầu chuỗi Gánh/Vây.
- Engine/state logic không đổi; UI phát sequence từ kết quả đã resolve.
- Quyết định: CHỐT ngày 2026-09-24.


## D-015 — Game 03
- Game thứ ba của Kho game là **Cờ Hùm**.
- Dùng biến thể dân gian **1 Hùm + 15 Trâu**, không dùng Cờ Hùm Tôm.
- Route: `#/co-hum`.
- Quyết định: CHỐT ngày 2026-09-24.

## D-016 — Cờ Hùm ruleset v0.1
- Bàn chính 5×5 giao điểm + Hang Hùm nối giữa cạnh phải.
- Tổng graph 29 node: 25 bàn chính + 4 node Hang bổ sung.
- 15 Trâu ở vành ngoài bàn chính, trừ cửa Hang; Hùm ở đỉnh ngoài của Hang.
- Hùm đi trước.
- Mỗi lượt một quân đi một bước theo đường kẻ tới điểm trống.
- Hùm vồ bằng một cú nhảy qua Trâu sang landing trống trên cùng đường; Trâu bị loại.
- v0.1 dùng **1 capture/lượt**, không multi-jump.
- Cấm lập tức đảo ngược exact nước của cùng bên ở lượt trước.
- Hùm thắng khi ăn hết 15 Trâu.
- Trâu thắng khi Hùm không còn step/capture hợp lệ.
- Đấu AI cho phép người chơi chọn bên Hùm hoặc Trâu.
- Nguồn và các giả định: `docs/CO_HUM_RULES.md`.
- Quyết định: CHỐT ngày 2026-09-24.


## D-017 — Cờ Hùm animation + forbidden move feedback
- Mục tiêu UX: cân bằng nhưng **nghiêng về rõ luật**.
- Tempo di chuyển quân: khoảng **550–650 ms**, lấy mốc triển khai **600 ms**.
- Di chuyển phải thấy quân đi từ từ từ điểm cũ tới điểm mới.
- Nước **Vồ** dùng sequence riêng: Hùm nhảy -> nghỉ khoảng 200 ms -> Trâu rung/trúng đòn -> biến mất -> cập nhật số Trâu.
- Hiệu ứng Vồ phải có marker thị giác rõ, gồm nhãn **VỒ!** và impact ring.
- Nước cấm đi ngược không hiển thị như nước hợp lệ.
- Nếu người chơi thử chạm đúng điểm bị cấm, điểm đó nháy đỏ + hiện `↩ CẤM` + giải thích “Không được đi ngược lại đúng nước mà bên này vừa di chuyển.”
- Input khóa trong toàn bộ move/capture animation; AI dùng cùng animation.
- Quyết định: CHỐT ngày 2026-09-24.
