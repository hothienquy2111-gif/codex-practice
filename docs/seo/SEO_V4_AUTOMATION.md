# SEO V4 Automation

Workflow `.github/workflows/product-seo-sync.yml` chạy thủ công hoặc mỗi 6 giờ 17 phút. Nó đọc public catalog, generate static SEO, chạy validator, rồi chỉ tạo/cập nhật **Draft PR** `seo/automated-product-sync`.

Workflow không auto-merge, không push trực tiếp vào `main`, không deploy và không ghi Supabase. Nếu catalog read, generation hoặc validation lỗi, workflow thất bại và không mở PR hợp lệ.

## Catalog continuity guard

Trước khi lập write plan hoặc archive sản phẩm, generator so sánh ID trong public catalog hiện tại với `data/seo/generated-products-manifest.json`. Báo cáo deterministic gồm số lượng trước/sau, retained, removed, added và các tỷ lệ retention/removal/count drop.

Guard chặn catalog rỗng; chặn mức giảm còn tối đa 50% khi baseline có ít nhất 10 sản phẩm; đồng thời chặn removal/churn lớn khi baseline có ít nhất 20 sản phẩm và từ 10 ID bị mất. Khi guard chặn, generator chưa tạo write plan và không ghi file nào, nên output SEO cũ được giữ nguyên. Thay đổi nhỏ và catalog chỉ tăng vẫn chạy bình thường; lần bootstrap không có manifest cũ được phép chạy nếu catalog mới không rỗng.

Đợt nghỉ bán hàng loạt có chủ đích chỉ được override bằng **manual workflow dispatch**: bật `allow_catalog_collapse` và nhập `catalog_override_reason` tối thiểu 8 ký tự. Lý do được làm sạch, giới hạn độ dài, ghi vào data quality report và in cảnh báo nổi bật trong log. Catalog rỗng không thể override. Scheduled run luôn truyền override là `false`, vì vậy cron không thể âm thầm vượt guard.

## Workflow supply-chain controls

Ba action bên thứ ba được pin bằng full commit SHA đã xác minh từ repository chính thức, kèm chú thích phiên bản: `actions/checkout` v4.4.0, `actions/setup-node` v4.4.0 và `peter-evans/create-pull-request` v7.0.11. Checkout tắt persisted credentials; bước tạo Draft PR nhận rõ `github.token`. Validator `scripts/seo/validate-product-seo-workflow.mjs` khóa trigger, cadence, permissions, action allowlist/SHA, Draft branch và phạm vi manual override.

Luồng owner: cập nhật product public bình thường → chờ hoặc chạy workflow thủ công → review Draft PR → tự merge khi sẵn sàng. Save product không đồng nghĩa trang static được deploy tức thì; event-triggered publish là một kiến trúc khác, cần phê duyệt riêng.
