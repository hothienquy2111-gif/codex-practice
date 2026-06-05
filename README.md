# ANH MINH STORE

Trang chủ tĩnh cho **ANH MINH STORE - Công ty kỹ thuật điện tử Anh Minh**.

## Nội dung cập nhật

- Giao diện homepage giữ phong cách cửa hàng điện tử sạch, cao cấp, dùng hai màu chính là trắng và xanh dương đậm.
- Header hiện là nền xanh dương đậm dạng gradient `#01346C -> #023871 -> #03457F`, chữ trắng, có logo bên trái và tên công ty rõ ràng.
- Typography áp dụng Aptos toàn trang qua `body` với fallback an toàn: `Aptos, "Segoe UI", Arial, Helvetica, sans-serif`; các nút và control kế thừa font, không tải font ngoài.
- Carousel/banner chính vẫn giữ tỷ lệ **16:9**, dùng đúng các ảnh đã có trong repository và hỗ trợ kéo chuột, vuốt cảm ứng, nút mũi tên, chấm chuyển ảnh, autoplay và snap mượt.
- Homepage đã bỏ các thẻ dịch vụ lớn dạng `01 Tivi cũ`, `02 Tivi mới`, `03 Thu cũ - đổi mới`, `04 Sửa tivi tất cả các dòng` để bố cục gọn hơn.
- Các lựa chọn dịch vụ chính vẫn nằm trong menu hamburger:
  1. Trang chủ
  2. Tivi cũ
  3. Tivi mới
  4. Thu cũ - đổi mới
  5. Sửa tivi tất cả các dòng
- Trên desktop, rê chuột vào hamburger sẽ hiện menu; bấm vào hamburger cũng mở hoặc đóng menu.
- Trên mobile, bấm hamburger để mở hoặc đóng menu.
- Khu vực carousel có thêm panel dọc **DANH MỤC HÃNG TIVI** đặt gần góc trái phía trên banner trên desktop, bo góc, nền trắng, tiêu đề xanh dương đậm và bóng đổ mềm.
- Danh mục hãng tivi có danh sách cuộn để nội dung không bị tràn khi danh sách dài.
- Trên mobile, panel danh mục được chuyển xuống dưới carousel để không che toàn bộ banner và tránh tràn màn hình.
- Khu vực **Chọn kích thước tivi** nằm gần carousel, hiển thị các nút dạng pill theo chiều ngang và có thể cuộn ngang khi không đủ không gian.
- Bộ chọn kích thước có tương tác JavaScript: khi bấm một kích thước, nút đó chuyển sang trạng thái active và dòng `Đang xem: ...` được cập nhật.

## Danh mục hãng tivi hiện có

Danh sách hiện tại gồm:

```text
Samsung
LG
Sony
Toshiba
Hisense
TCL
Panasonic
Sharp
Xiaomi
Casper
Coocaa
Skyworth
Philips
Hitachi
```

## Cách cập nhật danh sách hãng tivi sau này

1. Mở `index.html`.
2. Tìm khu vực `<ul class="brand-list" aria-label="Danh sách hãng tivi">`.
3. Thêm, sửa hoặc bỏ từng dòng `<li>` tương ứng với hãng cần cập nhật.
4. Với mỗi hãng, cập nhật:
   - Chữ trong `<span class="brand-badge">...</span>` thành ký tự viết tắt hoặc chữ cái đầu của hãng.
   - Phần chữ sau badge thành tên hãng hiển thị cho khách hàng.
5. Nếu danh sách dài hơn, không cần chỉnh CSS ngay vì `.brand-list` đã có `overflow-y: auto` để cuộn dọc.

Ví dụ một dòng hãng:

```html
<li>
  <a href="#danh-muc-tivi"><span class="brand-badge">S</span>Samsung</a>
</li>
```

## Kích thước tivi hiện có

Các lựa chọn kích thước hiện tại gồm:

```text
32 inch
43 inch
49 inch
50 inch
55 inch
65 inch
75 inch
85 inch
```

## Cách cập nhật size options sau này

1. Mở `index.html`.
2. Tìm khu vực `<div class="size-options" role="group" aria-label="Chọn kích thước tivi">`.
3. Thêm, sửa hoặc xóa các nút `<button class="size-pill" ...>`.
4. Đảm bảo giá trị `data-size` giống nội dung chữ hiển thị để JavaScript cập nhật đúng nhãn `Đang xem`.
5. Nếu muốn đổi kích thước mặc định, chuyển class `is-active` và `aria-pressed="true"` sang nút mới, đồng thời sửa dòng mặc định trong `.selected-size`.

Ví dụ một nút kích thước:

```html
<button class="size-pill" type="button" data-size="65 inch">65 inch</button>
```

## Ảnh đang sử dụng

Các ảnh được dùng trực tiếp từ thư mục gốc của repository:

```text
Use_the_uploaded_image_as_202605051008.jpeg
Create_an_ultra-realistic_premium_World_202606042116.jpeg
Create_a_premium_16_9_commercial_202605091429.jpeg
```

## Cấu trúc file

```text
index.html   # Cấu trúc trang chủ, carousel, danh mục hãng tivi và bộ chọn kích thước
styles.css   # Giao diện responsive, header, menu, carousel, panel hãng tivi và size pills
script.js    # Tương tác hamburger, carousel, kéo chuột, vuốt, autoplay và chọn kích thước
README.md    # Tài liệu dự án bằng tiếng Việt
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
- Khi cập nhật layout hoặc tài liệu, chỉ chỉnh các file văn bản được phép: `index.html`, `styles.css`, `script.js`, `README.md`.
