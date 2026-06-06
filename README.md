# ANH MINH STORE - Website tivi tại Đà Nẵng

Website tĩnh cho **Công ty kỹ thuật điện tử Anh Minh** tại Đà Nẵng, dùng để giới thiệu dịch vụ tivi cũ, tivi mới, thu hư đổi mới, sửa tivi và tư vấn sản phẩm cho khách hàng.

Thiết kế giữ phong cách bán lẻ điện máy chuyên nghiệp với nền trắng, xanh dương đậm, điểm nhấn cam cho hành động gọi điện. Toàn bộ giao diện dùng font:

```css
font-family: Aptos, "Segoe UI", Arial, Helvetica, sans-serif;
```

## Tóm tắt tối ưu production

Website đã được tối ưu theo hướng nhẹ, ổn định và dễ bảo trì:

- Chỉ dùng **HTML, CSS, JavaScript thuần**, không framework và không thư viện ngoài.
- Dữ liệu sản phẩm tập trung ở `products.js`, trang chủ và trang chi tiết dùng chung một nguồn dữ liệu.
- Carousel 16:9 hỗ trợ kéo chuột, vuốt mobile, nút mũi tên, chấm điều hướng, autoplay và tự tạm dừng khi hover/kéo.
- Menu danh mục hỗ trợ hover/click trên desktop, click trên mobile, đóng khi bấm ngoài hoặc nhấn Escape.
- Điều hướng nội bộ cuộn mượt, có active state và `scroll-margin-top` để header sticky không che tiêu đề.
- Product card được render tự động, link mở trong cùng tab theo dạng `product-detail.html?id={product.id}`.
- Panel **DANH MỤC HÃNG TIVI** dùng logo SVG thật được lưu ngay tại thư mục gốc repository; hãng chưa có logo vẫn dùng badge chữ fallback gọn gàng.
- Các thẻ dịch vụ nổi bật trên trang chủ dùng icon ảnh thật từ thư mục gốc repository và có badge chữ xanh đậm để dự phòng khi ảnh không tải được.
- Nếu chưa có ảnh sản phẩm hoặc ảnh sản phẩm tải lỗi, website dùng placeholder tivi bằng CSS để tránh vỡ layout.
- Sản phẩm thật **Samsung 43U8500F** đã được thêm với thư viện 4 ảnh thật lưu ở thư mục gốc repository.
- Nếu thiếu danh sách sản phẩm hoặc id sản phẩm không hợp lệ, website hiển thị thông báo tiếng Việt thân thiện.
- Có SEO metadata, Open Graph, alt text ảnh, focus state, aria attributes và hỗ trợ `prefers-reduced-motion`.
- Có nút liên hệ nổi **Gọi ngay / Zalo** và nút **lên đầu trang**.

## Cấu trúc file

```text
index.html             # Trang chủ, header, menu, carousel, danh sách sản phẩm, dịch vụ, liên hệ
styles.css             # Toàn bộ giao diện responsive, placeholder tivi, trạng thái hover/focus/mobile
script.js              # Menu, carousel, tìm kiếm, lọc kích thước/hãng/loại, render product card, back-to-top
products.js            # Nguồn dữ liệu sản phẩm duy nhất
product-detail.html    # Khung trang chi tiết sản phẩm
product-detail.js      # Đọc id từ URLSearchParams, render chi tiết và thư viện ảnh sản phẩm
README.md              # Hướng dẫn vận hành và bảo trì website
```

## Icon dịch vụ trên trang chủ

Các thẻ dịch vụ nổi bật trên trang chủ dùng icon ảnh được lưu trực tiếp ở thư mục gốc repository, cùng cấp với `index.html`. Bốn file đang dùng là:

- `tivicu.jpeg` cho dịch vụ **Tivi cũ**.
- `tivimoi.jpeg` cho dịch vụ **Tivi mới**.
- `thucudoimoi.jpeg` cho dịch vụ **Thu hư đổi mới**.
- `suachua.jpeg` cho dịch vụ **Sửa tivi**.

