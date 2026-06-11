# ANH MINH STORE - Website tivi và hệ thống quản trị Supabase

## 1. Tổng quan hệ thống admin
Website ANH MINH STORE vẫn là website tĩnh chạy bằng HTML, CSS và JavaScript trên GitHub Pages. Hệ thống mới bổ sung trang `admin.html` để chủ cửa hàng đăng nhập, thêm sản phẩm, upload ảnh, sửa, ẩn/hiện và xoá sản phẩm mà không cần sửa code GitHub thủ công.

## 2. Vì sao cần Supabase
Supabase được dùng cho 3 phần chính:

- **Supabase Auth**: đăng nhập/đăng xuất tài khoản quản trị.
- **Supabase Database**: lưu dữ liệu sản phẩm trong bảng `products`.
- **Supabase Storage**: lưu ảnh sản phẩm trong bucket `product-images`.

GitHub Pages chỉ phục vụ file tĩnh, vì vậy cần Supabase để có cơ sở dữ liệu, đăng nhập và kho ảnh động.

## 3. File mới được tạo
- `admin.html`: giao diện đăng nhập và quản lý sản phẩm.
- `admin.js`: xử lý Auth, kiểm tra quyền admin, upload ảnh, tìm kiếm, nhân bản, thêm/sửa/ẩn/xoá sản phẩm.
- `admin.css`: bổ sung style riêng cho tìm kiếm sản phẩm, xoá ảnh hiện có và modal nhân bản trong admin.
- `supabase-client.js`: khởi tạo Supabase an toàn, không làm hỏng website nếu chưa cấu hình.
- `supabase-config.example.js`: file mẫu chứa placeholder URL và anon key.
- `supabase-schema.sql`: schema bảng, RLS policy và storage policy mẫu.

Các file được cập nhật:

- `index.html`, `script.js`: tải sản phẩm public từ Supabase/admin; nếu chưa có sản phẩm thật thì hiển thị trạng thái trống, không dùng dữ liệu demo.
- `product-detail.html`, `product-detail.js`: tải chi tiết sản phẩm từ Supabase/admin; nếu ID không tồn tại thì hiển thị thông báo không tìm thấy, không dùng dữ liệu demo. Trang chi tiết hiện có gallery tự động chuyển ảnh mỗi 5 giây và thêm mục “Sản phẩm tham khảo” ưu tiên cùng hãng trước, sau đó mới lấy sản phẩm liên quan đang hoạt động.
- `styles.css`: thêm giao diện admin responsive, giữ phong cách trắng + xanh đậm và font Aptos.

## 3.1. Trang tra cứu bảo hành
Header trên trang chủ giữ nút “Tra cứu bảo hành”, nhưng nút này mở trang riêng `tra-cuu-bao-hanh.html` thay vì cuộn tới form trên trang chủ. Trang chủ không còn hiển thị form tra cứu bảo hành lớn để tránh tạo cảm giác website có hệ thống tra cứu tự động khi chưa có dữ liệu bảo hành riêng.

Trang `tra-cuu-bao-hanh.html` cung cấp hướng dẫn kiểm tra bảo hành thủ công bằng số điện thoại mua hàng, model tivi, ảnh tem/model hoặc thông tin đơn hàng. Trang có nút gọi hotline sửa chữa `0905111223`, `0774111223`; hotline tư vấn mua bán `0702386544`, `0389660779`; và nút nhắn Zalo mở popup chọn đúng nhu cầu trước khi khách chọn số liên hệ. Hiện chưa có cơ sở dữ liệu bảo hành tự động, chưa có bảng bảo hành riêng và chưa có kết quả tra cứu giả lập.

## 3.2. Hotline và popup chọn Zalo

Khu vực liên hệ công khai hiện tách riêng hai nhóm hotline:

- **Hotline sửa chữa:** `0905111223` - `0774111223`.
- **Hotline tư vấn mua bán:** `0702386544` - `0389660779`.

Các nút **“Zalo”** hoặc **“Nhắn Zalo”** trên trang chủ, trang chi tiết sản phẩm, trang tra cứu bảo hành và nút hành động trong chatbot không mở thẳng một số Zalo duy nhất nữa. Khi bấm, website hiển thị popup **“Bạn muốn nhắn Zalo về nội dung nào?”** để khách chọn nhóm hỗ trợ phù hợp.

Liên hệ Zalo sửa chữa:

- `0905111223`
- `0774111223`

Liên hệ Zalo tư vấn mua bán:

- `0702386544`
- `0389660779`

Kiểm thử thủ công đề xuất:

1. Trang chủ, khu vực liên hệ hiển thị **“Hotline sửa chữa: 0905111223 - 0774111223”** và **“Hotline tư vấn mua bán: 0702386544 - 0389660779”**.
2. Nút Zalo nổi mở popup lựa chọn, không mở ngay một số Zalo duy nhất.
3. Nhóm **“Sửa chữa tivi”** có nút nhắn Zalo `0905111223` và `0774111223`.
4. Nhóm **“Tư vấn mua bán”** có nút nhắn Zalo `0702386544` và `0389660779`.
5. Trang chi tiết sản phẩm, nút **“Nhắn Zalo”** mở cùng popup.
6. Trang tra cứu bảo hành, nút **“Nhắn Zalo”** mở cùng popup.
7. Trên mobile, popup dễ đọc và các nút không tràn ngang.
8. Nút đóng, bấm nền phủ và phím Escape đều đóng popup.

## 4. Cách tạo Supabase project
1. Vào Supabase Dashboard.
2. Tạo project mới.
3. Chọn region phù hợp.
4. Sau khi project sẵn sàng, vào **Project Settings > API** để lấy:
   - Project URL.
   - `anon public` key.

