# ANH MINH STORE - Website showroom tivi neon cao cấp

Dự án này là website giới thiệu **CÔNG TY KỸ THUẬT ĐIỆN TỬ ANH MINH STORE** tại Đà Nẵng. Giao diện được nâng cấp theo phong cách showroom tivi cao cấp: nền tối, kính bóng, neon tím hồng, pha lê thạch anh trong hero và chuyển cảnh sang đại dương sứa neon xanh ở phần thương hiệu tivi.

## Cấu trúc file

```text
.
├── index.html   # Cấu trúc nội dung, các section, menu, thẻ thương hiệu và liên hệ
├── styles.css   # Toàn bộ giao diện, responsive, glassmorphism và animation CSS
├── script.js    # Hamburger menu, smooth scroll, active menu, đổi theme khi cuộn
└── README.md    # Tài liệu hướng dẫn chỉnh sửa, chạy local và triển khai
```

Website chỉ dùng **HTML, CSS và JavaScript thuần**, không dùng React, Vue, Bootstrap, Tailwind hoặc thư viện animation nặng.

## Các section chính

1. **Trang chủ**: hero tivi cao cấp với khung màn hình, pha lê thạch anh CSS-only, tiêu đề và nút CTA.
2. **Các dòng tivi**: nền đại dương neon xanh, các thẻ logo thương hiệu Samsung, LG, Sony, Toshiba, Hisense, TCL, Panasonic.
3. **Thu cũ đổi mới**: quy trình 3 bước gồm gửi thông tin tivi cũ, nhận tư vấn định giá, đổi lên tivi mới.
4. **Hỗ trợ trả góp**: các lợi ích tư vấn nhanh, thủ tục đơn giản, phù hợp ngân sách, nhiều lựa chọn sản phẩm.
5. **Liên hệ**: số điện thoại, hai cơ sở tại Đà Nẵng và nút gọi, Zalo, bản đồ.

## Pha lê thạch anh trong hero hoạt động như thế nào?

Hero dùng các phần tử HTML rỗng trong `.quartz-composition`, ví dụ `.quartz-main`, `.quartz-left`, `.quartz-right`, `.quartz-ice` và `.quartz-small`.

Trong `styles.css`, mỗi mảnh pha lê được dựng bằng:

- `clip-path: polygon(...)` để tạo hình tinh thể sắc cạnh.
- `linear-gradient(...)` để tạo lớp kính, ánh tím hồng, ánh băng xanh và phản xạ trắng.
- `box-shadow` và `filter` để tạo hào quang quảng cáo cao cấp.
- Pseudo-element `::after` chạy animation `shineSweep` để tạo vệt sáng quét qua bề mặt.
- Các chấm `.crystal-spark` dùng animation `sparkTwinkle` để tạo hiệu ứng lấp lánh nhẹ.

Toàn bộ visual này là **CSS-only**, không cần ảnh nền hoặc video nặng.

## Chủ đề đại dương sứa neon hoạt động như thế nào?

Phần nền toàn trang có `.scene-backdrop` chứa hai lớp:

- `.rose-scene`: chủ đề hồng tím, orb neon và pha lê mờ cho khu vực đầu trang.
- `.ocean-scene`: chủ đề xanh đại dương, ánh nước, sứa neon và silhouette san hô.

Các con sứa được tạo bằng CSS:

- Thân sứa dùng gradient trong `.jellyfish` và `.panel-jelly`.
- Tua sứa dùng `::before`, `::after` và thẻ `<i>` bên trong.
- Animation `jellyFloat` làm sứa trôi chậm lên xuống để giữ cảm giác premium, không quá trẻ con.
- San hô dùng `clip-path` để tạo silhouette mềm ở đáy nền.

## Chuyển theme khi cuộn hoạt động như thế nào?

Mỗi section chính có thuộc tính `data-theme`, ví dụ:

```html
<section id="trang-chu" data-theme="rose">
<section id="cac-dong-tivi" data-theme="blue">
```

Trong `script.js`, hàm `updateScrollScene()` tính tiến trình cuộn từ hero đến section thương hiệu. Khi người dùng cuộn xuống đủ xa, script chuyển class trên `<body>`:

- `theme-rose`: ưu tiên nền rose/purple quartz.
- `theme-blue`: làm `.rose-scene` mờ và trượt lên, đồng thời đưa `.ocean-scene` hiện ra.

