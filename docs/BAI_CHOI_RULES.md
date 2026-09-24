# BÀI CHÒI — PROJECT RULESET / RESEARCH NOTES

Ngày chốt bản đầu: 2026-09-24.

## 1. Bối cảnh văn hóa

UNESCO ghi danh **Nghệ thuật Bài Chòi Trung Bộ Việt Nam** vào Danh sách Di sản văn hóa phi vật thể đại diện của nhân loại năm 2017. UNESCO mô tả Bài Chòi kết hợp âm nhạc, thơ, diễn xuất, hội họa và văn học; một trong hai hình thức chính là trò chơi Bài Chòi trong các chòi tre vào dịp Tết.

Nguồn:
- UNESCO: https://ich.unesco.org/en/RL/the-art-of-bai-choi-in-central-viet-nam-01222

## 2. Nguồn luật chơi

### Đà Nẵng / Hòa Vang
- Cổng thông tin Đà Nẵng, “Nghệ thuật Bài chòi ở Hòa Vang”:
  https://hoavang.danang.gov.vn/vi/w/nghe-thuat-bai-choi-o-hoa-vang-381733
- Mô tả bộ bài, 9 chòi/27 cặp và các pho bài.

### Báo Đà Nẵng
- “Nao nức bài chòi”
  https://baodanang.vn/nao-nuc-bai-choi-3231738.html
- “Rủ nhau nghe hội bài chòi”
  https://baodanang.vn/ru-nhau-nghe-hoi-bai-choi-3233235.html
- Mô tả mỗi chòi có 3 con bài, Anh Hiệu rút/hô, chòi trúng gõ mõ, đủ 3 con thì “Tới”.

### Bình Định
- Báo Bình Định/Gia Lai, bài về hệ thống câu thai Bài Chòi, 2023.
- Nêu hệ 27 tên con bài dùng trong hội đánh Bài Chòi Bình Định.

## 3. Bộ 27 con dùng trong v0.1

Bản dự án dùng đúng danh sách 27 tên được nguồn Bình Định liệt kê:
1. Ông Ầm
2. Tứ Cẳng
3. Bạch Huê
4. Chín Gối
5. Sáu Ghe
6. Năm Dụm
7. Tứ Xách
8. Nhì Nghèo
9. Ba Gà
10. Tứ Tượng
11. Tám Dùng
12. Ngũ Trợt
13. Tứ Móc
14. Tam Quăng
15. Bánh Hai
16. Cửu Điều
17. Ba Bụng
18. Chín Cu
19. Nhứt Nọc
20. Thất Vung
21. Bát Bồng
22. Lục Chạng
23. Tám Miểng
24. Nhứt Trò
25. Bảy Thưa
26. Bảy Liễu
27. Cửu Chùa

Tên bài có dị bản theo địa phương; v0.1 không cố trộn các cách gọi.

## 4. Ruleset dự án v0.1

### Hội 9 chòi
- Có 9 chòi.
- Một bộ 27 con được xáo và chia hết, mỗi chòi 3 con, không trùng.
- Một bộ trùng thứ hai gồm đúng 27 con được dùng làm **bài tỳ** để Anh Hiệu rút.

### Một lượt rút
1. Anh Hiệu rút con tiếp theo từ ống bài tỳ.
2. Trước khi xướng tên, UI hiện một câu **hô thai minh họa**.
3. Khi xướng tên, chòi đang sở hữu con bài đó được ghi một lần trúng.
4. UI mô phỏng tiếng gõ mõ bằng hiệu ứng “CỐC! CỐC!”.

### Thắng
- Chòi đầu tiên trúng đủ cả 3 con bài của mình thì **TỚI** và thắng hội.
- Hội dừng ngay khi có chòi Tới.

## 5. Chế độ người chơi

### Solo
- 1 chòi người chơi + 8 chòi máy.

### Local
- 2 chòi người chơi + 7 chòi máy.

Bài Chòi là trò may rủi theo thứ tự rút bài, không có quyết định chiến thuật từ các chòi. Vì vậy v0.1 **không có AI Dễ/Vừa/Khó**; chòi máy không can thiệp xác suất hay thứ tự rút.

## 6. Câu hô thai trong bản web

Các câu hiển thị trong game là **câu minh họa mới do dự án biên soạn**, chỉ nhằm tạo nhịp chờ và giới thiệu tinh thần hô thai.
Không khẳng định đây là lời cổ hay lời nghệ nhân truyền thống.

Lý do:
- câu thai truyền thống có rất nhiều dị bản địa phương;
- hô thai là một phần nghệ thuật ứng khẩu/diễn xướng, không nên giả lập một corpus nhỏ như “chuẩn duy nhất”;
- v0.1 ưu tiên minh bạch và tránh sao chép dài lời từ nguồn.

## 7. Việc cần QC

1. Cảm giác “Hô thai -> xướng tên -> gõ mõ -> đánh dấu” có đủ rõ không.
2. Chòi người chơi phải đọc được rõ 3 con bài trên mobile.
3. 8/7 chòi máy nên chỉ hiện tiến độ để giao diện không quá dày.
4. Hiệu ứng “TỚI!” cần đủ vui nhưng không che toàn bộ màn hình.
5. Có cần thêm âm thanh mõ/trống thật ở v0.2 hay không.
6. Có cần bộ hình vẽ con bài truyền thống thay cho thẻ chữ ở v0.2 hay không.
