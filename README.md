# ANH MINH STORE

Trang chủ tĩnh cho **ANH MINH STORE - Công ty kỹ thuật điện tử Anh Minh** tại Đà Nẵng. Website giới thiệu dịch vụ tivi cũ, tivi mới, thu cũ đổi mới, sửa tivi tất cả các dòng, tư vấn chọn tivi theo nhu cầu và hỗ trợ giao hàng tại Đà Nẵng.

## Mục đích website

Website được thiết kế như một homepage bán lẻ điện tử chuyên nghiệp, tập trung vào:

- Tạo cảm giác uy tín cho khách hàng tại Đà Nẵng.
- Hiển thị rõ hotline, địa chỉ và dịch vụ chính.
- Đưa khách hàng đến nhanh các nhóm nội dung: tivi cũ, tivi mới, thu cũ đổi mới, sửa tivi và liên hệ.
- Chuẩn bị sẵn cấu trúc để bổ sung sản phẩm thật, giá thật và liên kết Zalo thật sau này.

## Cấu trúc homepage mới

Trang chủ hiện gồm các phần chính:

1. Top mini bar với thông tin uy tín, hotline và 2 cơ sở.
2. Header cố định có logo, tên công ty, ô tìm kiếm, nút hotline và Zalo.
3. Thanh điều hướng và hamburger menu dạng danh mục bán lẻ.
4. Hero banner carousel tỷ lệ 16:9.
5. Panel danh mục hãng tivi.
6. Các khối dịch vụ nhanh.
7. Bộ lọc kích thước tivi dạng pill.
8. Khu vực sản phẩm nổi bật.
9. Khu vực tivi cũ đã kiểm tra.
10. Khu vực tivi mới chính hãng.
11. Khu vực thu cũ - đổi mới.
12. Khu vực sửa tivi tất cả các dòng.
13. Khu vực lý do chọn Anh Minh Store.
14. Khu vực liên hệ và địa chỉ cửa hàng.
15. Footer với liên kết nhanh và danh sách dịch vụ.

## Cấu trúc file

```text
index.html   # Nội dung HTML, bố cục, section, sản phẩm mẫu và thông tin liên hệ
styles.css   # Toàn bộ giao diện responsive, màu sắc, header, carousel, card, footer
script.js    # Tương tác menu, cuộn mượt, active nav, carousel, size selector, nút lên đầu trang
README.md    # Tài liệu hướng dẫn cập nhật và vận hành website
```

Dự án chỉ dùng **HTML, CSS và JavaScript thuần**, không dùng React, Vue, Bootstrap, Tailwind hoặc thư viện ngoài.

## Header hoạt động như thế nào?

Header gồm 3 lớp:

- **Top mini bar**: hiển thị thông điệp uy tín, hotline và khu vực cơ sở.
- **Main header**: hiển thị logo, tên công ty, ô tìm kiếm và nút liên hệ.
- **Main nav**: chứa hamburger menu và các liên kết chính.

Header đang dùng `position: sticky` để bám trên đầu trang. Các section có `scroll-margin-top` để khi bấm menu, nội dung không bị che bởi header.

## Hamburger menu hoạt động như thế nào?

Hamburger menu có danh sách:

- Trang chủ
- Tivi cũ
- Tivi mới
- Thu cũ - đổi mới
- Sửa tivi tất cả các dòng
- Tivi theo kích thước
- Tivi theo hãng
- Liên hệ tư vấn

Trên desktop, menu có thể mở bằng cách rê chuột hoặc bấm vào nút hamburger. Trên mobile, người dùng bấm để mở hoặc đóng menu. JavaScript cập nhật `aria-expanded`, đóng menu khi bấm ra ngoài hoặc bấm phím `Escape`, đồng thời cuộn mượt đến section tương ứng.

## Carousel hoạt động như thế nào?

Carousel trong hero dùng 2 ảnh có sẵn trong thư mục gốc:

```text
Create_an_ultra-realistic_premium_World_202606042116.jpeg
Create_a_premium_16_9_commercial_202605091429.jpeg
```

Tính năng carousel:

- Giữ tỷ lệ 16:9.
- Có nút trước và sau.
- Có dot indicators.
- Tự chạy mỗi khoảng 4,5 giây.
- Tạm dừng khi rê chuột hoặc kéo.
- Hỗ trợ kéo chuột trên desktop và vuốt trên mobile.
- Tự đo lại chiều rộng khi resize trình duyệt.
- Tôn trọng `prefers-reduced-motion` bằng cách không tự chạy khi người dùng giảm chuyển động.

## Cách thay ảnh carousel

