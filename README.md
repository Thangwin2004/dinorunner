# Dino Runner Game

Một tựa game chạy vô tận (Endless Runner) màn hình ngang, phong cách vượt chướng ngại vật được phát triển bằng **PixiJS v8** và **GSAP**.

## Tính Năng Nổi Bật
- **Cơ chế nhảy (Jump):** Chạm hoặc click để nhân vật nhảy qua các chướng ngại vật.
- **Vòng lặp vô tận (Endless):** Tốc độ game tăng dần theo thời gian tạo cảm giác thử thách.
- **Hệ thống Parallax Background:** Cảnh vật (bầu trời, mặt đất) cuộn liên tục tạo hiệu ứng chiều sâu 2D.
- **Điểm số & Kỷ lục:** Tính điểm dựa trên quãng đường chạy và thời gian sống sót, lưu High Score vào bộ nhớ trình duyệt.
- **Âm thanh:** Tích hợp âm thanh chạy, nhảy, va chạm và nhạc nền (BGM) đầy đủ.
- **Responsive:** Giao diện tự động co giãn và hiển thị tốt trên cả nền tảng Mobile và Desktop.

## Kiến Trúc & Công Nghệ
- **Engine:** PixiJS v8 (Canvas/WebGL/WebGPU)
- **Animation:** GSAP 3 (Dùng cho các popup UI và một số hiệu ứng mềm mại)
- **Kiến trúc:** Game Loop tách biệt rõ ràng giữa logic nhân vật (`Dino`), chướng ngại vật (`Obstacles`), và quản lý giao diện.

## Cài Đặt & Chạy Game
1. Mở terminal tại thư mục này (`dino-runner`).
2. Cài đặt các gói phụ thuộc:
   ```bash
   pnpm install
   ```
3. Chạy server phát triển:
   ```bash
   pnpm run dev
   ```
4. Build bản production:
   ```bash
   pnpm run build
   ```
