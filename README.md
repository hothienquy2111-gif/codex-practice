# Anh Minh Store - Website bán tivi

Website tĩnh giới thiệu dịch vụ và danh sách tivi của Anh Minh Store. Giao diện giữ phong cách bán lẻ trắng + xanh dương đậm, dùng hệ chữ trang trọng toàn cục và toàn bộ nội dung hiển thị bằng tiếng Việt.

## Tối ưu typography

Typography của website đã được tối ưu theo phong cách doanh nghiệp trang trọng, lịch sự và chuyên nghiệp hơn cho một cửa hàng điện tử thật. Toàn site dùng font stack toàn cục `Aptos, "Segoe UI", "Noto Sans", Arial, Helvetica, sans-serif;` để ưu tiên chữ sạch, dễ đọc, hỗ trợ tốt dấu tiếng Việt và vẫn tương thích với nhiều hệ điều hành.

Các cấp tiêu đề, menu, nút bấm, tên sản phẩm, giá, thông tin sản phẩm và bảng thông số được cân chỉnh lại về độ đậm, line-height và khoảng cách chữ để tạo cảm giác tinh tế, đáng tin cậy hơn mà vẫn giữ thiết kế bán lẻ trắng + xanh dương đậm hiện tại. Không có file font bên ngoài, font trả phí/proprietary hoặc tài nguyên font bổ sung nào được thêm vào.

## Sản phẩm Samsung QA55Q7FA

Sản phẩm mẫu Samsung 55 inch cũ đã được thay thế bằng sản phẩm thật:

- `id`: `samsung-qa55q7fa`
- `brand`: `Samsung`
- `model`: `QA55Q7FA`
- `fullName`: `Smart Tivi Samsung QLED 4K Vision AI 55 Inch QA55Q7FA`
- `size`: `55 inch`
- `type`: `Tivi mới`
- `condition`: `Mới`
- `warranty`: `Bảo hành 2 năm`
- `oldPrice`: `14.299.000đ`
- `price`: `11.690.000đ`

Card sản phẩm trên trang chủ dùng ảnh chính `55Q7 trước.webp`, hiển thị giá cũ gạch ngang và giá bán nổi bật. Nút **Xem chi tiết** mở cùng tab tại:

```text
product-detail.html?id=samsung-qa55q7fa
```

Trang chi tiết hiển thị thư viện 4 ảnh, thông tin thương hiệu, model, tên đầy đủ, kích thước, loại sản phẩm, tình trạng, bảo hành, đặc điểm nổi bật, mô tả, giá cũ, giá bán và các nút CTA **Gọi tư vấn**, **Nhắn Zalo**, **Quay lại danh sách**.

## Ảnh sản phẩm

Các ảnh của Samsung QA55Q7FA được lưu ngay tại thư mục gốc repository, cùng cấp với `index.html` và `products.js`. Tên file phải được giữ nguyên chính xác vì GitHub Pages phân biệt chữ hoa/thường, dấu tiếng Việt và khoảng trắng:

- `55Q7 trước.webp`
- `55q7 nghiên trái.webp`
- `55q7 nghiên phải.webp`
- `55q7 viền.webp`

Không đổi tên, không di chuyển và không chỉnh sửa các file ảnh/binary khi chỉ cập nhật dữ liệu sản phẩm.

## Modal tổng quan và thông số chi tiết

Sản phẩm `samsung-qa55q7fa` có sẵn dữ liệu:

- `overview`: nội dung **Tổng quan sản phẩm** gồm giới thiệu, đặc điểm nổi bật, thiết kế, màn hình QLED 4K, công nghệ hình ảnh, Samsung Vision AI, trải nghiệm chuyển động, âm thanh và hệ điều hành.
- `specifications`: nội dung **Thông số chi tiết** theo nhóm gồm tổng quan sản phẩm, công nghệ hình ảnh, công nghệ âm thanh, cổng kết nối, tiện ích, thông tin lắp đặt, xuất xứ và bảo hành.

Trang chi tiết tự hiển thị hai nút **Tổng quan sản phẩm** và **Thông số chi tiết** nếu sản phẩm có dữ liệu tương ứng. Hai nút mở modal nổi trên cùng trang, không chuyển trang, không mở tab mới. Modal có thể đóng bằng nút X, bấm nền mờ hoặc phím Escape; nội dung modal có vùng cuộn để dùng tốt trên mobile.

