# PROJECT START HERE

Đây là điểm vào bắt buộc cho mọi chat/agent mới tiếp tục dự án **Minigame**.

## Đọc theo thứ tự

1. `PROJECT_STATE.md` — trạng thái sống của dự án, việc đang làm, việc tiếp theo.
2. `docs/AUTO_TECH_STATUS.md` — snapshot kỹ thuật tự động từ lần deploy thành công gần nhất.
3. `docs/DECISIONS.md` — các quyết định đã chốt, không tự ý hỏi lại.
4. `docs/HANDOFF_PROTOCOL.md` — quy tắc tiếp quản và cập nhật handoff.
5. Chỉ sau đó mới đọc source code liên quan tới task hiện tại.

## Nguyên tắc tiếp quản

- Không bắt người dùng kể lại những gì đã có trong các file trên.
- Không tự đảo các quyết định đã chốt.
- Nếu trạng thái file và repo mâu thuẫn, ưu tiên kiểm tra repo/CI thực tế rồi cập nhật `PROJECT_STATE.md`.
- Trước khi code, xác định rõ task hiện tại trong mục **NEXT ACTION** của `PROJECT_STATE.md`.
- Sau mỗi mốc có thay đổi gameplay, kiến trúc, UX, deploy hoặc quyết định sản phẩm, cập nhật `PROJECT_STATE.md`.
- Khi hoàn tất một mốc deploy, kiểm tra GitHub Actions và URL live trước khi báo hoàn thành.

## Project

- Repo: https://github.com/momentum448-glitch/Minigame
- Live: https://momentum448-glitch.github.io/Minigame/
- Game playable: Ô ăn quan, Cờ Gánh, Cờ Hùm, Cờ Lúa Ngô, Tam Cúc, Bài Chòi, Monster Chess prototype v0.1
- Mốc hiện tại: Monster Chess v0.1 đã tạm dừng có chủ đích; chờ task mới của người dùng
