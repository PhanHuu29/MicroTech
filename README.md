# MicroTech 1.2.0

Website hỗ trợ phần mềm bằng React 18, TypeScript và Vite. Bản nâng cấp có giao diện glass, cover với Zalo/hotline, nút đặt hỗ trợ có hiệu ứng nổi, Việt–Anh và sáng/tối.

**Mới: đánh giá dịch vụ 1–5 sao, trang `/reviews`, bộ lọc, điểm trung bình và nhận xét chờ duyệt trong Google Sheets.** Đọc **`HUONG_DAN_DANH_GIA.md`** để cập nhật Apps Script, tạo tab Reviews và triển khai website. Chỉ những đánh giá đã duyệt được công khai; website không tạo đánh giá mẫu.

**Cấu hình website chỉ chỉnh trong mã nguồn.** Trang Settings, link mở Settings và cơ chế ghi đè cấu hình từ localStorage đã được bỏ. Bắt đầu tại **`CHEN_LINK_SHEET_VA_API.md`** để chèn link Google Sheet và API nhận đơn.

## Chạy website

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test:sheet
```

Dự án giữ `pnpm@9.12.0` và lockfile của bản gốc. Không cần chép `node_modules` từ bản ZIP cũ.

Trên Windows, nếu PowerShell chặn script, dùng `npm.cmd` / `pnpm.cmd` hoặc mở Command Prompt.

## Trang và cấu hình

| Trang / file | Chức năng |
| --- | --- |
| `/` | Cover, liên hệ nhanh, dịch vụ, form đặt nhanh |
| `/booking` | Form 4 bước và trang kết quả |
| `/pricing` | Bảng giá |
| `/track` | Tra cứu dữ liệu lưu trên cùng trình duyệt |
| `/reviews` | Xem và gửi đánh giá; chỉ hiển thị nhận xét đã duyệt |
| `src/config.ts` | Hotline, Zalo, URL Apps Script, link Sheet, mặc định ngôn ngữ/theme cho mọi khách |
| `src/lib/images.ts` | Đường dẫn ảnh |
| `src/lib/data.ts` | Nội dung dịch vụ, giá, khung giờ và bản dịch |
| `google-apps-script/Code.gs` | Mã nhận đơn và đánh giá vào Sheet; API đọc đánh giá công khai |
| `HUONG_DAN_DANH_GIA.md` | Cập nhật tính năng và duyệt/ẩn đánh giá |
| `CHEN_LINK_SHEET_VA_API.md` | Vị trí chèn link Sheet, API và ID bảng tính |
| `HUONG_DAN_MICROTECH.md` | Hướng dẫn kết nối, cập nhật và triển khai |

**Đã giữ API `/exec` và ID Sheet MicroTech – Support Requests.** Tab nhận đơn là `Support Requests` không có dấu cách đầu/cuối; kết nối đặt đơn đã được kiểm tra bằng dòng TEST ngày 03/10/2026. Bản mới giữ nguyên lựa chọn ẩn nút mở Sheet của repo. Tính năng đánh giá cần cập nhật Apps Script trên Google rồi chọn phiên bản mới; xem `HUONG_DAN_DANH_GIA.md`.

Sau khi sửa `src/config.ts`, chạy build và triển khai lại. Nút VI/EN và sáng/tối chỉ lưu lựa chọn giao diện của khách, không sửa thông tin cấu hình website.

Nếu chép đè bản ZIP này vào repo cũ, xóa **`src/pages/Settings.tsx`** và **`src/lib/settings.tsx`** trong repo cũ. Hai file này đã bị bỏ khỏi bản mới. Giữ thư mục `.git` của repo hiện có.

Luồng đặt đơn gửi POST bằng `no-cors`: hoàn tất fetch không xác nhận thao tác ghi ở Google thành công. Kiểm tra bằng dòng thử trong Sheet. Luồng đánh giá đọc lại mã xác nhận trước khi báo đã lưu. Tra cứu hiện dùng localStorage, chưa đồng bộ trạng thái trực tiếp từ Sheet. Tệp ảnh/video chỉ được ghi tên; gửi tệp qua Zalo.