## Cách dữ liệu sản phẩm hoạt động

`products.js` khai báo mảng toàn cục:

```js
window.products = [
  {
    id: "samsung-qa55q7fa",
    brand: "Samsung",
    model: "QA55Q7FA",
    fullName: "Smart Tivi Samsung QLED 4K Vision AI 55 Inch QA55Q7FA",
    size: "55 inch",
    type: "Tivi mới",
    condition: "Mới",
    warranty: "Bảo hành 2 năm",
    oldPrice: "14.299.000đ",
    price: "11.690.000đ",
    image: "55Q7 trước.webp",
    images: [
      "55Q7 trước.webp",
      "55q7 nghiên trái.webp",
      "55q7 nghiên phải.webp",
      "55q7 viền.webp",
    ],
  },
];
```

`script.js` đọc `window.products`, chuẩn hóa dữ liệu thiếu và render sản phẩm vào trang chủ. Bộ lọc trang chủ hoạt động theo `brand`, `size` và `type`, vì vậy Samsung QA55Q7FA xuất hiện khi chọn **Tất cả**, **Samsung**, **55 inch** hoặc **Tivi mới**.

`product-detail.html` nạp `products.js` và `product-detail.js`. `product-detail.js` đọc tham số `id` trên URL, tìm đúng sản phẩm trong `window.products` rồi render chi tiết, thư viện ảnh và modal nếu có dữ liệu.

## Cách thêm một sản phẩm mới có ảnh, giá cũ, giá bán, tổng quan và thông số

1. Mở `products.js`.
2. Thêm object sản phẩm mới vào mảng `window.products` hoặc cập nhật object hiện có nếu đang thay sản phẩm mẫu.
3. Đặt `id` duy nhất, không dấu, chữ thường và nên nối bằng dấu gạch ngang.
4. Điền các trường hiển thị chính:
   - `brand`
   - `model`
   - `fullName`
   - `size`
   - `type`
   - `condition`
   - `warranty`
   - `oldPrice`
   - `price`
   - `badge`
   - `description`
   - `features`
5. Lưu ảnh vào đúng vị trí mong muốn, sau đó tham chiếu chính xác tên file trong:
   - `image`: ảnh chính dùng cho card sản phẩm.
   - `images`: danh sách ảnh dùng cho thư viện ảnh trang chi tiết.
6. Thêm `overview` dạng mảng section. Mỗi section có thể có `heading` và `paragraphs`:

```js
overview: [
  {
    paragraphs: [
      "Đoạn giới thiệu tổng quan sản phẩm bằng tiếng Việt.",
    ],
  },
  {
    heading: "Thiết kế",
    paragraphs: [
      "Mô tả thiết kế, kích thước và không gian sử dụng.",
    ],
  },
]
```

7. Thêm `specifications` dạng mảng nhóm. Mỗi nhóm có `group` và `rows`; mỗi dòng có `label` và `value`. `value` có thể là chuỗi hoặc mảng chuỗi:

```js
specifications: [
  {
    group: "Tổng quan sản phẩm",
    rows: [
      { label: "Loại Tivi", value: "Smart Tivi QLED" },
      { label: "Kích cỡ màn hình", value: "55 Inch" },
    ],
  },
  {
    group: "Công nghệ hình ảnh",
    rows: [
      {
        label: "Công nghệ hình ảnh",
        value: ["Quantum Dot", "Quantum HDR+", "Motion Xcelerator"],
      },
    ],
  },
]
```

8. Kiểm tra trang chủ, các bộ lọc, card sản phẩm, trang chi tiết, thư viện ảnh và hai modal trước khi đưa lên GitHub Pages.

## Lưu ý bảo trì

- Luôn giữ nội dung hiển thị bằng tiếng Việt.
- Giữ font stack `Aptos, "Segoe UI", "Noto Sans", Arial, Helvetica, sans-serif;` và phong cách trắng + xanh dương đậm hiện tại.
- Không dùng `target="_blank"` cho nút xem chi tiết sản phẩm.
- Nếu ảnh sản phẩm lỗi tải, giao diện sẽ hiển thị placeholder tivi CSS sạch có sẵn.

