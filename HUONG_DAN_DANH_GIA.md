# MicroTech 1.2.0 — Đánh giá dịch vụ

## Phần đã thêm

- Trang `/reviews`: chọn 1–5 sao, tên hiển thị, dịch vụ và nhận xét.
- Trang chủ có khu vực đánh giá và nút mở form.
- Điểm trung bình, phân bố số sao, lọc dịch vụ/số sao và tải thêm đánh giá.
- Giao diện Việt–Anh, sáng/tối và điện thoại.
- Dữ liệu được lưu trong tab `Reviews` của Google Sheet hiện có.
- Đánh giá mới ở trạng thái `Chờ duyệt`; chỉ `Đã duyệt` được hiển thị và tính điểm. Không thêm đánh giá mẫu hoặc điểm số giả vào website.
- Website chỉ báo đã lưu khi đọc được xác nhận của đúng mã đánh giá từ API. Gửi lại cùng nội dung sau lỗi dùng cùng mã để tránh thêm dòng trùng.

**Bản nâng cấp đã được kiểm tra ở môi trường phát triển. API Google và website Vercel hiện tại cần được cập nhật theo các bước bên dưới; chỉ tải hoặc chép ZIP chưa cập nhật mã Apps Script.**

## 1. Cập nhật Apps Script

1. Mở bảng [MicroTech – Support Requests](https://docs.google.com/spreadsheets/d/1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w/edit) → **Tiện ích mở rộng → Apps Script**.
2. Thay nội dung `Code.gs` trên Google bằng toàn bộ file **`google-apps-script/Code.gs`** đi kèm bản này. ID bảng tính và tab đặt đơn `Support Requests` đã được điền. Tên tab không có dấu cách đầu/cuối.
3. Lưu. Chọn hàm **`setupReviews`** cạnh nút Chạy, rồi bấm **Chạy**. Cấp quyền cho mã của bạn nếu Google yêu cầu.
4. Trong Sheet sẽ có tab **`Reviews`** với 9 cột; cột G có danh sách chọn trạng thái. Hàm này giữ nguyên các đơn đang có ở `Support Requests`.
5. Chọn **Triển khai → Quản lý bản triển khai → bút chì** ở bản `/exec` đang dùng → **Phiên bản mới → Triển khai**. Giữ **Thực thi với tư cách: Tôi**, quyền truy cập dành cho người chưa đăng nhập.
6. Khi cập nhật chính bản triển khai đang dùng, URL `/exec` giữ nguyên. Nếu tạo bản triển khai khác, dán URL mới vào `sheetScriptUrl` trong `src/config.ts`.

`google-apps-script/appsscript.json` là tệp cấu hình mẫu. Nếu dự án đang có cấu hình riêng, giữ các mục hiện có; khối `webapp` cần `USER_DEPLOYING` và `ANYONE_ANONYMOUS`. Không bấm Chạy trực tiếp hàm `doPost` vì không có dữ liệu HTTP POST; dùng `testWriteOrder` để thử riêng phần đặt đơn.

Để kiểm tra API đọc đánh giá, mở URL API `/exec` của bạn và thêm `?action=reviews` ở cuối. Kết quả phải có `"kind":"reviews"`, `"summary"` và `"reviews"`. Khi chưa có đánh giá được duyệt, danh sách rỗng và tổng đánh giá bằng 0 là đúng.

## 2. Cập nhật website trên GitHub/Vercel

1. Giải nén bộ mã nguồn, chép các file vào repo MicroTech trên máy của bạn; giữ thư mục `.git` của repo hiện có.
2. Nếu hai file cũ còn tồn tại, xóa `src/pages/Settings.tsx` và `src/lib/settings.tsx`. Bản 1.2.0 không dùng chúng.
3. Chạy trong PowerShell ở thư mục có `package.json`:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd build
pnpm.cmd test:sheet
```

4. Khi build và kiểm tra thành công, đẩy bản cập nhật:

```powershell
git add -A
git commit -m "Add service reviews with Google Sheets moderation"
git push origin main
```

5. Chờ bản triển khai mới trên Vercel, mở `/reviews`. Nếu trình duyệt chưa tải được đánh giá, đối chiếu bước triển khai Apps Script và URL trong `src/config.ts`.

## 3. Nhận và duyệt đánh giá

1. Khách chọn số sao, nhập tên hiển thị, dịch vụ, nhận xét và đồng ý công khai nội dung.
2. Gửi thành công → đánh giá vào tab **Reviews**, trạng thái **Chờ duyệt**.
3. Đọc nội dung, chọn **Đã duyệt** ở cột G để công khai; chọn **Ẩn** để gỡ khỏi danh sách và điểm trung bình.
4. Tải lại trang website để đọc dữ liệu mới. Không cần build lại chỉ để duyệt hoặc ẩn nhận xét.

| Cột | Nội dung | Cần thao tác |
| --- | --- | --- |
| A | Mã đánh giá | Mã tự tạo; giữ nguyên |
| B | Thời gian | Thời gian máy chủ ghi nhận |
| C | Tên hiển thị | Tên khách đồng ý công khai |
| D | Dịch vụ | `install`, `trouble`, `it`, `business` |
| E | Số sao | 1 đến 5 |
| F | Nhận xét | Nội dung khách gửi |
| G | Trạng thái | Chọn Chờ duyệt / Đã duyệt / Ẩn |
| H | Mã xác nhận | Mã tự tạo; giữ nguyên, không công khai |
| I | Đồng ý công khai | Giá trị TRUE khi khách đồng ý |

API công khai chỉ trả mã đánh giá, tên hiển thị, dịch vụ, số sao, nhận xét và thời gian của những dòng **Đã duyệt** và **TRUE** ở cột I. API không trả dữ liệu đặt đơn, SĐT, email hay mã xác nhận. Không cần công khai toàn bộ bảng tính.

Nhận xét không được xác thực bằng giao dịch đã hoàn tất; chúng là nội dung khách gửi và bạn duyệt. Khi duyệt, áp dụng tiêu chí nội dung cho mọi mức sao. Giao diện không tự ẩn nhận xét 1–2 sao.

Thử một đánh giá có tên `TEST`, kiểm tra dòng mới, duyệt để thử hiển thị rồi chọn **Ẩn** sau kiểm tra. Múi giờ hiển thị trong Google Sheet theo cài đặt bảng tính; phần ngày trên website dùng giờ Việt Nam.

Nguồn kỹ thuật: [Google Apps Script — Content Service/JSONP](https://developers.google.com/apps-script/guides/content), [Cập nhật bản triển khai](https://developers.google.com/apps-script/concepts/deployments).
