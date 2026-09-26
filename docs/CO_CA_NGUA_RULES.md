# CỜ CÁ NGỰA — RULESET v0.1

> Ruleset dự án Game 08. Đây là biến thể đã chốt với người dùng, không mặc định đồng nhất với mọi bộ luật Cờ cá ngựa ngoài đời.

## 1. Chế độ

- Local: 2–4 người.
- Đấu AI: người chơi + máy để đủ 2–4 ghế.
- Mỗi màu có **4 ngựa**.
- Mục tiêu: đưa đủ 4 ngựa vào chuồng và chiếm các bậc **6, 5, 4, 3**.

## 2. Bàn đua

- Đường đua ngoài gồm **56 ô**.
- Có 4 cửa chuồng, cách nhau 14 ô.
- Mỗi màu có một điểm xuất quân/cửa chuồng riêng.
- Hai người chơi mặc định ngồi hai phía đối diện.
- Mỗi quân phải hoàn thành một vòng theo chiều chạy rồi mới được leo chuồng của mình.

## 3. Hai xúc xắc

- Mỗi lượt bắt đầu bằng **2 xúc xắc**.
- Hai mặt xúc xắc là **hai quyền hành động riêng**, không cộng tổng bắt buộc.
- Người chơi có thể:
  - dùng hai viên cho hai ngựa khác nhau; hoặc
  - dùng lần lượt cả hai viên cho cùng một ngựa nếu từng nước đều hợp lệ.
- Thứ tự dùng hai viên do người chơi chọn.

## 4. Luật mặt 6

- Một mặt **6** có thể dùng để xuất một ngựa từ sân ra điểm xuất quân nếu điểm đó hợp lệ.
- Mặt 6 cũng có thể dùng để di chuyển bình thường nếu người chơi không muốn/không thể xuất quân.
- **Mỗi viên ra 6 tạo đúng 1 xúc xắc tung bù** sau khi xử lý xong lô xúc xắc hiện tại.
- Ví dụ:
  - 6 + 4: xử lý hai viên, sau đó tung bù **1 viên**.
  - 6 + 6: xử lý hai viên, sau đó tung bù **2 viên**.
- Nếu lượt tung bù lại xuất hiện mặt 6, mỗi mặt 6 mới lại tạo thêm một viên tung bù theo cùng quy tắc.

## 5. Luật mặt 1 — bay tới cửa chuồng kế tiếp

Khi dùng một viên có mặt **1** cho ngựa đang ở đường đua ngoài, người chơi có hai lựa chọn nếu hợp lệ:
1. đi bình thường 1 ô; hoặc
2. **bay tới cửa chuồng kế tiếp phía trước theo chiều chạy**.

Điều kiện bay:
- giữa vị trí hiện tại và cửa chuồng kế tiếp không có bất kỳ quân nào cản đường;
- ô cửa chuồng đích không có quân cùng màu;
- nếu ô đích có quân đối phương, quân đối phương bị đá về sân;
- nếu cửa chuồng kế tiếp chính là cửa chuồng của mình sau khi đã đủ một vòng, ngựa chuyển sang trạng thái **đứng ở cửa chuồng**, sẵn sàng leo chuồng.

Luật bay mặt 1 là biến thể riêng đã chốt cho dự án.

## 6. Cản và đá

- Không được vượt qua bất kỳ quân nào đang đứng trên các ô trung gian của đường đi.
- Không được đi vào ô đang có quân cùng màu.
- Nếu kết thúc nước đi đúng ô có quân đối phương, quân đối phương bị **đá về sân**.
- Nếu một viên xúc xắc không tạo ra nước hợp lệ nào, viên đó bị bỏ.
- Nếu toàn bộ xúc xắc của lượt đều không dùng được, lượt kết thúc sau khi xử lý các lượt tung bù bắt buộc (nếu có).

## 7. Hoàn thành vòng và cửa chuồng

- Một ngựa trên đường đua có tiến độ 0–55.
- Ngựa phải **đi đúng số** để hoàn thành vòng và tới cửa chuồng của mình.
- Nếu số xúc xắc làm vượt quá cửa chuồng, nước đó không hợp lệ.
- Khi vừa đủ vòng, ngựa đứng ở cửa chuồng (bậc 0), tách khỏi đường đua ngoài.

## 8. Leo chuồng 1 → 6

- Chuồng mỗi màu có các bậc **1, 2, 3, 4, 5, 6**.
- Ngựa ở cửa chuồng/bậc hiện tại chỉ được leo **một bậc kế tiếp** khi có đúng mặt xúc xắc bằng số của bậc kế tiếp.
  - cửa → bậc 1 cần mặt 1;
  - bậc 1 → bậc 2 cần mặt 2;
  - ...
  - bậc 5 → bậc 6 cần mặt 6.
- Không được leo vào bậc đã có ngựa cùng màu.
- Không có đá quân trong chuồng riêng.

## 9. Thắng

Một người thắng ngay khi 4 ngựa của mình lần lượt chiếm đủ các bậc:
- 3
- 4
- 5
- 6

Tức là không cần ngựa đứng ở bậc 1 hoặc 2 khi kết thúc.

## 10. Luật phụ

v0.1 **không dùng**:
- thầu mạ;
- sập hầm;
- phạt/thưởng tiền;
- luật giao kèo gia đình khác.

Có thể bổ sung sau dưới dạng “Luật vui”.

## 11. Animation / UX đã chốt

- Xúc xắc phải lắc, nảy 2–3 nhịp rồi mới dừng.
- Ngựa di chuyển **từng ô**, không teleport cho nước đi thường.
- Nhịp mục tiêu: khoảng 180–250 ms/ô.
- Khi đá: quân bị đá rung/bật rồi bay về sân.
- Khi bay bằng mặt 1: dùng animation riêng, rõ là một “cú bay” qua đường đua.
- Khi leo chuồng: ngựa nhảy từng bậc với nhịp rõ.
- Engine là source of truth; animation chỉ trình diễn kết quả engine.

## 12. Việc chưa khóa

- Heuristic và độ khó AI.
- Màu/visual cuối.
- Âm thanh xúc xắc, vó ngựa, đá quân.
- Tempo animation chính xác sau QC mobile.
