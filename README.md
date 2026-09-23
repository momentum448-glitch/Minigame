# Minigame Việt

Website chứa nhiều minigame độc lập. Game đầu tiên là **Ô ăn quan**.

## Ô ăn quan v0.1

- 2 người chơi cùng thiết bị hoặc đấu AI.
- AI có 3 mức: Dễ, Vừa, Khó.
- Luật Quan non: Quan chỉ được ăn khi ô Quan có ít nhất 5 dân đi kèm.
- Quan = 10 điểm.
- Có cơ chế rải lại 5 dân và ghi nợ nếu thiếu.
- Responsive, ưu tiên mobile.

## Chạy local

```bash
npm install
npm run dev
```

## Kiểm thử

```bash
npm test
npm run build
```

## Deploy

GitHub Pages được deploy tự động bằng GitHub Actions khi push lên `main`.
