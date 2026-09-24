# CỜ HÙM — PROJECT RULESET / RESEARCH NOTES

Ngày chốt bản đầu: 2026-09-24.

## 1. Nguồn tham khảo

### Nguồn chính
- *100 trò chơi dân gian cho thiếu nhi*, NXB Kim Đồng, phần “23. Cờ Hùm”, trang in 53–55:
  https://medialib.qlgd.edu.vn/Uploads/THU_VIEN/shn/2/912/UserFiles/925-100-tro-choi-dan-gian-cho-thieu-nhi-thuviensach.vn-666fb864-a75c-470e-a942-ce9f2c064424.pdf

Nguồn này cung cấp cả sơ đồ bàn và mô tả luật:
- 2 người.
- 1 Hùm, 15 Trâu.
- Bàn chính 5×5 giao điểm, có đường ngang/dọc/chéo.
- Một Hang Hùm dạng hình vuông xoay, có hai đường chéo, nối vào giữa cạnh phải bàn chính.
- Hùm đi trước.
- Mỗi lượt một quân đi một nước.
- Hùm vồ Trâu bằng cách nhảy qua Trâu theo đúng vạch nếu phía sau còn điểm đáp.
- Trâu thắng khi vây kín Hùm.
- Hùm thắng khi ăn hết Trâu.
- Không được đi lại ngay nước cờ vừa đi trước đó.

### Nguồn đối chiếu
- Special Kid Việt Nam, “Trò chơi dân gian: Cờ hùm”:
  https://specialkid.vn/blogs/cac-tro-choi-cho-be/tro-choi-dan-gian-co-hum

Nguồn này độc lập lặp lại các điểm 1 Hùm / 15 Trâu / Hùm đi trước / nhảy vồ / vây kín.

## 2. Ruleset dự án — CHỐT cho v0.1

### Bàn và bố trí
- 29 giao điểm:
  - 25 điểm bàn chính 5×5;
  - 4 điểm Hang Hùm bổ sung, vì cửa Hang dùng chung với điểm giữa cạnh phải của bàn chính.
- Đường chéo bàn chính dùng pattern đúng sơ đồ sách, tương đương các nút parity chẵn nối chéo tới nút kề.
- Hang Hùm có bốn cạnh và hai đường chéo, giao nhau tại tâm Hang.
- 15 Trâu bắt đầu trên toàn bộ vành ngoài bàn chính, trừ cửa Hang.
- Hùm bắt đầu ở đỉnh ngoài cùng của Hang.

### Nước đi
- Hùm đi trước.
- Hùm và Trâu đều đi một bước sang giao điểm kề còn trống theo đường kẻ.
- Một bên không được lập tức đảo ngược đúng nước mà bên đó vừa đi trong lượt trước.

### Hùm vồ
- Nếu điểm kề theo một đường thẳng có Trâu và điểm tiếp theo trên cùng đường trống, Hùm có thể nhảy qua Trâu tới điểm trống.
- Trâu bị nhảy qua bị loại khỏi bàn.
- Bản v0.1 dùng **một cú vồ / một lượt**.
- Lý do: nguồn đồng thời ghi “mỗi người chỉ được đi một quân cờ một nước”; câu “ăn 2–3 trâu cùng một lúc” được hiểu là thế Hùm có nhiều mục tiêu vồ, không phải chuỗi nhảy liên hoàn. Nếu QC văn hóa cho thấy cách hiểu địa phương khác, cập nhật ruleset trước khi sửa engine.

### Kết thúc
- Hùm thắng khi không còn Trâu.
- Trâu thắng nếu đến lượt Hùm mà Hùm không còn bất kỳ nước đi thường hay nước vồ nào.

## 3. UX / AI v0.1
- Chế độ local 2 người.
- Đấu AI Dễ / Vừa / Khó.
- Khi đấu AI, người chơi được chọn **Hùm** hoặc **Trâu**.
- Tap quân -> highlight điểm đi.
- Nước vồ dùng marker riêng “Vồ”.
- Hùm và Trâu có visual khác nhau rõ ràng.

## 4. Việc cần QC
- So sơ đồ bàn/Hang với người từng chơi thực tế.
- Xác nhận cách hiểu “ăn 2–3 trâu” có phải một lượt nhiều cú nhảy ở dị bản nào cần hỗ trợ hay không.
- Test các thế vây kín ở góc, giữa bàn và trong Hang.
- Test anti-reversal để tránh vòng lặp nhưng không khóa nước hợp lệ ngoài ý muốn.
- Theo dõi AI Hard trên mobile.
