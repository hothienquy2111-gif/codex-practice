# Anh Minh Store - Website bán tivi

Website tĩnh giới thiệu dịch vụ và danh sách tivi của Anh Minh Store. Giao diện giữ phong cách bán lẻ trắng + xanh dương đậm, dùng font Aptos toàn cục và toàn bộ nội dung hiển thị bằng tiếng Việt.

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
- Giữ font Aptos và phong cách trắng + xanh dương đậm hiện tại.
- Không dùng `target="_blank"` cho nút xem chi tiết sản phẩm.
- Nếu ảnh sản phẩm lỗi tải, giao diện sẽ hiển thị placeholder tivi CSS sạch có sẵn.
