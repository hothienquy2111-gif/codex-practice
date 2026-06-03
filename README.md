# ANH MINH STORE - Website tivi phong cách công nghệ cao

Website tĩnh cho **CÔNG TY KỸ THUẬT ĐIỆN TỬ ANH MINH STORE** tại Đà Nẵng. Dự án dùng **HTML, CSS và JavaScript thuần**, không dùng framework, tập trung vào giao diện sạch, sắc nét, chuyên nghiệp cho cửa hàng tivi chính hãng.

## Mục đích dự án

- Giới thiệu Anh Minh Store và thông tin liên hệ chính thức.
- Trưng bày các dòng tivi theo thương hiệu.
- Trình bày dịch vụ **thu cũ đổi mới** và **hỗ trợ trả góp**.
- Cung cấp các nút liên hệ nhanh: gọi điện, Zalo và xem địa chỉ.

## Hướng thiết kế mới

Giao diện mới lấy cảm hứng cảm giác từ các website sản phẩm gaming-tech cao cấp: mạnh mẽ, hiện đại, kỹ thuật và có bố cục sắc cạnh. Website **không sao chép logo, nhãn hiệu hoặc tài sản của ASUS/ROG**.

Đặc điểm chính:

- Nền trắng làm chủ đạo, chữ đen có độ tương phản cao.
- Điểm nhấn bằng đen, xám đậm, bạc, xám nhạt và một lượng nhỏ màu đỏ.
- Bố cục nhiều khoảng thở, đường viền kỹ thuật, lưới mảnh và mảng chéo.
- Loại bỏ toàn bộ phong cách trang trí cũ không phù hợp với hướng công nghệ trắng / đen mới.

## Cấu trúc file

```text
.
├── index.html   # Cấu trúc nội dung chính của website
├── styles.css   # Toàn bộ giao diện, responsive, hiệu ứng hover và visual TV
├── script.js    # Menu mobile, smooth scroll, active nav và reveal nhẹ
├── tivi.svg     # Ảnh đang được hiển thị trong màn hình TV ở hero
└── README.md    # Tài liệu hướng dẫn tiếng Việt
```

## Vai trò từng file

### `index.html`

- Chứa HTML5 semantic cho header, hero, các dòng tivi, thu cũ đổi mới, trả góp, liên hệ và footer.
- Dùng các section ID rõ ràng để menu cuộn tới đúng vị trí:
  - `#trang-chu`
  - `#cac-dong-tivi`
  - `#thu-cu-doi-moi`
  - `#tra-gop`
  - `#lien-he`
- Hiển thị thông tin thương hiệu, số điện thoại và hai cơ sở tại Đà Nẵng.
- Dùng `tivi.svg` bên trong màn hình TV ở phần hero vì file này đang tồn tại trong repository.

### `styles.css`

- Tổ chức theo biến màu, base styles, header, hero, card sản phẩm, timeline, benefit cards, contact và responsive.
- Tạo visual TV nền trắng với khung đen/bạc, bóng đổ, đường lưới kỹ thuật, badge thông số và chi tiết đỏ nhỏ.
- Tạo các brand card sắc cạnh, viền đen, bóng nhẹ và hover chuyên nghiệp.
- Đảm bảo responsive cho desktop, tablet và mobile.

### `script.js`

- Đóng/mở hamburger menu trên mobile.
- Smooth scroll khi bấm các mục điều hướng.
- Cập nhật trạng thái active của menu khi cuộn trang.
- Đổi trạng thái header khi trang được cuộn.
- Thêm reveal-on-scroll nhẹ bằng `IntersectionObserver`.

## Cách thay ảnh TV

Hiện tại hero dùng file:

```html
<img src="tivi.svg" alt="Hình ảnh tivi hiển thị sắc nét tại Anh Minh Store" class="tv-screen-image">
```

Cách thay ảnh:

1. **Giữ tên `tivi.svg`:** thay nội dung file `tivi.svg` bằng ảnh mới cùng tên, không cần sửa HTML.
2. **Dùng file khác:** sửa thuộc tính `src` trong `index.html`, ví dụ:

```html
<img src="assets/tivi-moi.svg" alt="Hình ảnh tivi mới" class="tv-screen-image">
```

Nếu muốn ảnh nằm gọn toàn bộ trong màn hình, có thể đổi CSS tại `.tv-screen-image` từ `object-fit: cover` sang `object-fit: contain`.

## Cách thêm logo thương hiệu thật sau này

Hiện tại các thương hiệu dùng logo dạng chữ để không phụ thuộc vào file ngoài. Khi có logo thật, có thể tạo thư mục:

```text
assets/logos/
```

Sau đó thay nội dung trong card, ví dụ:

```html
<div class="brand-logo" aria-label="Samsung">
  <img src="assets/logos/samsung.svg" alt="Samsung">
</div>
```

Nên ưu tiên file SVG để logo sắc nét trên màn hình lớn. Nếu dùng PNG, hãy dùng ảnh nền trong suốt và độ phân giải đủ cao.

## Cách cập nhật giá sau này

Mỗi card thương hiệu trong `index.html` có dòng:

```html
<strong>Giá đang cập nhật</strong>
```

Khi có giá cụ thể, sửa trực tiếp nội dung này, ví dụ:

```html
<strong>Từ 6.990.000đ</strong>
```

Nếu cần nhiều sản phẩm cho từng thương hiệu, có thể nhân bản card hoặc tạo thêm section danh sách sản phẩm chi tiết.

## Cách cập nhật link Zalo

Nút Zalo hiện dùng:

```html
<a href="https://zalo.me/0905111223">Nhắn Zalo</a>
```

Nếu tài khoản Zalo OA hoặc link Zalo khác được cung cấp, thay URL trong thuộc tính `href` của nút **Nhắn Zalo** tại section `#lien-he`.

## Cách chạy local

Có thể mở trực tiếp file `index.html` bằng trình duyệt, hoặc chạy local server tại thư mục dự án:

```bash
python3 -m http.server 8000
```

Sau đó truy cập:

```text
http://localhost:8000
```

## Cách deploy bằng GitHub Pages

1. Đẩy toàn bộ mã nguồn lên một repository GitHub.
2. Vào **Settings** của repository.
3. Chọn **Pages**.
4. Ở mục **Build and deployment**, chọn source là nhánh chứa website, thường là `main`.
5. Chọn thư mục root nếu các file `index.html`, `styles.css`, `script.js` nằm ở gốc repository.
6. Lưu cấu hình và chờ GitHub Pages tạo link truy cập.

## Ghi chú kiểm tra trước khi bàn giao

- `tivi.svg` đang tồn tại nên website sử dụng file này trong màn hình TV hero.
- Không còn dùng các lớp nền và chi tiết trang trí cũ không phù hợp với hướng công nghệ trắng / đen.
- Menu mobile hỗ trợ mở/đóng bằng hamburger và đóng bằng phím Escape.
- Điều hướng hỗ trợ smooth scroll và active nav theo vị trí cuộn.
- Layout có media query cho desktop, tablet và mobile.