Các icon này được đặt trong hộp icon bo góc nền trắng xanh nhẹ để giữ giao diện bán lẻ trắng + xanh dương đậm gọn gàng. Nếu một file ảnh dịch vụ bị thiếu hoặc tải lỗi, `script.js` sẽ ẩn ảnh lỗi và hiện badge chữ màu xanh dương đậm thay thế để không làm vỡ bố cục.

### Cách thay icon dịch vụ sau này

1. Chuẩn bị file icon mới có dung lượng tối ưu và hình ảnh rõ nét.
2. Đưa file icon mới vào thư mục gốc repository.
3. Mở `index.html` và cập nhật thuộc tính `src` trong thẻ `<img>` của dịch vụ tương ứng, ví dụ đổi `src="tivicu.jpeg"` sang tên file mới.
4. Giữ hoặc cập nhật `alt` tiếng Việt cho đúng nội dung, ví dụ `alt="Biểu tượng tivi cũ"`.
5. Nếu cần đổi chữ dự phòng, cập nhật `data-fallback` và nội dung trong `.service-icon-fallback` của đúng thẻ dịch vụ.
6. Kiểm tra lại trên desktop, tablet và mobile để đảm bảo icon không bị méo, không tràn khỏi thẻ và các thẻ dịch vụ vẫn xếp hàng/cột gọn gàng.

Lưu ý: chỉ thay đường dẫn trong code khi muốn đổi icon; không chỉnh sửa trực tiếp file ảnh gốc nếu không có yêu cầu riêng.

## Cách dữ liệu sản phẩm hoạt động trong products.js

`products.js` khai báo mảng toàn cục:

```js
window.products = [
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
  },
];
```

`script.js` đọc `window.products`, chuẩn hóa dữ liệu thiếu và render danh sách sản phẩm vào:

```html
<div class="product-grid" data-product-grid aria-live="polite"></div>
```

Nếu mảng sản phẩm bị thiếu hoặc trống, trang chủ hiển thị:

```text
Sản phẩm đang được cập nhật.
```

### Sản phẩm thật Samsung 43U8500F

Website đã thêm sản phẩm thật:

- `id`: `samsung-43u8500f`
- `brand`: `Samsung`
- `model`: `43U8500F`
- `fullName`: `Smart Tivi Crystal UHD Samsung 4K 43 inch`
- `size`: `43 inch`
- `type`: `Tivi mới`
- `condition`: `Mới`
- `warranty`: `Bảo hành 2 năm`
- `price`: `7.700.000đ`

Ảnh sản phẩm được lưu ngay tại thư mục gốc repository, cùng cấp với `index.html`, và được tham chiếu trực tiếp trong `products.js`. Tên file ảnh giữ nguyên tiếng Việt có dấu và khoảng trắng:

- `mặt trước tivi.jpg`
- `mặt nghiêng trái tivi.jpg`
- `màu nghiêng phải tivi.jpg`
- `viền tivi.jpg`

Trong đó `image: "mặt trước tivi.jpg"` là ảnh chính dùng cho card ở trang chủ, còn mảng `images` chứa 4 ảnh dùng cho thư viện ảnh ở trang chi tiết.

## Cách điều hướng chi tiết sản phẩm hoạt động

Mỗi card sản phẩm trên trang chủ là một liên kết bình thường trong cùng tab:

```text
product-detail.html?id={product.id}
```

Ví dụ:

```text
product-detail.html?id=samsung-55-du7000
```

URL chi tiết của sản phẩm Samsung 43U8500F là:

```text
product-detail.html?id=samsung-43u8500f
```

Trang `product-detail.html` nạp `products.js`, sau đó `product-detail.js` đọc id bằng:

