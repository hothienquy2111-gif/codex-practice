# Codex Safety Rules for Anh Minh Store

1. Luôn làm trên branch riêng, không push trực tiếp vào main.
2. Không merge PR khi chưa được chủ repo duyệt.
3. Không tự deploy thủ công.
4. Không sửa các file cấu hình nhạy cảm:
   - supabase-config.js
   - supabase-client.js
   - CNAME
   - .github/workflows
   - sitemap.xml
   - robots.txt
5. Không thay đổi Supabase keys, auth, RLS, storage policies hoặc production config nếu chưa được yêu cầu rõ.
6. Không xoá file, không reset hard, không clean -fd nếu chưa được duyệt.
7. Không cài dependency mới nếu chưa được duyệt.
8. Khi sửa UI/JS/CSS, phải chạy kiểm tra syntax và báo cáo file đã đổi.
9. Với tính năng admin/Supabase, phải ưu tiên tạo SQL draft an toàn, không tự chạy SQL production nếu chưa được yêu cầu.
10. Trước khi commit phải báo:
    - branch hiện tại
    - files changed
    - forbidden files có bị đụng không
    - checks passed/failed
11. Chỉ commit/push sau khi người dùng duyệt.
12. Mục tiêu là sửa nhỏ, đúng phạm vi, dễ review, tránh refactor lớn khi chưa cần.
