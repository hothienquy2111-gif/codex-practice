# ANH MINH STORE - Website cửa hàng tivi/điện tử

Đây là website landing page tĩnh cho **ANH MINH STORE**, hiển thị tên công ty **CÔNG TY KỸ THUẬT ĐIỆN TỬ ANH MINH STORE**. Trang được xây dựng bằng HTML, CSS và JavaScript thuần, không dùng React, Vue, Bootstrap, Tailwind hay framework bên ngoài.

Mục tiêu của dự án là tạo một giao diện showroom điện tử cao cấp: nền tối sang trọng, hiệu ứng neon hồng ở phần đầu trang, chuyển dần sang nền xanh cyan kiểu đại dương/sứa khi người dùng kéo xuống các phần sản phẩm và dịch vụ.

## Cấu trúc file

```text
.
├── index.html   # Nội dung, bố cục và các section của website
├── styles.css   # Toàn bộ giao diện, responsive, hiệu ứng neon/glassmorphism
├── script.js    # Tương tác menu, cuộn mượt, active menu và đổi theme khi scroll
└── README.md    # Tài liệu hướng dẫn cho người mới bắt đầu
```

## File `index.html` làm gì?

`index.html` chứa cấu trúc HTML5 của website:

- Header cố định/sticky với logo chữ **AM** và tên công ty.
- Menu điều hướng gồm: Trang chủ, Các dòng tivi, Thu cũ đổi mới, Hỗ trợ trả góp, Liên hệ.
- Hero section với tiêu đề chính, mô tả, nút kêu gọi hành động và mô phỏng tivi bằng CSS.
- Section thương hiệu tivi: Samsung, LG, Sony, Toshiba, Hisense, TCL, Panasonic.
- Section dịch vụ **Thu cũ đổi mới** với 3 bước đơn giản.
- Section **Hỗ trợ trả góp linh hoạt** với các lợi ích chính.
- Footer/liên hệ với số điện thoại, 2 cơ sở tại Đà Nẵng và các nút hành động.

## File `styles.css` làm gì?

`styles.css` quyết định toàn bộ phần nhìn của website:

- Khai báo CSS variables trong `:root` cho màu sắc, spacing, bo góc, bóng đổ và theme.
- Tạo giao diện dark premium, neon rose, neon cyan và glassmorphism.
- Vẽ mockup tivi bằng CSS, không cần ảnh nặng.
- Tạo card thương hiệu, card lợi ích, step list và contact card.
- Tạo hover effect, focus state để dễ dùng bằng bàn phím.
- Tạo responsive layout cho desktop, tablet và mobile bằng media queries.
- Có hỗ trợ `prefers-reduced-motion` để giảm chuyển động cho người dùng cần hạn chế animation.

## File `script.js` làm gì?

`script.js` xử lý các tương tác nhẹ:

- Mở/đóng hamburger menu.
- Đổi trạng thái `aria-expanded` và `aria-label` để menu thân thiện hơn với trình đọc màn hình.
- Cuộn mượt tới đúng section khi bấm menu hoặc nút CTA.
- Tự đóng menu sau khi chọn một mục.
- Cập nhật menu item đang active khi người dùng cuộn trang.
- Đổi class theme trên `<body>` từ `theme-rose` sang `theme-blue` bằng `IntersectionObserver`.
- Thêm hiệu ứng xuất hiện nhẹ cho các khối nội dung khi cuộn tới.

## Hamburger menu hoạt động như thế nào?

Trong HTML, nút hamburger là phần tử `<button class="menu-toggle">` có 3 dòng `<span>`. Khi bấm nút:

1. JavaScript kiểm tra menu đang mở hay đóng.
2. Nếu đóng, script thêm class `is-open` vào `.nav-menu` và class `is-active` vào nút.
3. Nếu mở, script xóa các class đó.
4. CSS dùng các class này để hiển thị dropdown menu và biến 3 dòng thành biểu tượng đóng.
5. Khi bấm phím `Escape`, menu cũng tự đóng.

