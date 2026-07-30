# SEO Implementation — Anh Minh Store

Ngày: 2026-07-30
Nhánh: `seo/full-spectrum-seo-v2`
Trạng thái: triển khai source và crawl architecture hoàn tất; đã validate local, chưa merge/deploy.

## 1. Mục tiêu

Chuẩn hóa entity URL về domain chính thức, kiểm soát indexation theo giá trị thật của từng trang, bổ sung structured data bảo thủ, làm rõ internal hierarchy và giảm tải ảnh ban đầu mà không đổi thiết kế hay tạo ảnh mới.

## 2. Thay đổi đã triển khai

### Canonical và social metadata

- 14 trang công khai đã bỏ canonical/OG URL GitHub Pages.
- URL SEO dùng `https://www.anhminhstore.io.vn`.
- Bổ sung Open Graph/Twitter metadata còn thiếu, `og:locale`, `og:site_name` và image alt.
- `404.html` không có canonical và dùng `noindex,follow`.
- `compare.html`, `san-pham-gia-dinh.html`, `other-products.html` dùng `noindex,follow`.
- `sua-tivi-da-nang.html` dùng `noindex,follow` và canonical về `sua-tivi.html`.

### Product SEO lifecycle

`product-detail.js` hiện xử lý bốn lớp:

1. Validate `id` bằng allowlist ký tự và giới hạn độ dài.
2. Chỉ khi nhận được sản phẩm active hợp lệ mới chuyển robots sang index.
3. Đồng bộ title, description, canonical, OG, Twitter và breadcrumb.
4. Với missing/invalid/inactive/error: bỏ canonical, noindex và xóa Product schema cũ.

Product JSON-LD:

- Có `Product`, `BreadcrumbList`.
- Có `Offer` chỉ khi giá parse được thành số dương.
- Không có `availability`, rating, review, aggregateRating, condition hoặc stock được suy diễn.
- Chỉ có Brand khi dữ liệu nguồn thật sự chứa brand.

### Structured data trang tĩnh

- Homepage: `Organization`, `WebSite`, `WebPage`.
- Service page: `Service`, `WebPage`, `BreadcrumbList`.
- Contact/policy/category/support: page type phù hợp và `BreadcrumbList`.
- Entity dùng `@id` ổn định trên domain chính thức.
- Không thêm geo, sameAs, legalName, openingHours, review/rating chưa xác minh.

`seo-schema.js` là helper nhỏ, không phụ thuộc framework. Nó đọc cấu hình trang từ data attributes và chèn JSON-LD trong head khi tải trang.

### Internal linking và semantics

- Thay internal link tới trang sửa tivi phụ bằng `sua-tivi.html`.
- Thêm breadcrumb hiển thị trên các trang indexable quan trọng và product/category template.
- Đổi cụm NAP chính trên trang liên hệ sang `<address>`.
- CSS breadcrumb được scope bằng `.seo-breadcrumb`; không sửa global layout.

### Ảnh và performance

- Không có file ảnh mới hoặc file ảnh bị sửa.
- Thêm `width`/`height` cho logo, banner và ảnh dịch vụ đã biết kích thước.
- Banner đầu tiên có `fetchpriority="high"` và `decoding="async"`.
- Bốn banner carousel sau dùng `data-src`; JavaScript chỉ hydrate ảnh hiện tại và preload ảnh kế tiếp trước khi chuyển slide.
- Banner lấy từ Supabase áp dụng cùng lifecycle tải.

Kết quả đo cùng phương pháp trên homepage local:

| Chỉ số | Baseline | Sau sửa |
|---|---:|---:|
| Image transfer bytes | 107,606,219 | 74,911,610 |
| Carousel có `src` trong 0,8 giây đầu | 5 | 1 |
| Carousel đang deferred | 0 | 4 |
| Ảnh thiếu width/height trong DOM | 8 | 2 |

Đây là số đo local browser, không phải Lighthouse hoặc Core Web Vitals production.

### AI discovery

- Thêm `llms.txt` với domain canonical, các trang chính và NAP đang công bố.
- Không tuyên bố `llms.txt` là yếu tố xếp hạng.

### Validator

`scripts/validate-seo.mjs` kiểm tra:

- language, charset, viewport;
- title, description, H1;
- canonical host;
- noindex footprint;
- inline JSON-LD parse;
- local file references;
- host công bố trong robots/sitemap.

## 3. Crawl architecture đã triển khai

Sau khi owner xác nhận lại đúng phạm vi:

- `robots.txt` công bố sitemap production.
- `sitemap.xml` là sitemap index, trỏ tới static và product sitemap.
- `sitemap-static.xml` chứa 8 canonical URL indexable theo allowlist.
- `sitemap-products.xml` chứa 107 sản phẩm public `is_active=true`.
- `scripts/generate-product-sitemap.mjs` chỉ gọi REST bằng `GET`, dùng publishable/anon config hiện có, exact count và giới hạn 50.000 URL.
- Generator từ chối secret/service-role key, id sai/trùng, response lỗi, count thiếu/rỗng, lastmod sai và dữ liệu không đầy đủ.
- File được ghi vào temporary path, validate nội bộ rồi mới rename sang sitemap chính.
- Không có SQL, RPC hoặc request ghi dữ liệu.

XML parser và SEO validator cuối đều PASS.

## 4. File tác động

### Source/runtime

- 14 file HTML công khai.
- `product-detail.js`.
- `other-products.js`.
- `script.js`.
- `styles.css`.
- `seo-schema.js`.

### Tooling/discovery

- `scripts/validate-seo.mjs`.
- `llms.txt`.
- `.gitignore` để loại `.seo-cache/`.

### Báo cáo

- `docs/seo/SEO_AUDIT_2026-07-30.md`.
- `docs/seo/SEO_IMPLEMENTATION_2026-07-30.md`.
- `docs/seo/SEO_OWNER_ACTIONS_2026-07-30.md`.
- `docs/seo/SEO_QA_2026-07-30.md`.

## 5. Phần được bảo vệ

Không thay đổi:

- `admin.html`, `admin.js`, `admin.css`;
- `supabase-config.js`, `supabase-client.js`, SQL/schema/RLS;
- `CNAME`;
- `.github/workflows`;
- ảnh;
- database hoặc dữ liệu production.