```js
const detailParams = new URLSearchParams(window.location.search);
const productId = detailParams.get("id");
```

Nếu tìm thấy sản phẩm đúng id, trang chi tiết hiển thị thương hiệu, model, tên đầy đủ, kích thước, loại sản phẩm, tình trạng, bảo hành, đặc điểm nổi bật, mô tả, giá và nút liên hệ. Nếu sản phẩm có mảng `images`, trang chi tiết hiển thị ảnh lớn và hàng thumbnail; khi bấm một thumbnail, JavaScript đổi `src` của ảnh lớn sang đúng file ảnh được chọn và đánh dấu thumbnail đang active bằng viền xanh dương đậm. Nếu không tìm thấy id, trang hiển thị:

```text
Không tìm thấy sản phẩm. Vui lòng quay lại trang chủ.
```

## Cách thêm một sản phẩm tivi mới

1. Mở file `products.js`.
2. Thêm một object mới vào cuối mảng `window.products`.
3. Đảm bảo `id` là duy nhất, không dấu, chữ thường và nên nối bằng dấu gạch ngang.

Ví dụ:

```js
{
  id: "lg-55-ur7550",
  brand: "LG",
  model: "UR7550",
  fullName: "Smart Tivi LG 4K UHD 55 inch",
  size: "55 inch",
  type: "Tivi mới",
  condition: "Mới",
  warranty: "Bảo hành chính hãng",
  features: ["4K UHD", "Smart TV", "Phù hợp phòng khách"],
  oldPrice: "",
  price: "Liên hệ nhận giá tốt",
  image: "anh-chinh.jpg",
  images: ["anh-chinh.jpg", "anh-nghieng.jpg", "anh-can-canh.jpg"],
  badge: "Hàng mới",
  description: "Mẫu tivi 55 inch phù hợp nhu cầu xem phim, thể thao và giải trí gia đình.",
}
```

Gợi ý các trường nên có:

- `id`: mã sản phẩm dùng trong URL chi tiết.
- `brand`: hãng tivi.
- `model`: mã model ngắn hiển thị trên card và trang chi tiết.
- `fullName`: tên sản phẩm đầy đủ.
- `size`: kích thước như `43 inch`, `55 inch`, `65 inch`.
- `type`: tivi cũ, tivi mới hoặc nhóm tư vấn.
- `condition`: tình trạng sản phẩm.
- `warranty`: thông tin bảo hành nếu có.
- `features`: 2-6 điểm nổi bật.
- `oldPrice`: giá cũ nếu có, để `""` nếu không dùng.
- `price`: giá bán hoặc dòng liên hệ.
- `image`: đường dẫn ảnh chính cho card trang chủ, để `""` nếu chưa có ảnh.
- `images`: mảng nhiều ảnh cho gallery trang chi tiết; ảnh đầu tiên thường trùng với `image`.
- `badge`: nhãn ngắn như `Hàng mới`, `Tư vấn nhiều`, `Bảo hành 2 năm`.
- `description`: mô tả ngắn cho trang chi tiết.

## Logo hãng tivi trong panel DANH MỤC HÃNG TIVI

Các logo hãng tivi được lưu trực tiếp ở thư mục gốc repository, cùng cấp với `index.html`. Panel **DANH MỤC HÃNG TIVI** hiện dùng logo SVG thật cho các hãng đã có file, ví dụ:

- `samsung1.svg` cho Samsung
- `LG_logo.svg`
- `Sony.svg`
- `Toshiba-Logo.svg`
- `Hisense.svg`
- `TCL.svg`
- `Panasonic-Logo.svg`
- `sharp1.svg` cho Sharp
- `xiaomi.svg` nếu file này có trong thư mục gốc