> Với GitHub Pages, Supabase anon key có thể nằm công khai ở frontend **chỉ khi Row Level Security (RLS) được cấu hình đúng**.

## 5. Cách tạo bảng products
1. Mở Supabase Dashboard.
2. Vào **SQL Editor**.
3. Mở file `supabase-schema.sql` trong repo.
4. Copy toàn bộ SQL và chạy.

Bảng `products` chứa các trường: `id`, `brand`, `model`, `full_name`, `size`, `type`, `condition`, `warranty`, `old_price`, `price`, `badge`, `description`, `features`, `image`, `images`, `overview`, `specifications`, `is_active`, `is_featured`, `sort_order`, `created_at`, `updated_at`. Trường `is_featured` là boolean, mặc định `false`, dùng để chọn sản phẩm hiện ở mục “Sản phẩm nổi bật”.

## 6. Cách tạo bảng profiles
File `supabase-schema.sql` cũng tạo bảng `profiles` với các trường:

- `id`: trỏ tới `auth.users(id)`.
- `role`: mặc định là `staff`, admin phải có role là `admin`.
- `full_name`: tên chủ cửa hàng hoặc nhân viên.
- `created_at`: thời điểm tạo.

## 7. Cách bật RLS
SQL đã bật RLS cho `profiles` và `products`:

- Khách truy cập chỉ đọc được sản phẩm `is_active = true`.
- Người đăng nhập có role `admin` đọc được toàn bộ sản phẩm.
- Chỉ role `admin` được thêm, sửa, xoá sản phẩm.

## 7.1. Hiển thị trang chi tiết sản phẩm
Trang `product-detail.html` hiện có:

- Gallery ảnh sản phẩm tự động chuyển slide mỗi 5 giây nếu sản phẩm có từ 2 ảnh trở lên.
- Hiệu ứng chuyển ảnh ngang mượt, thumbnail vẫn giữ trạng thái đang chọn rõ ràng.
- Mục **Sản phẩm tham khảo** bên dưới phần chi tiết sản phẩm và nút CTA.
- Gợi ý ưu tiên sản phẩm cùng hãng trước, sau đó mới bổ sung các sản phẩm đang hoạt động khác nếu chưa đủ số lượng.
- Không dùng sản phẩm demo/fallback như nguồn gợi ý thực tế.

Admin policy dùng kiểm tra:

```sql
exists (
  select 1 from public.profiles
  where profiles.id = auth.uid()
  and profiles.role = 'admin'
)
```

## 8. Cách tạo storage bucket product-images
Có 2 cách:

### Cách 1: Chạy SQL
`supabase-schema.sql` có câu lệnh tạo bucket `product-images` và policy cho storage.

### Cách 2: Tạo trong Dashboard
Nếu SQL không tạo bucket được do quyền dashboard:

1. Vào **Storage**.
2. Chọn **New bucket**.
3. Bucket name: `product-images`.
4. Bật public bucket để website đọc ảnh công khai.
5. Tạo policy để public được đọc ảnh và chỉ admin được upload/update/delete.

## 9. Cách tạo tài khoản admin
1. Vào **Authentication > Users** trong Supabase.
2. Tạo user bằng email và mật khẩu mạnh.
3. Copy user id của tài khoản đó.
4. Chèn profile admin trong SQL Editor:

```sql
insert into public.profiles (id, role, full_name)
values ('AUTH_USER_ID_HERE', 'admin', 'Tên chủ cửa hàng')
on conflict (id) do update set role = 'admin', full_name = excluded.full_name;
```

Chỉ tài khoản có `profiles.role = 'admin'` mới thêm/sửa/xoá sản phẩm được.

## 10. Cách cấu hình supabase-config.js
1. Copy file mẫu:

```bash
cp supabase-config.example.js supabase-config.js
```

2. Sửa `supabase-config.js`:

```js
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-public-key";
```

Không đưa service role key vào file này.

Trong `admin.html`, thứ tự script bắt buộc là Supabase JS CDN, `supabase-config.js`, `supabase-client.js`, rồi mới đến `admin.js`. File `supabase-config.js` phải được gọi bằng đường dẫn tương đối `supabase-config.js` để chạy đúng trên GitHub Pages.

Nếu trang admin báo “Chưa cấu hình Supabase”, hãy kiểm tra:

- File `/supabase-config.js` đã có trên bản deploy và không phải file mẫu.
- `admin.html` đang tải `supabase-config.js` trước `supabase-client.js` và `admin.js`.
- GitHub Actions đã deploy bản mới nhất có file cấu hình đúng.

## 11. Cách đăng nhập admin.html
1. Mở `admin.html` trên website.
2. Nhập Email và Mật khẩu của tài khoản đã tạo trong Supabase Auth.
3. Bấm **Đăng nhập quản trị**.
4. Nếu chưa cấu hình Supabase, trang admin sẽ báo: “Chưa cấu hình Supabase. Vui lòng kiểm tra supabase-config.js.”
5. Nếu tài khoản không có role `admin`, hệ thống sẽ báo: “Tài khoản này không có quyền quản trị.”

## 12. Cách thêm sản phẩm mới
1. Đăng nhập `admin.html`.
2. Bấm **+ Thêm sản phẩm**.
3. Nhập thông tin tivi: hãng, model, tên đầy đủ, kích thước, loại sản phẩm, giá bán...
4. Mã sản phẩm được tự tạo từ hãng + model + kích thước, ví dụ `Samsung + QA55Q7FA + 55 inch` thành `samsung-qa55q7fa-55-inch`.
5. Có thể sửa mã sản phẩm thủ công nếu cần.
6. Chọn **Hiện lên sản phẩm nổi bật: Có / Không**. Chọn **Có** sẽ lưu `is_featured = true`, chọn **Không** sẽ lưu `is_featured = false`; sản phẩm cũ chưa có trường này được hiểu là **Không**.
7. Bấm **Lưu sản phẩm**.

