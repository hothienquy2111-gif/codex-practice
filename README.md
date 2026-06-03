# TV House - Simple HTML/CSS Website

Đây là một website tĩnh đơn giản cho cửa hàng TV. Trang web có banner, 3 thẻ sản phẩm, phần bảng giá và footer liên hệ.

## Cách chạy

Mở file `index.html` trực tiếp trong trình duyệt, hoặc dùng một local server đơn giản:

```bash
python3 -m http.server 8000
```

Sau đó truy cập `http://localhost:8000`.

## Giải thích code cho người mới bắt đầu

### 1. File `index.html`

`index.html` chứa nội dung và cấu trúc của trang web:

- `<!DOCTYPE html>` cho trình duyệt biết đây là tài liệu HTML5.
- Thẻ `<html lang="vi">` khai báo ngôn ngữ trang là tiếng Việt.
- Phần `<head>` chứa thông tin cấu hình như bảng mã UTF-8, tiêu đề trang và đường dẫn đến file CSS.
- Thẻ `<link rel="stylesheet" href="styles.css">` kết nối HTML với file `styles.css` để trang có giao diện đẹp.
- `<header class="banner">` là phần banner lớn ở đầu trang, gồm tên cửa hàng, lời giới thiệu và nút xem sản phẩm.
- `<main>` chứa nội dung chính của trang.
- `<section id="products">` hiển thị 3 product cards bằng các thẻ `<article>`.
- `<section class="price-section">` hiển thị bảng giá cho từng mẫu TV.
- `<footer id="contact">` là chân trang, chứa địa chỉ, hotline và email liên hệ.

### 2. File `styles.css`

`styles.css` quyết định màu sắc, khoảng cách, bố cục và hiệu ứng của trang:

- `body` thiết lập font chữ, màu chữ, màu nền và khoảng cách dòng chung cho toàn trang.
- `.banner` tạo banner nền xanh đậm có gradient và chiều cao lớn để gây ấn tượng.
- `.navbar` dùng `display: flex` để đặt tên cửa hàng bên trái và link liên hệ bên phải.
- `.button` tạo nút màu vàng, bo tròn và có bóng đổ.
- `.product-grid` dùng CSS Grid để xếp 3 thẻ sản phẩm thành 3 cột trên màn hình lớn.
- `.product-card` tạo khung trắng, bo góc và bóng đổ cho từng sản phẩm.
- `.tv-screen` vẽ hình màn hình TV bằng CSS, không cần dùng ảnh thật.
- `.price-section` dùng Grid để chia phần mô tả và bảng giá thành 2 cột.
- `.contact-footer` dùng Flexbox để đặt thông tin cửa hàng và thông tin liên hệ cạnh nhau.
- `@media (max-width: 800px)` giúp trang responsive: khi màn hình nhỏ, các cột sẽ chuyển thành 1 cột để dễ đọc trên điện thoại.

## Gợi ý học thêm

- Muốn đổi nội dung sản phẩm: sửa chữ trong các thẻ `<article class="product-card">`.
- Muốn đổi màu: sửa các mã màu trong `styles.css`, ví dụ `#facc15` là màu vàng của nút và giá.
- Muốn thêm sản phẩm: copy một khối `<article class="product-card">`, dán vào trong `.product-grid`, rồi sửa tên và mô tả.