Mỗi dòng hãng trong `index.html` hiển thị logo bên trái và tên hãng bên phải. Logo được đặt trong hộp nhỏ để giữ giao diện trắng + xanh dương đậm gọn gàng, không làm panel lớn hơn và không che nhiều banner. Riêng Samsung dùng chính xác `samsung1.svg` từ thư mục gốc repository và Sharp dùng chính xác `sharp1.svg` từ thư mục gốc repository.

### Cách thay logo một hãng sau này

1. Tải file SVG logo mới lên thư mục gốc repository.
2. Cập nhật đường dẫn logo trong map/code hiển thị logo hãng, hiện là thẻ `<img src="...">` tương ứng trong `index.html` của panel **DANH MỤC HÃNG TIVI**. Ví dụ Samsung đang trỏ tới `samsung1.svg`, Sharp đang trỏ tới `sharp1.svg`.
3. Kiểm tra lại `alt` của ảnh trong `index.html`, ví dụ `alt="Logo Samsung"`, để đảm bảo mô tả vẫn đúng và giữ badge chữ bên trong hộp logo ở trạng thái ẩn mặc định.
4. Mở website trên desktop và mobile để kiểm tra logo không bị méo, không bị cắt và không gây tràn ngang.

### Cách thêm logo cho một hãng mới sau này

1. Đưa file SVG logo mới vào thư mục gốc repository.
2. Thêm hoặc cập nhật dòng hãng trong `index.html` theo mẫu:

```html
<li>
  <a href="#san-pham">
    <span class="brand-logo-box">
      <img src="ten-logo.svg" alt="Logo Tên hãng" />
      <span class="brand-fallback-badge" aria-hidden="true">T</span>
    </span>
    <span class="brand-name">Tên hãng</span>
  </a>
</li>
```

3. Nếu chưa có logo, giữ badge chữ fallback theo mẫu:

```html
<li>
  <a href="#san-pham">
    <span class="brand-fallback-badge">T</span>
    <span class="brand-name">Tên hãng</span>
  </a>
</li>
```

Nếu file logo bị thiếu hoặc chưa được tải lên, `script.js` sẽ ẩn ảnh bị lỗi và chỉ lúc đó mới hiện badge chữ fallback trong hộp logo. Khi logo tải thành công, badge fallback vẫn bị ẩn nên không che ảnh logo.

## Cách cập nhật hình ảnh sau này

Hiện tại nhiều sản phẩm dùng placeholder tivi bằng CSS. Khi muốn thêm ảnh thật:

1. Chuẩn bị ảnh tối ưu dung lượng, ưu tiên tỷ lệ ngang rõ nét.
2. Đưa file ảnh vào thư mục website.
3. Cập nhật trường `image` trong `products.js`:

```js
image: "ten-file-anh.jpg"
```

Lưu ý: khi cập nhật nội dung hoặc code, không chỉnh sửa file ảnh/SVG/binary nếu không có yêu cầu riêng. Với ảnh có tên tiếng Việt, khoảng trắng hoặc dấu, hãy dùng đúng tên file trong `products.js`, không tự đổi sang dấu gạch ngang và không bỏ dấu. Nên nén ảnh trước khi đưa lên production để tải nhanh hơn.

## Cách cập nhật số điện thoại và địa chỉ

Các số hotline hiện tại:

- `0905111223`
- `0774111223`

Địa chỉ hiện tại:

- `100 Tiểu La, Hải Châu, Đà Nẵng`
- `540B Nguyễn Hữu Thọ, Cẩm Lệ, Đà Nẵng`

Khi cần đổi thông tin, tìm và cập nhật trong:

- `index.html`: header, phần liên hệ, footer, floating contact.
- `product-detail.html`: header, footer, floating contact.
- `product-detail.js`: nút gọi tư vấn trên trang chi tiết nếu đổi số chính.
- `script.js`: nút gọi mobile nếu đổi số chính.

Các link gọi điện nên giữ dạng:

```html
<a href="tel:0905111223">Gọi ngay</a>
```

## Cách cập nhật link Zalo

Link Zalo hiện đang để placeholder:

