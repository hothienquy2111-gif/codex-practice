# SEO V4 Product Authority Engine

## Mục đích

Mỗi product public đủ điều kiện được build thành một URL static tại `/san-pham/<slug>.html`. Raw HTML chứa H1, product identity, ảnh, mô tả, dữ liệu thuộc tính, canonical, Open Graph/Twitter và một JSON-LD graph gồm `WebPage`, `Product`, `BreadcrumbList`; `Offer` chỉ xuất hiện khi giá số hợp lệ.

## Single source of truth

`scripts/seo/product-source.mjs` đọc catalog public qua publishable/anon access vốn đã dùng bởi storefront. Dữ liệu được normalize vào `data/seo/products.generated.json`; sau đó toàn bộ product page, URL map, sitemap, hub và validator cùng dùng snapshot này. Không có SQL, Supabase write, service role hoặc dữ liệu khách hàng.

Title và meta description được kiểm tra unique trong mỗi build. Khi mô tả nguồn bị trùng giữa các model, generator chỉ nối thêm nhận diện có thật (model, kích thước và ID catalog) để phân biệt; không tạo claim sản phẩm mới.

## Chạy thủ công

```powershell
node scripts/seo/run-product-seo.mjs
node scripts/validate-seo.mjs
```

`data/seo/product-overrides.json` chỉ dành cho ngoại lệ có căn cứ như slug legacy hoặc collision. Product mới không cần nhập SEO thủ công.

## URL và legacy

Canonical mới là `/san-pham/<slug>.html`. Các URL `product-detail.html?id=<id>` vẫn hoạt động để giữ bookmark cũ; khi map tồn tại, runtime canonical của legacy detail trỏ về static URL. GitHub Pages không cung cấp 301 động cho query string, nên không tuyên bố có server redirect.

Khi một product từng được generate nhưng không còn public/indexable, generator giữ URL cũ dưới dạng trang lưu trữ `noindex,follow`, không còn đưa URL đó vào runtime map hay sitemap. Cách này tránh broken URL mà không tiếp tục index catalog đã rút khỏi public.

## Readiness

Không tạo rating/review giả. Không thêm availability, shipping hoặc return policy khi catalog/policy chưa có dữ liệu đáng tin. Merchant feed hiện không generate vì catalog public chưa có availability rõ ràng cho toàn bộ item.