Nếu mã sản phẩm đã tồn tại, trang admin sẽ báo: “Mã sản phẩm đã tồn tại. Vui lòng đổi model hoặc mã sản phẩm.”

## 13. Cách upload ảnh sản phẩm
Trong form sản phẩm có:

- **Ảnh chính**: ảnh đại diện sản phẩm.
- **Ảnh gallery nhiều ảnh**: nhiều ảnh chi tiết.

Ảnh được upload lên bucket `product-images` theo thư mục của mã sản phẩm. Nếu upload lỗi, trang admin báo: “Không thể tải ảnh lên. Vui lòng thử lại.”

Nếu không upload ảnh, sản phẩm vẫn lưu được và website public sẽ hiển thị placeholder tivi bằng CSS.

## 14. Tìm kiếm, xoá ảnh và nhân bản sản phẩm trong Admin
Sau khi đăng nhập `admin.html`, khu vực **Danh sách sản phẩm** có thêm ô tìm kiếm cục bộ để lọc nhanh theo mã sản phẩm, model, tên tivi, hãng, kích thước, loại sản phẩm, tình trạng, bảo hành, giá, badge, mô tả, đặc điểm nổi bật, tổng quan và thông số kỹ thuật. Tìm kiếm không gọi Supabase trên từng phím bấm; dữ liệu được lọc từ danh sách sản phẩm đã tải sẵn. Có thể bấm **Xoá tìm kiếm** để quay lại toàn bộ danh sách.

Khi sửa sản phẩm, mục **Ảnh hiện có** hiển thị từng ảnh kèm nút **Xoá**. Nút này chỉ bỏ URL ảnh khỏi danh sách ảnh của sản phẩm trong form; ảnh không bị xoá khỏi Supabase Storage ngay lúc bấm. Cần bấm **Lưu sản phẩm** để lưu thay đổi vào bản ghi `products`. Cách này giúp tránh xoá nhầm ảnh đang được sản phẩm khác dùng chung.

Mỗi sản phẩm trong danh sách admin có nút **Nhân bản**. Quy trình nhân bản sẽ yêu cầu chọn hoặc nhập kích thước/inch mới và bắt buộc nhập giá bán mới thủ công; giá cũ là tuỳ chọn. Bản nhân bản sẽ:

- Sao chép thông tin sản phẩm gốc nhưng thay kích thước cũ bằng kích thước mới trong mã/model, tên, mô tả, đặc điểm nổi bật, tổng quan, thông số và badge nếu có chứa kích thước.
- Tự tạo mã sản phẩm mới từ hãng, model và kích thước mới; nếu trùng sẽ thêm hậu tố an toàn.
- Dùng lại URL ảnh hiện có theo mặc định, không upload/copy file ảnh và không xoá ảnh gốc.
- Không tự động sao chép `price` hoặc `old_price`; admin phải nhập giá bán mới, còn giá gạch để trống nếu không nhập.
- Đặt `is_active = false` và `is_featured = false` để sản phẩm là bản nháp cần kiểm tra trước khi bật hiển thị.

Sau khi tạo xong, admin sẽ tự mở form sửa bản nhân bản để kiểm tra lại thông tin, ảnh và trạng thái trước khi xuất bản.


## 15. Cách nhập thông số chi tiết nhanh trong Admin
Không cần dán JSON thủ công vào Supabase để hiện nút **Thông số chi tiết**. Trong `admin.html`, bạn có thể nhập nhanh như sau:

1. Mở form thêm/sửa sản phẩm trong Admin.
2. Dán thông số dạng văn bản thường vào ô **Thông số chi tiết**.
3. Bấm **Tự động căn thông số** để hệ thống tự tách nhóm, nhãn và giá trị.
4. Bấm **Xem trước thông số** để kiểm tra bảng thông số trước khi lưu.
5. Bấm **Lưu sản phẩm**.
6. Website sẽ tự hiện nút **Thông số chi tiết** trên trang chi tiết nếu sản phẩm có dữ liệu thông số.

Có thể nhập theo kiểu nhãn và giá trị trên dòng riêng:

```text
Loại Tivi:
Smart Tivi Neo QLED
Kích cỡ màn hình:
65 inch

Công nghệ hình ảnh
Công nghệ hình ảnh:
Công nghệ Color Booster Pro
AI Generative Wallpaper
Supreme UHD Dimming
```

Hoặc vẫn có thể nhập nhanh theo dạng pipe:

```text
Tổng quan | Loại Tivi | Smart Tivi Neo QLED
Tổng quan | Kích cỡ màn hình | 65 inch
Công nghệ hình ảnh | Bộ xử lý | Bộ xử lý AI NQ4 thế hệ 2
```

Nếu muốn xuống dòng trong một thông số, nhập mỗi ý trên một dòng dưới cùng một nhãn. Hệ thống sẽ tự lưu thành nhiều dòng bullet để modal **Thông số chi tiết** hiển thị rõ ràng.

## 16. Cách nhập Tổng quan sản phẩm nhanh trong Admin
Không cần viết JSON hoặc HTML thủ công để phần **Tổng quan sản phẩm** hiển thị đẹp trên trang chi tiết. Trong `admin.html`, bạn có thể nhập nhanh như sau:

