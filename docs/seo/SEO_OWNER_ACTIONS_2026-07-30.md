# SEO Owner Actions — Anh Minh Store

Ngày: 2026-07-30

## P0 — Crawl files đã được owner xác nhận

Owner đã xác nhận ngày 2026-07-30 cho đúng phạm vi:

1. Đổi `robots.txt` để công bố:
   `Sitemap: https://www.anhminhstore.io.vn/sitemap.xml`
2. Đổi `sitemap.xml` thành sitemap index.
3. Thêm `sitemap-static.xml` chỉ chứa canonical indexable.
4. Thêm `sitemap-products.xml` chứa sản phẩm `is_active=true`.
5. Thêm `scripts/generate-product-sitemap.mjs`, chỉ đọc REST API công khai hiện có; fail closed nếu lỗi/rỗng/sai id; không log key.

Phạm vi này đã được triển khai và validate mà không sửa Supabase, CNAME, workflow hay database. Chưa merge/deploy.

## P0 — Xác minh nội dung kinh doanh/pháp lý

Trước khi mở rộng LocalBusiness schema hoặc nội dung trust:

- Tên chính xác trên hóa đơn/GBP: “Anh Minh Store” hay “Công ty kỹ thuật điện tử Anh Minh”.
- Mỗi cơ sở là storefront khách ghé trực tiếp hay service-area location.
- Số primary của từng cơ sở.
- Địa chỉ đầy đủ đến phường/quận theo hồ sơ chính thức.
- Giờ mở cửa, ngày lễ và thời gian hỗ trợ.
- GBP URL/place ID của từng cơ sở.
- Hai Facebook URL trong source có phải kênh chính thức để dùng `sameAs`.
- Phạm vi giao hàng và vùng sửa chữa.
- Cam kết “chính hãng”, thời hạn bảo hành hai năm/sáu tháng và điều kiện áp dụng.

## P0 — Privacy

Form đặt hàng thu thập họ tên, điện thoại, địa chỉ và ghi chú. Owner cần cung cấp nội dung thật cho:

- mục đích thu thập;
- nơi xử lý/lưu trữ;
- thời hạn lưu;
- bên được tiếp cận;
- cách yêu cầu xem/sửa/xóa;
- đầu mối liên hệ.

Không nên tự sinh chính sách pháp lý bằng nội dung mẫu rồi công bố.

## P1 — Sau khi merge/deploy

1. Kiểm tra live canonical, robots và sitemap bằng HTTP.
2. Submit sitemap index trong Google Search Console.
3. Inspect một URL tĩnh và 3–5 URL sản phẩm.
4. Theo dõi `Page indexing`, canonical selected by Google và rich result.
5. Xác minh redirect non-www → www vẫn hoạt động.
6. Kết nối GBP/Bing Places/Apple Business Connect sau khi entity được owner xác nhận.

## P1 — Image pipeline

Homepage vẫn nặng khoảng 75 MB trong local measurement vì source assets rất lớn. Nên tạo nhánh riêng:

- WebP/AVIF;
- responsive variants và `srcset`;
- logo đúng kích thước hiển thị;
- kiểm tra chất lượng/crop;
- giữ fallback raster;
- đo LCP/CLS trước–sau.

Nhánh SEO hiện tại không sửa hoặc tạo ảnh theo guardrail.

## P2 — Accessibility/UI follow-up

- Đổi action `href="#"` sang button hoặc URL thật.
- Nâng touch target nhỏ lên gần 44×44 px.
- Hoàn thiện focus trap/return focus của order modal.
- Kiểm tra screen reader và tab order trên thiết bị thật.
- Xem lại floating contact trên màn hình thấp vì có thể che CTA.

## P2 — Content/E-E-A-T

Chỉ bổ sung khi có bằng chứng:

- hồ sơ kỹ thuật viên/đơn vị chịu trách nhiệm;
- case study sửa chữa thật;
- ảnh cơ sở có quyền sử dụng;
- review thật có nguồn và consent;
- quy trình kiểm tra, bảo hành, đổi trả chi tiết;
- tác giả/ngày cập nhật cho nội dung quan trọng.
