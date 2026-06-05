# ANH MINH STORE - Website tư vấn tivi

Website tĩnh cho **ANH MINH STORE / Công ty kỹ thuật điện tử Anh Minh** tại Đà Nẵng. Trang dùng HTML, CSS và JavaScript thuần, không dùng framework hay thư viện ngoài.

## Cấu trúc file chính

```text
index.html            # Trang chủ
styles.css            # Giao diện toàn website
products.js           # Nguồn dữ liệu sản phẩm dùng chung
script.js             # Tương tác trang chủ và render thẻ sản phẩm
product-detail.html   # Trang chi tiết sản phẩm
product-detail.js     # Đọc id trên URL và render chi tiết sản phẩm
```

## Cách điều hướng sang trang chi tiết sản phẩm

Danh sách sản phẩm trên trang chủ được lấy từ `products.js` và render bằng `script.js` vào khu vực:

```html
<div class="product-grid" data-product-grid aria-live="polite"></div>
```

Mỗi thẻ sản phẩm là một liên kết bình thường có dạng:

```text
product-detail.html?id=product-id
```

Ví dụ:

```text
product-detail.html?id=samsung-55-du7000
```

Khi người dùng bấm vào card sản phẩm hoặc nút **“Xem chi tiết”**, trình duyệt chuyển sang `product-detail.html?id=...` ngay trong cùng tab hiện tại.

Website không dùng `target="_blank"` cho các liên kết chi tiết sản phẩm, vì vậy không mở tab mới, popup hay cửa sổ mới.

## Cách product-detail.html dùng id trong URL

Trang `product-detail.html` nạp dữ liệu từ `products.js`, sau đó `product-detail.js` đọc id bằng `URLSearchParams`:

```js
const detailParams = new URLSearchParams(window.location.search);
const productId = detailParams.get("id");
```

Sau khi có `productId`, JavaScript tìm sản phẩm tương ứng trong `window.products`:

```js
const selectedProduct = detailProducts.find((product) => product.id === productId);
```

Nếu tìm thấy, trang chi tiết sẽ hiển thị:

- Thương hiệu (`brand`)
- Model (`model`)
- Kích thước (`size`)
- Loại sản phẩm (`type`)
- Tình trạng (`condition`)
- Badge (`badge`)
- Tính năng (`features`)
- Mô tả (`description`)
- Giá cũ nếu có (`oldPrice`)
- Giá bán hoặc dòng liên hệ (`price`)
- Ảnh sản phẩm nếu có (`image`)

Nếu sản phẩm chưa có ảnh, trang sẽ hiển thị placeholder tivi bằng CSS để bố cục vẫn sạch và chuyên nghiệp.

Nếu URL bị thiếu id hoặc id không tồn tại, trang hiển thị thông báo thân thiện:

```text
Không tìm thấy sản phẩm. Vui lòng quay lại trang chủ.
```

Kèm nút để quay lại `index.html`.

## Cách thêm sản phẩm mới trong products.js

Mở `products.js` và thêm một object mới vào mảng `window.products`.

Mỗi sản phẩm bắt buộc nên có `id` duy nhất, không trùng với sản phẩm khác. Nên dùng chữ thường, không dấu và nối bằng dấu gạch ngang.

Ví dụ:

```js
{
  id: "samsung-55-du7000",
  brand: "Samsung",
  model: "UA55DU7000",
  size: "55 inch",
  type: "Tivi mới",
  condition: "Mới",
  features: ["4K UHD", "Smart TV", "Bảo hành chính hãng"],
  oldPrice: "",
  price: "Liên hệ nhận giá tốt",
  image: "",
  badge: "Hàng mới",
  description: "Phù hợp phòng khách, hình ảnh sắc nét, dễ sử dụng.",
}
```

Giải thích nhanh các trường:

- `id`: mã sản phẩm dùng trên URL chi tiết, ví dụ `product-detail.html?id=samsung-55-du7000`.
- `brand`: thương hiệu tivi.
- `model`: tên model hoặc tên sản phẩm hiển thị.
- `size`: kích thước màn hình.
- `type`: tivi mới, tivi cũ hoặc loại tư vấn phù hợp.
- `condition`: tình trạng sản phẩm.
- `features`: danh sách tính năng nổi bật.
- `oldPrice`: giá cũ nếu có; để chuỗi rỗng `""` nếu không dùng.
- `price`: giá bán hoặc dòng liên hệ.
- `image`: đường dẫn ảnh nếu có; để chuỗi rỗng `""` để dùng placeholder CSS.
- `badge`: nhãn nổi bật.
- `description`: mô tả ngắn cho trang chi tiết.

## Cách làm thẻ sản phẩm link sang trang chi tiết

Hiện tại thẻ sản phẩm được render tự động trong `script.js`. Với mỗi sản phẩm, link chi tiết được tạo từ `product.id`:

```js
const createProductDetailUrl = (product) => `product-detail.html?id=${encodeURIComponent(product.id)}`;
```

Vì vậy chỉ cần thêm sản phẩm đúng cấu trúc vào `products.js`, card trên trang chủ sẽ tự trỏ đến:

```text
product-detail.html?id={product.id}
```

Nếu cần viết thủ công một link chi tiết, dùng dạng:

```html
<a href="product-detail.html?id=samsung-55-du7000">Xem chi tiết</a>
```

Không thêm `target="_blank"` nếu muốn giữ điều hướng trong cùng tab.

## Header, hotline và CTA

Trang chi tiết giữ cùng nhận diện với trang chủ:

- Tên thương hiệu: **ANH MINH STORE**
- Tên công ty: **Công ty kỹ thuật điện tử Anh Minh**
- Hotline: **0905111223 - 0774111223**

Các CTA chính trên trang chi tiết:

- **Gọi tư vấn** dùng `tel:0905111223`
- **Nhắn Zalo** dùng link giữ chỗ `#`
- **Quay lại danh sách** trỏ về `index.html#san-pham`

## Giao diện responsive

Trang chi tiết dùng layout dạng retail trắng + xanh dương đậm:

- Desktop: ảnh hoặc placeholder tivi nằm bên trái, thông tin sản phẩm nằm bên phải.
- Tablet/mobile: bố cục xếp chồng để dễ đọc trên màn hình nhỏ.
- Card trắng, viền nhẹ, bóng mềm, điểm nhấn xanh dương đậm và cam cho giá/CTA.
- Font toàn site dùng Aptos với fallback:

```css
font-family: Aptos, "Segoe UI", Arial, Helvetica, sans-serif;
```

## Cách chạy local

Có thể mở trực tiếp `index.html` bằng trình duyệt. Cách khuyến nghị là chạy server tĩnh:

```bash
python3 -m http.server 8000
```

Sau đó truy cập:

```text
http://localhost:8000
```

Ví dụ trang chi tiết:

```text
http://localhost:8000/product-detail.html?id=samsung-55-du7000
```

## Ghi chú bảo trì

- Không cần cài dependency.
- Không dùng thư viện ngoài.
- Dữ liệu sản phẩm tập trung ở `products.js` để trang chủ và trang chi tiết dùng chung một nguồn.
- Không chỉnh sửa file ảnh hoặc file nhị phân nếu chỉ cập nhật nội dung/code.
- Các link chi tiết sản phẩm mở trong cùng tab vì không dùng `target="_blank"`.
