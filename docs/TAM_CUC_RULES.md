# TAM CÚC — PROJECT RULESET / RESEARCH NOTES

Ngày chốt bản đầu: 2026-09-24.

## 1. Nguồn tham khảo

### Nguồn văn hóa / bộ bài
- Từ điển Văn hóa, cơ quan nhà nước: mục Đánh chắn có phần mô tả Tam Cúc:
  https://scov.gov.vn/ban-sac-van-hoa/tu-dien-van-hoa/danh-chan.html
- VietnamChess, bài viết về bộ quân Tam Cúc:
  https://vietnamchess.vn/index.php/chessnews/special-news/analys/khacbiet-cotuong

Các nguồn xác nhận:
- Bộ 32 lá.
- 16 đỏ + 16 đen.
- Mỗi màu: 1 Tướng, 2 Sĩ, 2 Tượng, 2 Xe, 2 Pháo, 2 Mã, 5 Tốt.

### Nguồn luật chơi đối chiếu
- GameVH, Hướng dẫn chơi Tam Cúc:
  https://gamevh.me/com/ftl/cms/static/guide_tamcuc.jsp?language=EN
- Thủ Thuật Chơi, Hướng dẫn cách chơi bài Tam Cúc:
  https://thuthuatchoi.com/huong-dan-cach-choi-bai-tam-cuc.html

Hai nguồn thống nhất ở các điểm chính:
- Chơi 2–4 người; tay đôi chia 16 lá/người và hai bên biết bài nhau.
- Thứ tự: Tướng > Sĩ > Tượng > Xe > Pháo > Mã > Tốt.
- Cùng tên: đỏ hơn đen.
- Đôi: 2 lá cùng tên, cùng màu.
- Bộ ba hợp lệ: Tướng–Sĩ–Tượng hoặc Xe–Pháo–Mã cùng màu.
- Người có cái gọi 1/2/3 cây; các bên ra cùng số cây.
- Có quyền Chui, tức chịu thua và không ngửa bài.
- Người thắng lượt giành/giữ cái.
- Có các luật nâng cao: Tứ tử, Ngũ tử trình làng, Kết, Kết Tốt đen, Đè Tốt đen.

## 2. Mâu thuẫn nguồn cần ghi nhớ

Luật lượt đầu có mâu thuẫn:
- Thủ Thuật Chơi ghi khẩu lệnh **“cấm Tướng, cấm Sĩ, lấy Tượng cầm đầu”**, Tượng hồng là cao nhất được phép ngửa.
- Một bản hướng dẫn GameVH lại ghi Xe hồng ở phần lưu ý lượt đầu.

v0.1 chọn **Tượng hồng** vì khớp trực tiếp với khẩu lệnh “lấy Tượng cầm đầu”.
Đây là quyết định dự án, cần QC với người biết chơi thực tế.

## 3. Ruleset dự án v0.1

### Phạm vi
- Chỉ triển khai **tay đôi 2 người**, phù hợp kiến trúc local + AI hiện tại.
- Chia 16 lá/người.
- Hai tay bài đều hiển thị công khai vì nguồn mô tả tay đôi biết bài nhau.
- Người giữ cái đầu tiên được chọn ngẫu nhiên khi bắt đầu ván.

### Gọi bài
- Cái chọn và gọi 1, 2 hoặc 3 cây.
- 1 cây: bất kỳ lá hợp lệ.
- 2 cây: phải là đôi cùng tên + cùng màu.
- 3 cây: chỉ Tướng–Sĩ–Tượng hoặc Xe–Pháo–Mã cùng màu.
- Lượt đầu cấm Tướng/Sĩ trong bộ được ngửa.

### Đáp bài / Chui
- Người đáp phải bỏ đúng số lá bằng số cây được gọi.
- Nếu Ngửa bài, các lá phải tạo thành bộ hợp lệ cùng kích thước.
- Nếu Chui, bộ không cần hợp lệ; các lá vẫn bị bỏ vào lượt và cái thắng lượt.
- Người đáp có thể Chui dù có bộ hợp lệ.

### So bài
- Singles / đôi: theo quân Tướng > Sĩ > Tượng > Xe > Pháo > Mã > Tốt; cùng tên đỏ > đen.
- Bộ ba trên Tướng–Sĩ–Tượng > bộ ba dưới Xe–Pháo–Mã; cùng loại bộ ba thì đỏ > đen.
- Nếu sức mạnh bằng hệt nhau, v0.1 cho **cái thắng hòa**. Đây là fallback số hóa cho trường hợp hai bản sao giống hệt nhau.

### Kết thúc / điểm v0.1
- Mỗi lượt, người thắng nhận tất cả lá đã bỏ ở lượt đó.
- Khi hai tay hết bài, so tổng số lá đã ăn.
- Nhiều lá hơn thắng; 16–16 hòa.
- Đây là scoring số hóa đơn giản cho v0.1.

## 4. Chưa triển khai trong v0.1

- Trình làng Tứ tử / Ngũ tử.
- Ngũ tử cướp cái.
- Kết đôi / Kết ba cuối ván.
- Kết Tốt đen / Đè Tốt đen.
- Tính điểm thưởng truyền thống.
- 3 người / 4 người.

Các luật này được ghi nhận nhưng không giả là đã có.

## 5. UX / AI

- Local 2 người và vs AI Dễ / Vừa / Khó.
- Hai tay bài hiện công khai.
- Chọn lá trực tiếp.
- Cái có nút Gọi bài.
- Người đáp có Ngửa bài / Chui.
- Chiếu giữa bàn hiển thị bài úp khi vừa gọi và bài ngửa sau khi xử lý.
- AI:
  - Dễ: ngẫu nhiên nhiều hơn.
  - Vừa: ưu tiên bộ bắt được.
  - Khó: tận dụng thông tin công khai để ưu tiên lượt đối thủ khó đè.

## 6. QC cần làm

1. Cảm giác tay đôi biết bài nhau có đúng với người chơi Tam Cúc thực tế không.
2. Xác nhận luật lượt đầu Tượng hồng vs Xe hồng.
3. Xác nhận “cái thắng hòa” khi hai lá/bộ ngang sức.
4. Xác nhận Chui vẫn bỏ đúng số lá và mất các lá đó.
5. Sau gameplay core, quyết định có nâng v0.2 lên Trình làng/Kết hay không.