1. Đặt ảnh mới vào repository nếu quy trình dự án cho phép cập nhật ảnh.
2. Mở `index.html`.
3. Tìm các thẻ `<img>` trong khu vực `<section class="hero-carousel" ...>`.
4. Cập nhật thuộc tính `src` sang tên file ảnh mới.
5. Cập nhật `alt` để mô tả đúng nội dung ảnh.
6. Nên dùng ảnh tỷ lệ 16:9 để banner không bị cắt quá nhiều.

## Cách cập nhật danh sách hãng tivi

1. Mở `index.html`.
2. Tìm khu vực `<ul class="brand-list" aria-label="Danh sách hãng tivi">`.
3. Thêm, sửa hoặc xóa từng dòng `<li>`.
4. Mỗi hãng có dạng:

```html
<li><a href="#san-pham"><span>S</span>Samsung</a></li>
```

Trong đó:

- Chữ trong `<span>` là ký tự viết tắt hiển thị như badge.
- Chữ sau `</span>` là tên hãng hiển thị cho khách hàng.

Nếu danh sách dài, desktop sẽ cuộn dọc trong panel; mobile sẽ chuyển sang danh sách ngang để không che banner.

## Cách cập nhật size options

1. Mở `index.html`.
2. Tìm khu vực `<div class="size-options" role="group" aria-label="Chọn kích thước tivi">`.
3. Thêm hoặc sửa các nút `.size-pill`.
4. Đảm bảo `data-size` trùng với nội dung hiển thị.

Ví dụ:

```html
<button class="size-pill" type="button" data-size="65 inch" aria-pressed="false">65 inch</button>
```

Nếu muốn đổi kích thước mặc định, hãy chuyển class `is-active` và `aria-pressed="true"` sang nút mong muốn, sau đó cập nhật dòng mặc định `Đang xem: ...`.

## Cách thêm sản phẩm và giá thật

1. Mở `index.html`.
2. Tìm khu vực `<div class="product-grid">`.
3. Sao chép một thẻ `<article class="product-card">` hiện có.
4. Cập nhật các trường:
   - `.product-brand`: thương hiệu.
   - Tiêu đề `<h3>`: tên model.
   - `.product-size`: kích thước.
   - Danh sách `<ul>`: tính năng chính.
   - `.product-price`: giá thật hoặc dòng liên hệ.
   - Nút CTA: liên kết đến phần liên hệ, số điện thoại hoặc Zalo.

Hiện tại giá đang dùng nội dung giữ chỗ như `Liên hệ nhận giá tốt` và `Giá đang cập nhật`.

## Cách cập nhật số điện thoại và địa chỉ

Các số điện thoại và địa chỉ đang xuất hiện trong `index.html` ở nhiều vị trí:

- Top mini bar.
- Nút hotline trong header.
- Khu vực liên hệ.
- Footer.
- Nút liên hệ nổi.

Khi đổi số điện thoại, hãy cập nhật cả nội dung hiển thị và link `tel:`. Ví dụ:

```html
<a href="tel:0905111223">Gọi ngay</a>
```

Khi đổi địa chỉ, hãy cập nhật:

- Dòng chữ hiển thị trong section liên hệ và footer.
- Link Google Maps trong nút `Xem địa chỉ` nếu muốn trỏ sang địa chỉ mới.

## Cách cập nhật Zalo link

Hiện tại các nút Zalo dùng link giữ chỗ:

```html
href="#"
```

Khi có liên kết Zalo chính thức:

1. Mở `index.html`.
2. Tìm các liên kết có chữ `Nhắn Zalo` hoặc `Zalo`.
3. Thay `href="#"` bằng link Zalo thật.
4. Nếu mở tab mới, thêm `target="_blank" rel="noreferrer"`.

## Cách chạy local

Có thể mở trực tiếp `index.html` bằng trình duyệt. Cách khuyến nghị là chạy server tĩnh:

```bash
python3 -m http.server 8000
```

Sau đó truy cập:

```text
http://localhost:8000
```

## Cách deploy với GitHub Pages

1. Đẩy code lên repository GitHub.
2. Vào **Settings** của repository.
3. Chọn **Pages**.
4. Trong phần **Build and deployment**, chọn branch muốn deploy.
5. Chọn thư mục gốc `/root` nếu các file `index.html`, `styles.css`, `script.js` nằm ở root repository.
6. Lưu cấu hình và chờ GitHub Pages tạo link website.

## Ghi chú bảo trì

- Không cần cài dependency.
- Không dùng thư viện ngoài.
- Nên giữ màu chủ đạo trắng, xanh dương đậm và xám nhạt để website nhất quán.
- Các ảnh hiện có đang được dùng trực tiếp, không chỉnh sửa file ảnh.
- Nếu thêm sản phẩm thật, nên bổ sung giá, tình trạng hàng và đường dẫn tư vấn rõ ràng.
