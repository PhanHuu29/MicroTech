# Chèn link Google Sheet và API vào MicroTech

Mọi cấu hình website chỉ sửa trong mã nguồn. Mở thư mục MicroTech bằng VS Code; không cần trang Settings trên web.

## Bản 1.1.2 đã điền link của bạn

- `src/config.ts`: đã điền API `/exec` bạn gửi, link Sheet bên dưới và bật nút mở Sheet sau khi đặt đơn.
- `google-apps-script/Code.gs`: đã điền ID bảng tính `1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w`, tab ` Support Requests` với đúng 13 cột. Tên tab có một dấu cách ở đầu; giữ nguyên dấu cách trong mã.
- [Mở Sheet MicroTech – Support Requests](https://docs.google.com/spreadsheets/d/1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w/edit).

**Kết quả kiểm tra API ngày 03/10/2026 (giờ Việt Nam):** mở URL khi chưa đăng nhập bị chuyển sang trang đăng nhập Google; gửi POST đơn thử `MT-TEST-20261002-4725FFF1EA` trả về **401 Unauthorized**. Chưa xác nhận API đã ghi được đơn. Mã trong ZIP đã cấu hình cho bảng Support Requests bạn gửi; chưa thay đổi bản triển khai đang chạy trên Google.

### Sửa quyền triển khai trước khi nhận đơn

1. Mở dự án Apps Script chứa bản triển khai `/exec` bạn gửi. Sao chép toàn bộ `google-apps-script/Code.gs` trong ZIP vào đó rồi lưu; ID Sheet đã điền sẵn. Tài khoản triển khai phải có quyền sửa Sheet này.
2. Vào **Triển khai → Quản lý bản triển khai**, chọn đúng bản `/exec` đang dùng, bấm biểu tượng bút chì và chọn **Phiên bản mới**.
3. Chọn **Thực thi với tư cách: Tôi**; **Ai có quyền truy cập: Bất kỳ ai**, bao gồm người chưa đăng nhập. Lựa chọn chỉ dành cho người đã đăng nhập Google vẫn không đáp ứng việc đặt đơn của khách.
4. Bấm **Triển khai** và cấp quyền cho mã của bạn. Nếu phải tạo bản triển khai mới để đổi quyền, sao chép URL `/exec` mới vào `src/config.ts` → `sheetScriptUrl`.
5. Mở `/exec` trong cửa sổ ẩn danh. Khi triển khai đúng mã đi kèm, phải thấy `{"ok":true,"service":"MicroTech booking endpoint"}` mà không cần đăng nhập. Sau đó cập nhật website và gửi một đơn thử ở `/booking`; tìm đúng mã đơn trong Sheet.

Chỉ sửa file trong ZIP chưa thay đổi mã hoặc quyền của API đang chạy trên Google. Không cần công khai Google Sheet cho khách để nhận đơn; quyền xem Sheet và quyền gọi API là hai phần riêng. Nếu tài khoản Workspace không cho truy cập ẩn danh, cần dùng cấu hình/tài khoản được quản trị viên cho phép.

## 1. Dán link vào đúng file

Mở **`src/config.ts`**, tìm ba mục có chú thích `[1]`, `[2]`, `[3]` và chỉ thay giá trị bên trong dấu nháy hoặc giá trị `true`/`false`:

```ts
  // [1] API nhận đơn: URL triển khai Apps Script, kết thúc /exec.
  sheetScriptUrl: 'https://script.google.com/macros/s/DEPLOYMENT_ID_CUA_BAN/exec',

  // [2] Link bảng tính Google Sheet cá nhân.
  sheetUrl: 'https://docs.google.com/spreadsheets/d/ID_SHEET_CUA_BAN/edit',

  // [3] Hiện nút mở Sheet trên trang kết quả sau khi khách đặt đơn.
  showSheetOnSuccess: true,
```

Các URL trên là mẫu cho lần đổi cấu hình sau. Bản ZIP này đã có đường dẫn thật của bạn, nên không thay lại bằng URL mẫu. Khi đổi link, giữ nguyên dấu nháy, dấu phẩy. Không tạo thêm một `export const CONFIG` thứ hai.

| Mục | Chèn gì? |
| --- | --- |
| `sheetScriptUrl` | URL API từ bản triển khai Google Apps Script: `https://script.google.com/macros/s/.../exec` |
| `sheetUrl` | Đường dẫn bảng tính: `https://docs.google.com/spreadsheets/d/.../edit` |
| `showSheetOnSuccess` | `true` để hiện nút Mở Google Sheet; `false` để ẩn |

**API trong dự án này là URL Ứng dụng web Apps Script, không phải API key Google.** Không cần dán khóa API, token hay mật khẩu vào frontend. Không dùng link Sheet, link `/dev` hoặc link `script.googleusercontent.com/macros/echo` thay cho API `/exec`.

Nếu chỉ muốn nhận đơn vào Sheet, điền `sheetScriptUrl` và để `showSheetOnSuccess: false`. Link Sheet và việc hiện nút không quyết định thao tác ghi đơn. Nút mở Sheet không tự cấp quyền xem bảng tính.

## 2. Gắn API với đúng bảng tính

Trong **`google-apps-script/Code.gs`**, tìm và sửa:

```js
const SPREADSHEET_ID = '1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w';
const SHEET_NAME = ' Support Requests'; // có một dấu cách trước chữ Support
```

Ví dụ link bảng tính là `https://docs.google.com/spreadsheets/d/ABC123xyz/edit#gid=0` thì sửa thành:

```js
const SPREADSHEET_ID = 'ABC123xyz';
```

Chỉ chèn phần giữa `/d/` và `/edit`, không chèn toàn bộ đường dẫn vào `SPREADSHEET_ID`.

`SHEET_NAME` là tên tab ở cạnh dưới bảng tính, không phải tên file Google Sheet. Bản này dùng đúng tab ` Support Requests` bạn gửi. Nếu tên không khớp, API báo lỗi `Sheet tab not found` và không tự tạo tab khác; kiểm tra cả dấu cách đầu/cuối trước khi triển khai lại.

Mở Google Sheet → **Tiện ích mở rộng → Apps Script**, dán toàn bộ nội dung `Code.gs` đã sửa vào đó và lưu. Chỉ sửa bản `Code.gs` trên máy tính sẽ chưa cập nhật được API Google.

## 3. Lấy URL API /exec

Trong Apps Script:

1. Chọn **Triển khai → Bản triển khai mới → Ứng dụng web**.
2. Chọn thực thi với tư cách **Tôi**; quyền truy cập **Bất kỳ ai** để khách gửi đơn không cần đăng nhập Google.
3. Triển khai và cấp quyền cho mã của bạn.
4. Sao chép **URL ứng dụng web** kết thúc `/exec` trong hộp triển khai; dán vào `sheetScriptUrl` của `src/config.ts`.

Nếu đã có bản triển khai, vào **Triển khai → Quản lý bản triển khai** để lấy URL. Sau khi đổi mã Apps Script, sửa bản triển khai, chọn phiên bản mới và triển khai lại. Với tài khoản Workspace bị giới hạn chia sẻ, lựa chọn Bất kỳ ai có thể không khả dụng.

## 4. Áp dụng cấu hình và kiểm tra

Lưu `src/config.ts`. Trong thư mục có `package.json`, chạy bằng Command Prompt hoặc PowerShell trên Windows:

```bat
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

Điền một đơn thử ở `/booking`, giữ mã đơn trên trang kết quả, rồi mở Sheet → tab **Support Requests** (tên đầy đủ trong mã là ` Support Requests`). Có dòng cùng mã đơn mới xác nhận việc ghi thành công. Do website gửi bằng `no-cors`, thông báo đã gửi đi không tự xác nhận Google đã ghi dữ liệu.

Để cập nhật website đang chạy trên Vercel:

```bat
pnpm.cmd build
git add .
git commit -m "Update MicroTech Sheet and API configuration"
git push origin main
```

Các lệnh Git dùng trong repo hiện có đã liên kết với GitHub/Vercel. Nếu chép đè ZIP này vào repo cũ, nhớ xóa `src/pages/Settings.tsx` và `src/lib/settings.tsx`, giữ thư mục `.git`. Vercel cần triển khai bản mã mới thì khách mới nhận cấu hình mới.

Nếu không thấy đơn trong Sheet, kiểm tra ID bảng tính, URL `/exec`, quyền bản triển khai, phiên bản Apps Script và mục Executions. Nếu không thấy nút mở Sheet, kiểm tra `showSheetOnSuccess: true` và link `sheetUrl` hợp lệ.

Tài liệu chi tiết về Zalo, hotline, ảnh, ngôn ngữ và sáng/tối: **`HUONG_DAN_MICROTECH.md`**.

Nguồn đối chiếu: [Google Apps Script Web apps](https://developers.google.com/apps-script/guides/web), [Google – quyền ứng dụng web](https://developers.google.com/apps-script/manifest/web-app-api-executable), [Google – cập nhật bản triển khai](https://developers.google.com/apps-script/concepts/deployments), [Google Content Service](https://developers.google.com/apps-script/guides/content#redirects), [MDN no-cors](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode).