1. Mở form thêm/sửa sản phẩm trong Admin.
2. Dán nội dung tổng quan dạng văn bản thường vào ô **Tổng quan sản phẩm**.
3. Đặt mỗi tiêu đề như **Thiết kế**, **Công nghệ hình ảnh**, **Công nghệ âm thanh**, **Tiện ích thông minh** trên một dòng riêng.
4. Bấm **Tự động căn tổng quan** để hệ thống tự nhận diện tiêu đề và gom nội dung bên dưới.
5. Bấm **Xem trước tổng quan** để kiểm tra cách hiển thị trước khi lưu.
6. Bấm **Lưu sản phẩm**.
7. Website sẽ tự in đậm tiêu đề, dùng màu xanh đậm và căn đoạn rõ ràng trong modal **Tổng quan sản phẩm** trên trang chi tiết.

Ví dụ nhập nhanh:

```text
Smart Tivi Samsung Neo QLED 4K 65 inch QA65QN70F mang đến trải nghiệm giải trí cao cấp với màn hình Mini LED, công nghệ Neo QLED và bộ xử lý AI NQ4 thế hệ 2.

Thiết kế
Tivi sở hữu thiết kế hiện đại, viền mỏng, phù hợp với nhiều không gian phòng khách, phòng ngủ hoặc phòng giải trí gia đình.

Công nghệ hình ảnh
Công nghệ Neo Quantum HDR, Supreme UHD Dimming và 4K AI Upscaling giúp hình ảnh rõ nét, màu sắc sống động và độ tương phản tốt hơn.
```

Khi lưu sản phẩm, nội dung này được chuyển thành JSON có cấu trúc trong trường `overview`; admin vẫn chỉ cần chỉnh sửa bằng văn bản thường ở lần sửa tiếp theo.

## 17. Cách sản phẩm hiện trên website
Trang chủ chỉ tải dữ liệu sản phẩm public từ Supabase `products` với `is_active = true`. Nếu Supabase chưa có sản phẩm, thiếu cấu hình, lỗi mạng hoặc query lỗi, website hiển thị trạng thái trống bằng tiếng Việt và không render dữ liệu demo từ `products.js` như sản phẩm thật.

Mục **Sản phẩm nổi bật** chỉ lấy sản phẩm có `is_featured = true` và có thể bao gồm cả **Tivi mới** lẫn **Tivi cũ**. Hai danh mục **Tivi mới chính hãng** và **Tivi cũ đã kiểm tra** vẫn tách riêng: sản phẩm được chuẩn hoá là Tivi mới chỉ hiện trong mục Tivi mới, sản phẩm được chuẩn hoá là Tivi cũ chỉ hiện trong mục Tivi cũ. Link chi tiết vẫn là `product-detail.html?id=MA_SAN_PHAM` và mở trong cùng tab.

Danh sách sản phẩm không dùng phân trang đánh số nữa. Mỗi mục sản phẩm dùng nút **Xem thêm sản phẩm** nằm bên dưới lưới; ban đầu hiển thị 12 sản phẩm, mỗi lần bấm nút sẽ hiện thêm 12 sản phẩm và nút tự ẩn khi đã hiện hết. Mỗi mục có trạng thái riêng, nên bấm **Xem thêm sản phẩm** ở “Sản phẩm nổi bật” không làm thay đổi số lượng đang hiện ở “Tivi mới” hoặc “Tivi cũ”. Muốn đổi số lượng mỗi lần tải thêm, sửa hằng số `PRODUCTS_BATCH_SIZE` trong `script.js`.

Trên trang chi tiết sản phẩm, khu vực dưới đặc điểm nổi bật và phía trên hộp giá có thể hiển thị các nút **Tổng quan sản phẩm** và **Thông số chi tiết**. Nút **Thông số chi tiết** chỉ hiện khi sản phẩm có dữ liệu `specifications`; nếu `specifications` rỗng, là chuỗi rỗng, mảng rỗng hoặc `null`, nút này sẽ được ẩn.

Thông số nhập trong admin được tự động chuyển thành JSON có cấu trúc và lưu vào trường `specifications`. Trang chi tiết sẽ nhóm các dòng theo “Nhóm”, giữ xuống dòng trong giá trị nhiều ý và hiển thị trong modal **Thông số chi tiết** trên cùng trang.

## 18. Cách sửa/ẩn/xoá sản phẩm
Trong dashboard admin:

- **Sửa**: mở form với dữ liệu hiện có. Ảnh cũ được giữ lại nếu không upload ảnh mới.
- **Ẩn/Hiện**: đổi `is_active`; sản phẩm ẩn không hiện trên website public nhưng vẫn thấy trong admin.
- **Xoá**: xoá row trong bảng `products` sau khi xác nhận “Bạn có chắc muốn xoá sản phẩm này không?”.

Ảnh trong Storage không bị xoá tự động. Có thể bổ sung chức năng dọn ảnh storage sau.

## 19. Cách test website sau khi thêm sản phẩm
1. Thêm sản phẩm trong `admin.html`.
2. Mở `index.html` hoặc website GitHub Pages.
3. Kiểm tra sản phẩm xuất hiện đúng mục Tivi mới/Tivi cũ.
4. Dùng bộ lọc hãng, kích thước và tìm kiếm; bộ lọc chỉ lọc trong từng mục hiện tại, không trộn Tivi mới với Tivi cũ.
5. Bấm “Xem chi tiết” để mở `product-detail.html?id=...` trong cùng tab.
6. Kiểm tra gallery, giá gạch, giá bán, đặc điểm nổi bật, modal tổng quan và modal thông số.
7. Kiểm tra trên màn hình điện thoại, không bị tràn ngang.

## 20. Cảnh báo bảo mật
- **Không bao giờ expose Supabase service role key trong frontend code.**
- **Không bao giờ lưu mật khẩu admin trong JavaScript.**
- Chỉ dùng Supabase Auth để đăng nhập.
- Luôn bật RLS cho bảng và storage.
- Supabase anon key có thể public trên GitHub Pages, nhưng chỉ an toàn khi RLS policy đúng.
- Admin actions phải yêu cầu user đã đăng nhập và có `profiles.role = 'admin'`.

