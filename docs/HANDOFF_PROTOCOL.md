# Handoff Protocol

## Mục tiêu

Một chat mới trong cùng dự án có thể tiếp tục mà không cần người dùng kể lại lịch sử.

## Source of truth

Ưu tiên theo thứ tự:
1. Repo và GitHub Actions thực tế.
2. `PROJECT_STATE.md`.
3. `docs/DECISIONS.md`.
4. Lịch sử chat.

Nếu có mâu thuẫn, kiểm tra trạng thái repo/CI rồi sửa lại handoff.

## Quy trình khi mở chat mới

1. Đọc `PROJECT_START_HERE.md`.
2. Đọc `PROJECT_STATE.md`.
3. Đọc `docs/AUTO_TECH_STATUS.md`.
4. Đọc `docs/DECISIONS.md`.
5. Kiểm tra repo/Actions nếu task phụ thuộc trạng thái deploy hiện tại.
6. Tóm tắt ngắn:
   - đang ở đâu;
   - task tiếp theo;
   - blocker nếu có.
7. Tiếp tục làm, không hỏi lại các quyết định đã có.

## Quy trình trước khi code

- Xác nhận task khớp **NEXT ACTION**.
- Nếu yêu cầu mới thay đổi NEXT ACTION, cập nhật state.
- Chỉ hỏi người dùng khi có quyết định thật sự ảnh hưởng lớn và chưa được chốt.

## Quy trình sau khi code

Nếu thay đổi source/gameplay/UI/architecture:
1. Test.
2. Build.
3. Deploy hoặc kiểm tra CI.
4. Cập nhật `PROJECT_STATE.md`.
5. Nếu có quyết định bền vững mới, cập nhật `docs/DECISIONS.md`.
6. Đảm bảo **NEXT ACTION** phản ánh việc tiếp theo thật sự.

## Không được làm

- Không báo "xong" chỉ vì code đã push.
- Không coi deploy thành công nếu chưa kiểm tra Actions.
- Không bắt người dùng copy lại handoff nếu repo vẫn truy cập được.
- Không hỏi lại lựa chọn đã ghi trong DECISIONS.
- Không ghi những dự định chưa làm vào mục "Đã có".

## Handoff quality gate

Một handoff tốt phải trả lời được trong dưới 2 phút đọc:
- Dự án là gì?
- Repo/live ở đâu?
- Cái gì đã chạy?
- Cái gì đã test?
- Quyết định nào không được hỏi lại?
- Bug/pain hiện tại là gì?
- Việc tiếp theo chính xác là gì?
- Acceptance criteria của việc đó là gì?
