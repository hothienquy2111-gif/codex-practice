# SEO V4 Automation

Workflow `.github/workflows/product-seo-sync.yml` chạy thủ công hoặc mỗi 6 giờ 17 phút. Nó đọc public catalog, generate static SEO, chạy validator, rồi chỉ tạo/cập nhật **Draft PR** `seo/automated-product-sync`.

Workflow không auto-merge, không push trực tiếp vào `main`, không deploy và không ghi Supabase. Nếu catalog read, generation hoặc validation lỗi, workflow thất bại và không mở PR hợp lệ.

Luồng owner: cập nhật product public bình thường → chờ hoặc chạy workflow thủ công → review Draft PR → tự merge khi sẵn sàng. Save product không đồng nghĩa trang static được deploy tức thì; event-triggered publish là một kiến trúc khác, cần phê duyệt riêng.