## Smooth scroll hoạt động như thế nào?

Mỗi link menu trỏ tới một `id` của section, ví dụ:

```html
<a href="#cac-dong-tivi">Các dòng tivi</a>
```

Khi người dùng bấm link, `script.js` chặn hành vi mặc định, tìm section tương ứng, tính vị trí cần cuộn có trừ chiều cao header, rồi gọi:

```js
window.scrollTo({ top: targetPosition, behavior: 'smooth' });
```

Nhờ vậy trang cuộn mượt và không bị header che tiêu đề section.

## Background theme đổi khi scroll như thế nào?

Mỗi section có thuộc tính `data-theme`, ví dụ:

```html
<section id="trang-chu" data-theme="rose">
<section id="cac-dong-tivi" data-theme="blue">
```

`script.js` dùng `IntersectionObserver` để theo dõi section đang xuất hiện trong vùng nhìn. Khi section có `data-theme="blue"` xuất hiện, script thêm class `theme-blue` vào `<body>` và xóa `theme-rose`. CSS sẽ chuyển gradient, glow và các hình sứa neon tương ứng.

## Cách cập nhật thương hiệu và giá sau này

Hiện tại giá được đặt bằng chữ giữ chỗ như **Giá đang cập nhật** hoặc **Liên hệ để nhận giá tốt**.

Để sửa trong HTML:

1. Mở `index.html`.
2. Tìm section `id="cac-dong-tivi"`.
3. Mỗi thương hiệu nằm trong một thẻ:

```html
<article class="brand-card">
```

4. Sửa tên thương hiệu trong `<h3>`, mô tả trong `<p>`, và giá/ghi chú trong `<strong>`.

Nếu sau này muốn quản lý bằng JavaScript, có thể tạo một mảng dữ liệu trong `script.js`, ví dụ `const brands = [...]`, rồi render card tự động vào `.brand-grid`.

## Thông tin liên hệ hiện tại

- Điện thoại: `0905111223`
- Cơ sở 1: `100 Tiểu La, Hải Châu, Đà Nẵng`
- Cơ sở 2: `540B Nguyễn Hữu Thọ, Đà Nẵng`

Nút **Gọi ngay** dùng link:

```html
href="tel:0905111223"
```

Nút **Nhắn Zalo** hiện dùng:

```html
href="https://zalo.me/0905111223"
```

Nếu doanh nghiệp dùng Zalo OA hoặc link Zalo khác, hãy thay giá trị `href` này trong `index.html` bằng đường dẫn chính thức.

## Cách chạy website trên máy tính

Cách nhanh nhất: mở trực tiếp file `index.html` bằng trình duyệt.

Cách khuyến nghị với local server:

```bash
python3 -m http.server 8000
```

Sau đó mở trình duyệt và truy cập:

```text
http://localhost:8000
```

## Cách deploy bằng GitHub Pages

1. Đưa toàn bộ file `index.html`, `styles.css`, `script.js`, `README.md` lên một repository GitHub.
2. Vào repository trên GitHub.
3. Chọn **Settings**.
4. Chọn **Pages**.
5. Ở phần **Build and deployment**, chọn source là nhánh chứa code, thường là `main`.
6. Chọn thư mục `/root` nếu file `index.html` nằm ở gốc repository.
7. Bấm **Save**.
8. Chờ GitHub tạo đường dẫn Pages, sau đó mở link được cung cấp để xem website.

## Gợi ý chỉnh sửa nhanh

- Muốn đổi màu neon: sửa các biến `--color-rose`, `--color-cyan`, `--color-blue` trong `styles.css`.
- Muốn thêm thương hiệu: copy một khối `<article class="brand-card">` trong `index.html`, dán vào `.brand-grid`, rồi sửa nội dung.
- Muốn đổi địa chỉ: sửa phần `<address>` trong footer `id="lien-he"`.
- Muốn đổi link bản đồ: sửa nút **Xem địa chỉ** trong `index.html`.