## 21. Dữ liệu demo products.js
`products.js` chỉ còn là dữ liệu tham khảo cho lập trình viên khi phát triển cục bộ. Trang public không nạp file này và `script.js`, `product-detail.js`, `chatbot.js` không dùng `window.products` làm fallback. Nếu cần bật demo trong môi trường phát triển riêng, phải đặt `window.ENABLE_DEMO_PRODUCTS = true` trước khi nạp `products.js`; mặc định flag này là `false`.

## 22. Pre-launch checklist
- [ ] Supabase URL/anon key configured.
- [ ] RLS enabled.
- [ ] Admin profile role = admin.
- [ ] product-images bucket created.
- [ ] Public website loads products.
- [ ] Admin can add product.
- [ ] Admin can upload images.
- [ ] Product detail page opens correctly.
- [ ] Sản phẩm nổi bật có thể gồm cả Tivi mới và Tivi cũ.
- [ ] Mục Tivi mới và Tivi cũ vẫn tách riêng.
- [ ] Nút “Xem thêm sản phẩm” hiện thêm 12 sản phẩm mỗi lần bấm và tự ẩn khi đã hết.
- [ ] Giao diện di động đã kiểm tra.
- [ ] No private keys in repository.

## 15. Quản lý ảnh banner trang chủ bằng Supabase
Homepage carousel ưu tiên đọc ảnh đang bật từ bảng `hero_banners` trên Supabase theo `sort_order` tăng dần, sau đó theo `created_at` tăng dần. Nếu Supabase chưa cấu hình, query lỗi hoặc chưa có banner đang hiển thị, website tự dùng các ảnh banner mặc định đang có trong code để không làm hỏng trang chủ.

### 15.1. Tạo bucket `site-banners`
Có thể chạy toàn bộ file `supabase-schema.sql` trong SQL Editor để tạo bucket và policy. Nếu Supabase Dashboard không cho tạo bucket bằng SQL, làm thủ công:

1. Vào **Storage**.
2. Chọn **New bucket**.
3. Bucket name: `site-banners`.
4. Bật **Public bucket ON** để trang chủ đọc ảnh công khai.
5. Chạy phần policy storage `site-banners` trong `supabase-schema.sql` để public được đọc ảnh và chỉ tài khoản admin được upload/update/delete.

### 15.2. Chạy SQL tạo bảng `hero_banners`
1. Vào **SQL Editor** trong Supabase Dashboard.
2. Mở file `supabase-schema.sql` trong repo.
3. Copy và chạy phần **Homepage hero/banner management** hoặc chạy toàn bộ file nếu project mới.

Bảng `hero_banners` gồm các trường: `id`, `title`, `image_url`, `storage_path`, `alt_text`, `sort_order`, `is_active`, `created_at`, `updated_at`. RLS đã bật để khách chỉ xem banner `is_active = true`, còn admin có role `admin` trong `public.profiles` được đọc, thêm, sửa và xoá toàn bộ banner.

### 15.3. Thêm ảnh banner từ admin
1. Đăng nhập `admin.html` bằng tài khoản có `public.profiles.role = 'admin'`.
2. Mở khu vực **Quản lý ảnh banner trang chủ**.
3. Bấm **+ Thêm ảnh banner**.
4. Nhập **Tiêu đề ảnh**, **Alt text** nếu cần.
5. Chọn **Thứ tự hiển thị**, **Trạng thái** và upload ảnh JPG, PNG hoặc WebP tối đa khoảng 10MB.
6. Bấm **Lưu ảnh banner**. Ảnh sẽ được upload vào bucket `site-banners`, URL công khai được lưu vào `hero_banners.image_url`, còn đường dẫn file được lưu vào `hero_banners.storage_path`.

### 15.4. Đổi thứ tự ảnh banner
Trong admin, bấm **Sửa** ở banner cần đổi, nhập lại **Thứ tự hiển thị** rồi bấm **Lưu ảnh banner**. Số nhỏ hơn sẽ xuất hiện trước trên carousel trang chủ.

### 15.5. Ẩn/hiện ảnh banner
Trong danh sách banner, bấm **Ẩn** để đặt `is_active = false` hoặc bấm **Hiện** để đặt `is_active = true`. Banner bị ẩn vẫn còn trong admin nhưng không xuất hiện ngoài trang chủ.

### 15.6. Xoá ảnh banner
Trong danh sách banner, bấm **Xoá** và xác nhận. Hệ thống xoá dòng dữ liệu trong `hero_banners`, sau đó cố gắng xoá file trong Supabase Storage nếu có `storage_path`. Nếu xoá file Storage lỗi nhưng xoá dữ liệu thành công, admin sẽ thấy cảnh báo thân thiện thay vì làm crash trang.

### 15.7. Lưu ý bảo mật frontend
Không dùng **service role key** trong `supabase-config.js` hoặc bất kỳ file frontend nào. Frontend chỉ dùng `anon public` key; quyền thêm/sửa/xoá được kiểm soát bằng RLS và policy kiểm tra `public.profiles.role = 'admin'`.

## Chatbot AM AI
Website có chatbot AM AI dạng preset/rule-based sử dụng mascot `linh vật AM.jpeg` làm avatar. Chatbot chạy hoàn toàn ở frontend bằng HTML, CSS và JavaScript thuần, không dùng OpenAI, không dùng AI API, không dùng API key, không tiêu thụ token, không cần Supabase Edge Functions và không cần tạo thêm bảng Supabase.

