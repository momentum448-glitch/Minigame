# CỜ LÚA NGÔ — PROJECT RULESET / RESEARCH NOTES

Ngày chốt bản đầu: 2026-09-24.

## 1. Nguồn tham khảo

### Nguồn chính
- Báo Nam Định, “Cờ lúa ngô”, 09/12/2011:
  https://baonamdinh.vn/channel/5087/201112/Co-lua-ngo-2141513/
- *100 trò chơi dân gian cho thiếu nhi*, NXB Kim Đồng, mục “Cờ Lúa Ngô”.
- Tạp chí Khoa học số 57, tháng 03/2023, ví dụ Cờ lúa ngô:
  https://scholar.dlu.edu.vn/thuvienso/bitstream/DLU123456789/195980/1/CVv459S572023081.pdf
- Special Kid Việt Nam, “Trò chơi dân gian: Cờ lúa ngô”:
  https://specialkid.vn/blogs/cac-tro-choi-cho-be/tro-choi-dan-gian-co-lua-ngo

Các nguồn thống nhất:
- 2 người.
- 8 quân, chia 4–4.
- Bàn gồm hai hình chữ nhật chồng vuông góc, một dọc và một ngang.
- Mỗi lượt chỉ đi một quân.
- Mỗi góc / điểm cắt là một bước.
- Năm nhịp đọc: **Lúa, Ngô, Khoai, Sắn, Đỗ**.
- Không được vượt qua chỗ đang có quân.
- Chỉ bước thứ 5 mới có thể ăn quân đối phương.
- Ăn hết quân đối phương thì thắng.

## 2. Bàn cờ số hóa

Bàn được mô hình hóa bằng 12 giao điểm:
- hình chữ nhật đứng: 8 điểm trên hai cạnh dọc + 4 góc;
- hình chữ nhật ngang dùng chung 4 điểm giao với hình đứng và thêm 4 điểm ngoài hai bên.

Bố trí ban đầu:
- 4 quân Người chơi 2 ở nửa trên hình chữ nhật đứng;
- 4 quân Người chơi 1 ở nửa dưới;
- 4 điểm ngoài hai cánh để trống.

## 3. Ruleset dự án v0.1

### Nhịp đi
- Người chơi chọn một quân.
- Quân đi từng bước theo đường kẻ.
- Bước 1–5 tương ứng: **Lúa → Ngô → Khoai → Sắn → Đỗ**.
- Bốn bước đầu chỉ được đi vào điểm trống.
- Bước thứ 5:
  - có thể đi vào điểm trống và hết lượt;
  - hoặc đi vào điểm có quân đối phương để ăn, thế quân mình vào đó.

### Chặn đường
- Không được vượt qua điểm đang có quân.
- Nếu trước bước 5 không còn điểm trống hợp lệ để đi tiếp, quân dừng tại điểm hiện tại và hết lượt.

### Giả định số hóa cần QC
Nguồn không nói rõ có được quay lại một giao điểm vừa đi qua trong cùng lượt hay không.
v0.1 **không cho lặp lại giao điểm trong cùng lượt** để giữ ý nghĩa tính đường 5 bước và tránh vòng lặp qua lại vô hạn.
Đây là giả định dự án, không tuyên bố là luật dân gian duy nhất.

Nguồn cũng có dị bản “Kim, Mộc, Thủy, Hỏa, Thổ”. v0.1 không dùng dị bản đó.

### Thắng
- Bên nào ăn hết 4 quân đối phương trước thì thắng.
- Fallback số hóa: nếu tới lượt một bên mà không còn bất kỳ nước đi nào, bên kia thắng để tránh trạng thái treo.

## 4. UX / AI v0.1
- Local 2 người.
- Người vs AI Dễ / Vừa / Khó.
- Mỗi bước được chọn trực tiếp trên bàn và hiển thị nhịp đang đi.
- Bước Đỗ có mục tiêu ăn riêng màu đỏ.
- AI phát lại toàn bộ đường 5 nhịp để người chơi theo dõi.

## 5. Việc cần QC
- So topology 12 node với người từng chơi thực tế.
- Xác nhận giả định “không lặp giao điểm trong cùng lượt”.
- Xác nhận trường hợp bị chặn trước bước 5 nên tự dừng như v0.1.
- Kiểm tra AI Hard trên mobile.
- Kiểm tra nhịp animation 390 ms/bước có đủ rõ hay cần chậm hơn.
