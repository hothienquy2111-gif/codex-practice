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
- `admin.js`: xử lý Auth, kiểm tra quyền admin, upload ảnh, thêm/sửa/ẩn/xoá sản phẩm.
- `supabase-client.js`: khởi tạo Supabase an toàn, không làm hỏng website nếu chưa cấu hình.
- `supabase-config.example.js`: file mẫu chứa placeholder URL và anon key.
- `supabase-schema.sql`: schema bảng, RLS policy và storage policy mẫu.

Các file được cập nhật:

- `index.html`, `script.js`: tải sản phẩm từ Supabase trước, fallback về `products.js` nếu chưa cấu hình hoặc lỗi mạng.
- `product-detail.html`, `product-detail.js`: tải chi tiết sản phẩm từ Supabase trước, fallback về `products.js`.
- `styles.css`: thêm giao diện admin responsive, giữ phong cách trắng + xanh đậm và font Aptos.

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

Bảng `products` chứa các trường: `id`, `brand`, `model`, `full_name`, `size`, `type`, `condition`, `warranty`, `old_price`, `price`, `badge`, `description`, `features`, `image`, `images`, `overview`, `specifications`, `is_active`, `sort_order`, `created_at`, `updated_at`.

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
6. Bấm **Lưu sản phẩm**.

Nếu mã sản phẩm đã tồn tại, trang admin sẽ báo: “Mã sản phẩm đã tồn tại. Vui lòng đổi model hoặc mã sản phẩm.”

## 13. Cách upload ảnh sản phẩm
Trong form sản phẩm có:

- **Ảnh chính**: ảnh đại diện sản phẩm.
- **Ảnh gallery nhiều ảnh**: nhiều ảnh chi tiết.

Ảnh được upload lên bucket `product-images` theo thư mục của mã sản phẩm. Nếu upload lỗi, trang admin báo: “Không thể tải ảnh lên. Vui lòng thử lại.”

Nếu không upload ảnh, sản phẩm vẫn lưu được và website public sẽ hiển thị placeholder tivi bằng CSS.

## 14. Cách sản phẩm hiện trên website
Trang chủ tải dữ liệu theo thứ tự:

1. Supabase `products` với `is_active = true`.
2. Nếu Supabase thiếu cấu hình, lỗi mạng hoặc query lỗi, website fallback về `products.js`.

Sản phẩm loại **Tivi mới** hiện ở phần “Tivi mới chính hãng”. Sản phẩm loại **Tivi cũ** hiện ở phần “Tivi cũ đã kiểm tra”. Link chi tiết vẫn là `product-detail.html?id=MA_SAN_PHAM` và mở trong cùng tab.

## 15. Cách sửa/ẩn/xoá sản phẩm
Trong dashboard admin:

- **Sửa**: mở form với dữ liệu hiện có. Ảnh cũ được giữ lại nếu không upload ảnh mới.
- **Ẩn/Hiện**: đổi `is_active`; sản phẩm ẩn không hiện trên website public nhưng vẫn thấy trong admin.
- **Xoá**: xoá row trong bảng `products` sau khi xác nhận “Bạn có chắc muốn xoá sản phẩm này không?”.

Ảnh trong Storage không bị xoá tự động. Có thể bổ sung chức năng dọn ảnh storage sau.

## 16. Cách test website sau khi thêm sản phẩm
1. Thêm sản phẩm trong `admin.html`.
2. Mở `index.html` hoặc website GitHub Pages.
3. Kiểm tra sản phẩm xuất hiện đúng mục Tivi mới/Tivi cũ.
4. Dùng bộ lọc hãng, kích thước, loại sản phẩm.
5. Bấm “Xem chi tiết” để mở `product-detail.html?id=...` trong cùng tab.
6. Kiểm tra gallery, giá gạch, giá bán, đặc điểm nổi bật, modal tổng quan và modal thông số.
7. Kiểm tra trên màn hình điện thoại, không bị tràn ngang.

## 17. Cảnh báo bảo mật
- **Không bao giờ expose Supabase service role key trong frontend code.**
- **Không bao giờ lưu mật khẩu admin trong JavaScript.**
- Chỉ dùng Supabase Auth để đăng nhập.
- Luôn bật RLS cho bảng và storage.
- Supabase anon key có thể public trên GitHub Pages, nhưng chỉ an toàn khi RLS policy đúng.
- Admin actions phải yêu cầu user đã đăng nhập và có `profiles.role = 'admin'`.

## 18. Fallback products.js nếu Supabase chưa cấu hình
Nếu chưa có `supabase-config.js`, config sai, mất mạng hoặc Supabase query lỗi:

- Trang public không crash.
- Trang chủ vẫn dùng `products.js`.
- Trang chi tiết vẫn dùng `products.js`.
- Người dùng không thấy lỗi kỹ thuật; console có thể có cảnh báo để debug.

## 19. Pre-launch checklist
- [ ] Supabase URL/anon key configured.
- [ ] RLS enabled.
- [ ] Admin profile role = admin.
- [ ] product-images bucket created.
- [ ] Public website loads products.
- [ ] Admin can add product.
- [ ] Admin can upload images.
- [ ] Product detail page opens correctly.
- [ ] Mobile layout checked.
- [ ] No private keys in repository.