- Giao diện và vị trí nút nổi được chỉnh trong `chatbot.css`.
- Câu trả lời FAQ, từ khoá nhận diện và logic gợi ý sản phẩm có thể chỉnh trong `chatbot.js`, đặc biệt tại hàm `getBotReply(message)`.
- Avatar hiện đang trỏ tới file `linh vật AM.jpeg`. Nếu muốn đổi hình, có thể thay file cùng tên hoặc cập nhật hằng `AVATAR_SRC` trong `chatbot.js`.
- Logic gợi ý sản phẩm chỉ đọc dữ liệu sản phẩm thật từ Supabase/admin đã được publish lên global state và các thẻ sản phẩm đang render trên trang; chatbot không đọc `window.products`/`window.PRODUCTS` demo làm nguồn đề xuất.
- Future AI API integration can be added inside `getBotReply()` later, nhưng phiên bản hiện tại không có bất kỳ đoạn gọi API AI nào.

## 17. Bố cục hero 3 cột trên trang chủ
Trang chủ đang dùng bố cục hero an toàn cho hình ảnh, dễ rollback và responsive:

- **Cột trái**: panel “DANH MỤC HÃNG TIVI” để lọc nhanh theo hãng tivi.
- **Cột giữa**: banner/carousel chính của trang chủ, được giữ trong khung ổn định tỷ lệ **16:9** để tránh nhảy layout trước khi ảnh tải xong.
- **Cột phải**: panel “DANH MỤC KHÁC” cho các nhóm danh mục dự kiến trong tương lai.

Trên desktop, layout dùng grid 3 cột để panel hãng tivi nằm gần mép trái hơn, carousel ở giữa rộng và nổi bật hơn, còn panel danh mục khác nằm bên phải. Trên tablet/mobile, các cột tự xếp lại để không ép banner quá hẹp và không tạo tràn ngang.

## 18. DANH MỤC KHÁC là placeholder
“DANH MỤC KHÁC” hiện chỉ là danh sách placeholder ở frontend, chưa kết nối database và chưa cần SQL. Danh sách ban đầu gồm:

- Loa
- Điều khiển tivi
- Giá treo tivi
- Phụ kiện tivi
- Dây HDMI
- Dịch vụ sửa chữa
- Thu hư đổi mới

Khi bấm vào các mục này, website chỉ hiển thị thông báo thân thiện rằng danh mục đang được chuẩn bị; không điều hướng sang trang chưa tồn tại và không làm lỗi trang.

Để cập nhật danh sách này sau, chỉnh trực tiếp các nút trong panel `other-category-panel` của `index.html`. Nếu sau này cần tải từ Supabase, có thể thay phần HTML tĩnh bằng JavaScript hoặc dữ liệu database, nhưng phiên bản hiện tại **không yêu cầu SQL, không yêu cầu bảng mới và không thay đổi cấu hình Supabase**.

## 19. An toàn hình ảnh trong hero và logo hãng
Logo hãng tivi được đặt trong khung cố định để luôn giữ tỷ lệ gốc:

- Khung logo có kích thước cố định, căn giữa bằng flex.
- Ảnh logo dùng `object-fit: contain`, không stretch, không crop và không squeeze.
- Badge fallback cho “Tất cả hãng” và logo lỗi dùng cùng kích thước khung với các logo thật.
- Tên hãng dài được ellipsis hoặc xuống dòng theo breakpoint để không ép méo logo.

Banner/carousel được bảo vệ bằng khung 16:9 ổn định:

- Carousel giữ tỷ lệ 16:9 trên desktop, tablet và mobile.
- Ảnh banner được căn giữa trong khung và không bị bóp méo.
- Logic autoplay, drag/swipe, dots, Supabase banner và banner fallback mặc định vẫn nằm trong JavaScript hiện có.

Không có file ảnh, SVG hoặc binary nào cần chỉnh sửa cho bố cục này. Không đổi tên file ảnh, không đổi đường dẫn ảnh, không crop/nén/tối ưu ảnh và không thay đổi `linh vật AM.jpeg` của chatbot.

## 17. AM AI tư vấn sản phẩm theo dữ liệu web

AM AI hiện có chế độ tư vấn tivi thông minh chạy hoàn toàn ở frontend bằng HTML/CSS/JS thuần. Phiên bản này:

- Không dùng OpenAI API.
- Không dùng bất kỳ AI API nào.
- Không dùng API key và không tiêu thụ token.
- Không dùng Supabase Edge Functions.
- Không tạo bảng SQL mới.
- Không gọi dịch vụ chatbot hoặc search API bên ngoài.
- Chỉ gợi ý tivi dựa trên dữ liệu sản phẩm thật website đã có sẵn: dữ liệu Supabase public đang được trang chủ tải hoặc thẻ sản phẩm thật đã render trong DOM; không dùng dữ liệu `products.js` dự phòng.

Khi khách hỏi như “phòng khách 30m2 tầm 15 triệu nên mua con nào”, “có Samsung 55 inch không”, “tivi cũ giá rẻ” hoặc “xem bóng đá World Cup nên mua tivi nào”, AM AI sẽ đọc dữ liệu sản phẩm hiện có và chuẩn hoá các trường như hãng, model, tên sản phẩm, kích thước, giá, loại tivi, bảo hành, tính năng, mô tả, tổng quan và thông số. Sau đó chatbot dùng bộ luật chấm điểm nội bộ để xếp hạng sản phẩm phù hợp nhất theo nhu cầu.

Bộ tư vấn có thể nhận diện các nhóm thông tin chính:

