# ANH MINH STORE - Landing page showroom tivi cao cấp

Website tĩnh cho **CÔNG TY KỸ THUẬT ĐIỆN TỬ ANH MINH STORE** tại Đà Nẵng. Giao diện dùng HTML, CSS và JavaScript thuần, tập trung vào cảm giác showroom điện tử cao cấp với hero tivi điện ảnh, pha lê thạch anh trong suốt và khu vực thương hiệu dạng kính.

## Thông tin chính

- **Tên công ty:** CÔNG TY KỸ THUẬT ĐIỆN TỬ ANH MINH STORE
- **Số điện thoại:** 0905111223
- **Cơ sở 1:** 100 Tiểu La, Hải Châu, Đà Nẵng
- **Cơ sở 2:** 540B Nguyễn Hữu Thọ, Đà Nẵng

## Nội dung đã thay đổi về mặt hình ảnh

- Nâng cấp hero thành một cảnh tivi quảng cáo cao cấp, tối hơn, nhiều chiều sâu hơn và gần phong cách TV premium/OLED demo.
- Làm mỏng khung tivi, giảm cảm giác hoạt hình, thêm viền kim loại tối, mặt kính đen, phản chiếu chéo và bóng đổ dưới chân đế.
- Điều chỉnh nền showroom từ tím hồng rực sang **dark navy, đen, deep plum, rose glow mềm và cyan highlight** để sang trọng hơn.
- Thêm light beams, phản chiếu mềm và lớp grain/noise bằng CSS để tránh nền phẳng.
- Làm mượt chuyển cảnh khi cuộn từ khu vực pha lê sang khu vực đại dương sứa neon.
- Tinh chỉnh phần thương hiệu thành các thẻ logo kính cao cấp, logo nằm giữa tile, có highlight và glow khi hover.

## Hiệu ứng pha lê thạch anh đã được cải thiện như thế nào?

Hero cũ có các mảng pha lê hồng/tím khá đặc và dễ tạo cảm giác nhựa. Phiên bản mới chuyển sang cảm giác **quartz/ice glass trong suốt** bằng CSS:

- Dùng nhiều lớp tinh thể: tinh thể phía sau, lớp giữa, mảnh trước và bóng phản chiếu ở đáy.
- Giảm các mảng magenta đặc; thay bằng gradient trong suốt, trắng băng, xanh cyan và phản xạ tím/cyan nhẹ.
- Thêm facet bằng `linear-gradient`, `radial-gradient`, `clip-path`, border sáng và pseudo-element để tạo mặt cắt sắc.
- Thêm highlight trắng mảnh trên cạnh tinh thể, hiệu ứng ánh sáng quét qua và các spark nhỏ.
- Thêm inner glow, bóng đổ và reflection để tinh thể trông như nằm bên trong màn hình TV kính tối.
- Thêm noise overlay nhẹ trên màn hình để cảnh giống quảng cáo TV cao cấp hơn, không bị phẳng như vector cartoon.

## Chủ đề đại dương sứa neon

Khi cuộn xuống section **Các dòng tivi**, nền chuyển dần sang đại dương xanh sâu:

- Nền dùng deep ocean blue, cyan glow và các dải phản chiếu nước.
- Sứa neon được tạo bằng CSS, trôi chậm để giữ cảm giác premium và nhẹ hiệu năng.
- Có silhouette san hô ở đáy panel, ánh nước và glow xanh giống cảnh demo Mini LED/OLED.

## Thương hiệu tivi

Các thương hiệu được trình bày dưới dạng **premium glass logo tiles** thay vì text thường:

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
├── styles.css   # Toàn bộ giao diện, responsive, pha lê, TV, đại dương và logo tiles
├── script.js    # Menu mobile, active nav, reveal-on-scroll và chuyển theme khi cuộn
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

## Những gì đã kiểm tra

- Kiểm tra cú pháp JavaScript bằng Node:

```bash
node --check script.js
```

- Kiểm tra số lượng dấu ngoặc `{}` trong CSS để phát hiện lỗi đóng/mở block:

```bash
python3 - <<'PY'
from pathlib import Path
s = Path('styles.css').read_text()
print(s.count('{'), s.count('}'))
PY
```

- Chạy local server để phục vụ website tĩnh và dùng `curl` kiểm tra HTML trả về:

```bash
python3 -m http.server 8000
curl -I http://127.0.0.1:8000/
```

- Đã thử dùng Playwright để chụp màn hình, nhưng môi trường bị chặn tải package từ npm registry nên không thể tạo screenshot tự động trong container này.

## Gợi ý bảo trì nhanh

- Đổi màu chủ đạo: sửa các biến trong `:root` của `styles.css`, ví dụ `--color-rose`, `--color-purple`, `--color-cyan`.
- Thêm thương hiệu: copy một khối `<article class="brand-card">` trong `index.html`, dán vào `.brand-grid`, rồi sửa logo, mô tả và giá.
- Đổi địa chỉ: sửa nội dung `<address>` trong section `id="lien-he"`.
- Đổi link bản đồ hoặc Zalo: sửa các nút trong section `id="lien-he"` của `index.html`.
- Nếu thêm ảnh/logo chính thức, ưu tiên SVG để logo sắc nét trên màn hình lớn.