## Danh mục hãng tivi và logo thương hiệu

Logo trong khung **DANH MỤC HÃNG TIVI** được khai báo tập trung trong `script.js` bằng một danh sách thương hiệu duy nhất. Các file logo đang được lưu ngay tại thư mục gốc repository, cùng cấp với `index.html`, nên đường dẫn dùng dạng tương đối như `samsung.jpeg`, `LG.jpeg`, `sony.jpeg`, `toshiba.jpeg`, `TCL.jpeg`, `skyworth.png`.

GitHub Pages phân biệt chữ hoa/thường, vì vậy tên file phải khớp chính xác với file thật trong repository. Ví dụ `LG.jpeg` khác `lg.jpeg`, `TCL.jpeg` khác `tcl.jpeg`. Không dùng đường dẫn bắt đầu bằng `/` vì website có thể được phục vụ dưới thư mục con của GitHub Pages.

Panel thương hiệu luôn ưu tiên hiển thị ảnh logo đã tải lên. Mỗi logo được render với `loading="eager"`, `decoding="async"`, kích thước cố định và alt tiếng Việt như `Logo Samsung`, `Logo LG`, `Logo Sony`. Badge chữ cái dự phòng được ẩn mặc định và chỉ hiện khi sự kiện `onerror` của ảnh xảy ra. Nếu ảnh tải thành công, ảnh vẫn hiển thị và badge dự phòng không phủ lên logo.

Để thay logo một thương hiệu sau này:

1. Đặt file ảnh mới vào thư mục gốc repository, cùng cấp với `index.html`.
2. Không đổi hoặc chỉnh sửa file ảnh cũ nếu không cần thiết.
3. Mở `script.js` và cập nhật đúng trường `logo` trong danh sách `BRAND_DATA`.
4. Kiểm tra tên file chính xác từng ký tự, gồm chữ hoa/thường và phần mở rộng `.jpeg`, `.png` hoặc `.svg`.
5. Giữ alt tự động theo tên hãng để người dùng và công cụ hỗ trợ đọc được nội dung logo.

## Cách lọc sản phẩm theo hãng

Khi bấm một hãng trong **DANH MỤC HÃNG TIVI**, website cập nhật trạng thái hãng đang chọn và lọc sản phẩm theo `product.brand` không phân biệt chữ hoa/thường nhưng yêu cầu tên hãng khớp chính xác, ví dụ `Samsung`, `LG`, `Sony`.

Bộ lọc hãng bên trái đồng bộ với hai khu vực:

- **Tivi cũ đã kiểm tra**.
- **Tivi mới chính hãng**.

Nút **Tất cả hãng** ở đầu panel dùng để bỏ lọc hãng và hiển thị lại toàn bộ sản phẩm. Các bộ lọc kích thước riêng của từng khu vực vẫn kết hợp với hãng đang chọn, nên nếu đang chọn một kích thước cụ thể rồi chọn hãng trong khu vực đó, danh sách sẽ lọc theo cả hãng và kích thước.

Nếu một khu vực không có sản phẩm thuộc hãng đang chọn, website hiển thị thông báo tiếng Việt: **“Chưa có sản phẩm thuộc hãng này. Vui lòng chọn hãng khác hoặc liên hệ Anh Minh Store.”** Nếu dữ liệu sản phẩm trống, website hiển thị **“Sản phẩm đang được cập nhật.”**

## Cách kiểm tra logo và lọc hãng

1. Mở trang chủ rồi nhấn **Ctrl + F5** để hard refresh.
2. Kiểm tra các logo trong **DANH MỤC HÃNG TIVI** vẫn hiển thị, không bị badge chữ cái phủ lên.
3. Bấm các hãng như **Samsung**, **LG**, **Sony**, **Toshiba**.
4. Kiểm tra **Sản phẩm nổi bật**, **Tivi cũ đã kiểm tra** và **Tivi mới chính hãng** được lọc theo hãng đã chọn.
5. Bấm **Tất cả hãng** để reset bộ lọc và hiển thị lại toàn bộ sản phẩm.
6. Trên mobile, kiểm tra panel vẫn cuộn được, không tràn ngang và logo không bị kéo giãn.