- Diện tích/phòng sử dụng: phòng ngủ, phòng khách, phòng nhỏ, phòng rộng, 20m², 25m², 30m², 40m²...
- Kích thước mong muốn: 32, 43, 49, 50, 55, 65, 75, 85 inch.
- Ngân sách: dưới 10 triệu, tầm 12 triệu, khoảng 15tr, 10–15 triệu, 20 triệu đổ lại, giá rẻ, cao cấp.
- Hãng: Samsung, LG, Sony, Toshiba, TCL, Panasonic, Sharp, Xiaomi, Casper, Coocaa, Skyworth, Philips, Hitachi, Hisense.
- Loại sản phẩm: tivi mới, hàng mới, mới 100%, tivi cũ, đã qua sử dụng, second hand.
- Mục đích dùng: xem phim, bóng đá, World Cup, chơi game, phòng ngủ, phòng khách, người lớn tuổi, YouTube, Netflix, học online, karaoke.
- Ưu tiên chất lượng: QLED, OLED, Mini LED, 4K, Google TV, Tizen, webOS, âm thanh tốt, hình ảnh đẹp, tiết kiệm điện, bảo hành lâu.

Mỗi sản phẩm được chấm điểm theo mức độ khớp hãng, loại tivi, kích thước, ngân sách, mục đích sử dụng, sản phẩm nổi bật và thông tin bảo hành. Chatbot sẽ hiển thị tối đa 3 gợi ý phù hợp nhất kèm lý do ngắn, ảnh thu nhỏ nếu có, giá bán và nút **Xem chi tiết** trỏ về `product-detail.html?id=MA_SAN_PHAM`. Nếu dữ liệu sản phẩm chưa tải kịp, AM AI sẽ trả lời an toàn và gợi ý khách bấm **Gọi ngay** hoặc **Nhắn Zalo**.

Để AM AI tư vấn chính xác hơn, khi thêm/sửa sản phẩm trong Admin nên nhập đầy đủ:

- `brand`
- `model`
- `size`
- `price`
- `type`
- `features`
- `overview`
- `specifications`

Sau này có thể bổ sung AI API thật nếu cửa hàng cần, nhưng phiên bản hiện tại là bộ gợi ý rule-based chạy local trên trình duyệt và không dùng API AI.

## 22. Điều hướng “Sản phẩm khác” và bố cục hero mới

Phiên bản này đã bỏ panel bên phải **“DANH MỤC KHÁC”** khỏi khu vực hero/banner trang chủ. Hero trang chủ hiện chỉ còn cột trái **“DANH MỤC HÃNG TIVI”** và vùng banner/carousel trung tâm rộng hơn, không chừa khoảng trống cho panel cũ.

Thanh điều hướng trên cùng đã thêm mục **“Sản phẩm khác”** sau **“Tivi mới”** và trước **“Thu hư đổi mới”**. Trên máy tính, rê chuột hoặc bấm vào **“Sản phẩm khác”** sẽ mở dropdown; dropdown vẫn hiển thị khi trỏ chuột nằm trong vùng menu và tự đóng khi rời khỏi menu. Trên điện thoại, mục **“Sản phẩm khác”** trong menu hamburger có thể bấm để bung/thu danh sách theo chiều dọc, không gây tràn ngang.

Các mục trong dropdown hiện là placeholder cho nhóm sản phẩm tương lai:

- Loa
- Điều khiển tivi
- Giá treo tivi
- Phụ kiện tivi
- Dây HDMI
- Sản phẩm gia đình
- Dịch vụ sửa chữa
- Thu hư đổi mới

Khi bấm vào từng mục, trình duyệt mở cùng tab tới `other-products.html?category=...`. Trang `other-products.html` đọc query `category` để đổi tiêu đề danh mục và hiển thị thông báo: **“Danh mục này đang được Anh Minh Store cập nhật. Vui lòng quay lại sau hoặc liên hệ cửa hàng để được tư vấn nhanh.”** Trang có các nút **“Gọi ngay”**, **“Nhắn Zalo”** và **“Quay lại trang chủ”**.

Riêng mục **“Sản phẩm gia đình”** đang là placeholder tương lai và hiển thị thêm các thẻ danh mục con:

- Tivi
- Điều hoà
- Tủ lạnh
- Máy giặt
- Gia dụng khác

Các danh mục này chưa nối với sản phẩm thật, chưa tạo bộ lọc thật và chưa trộn vào logic Tivi hiện tại. Phiên bản này **không cần SQL**, **không tạo bảng Supabase mới** và **không thay đổi cơ sở dữ liệu**.

### Cách cập nhật dropdown “Sản phẩm khác” sau này

1. Sửa các link trong header của `index.html`, `product-detail.html` và `other-products.html` nếu muốn thêm/bớt danh mục hiển thị.
2. Nếu thêm query `category` mới, cập nhật `CATEGORY_MAP` trong `other-products.js` để trang placeholder đổi đúng tiêu đề tiếng Việt.
3. Khi có dữ liệu thật trong tương lai, chỉ nối từng danh mục vào logic sản phẩm sau khi đã có thiết kế dữ liệu rõ ràng; không cần tạo SQL hoặc bảng mới cho placeholder hiện tại.

## 17. Bộ lọc dòng tivi

Website có thêm lớp lọc **Dòng tivi** cho khách mua hàng ở trang chủ. Sau khi chọn **Hãng tivi**, khu vực bên dưới danh mục hãng sẽ tự hiển thị các dòng tivi phù hợp trước khi khách chọn **Kích thước tivi**.

