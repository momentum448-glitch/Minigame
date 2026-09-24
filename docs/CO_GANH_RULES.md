# CỜ GÁNH — PROJECT RULESET / RESEARCH NOTES

Ngày chốt bản đầu: 2026-09-24.

## 1. Nguồn tham khảo

### Nguồn văn hóa / bối cảnh
- Cổng thông tin du lịch Việt Nam: https://www.dulichvn.org.vn/index.php/item/18059
- Báo Đà Nẵng: https://baodanang.vn/co-ganh-thu-choi-tao-nha-cua-nguoi-dan-nong-thon-3235682.html

Hai nguồn này thống nhất các điểm nền:
- Cờ Gánh là trò chơi dân gian gắn với xứ Quảng.
- 2 người chơi.
- 16 quân, mỗi bên 8.
- Bàn 5x5 giao điểm (25 điểm) với đường ngang, dọc, chéo.
- Mỗi lượt di chuyển một bước tới giao điểm trống theo đường kẻ.
- Hai cơ chế lõi là Gánh và Vây.

### Nguồn mô tả chi tiết luật
- Thủ Thuật Chơi: https://thuthuatchoi.com/huong-dan-cach-choi-co-ganh.html
- Hướng dẫn phổ biến: https://www.thegioididong.com/game-app/huong-dan-cach-choi-co-ganh-co-chem-luat-choi-co-dan-gian-don-1323649

Các nguồn này làm rõ:
- Gánh chỉ phát sinh khi người chơi **chủ động đi quân vào giữa** cặp quân đối phương.
- Có thể Gánh nhiều cặp trong cùng một nước ("chầu 4", "chầu 6").
- Vây/Chẹt đổi màu quân hoặc nhóm quân không còn đường thoát.
- Thế Mở: khi một người chủ động tạo vị trí bắt buộc Gánh, đối phương phải thực hiện nước Gánh đó.

## 2. Ruleset dự án — CHỐT cho v0.1

### Bàn
- 25 giao điểm theo lưới 5x5.
- Luôn có đường ngang/dọc giữa hai điểm kề.
- Đường chéo theo đúng pattern bàn truyền thống: các nút có parity chẵn (row + col chẵn) nối tới các nút chéo kề.
- Mỗi bên bắt đầu với 8 quân theo bố trí truyền thống đối xứng.

### Nước đi
- Mỗi lượt di chuyển đúng một quân của mình sang một giao điểm kề đang trống theo đường kẻ.
- Không nhảy qua quân.

### Gánh
- Sau khi quân vừa đi tới điểm mới, xét các cặp đối diện qua điểm đó.
- Nếu cả hai đầu của một cặp đều là quân đối phương, cả hai đổi sang màu người vừa đi.
- Có thể đổi nhiều cặp trong một nước.

### Vây
- Sau Gánh, tìm từng nhóm quân đối phương liên thông theo đường đi.
- Nếu toàn bộ nhóm không có bất kỳ giao điểm trống kề nào, cả nhóm đổi màu.

### Mở
- Chỉ xét điểm vừa được người chơi rời khỏi.
- Nếu điểm đó trở thành trung tâm của ít nhất một cặp quân của người vừa đi và đối phương có quân kề có thể đi vào đó, lượt kế tiếp bị ép đi vào điểm Mở.
- Nếu nhiều quân đối phương cùng có thể vào điểm đó, họ được chọn quân nhưng không được chọn đích khác.

### Kết thúc
- Kết thúc khi 16 quân đều cùng màu.
- Người sở hữu cả 16 quân thắng.

## 3. Biến thể KHÔNG dùng trong v0.1

Một số app/nguồn thứ cấp có nhắc "chém", "ăn xong đi tiếp" hoặc loại quân khỏi bàn. Bản dự án **không dùng** các cơ chế đó vì không nhất quán với bộ mô tả lõi Gánh/Vây/đổi màu được các nguồn văn hóa và hướng dẫn phổ biến dùng.

## 4. UX / AI

- Chế độ: 2 người local + đấu AI.
- AI: Dễ / Vừa / Khó.
- Tap quân -> hiện các điểm đến hợp lệ -> tap điểm đến.
- Khi có Thế Mở, điểm bắt buộc được highlight rõ.
- Quân bị Gánh/Vây dùng animation lật/đổi màu, không biến mất.

## 5. Việc cần QC

- So bố trí ban đầu và pattern đường chéo với người chơi Cờ Gánh thực tế.
- Test các thế chầu 4/chầu 6.
- Test Vây nhóm nhiều quân.
- Test nhiều lựa chọn quân cùng phải đi vào một điểm Mở.
- Theo dõi hiệu năng AI Khó trên mobile.