```html
href="#"
```

Khi có link Zalo chính thức, thay `#` bằng URL Zalo trong:

- `index.html`
- `product-detail.html`
- `product-detail.js`

Ví dụ:

```html
<a href="https://zalo.me/0905111223">Nhắn Zalo</a>
```

## Cách kiểm tra carousel, menu và trang sản phẩm

Chạy server tĩnh tại thư mục dự án:

```bash
python3 -m http.server 8000
```

Mở trình duyệt:

```text
http://localhost:8000
```

Checklist kiểm tra nhanh:

- Carousel giữ tỷ lệ 16:9 trên desktop/mobile.
- Kéo chuột và vuốt mobile chuyển slide mượt.
- Bấm mũi tên và dots chuyển đúng slide.
- Autoplay chạy khoảng 4,5 giây/lần và không tạo nhiều interval.
- Hover hoặc kéo carousel sẽ tạm dừng autoplay, rời chuột sẽ chạy lại.
- Menu danh mục mở bằng hover/click trên desktop.
- Menu danh mục mở/đóng bằng click trên mobile.
- Bấm ngoài menu hoặc nhấn Escape sẽ đóng menu.
- Link menu cuộn đến đúng section và không bị header che tiêu đề.
- Size filter đổi trạng thái active và cập nhật danh sách sản phẩm.
- Tìm kiếm trong header lọc sản phẩm theo hãng/model/kích thước/tính năng.
- Card sản phẩm mở trang chi tiết trong cùng tab.
- URL thiếu hoặc sai id hiển thị thông báo lỗi thân thiện.

Ví dụ trang chi tiết hợp lệ:

```text
http://localhost:8000/product-detail.html?id=samsung-55-du7000
```

Ví dụ trang chi tiết lỗi:

```text
http://localhost:8000/product-detail.html?id=khong-ton-tai
```

## Cách deploy với GitHub Pages

1. Đưa toàn bộ file website lên repository GitHub.
2. Vào **Settings** của repository.
3. Chọn **Pages**.
4. Trong mục **Build and deployment**, chọn deploy từ branch chính, thường là `main`.
5. Chọn thư mục root nếu các file `index.html`, `styles.css`, `script.js` đang nằm ở thư mục gốc.
6. Lưu cấu hình và chờ GitHub Pages tạo đường dẫn public.
7. Mở URL GitHub Pages để kiểm tra lại giao diện desktop/mobile.

Website là web tĩnh nên không cần build, không cần cài dependency và không cần backend.

## Checklist trước khi đưa website vào sử dụng kinh doanh

- [ ] Số hotline `0905111223` và `0774111223` chính xác.
- [ ] Hai địa chỉ cửa hàng chính xác.
- [ ] Link Zalo đã được đổi từ `#` sang link chính thức nếu có.
- [ ] Tất cả sản phẩm trong `products.js` có `id` duy nhất.
- [ ] Giá, tình trạng và mô tả sản phẩm đã được kiểm tra.
- [ ] Ảnh sản phẩm đã được tối ưu dung lượng nếu dùng ảnh thật.
- [ ] Trang chủ không bị cuộn ngang trên mobile.
- [ ] Hamburger menu hoạt động trên mobile.
- [ ] Carousel hoạt động bằng kéo/vuốt/mũi tên/dots/autoplay.
- [ ] Product card mở `product-detail.html?id=...` trong cùng tab.
- [ ] Trang chi tiết lỗi hiển thị thông báo thân thiện.
- [ ] Nút gọi điện dùng đúng `tel:0905111223`.
- [ ] Nút nổi Gọi ngay/Zalo không che nội dung quan trọng trên mobile.
- [ ] SEO title, meta description và Open Graph hiển thị đúng.
- [ ] Kiểm tra website trên Chrome, Safari mobile hoặc trình duyệt điện thoại thật trước khi chạy quảng cáo.