Nhờ vậy chuyển cảnh có cảm giác **di chuyển và tan lớp cảnh**, không chỉ đổi màu tĩnh.

## Hamburger menu hoạt động như thế nào?

Nút `.menu-toggle` có `aria-controls="primary-menu"` và `aria-expanded`. Khi bấm:

1. `script.js` thêm hoặc xóa class `.is-active` trên nút.
2. Menu `.nav-menu` nhận hoặc mất class `.is-open`.
3. `<body>` nhận class `.menu-open` để tránh cuộn nền khi menu mobile đang mở.
4. `aria-expanded` và `aria-label` được cập nhật để thân thiện hơn với trình đọc màn hình.
5. Khi chọn một link hoặc bấm phím `Escape`, menu tự đóng.

## Smooth scroll và active menu

Các link điều hướng trỏ tới id của section, ví dụ `#cac-dong-tivi`. JavaScript chặn hành vi mặc định, tính vị trí cuộn đã trừ chiều cao header cố định, rồi gọi:

```js
window.scrollTo({ top: targetPosition, behavior: 'smooth' });
```

Hàm `updateActiveLink()` theo dõi vị trí cuộn hiện tại và gắn class `.active` cho menu item tương ứng.

## Cách cập nhật logo thương hiệu sau này

Hiện tại logo được dựng bằng chữ kiểu logo trong các thẻ `.logo-tile` để không phụ thuộc ảnh bên ngoài. Khi có file logo chính thức:

1. Đặt file vào thư mục mới, ví dụ `assets/logos/samsung.svg`.
2. Trong `index.html`, tìm section `id="cac-dong-tivi"`.
3. Thay nội dung trong `.logo-tile`:

```html
<div class="logo-tile logo-samsung" aria-label="Logo Samsung">
  <img src="assets/logos/samsung.svg" alt="Samsung">
</div>
```

4. Có thể giữ class `.logo-tile` để tiếp tục dùng nền kính, glow và hover effect.

## Cách cập nhật giá thật sau này

Mỗi thẻ thương hiệu có một dòng giá hoặc ghi chú trong thẻ `<strong>`:

```html
<strong>Giá đang cập nhật</strong>
```

Khi có giá thật, sửa trực tiếp dòng này, ví dụ:

```html
<strong>Từ 6.990.000đ</strong>
```

Nếu danh sách sản phẩm nhiều hơn, có thể chuyển dữ liệu sang mảng JavaScript trong `script.js`, ví dụ `const brands = [...]`, rồi render tự động vào `.brand-grid`.

## Cách cập nhật link Zalo

Nút **Nhắn Zalo** hiện dùng link giữ chỗ theo số điện thoại:

```html
https://zalo.me/0905111223
```

Nếu doanh nghiệp có link Zalo OA hoặc link Zalo chính thức khác, mở `index.html`, tìm nút **Nhắn Zalo** trong section `id="lien-he"` và thay giá trị `href` bằng link mới.

## Cách chạy website trên máy tính

Cách nhanh nhất là mở trực tiếp file `index.html` bằng trình duyệt.

Cách khuyến nghị là chạy local server tại thư mục dự án:

```bash
python3 -m http.server 8000
```

Sau đó mở trình duyệt và truy cập:

```text
http://localhost:8000
```

## Cách deploy bằng GitHub Pages

1. Đẩy các file `index.html`, `styles.css`, `script.js`, `README.md` lên repository GitHub.
2. Vào repository trên GitHub.
3. Chọn **Settings**.
4. Chọn **Pages**.
5. Ở phần **Build and deployment**, chọn source là nhánh chứa code, ví dụ `main`.
6. Chọn thư mục `/root` nếu `index.html` nằm ở gốc repository.
7. Bấm **Save**.
8. Chờ GitHub Pages tạo đường dẫn public và mở link để kiểm tra website.

## Gợi ý bảo trì nhanh

- Đổi màu chủ đạo: sửa các biến trong `:root` của `styles.css`, ví dụ `--color-rose`, `--color-purple`, `--color-cyan`.
- Thêm thương hiệu: copy một khối `<article class="brand-card">` trong `index.html`, dán vào `.brand-grid`, rồi sửa logo, mô tả và giá.
- Đổi địa chỉ: sửa nội dung `<address>` trong section `id="lien-he"`.
- Đổi link bản đồ: sửa `href` của nút **Xem địa chỉ** trong `index.html`.
