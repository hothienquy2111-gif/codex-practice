# ANH MINH STORE

Trang chủ tĩnh cho **ANH MINH STORE - Công ty kỹ thuật điện tử Anh Minh**.

## Nội dung cập nhật

- Giao diện một trang sạch, hiện đại, dùng hai màu chính là trắng và xanh dương đậm.
- Header dùng gradient xanh dương đậm `#01346C -> #023871 -> #03457F`, chữ trắng, logo nằm bên trái và tên công ty hiển thị rõ ràng.
- Header có viền dưới mảnh và bóng đổ mềm để tạo cảm giác cao cấp.
- Menu hamburger có 5 mục:
  1. Trang chủ
  2. Tivi cũ
  3. Tivi mới
  4. Thu cũ - đổi mới
  5. Sửa tivi tất cả các dòng
- Trên desktop, rê chuột vào hamburger sẽ hiện menu; bấm vào hamburger cũng mở hoặc đóng menu.
- Trên mobile, bấm hamburger để mở hoặc đóng menu.
- Carousel 16:9 dùng 2 ảnh có sẵn ở thư mục gốc, hỗ trợ kéo chuột, vuốt cảm ứng, nút mũi tên, chấm chuyển ảnh, tự động chạy và snap mượt.

## Ảnh đang sử dụng

Các ảnh được dùng trực tiếp từ thư mục gốc của repository:

```text
Use_the_uploaded_image_as_202605051008.jpeg
Create_an_ultra-realistic_premium_World_202606042116.jpeg
Create_a_premium_16_9_commercial_202605091429.jpeg
```

## Cấu trúc file

```text
index.html   # Cấu trúc trang chủ và nội dung tiếng Việt
styles.css   # Giao diện responsive, header, menu và carousel
script.js    # Tương tác hamburger, carousel, kéo chuột, vuốt và autoplay
README.md    # Tài liệu dự án
```

## Cách chạy local

Mở trực tiếp `index.html` bằng trình duyệt hoặc chạy server tĩnh:

```bash
python3 -m http.server 8000
```

Sau đó truy cập:

```text
http://localhost:8000
```

## Ghi chú bàn giao

- Không cần thêm thư viện JavaScript.
- Không chỉnh sửa ảnh, SVG hoặc file nhị phân.
- Chỉ cần thay đổi nội dung trong `index.html`, `styles.css`, `script.js` và `README.md` khi cập nhật giao diện hoặc tài liệu.
