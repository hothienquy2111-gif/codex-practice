# ANH MINH STORE - Landing page showroom tivi cao cấp

Website tĩnh cho **CÔNG TY KỸ THUẬT ĐIỆN TỬ ANH MINH STORE** tại Đà Nẵng. Giao diện dùng HTML, CSS và JavaScript thuần, tập trung vào cảm giác showroom điện tử cao cấp với hero tivi điện ảnh, nền dark navy / purple / rose và khu vực thương hiệu dạng kính.

## Thông tin chính

- **Tên công ty:** CÔNG TY KỸ THUẬT ĐIỆN TỬ ANH MINH STORE
- **Số điện thoại:** 0905111223
- **Cơ sở 1:** 100 Tiểu La, Hải Châu, Đà Nẵng
- **Cơ sở 2:** 540B Nguyễn Hữu Thọ, Đà Nẵng

## Hero tivi dùng `tivi.svg`

Màn hình tivi trong hero hiện dùng file ảnh có sẵn **`tivi.svg`**. Ảnh chỉ được đặt bên trong khung màn hình TV, không dùng làm nền toàn trang, để giữ nguyên không gian showroom tối màu ở bên ngoài.

Cấu trúc chính nằm trong `index.html`:

```html
<div class="screen-media" aria-hidden="true">
  <img src="tivi.svg" alt="" loading="eager" decoding="async">
</div>
```

Phần CSS trong `styles.css` giúp ảnh vừa khít màn hình bằng `object-fit: cover`, giữ tỷ lệ ảnh không bị méo và cắt gọn phần thừa nếu tỷ lệ ảnh khác tỷ lệ màn hình TV.

## Hiệu ứng màn hình TV

Khung TV premium vẫn được giữ lại, đồng thời màn hình có thêm các lớp CSS để tạo cảm giác kính đen cao cấp:

- Lớp ảnh sản phẩm `tivi.svg` nằm trong `.screen-media`.
- `object-fit: cover` giúp ảnh phủ kín màn hình mà không bị kéo giãn.
- Lớp vignette làm tối viền màn hình để giống dark-glass.
- Lớp phản chiếu chéo tạo độ bóng kính bằng CSS.
- Bóng đổ, glow cyan nhẹ và inner shadow giúp màn hình có chiều sâu hơn.

## Cách thay `tivi.svg` sau này

Nếu muốn thay hình hiển thị trong màn hình TV, có hai cách:

1. **Giữ nguyên tên file:** thay nội dung file `tivi.svg` bằng ảnh mới cùng tên. Khi đó không cần sửa HTML hoặc CSS.
2. **Đổi sang đường dẫn khác:** sửa thuộc tính `src` trong `index.html` tại khối `.screen-media`, ví dụ:

```html
<img src="duong-dan/anh-moi.svg" alt="" loading="eager" decoding="async">
```

Nếu cần tinh chỉnh cách ảnh nằm trong màn hình, sửa trong `styles.css` tại selector `.screen-media img`:

```css
.screen-media img {
  object-fit: cover;
  object-position: center;
}
```

- Đổi `object-position` nếu muốn căn ảnh sang trái, phải, trên hoặc dưới.
- Có thể dùng `object-fit: contain` nếu muốn thấy toàn bộ ảnh, nhưng sẽ có thể xuất hiện khoảng trống trong màn hình.

## Chủ đề showroom và chuyển cảnh khi cuộn

Nền ngoài TV vẫn giữ phong cách **dark navy, tím, rose glow và cyan highlight**. Khi cuộn xuống section **Các dòng tivi**, JavaScript tiếp tục cập nhật biến CSS để chuyển dần sang chủ đề đại dương xanh sâu, giữ hiệu ứng sứa neon và các panel kính.

## Điều hướng và responsive

Website vẫn dùng `script.js` để xử lý:

- Header sticky đổi trạng thái khi cuộn.
- Hamburger menu trên màn hình nhỏ.
- Smooth scrolling khi bấm menu.
- Active navigation theo section hiện tại.
- Reveal-on-scroll và chuyển theme giữa hero và các section bên dưới.

Layout được thiết kế responsive cho desktop, tablet và mobile bằng các media query trong `styles.css`.

## Thương hiệu tivi

Các thương hiệu được trình bày dưới dạng **premium glass logo tiles**:

- Logo-style typography cho Samsung, LG, Sony, Toshiba, Hisense, TCL và Panasonic.
- Tile kính có border trong, reflection, glow và hover highlight.
- Khi có file logo chính thức, có thể thay text trong `.logo-tile` bằng ảnh SVG/PNG mà vẫn giữ hiệu ứng kính.

Ví dụ thay logo sau này:

```html
<div class="logo-tile logo-samsung" aria-label="Logo Samsung">
  <img src="assets/logos/samsung.svg" alt="Samsung">
</div>
```

## Cấu trúc file

```text
.
├── index.html   # Nội dung và cấu trúc website
├── styles.css   # Giao diện, responsive, TV, màn hình dùng tivi.svg, đại dương và logo tiles
├── script.js    # Menu mobile, active nav, reveal-on-scroll và chuyển theme khi cuộn
├── tivi.svg     # Ảnh đang hiển thị bên trong màn hình TV hero
└── README.md    # Tài liệu tiếng Việt
```

## Cách chạy website trên máy tính

Mở trực tiếp `index.html` bằng trình duyệt hoặc chạy local server tại thư mục dự án:

```bash
python3 -m http.server 8000
```

Sau đó truy cập:

```text
http://localhost:8000
```

## Gợi ý bảo trì nhanh

- Đổi ảnh hero TV: sửa `src="tivi.svg"` trong `index.html` hoặc thay file `tivi.svg` bằng ảnh mới cùng tên.
- Đổi màu chủ đạo: sửa các biến trong `:root` của `styles.css`, ví dụ `--color-rose`, `--color-purple`, `--color-cyan`.
- Thêm thương hiệu: copy một khối `<article class="brand-card">` trong `index.html`, dán vào `.brand-grid`, rồi sửa logo, mô tả và giá.
- Đổi địa chỉ: sửa nội dung `<address>` trong section `id="lien-he"`.
- Đổi link bản đồ hoặc Zalo: sửa các nút trong section `id="lien-he"` của `index.html`.
- Nếu thêm ảnh/logo chính thức, ưu tiên SVG để logo sắc nét trên màn hình lớn.