- Ví dụ khi chọn **Samsung**, website hiển thị các dòng như **Crystal UHD**, **QLED**, **Neo QLED**, **OLED**, **Lifestyle TV**, **The Frame**, **The Serif**, **The Sero**, **UHD / 4K UHD**, **LED**.
- Ví dụ khi chọn **LG**, website hiển thị các dòng như **OLED**, **QNED**, **NanoCell**, **UHD / 4K UHD**, **LED**, **webOS**, **StanbyME**.
- Khi chưa chọn hãng hoặc đang xem **Tất cả hãng**, website hiển thị bộ dòng tivi phổ biến gọn nhẹ như **QLED**, **OLED**, **Mini LED**, **UHD / 4K UHD**, **Google TV**, **Android TV**.
- Không cần thay đổi SQL, không cần tạo bảng Supabase mới và không cần thêm cột database mới cho phiên bản này.
- Hệ thống tự nhận diện dòng tivi từ dữ liệu sản phẩm hiện có như tên sản phẩm, model, hãng, mô tả, tính năng, tổng quan và thông số kỹ thuật.
- Nếu muốn nhận diện chính xác hơn, hãy thêm từ khóa dòng tivi vào tên sản phẩm, model, tính năng hoặc thông số, ví dụ: `QLED`, `Neo QLED`, `OLED`, `NanoCell`, `Google TV`.
- Nếu sau này sản phẩm có sẵn trường `series`, `line`, `tv_line` hoặc `product_line`, website sẽ ưu tiên dùng các trường này nhưng không bắt buộc phải có.
- Danh sách dòng tivi có thể chỉnh sửa trực tiếp trong cấu hình `TV_SERIES_BY_BRAND` của file JavaScript.
- Bộ lọc **Kích thước tivi** vẫn nằm bên dưới bộ lọc **Dòng tivi** và có thể kết hợp cùng hãng + dòng tivi để lọc sản phẩm.

## 17. Banner dọc trang chủ 9:16
Trang chủ có thêm khu vực **banner dọc trang chủ 9:16** ở bên phải banner chính trên desktop. Bố cục hero gồm cột danh mục hãng tivi bên trái, carousel/banner chính 16:9 ở giữa và banner dọc 9:16 bên phải. Trên tablet/mobile, banner dọc được chuyển xuống dưới banner chính để tránh tràn ngang và giữ carousel chính full width.

Banner dọc dùng vị trí dữ liệu:

```text
placement = home_right_9_16
```

Ảnh banner được upload lên Supabase Storage bucket công khai:

```text
site-banners
```

Nếu chưa có banner đang bật, hoặc Supabase trả lỗi, website vẫn tải bình thường và hiển thị khung gợi ý mặc định với nội dung “Ưu đãi nổi bật” và “Cập nhật banner trong trang quản trị”.

## 18. Cách quản lý banner dọc trong Admin
Sau khi đăng nhập `admin.html`, mở mục **Banner dọc trang chủ 9:16** để:

1. Upload hoặc thay ảnh banner dọc.
2. Nhập tiêu đề banner.
3. Nhập link URL nếu muốn người dùng bấm vào banner để mở trong cùng tab.
4. Chọn trạng thái **Đang hiển thị** hoặc **Tạm ẩn**.
5. Nhập thứ tự hiển thị nếu cần.
6. Bấm **Lưu banner dọc**.
7. Có thể bấm **Xoá banner dọc** nếu banner đã tồn tại.

Khuyến nghị dùng ảnh dọc tỉ lệ **9:16**, ví dụ `900x1600px` hoặc `1080x1920px`. Ảnh chỉ được kiểm tra định dạng JPG, PNG, WebP ở frontend; không dùng OpenAI API và không chỉnh sửa/cắt/nén ảnh gốc.

## 19. SQL cần chạy cho banner trang chủ
File `supabase-schema.sql` đã mở rộng bảng `hero_banners` để dùng chung cho carousel chính và banner dọc:

- `placement`: phân biệt `home_main_carousel` và `home_right_9_16`.
- `link_url`: link tuỳ chọn cho banner dọc.
- index theo `placement`, `is_active`, `sort_order`, `created_at`.

Nếu Supabase project đã có bảng `hero_banners`, hãy copy và chạy lại toàn bộ `supabase-schema.sql` trong **Supabase SQL Editor**. Các câu `alter table ... add column if not exists` sẽ thêm cột còn thiếu an toàn, không xoá dữ liệu banner cũ. Các banner carousel cũ sẽ mặc định có `placement = 'home_main_carousel'`.

## Chuẩn bị public website

Các hạng mục đã được chuẩn bị để đưa website Anh Minh Store lên GitHub Pages công khai:

- Thêm/cập nhật SEO cơ bản: `sitemap.xml`, `robots.txt`, canonical URL, meta description, Open Graph và Twitter card cho các trang public chính.
- Thêm các trang chính sách và hỗ trợ: `chinh-sach-bao-hanh.html`, `chinh-sach-doi-tra.html`, `lien-he.html`.
- Cập nhật khu vực liên hệ với hotline sửa chữa, hotline tư vấn mua bán, giờ làm việc và Google Maps nhúng cho 2 cơ sở tại Đà Nẵng.
- Thêm trang `404.html` thân thiện cho GitHub Pages.
- Cập nhật footer để có nhóm thông tin Anh Minh Store, sản phẩm/dịch vụ và chính sách/hỗ trợ.
- Thêm `supabase-rls-launch-check.sql` để rà soát RLS trước khi public.

Lưu ý Supabase:

- File `supabase-rls-launch-check.sql` chỉ là checklist SQL phục vụ review và phải được kiểm tra/chạy thủ công trong Supabase SQL Editor.
- Không chạy SQL tự động từ frontend, không dùng service role key trên website public và không đưa secret key vào mã nguồn.
- Sau khi áp dụng RLS, cần kiểm tra lại: khách public chỉ đọc được sản phẩm/banner đang active, tạo được đơn hàng mới nếu form đặt hàng hoạt động, nhưng không đọc/sửa/xoá được đơn hàng hoặc dữ liệu admin.
