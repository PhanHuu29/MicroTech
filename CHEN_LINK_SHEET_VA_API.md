# Chèn link Google Sheet và API vào MicroTech

**Tính năng đánh giá dịch vụ:** xem `HUONG_DAN_DANH_GIA.md` để cập nhật Apps Script và tạo tab Reviews trước khi sử dụng. API đặt đơn đã hoạt động; tính năng đánh giá mới cần triển khai mã Code.gs 1.2.0.

Mọi cấu hình website chỉ sửa trong mã nguồn. Mở thư mục MicroTech bằng VS Code; không cần trang Settings trên web.

## Bản 1.2.0 đã điền API mới và có hàm thử trong trình chỉnh sửa

- `src/config.ts`: đã điền API `/exec` mới bạn gửi, link Sheet bên dưới; nút mở Sheet sau khi đặt đơn hiện được ẩn.
- `google-apps-script/Code.gs`: đã điền ID bảng tính `1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w`, tab `Support Requests` với đúng 13 cột. Tên tab không có dấu cách đầu/cuối và đã khớp với API đang chạy.
- `google-apps-script/appsscript.json`: cấu hình ứng dụng web chạy với quyền của người triển khai và cho phép người chưa đăng nhập gọi API.
- [Mở Sheet MicroTech – Support Requests](https://docs.google.com/spreadsheets/d/1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w/edit).

### Khi thấy lỗi Missing request body

`doPost(e)` cần dữ liệu từ một yêu cầu HTTP POST. Nếu chọn `doPost` rồi bấm **Chạy** trong trình chỉnh sửa, Google không truyền dữ liệu của form vào hàm, nên mã báo `Missing request body` trước khi mở Sheet.

Bản này đã thêm hàm `testWriteOrder` để thử đúng cách trong trình chỉnh sửa:

1. Dán toàn bộ **`google-apps-script/Code.gs`** mới trong ZIP vào Apps Script rồi **Lưu**.
2. Trong danh sách hàm cạnh nút Chạy, chọn **`testWriteOrder`** rồi bấm **Chạy**.
3. Cấp quyền cho mã của bạn nếu Google yêu cầu; dùng tài khoản có quyền sửa bảng tính đã cấu hình.
4. Nếu thành công, nhật ký có `{"ok":true,"code":"MT-TEST-..."}`. Mở Sheet, tìm mã đó ở cột **Mã đơn** trong tab **Support Requests**.

Mỗi lần bấm Chạy tạo một dòng TEST có tên bắt đầu bằng `TEST MicroTech`, SĐT giả `0000000000` và email mẫu. Nếu thất bại, hàm ghi kết quả và báo lỗi cụ thể để kiểm tra ID, tên tab hoặc quyền tài khoản. Tên tab trong mã là `Support Requests`, không có dấu cách đầu/cuối.

Thử trong trình chỉnh sửa chỉ kiểm tra ghi Sheet bằng quyền tài khoản đang chạy. Sau đó vẫn cần thử đặt đơn trên website để kiểm tra luồng gửi form của bản website bạn đang dùng.

API hiện được cấu hình:

```text
https://script.google.com/macros/s/AKfycbwNSnefgqZ0q8WSaNYNSzjFe1RifxT0YscvCsCHLplLwhidoTi5XxH0kP3vr-knU_imEA/exec
```

**Kết quả kiểm tra mới nhất ngày 03/10/2026 (giờ Việt Nam):** GET trả `{"ok":true,"service":"MicroTech booking endpoint"}`. POST ban đầu báo `Sheet tab not found: "Support Requests"` vì tab thực tế có một dấu cách ở đầu tên. Đã bỏ dấu cách để tên tab thành `Support Requests`, giữ nguyên bảng tính và sheetId. Gửi lại cùng đơn TEST, API trả `{"ok":true,"code":"MT-TEST-1790987274384-API"}`; đã đọc lại đủ 13 cột của dòng này trong `A2:M2`. API → Google Sheets đã hoạt động; việc thử form trên bản website của bạn là bước đối chiếu tiếp theo. Không cần đổi URL API để áp dụng việc sửa tên tab này.

### Khi cần cập nhật mã hoặc quyền triển khai

API hiện đã nhận được POST không cần đăng nhập và ghi được dòng TEST. Các bước dưới đây dùng khi bạn thay mã hoặc cấu hình triển khai sau này.

1. Mở dự án Apps Script chứa bản triển khai `/exec` mới. Sao chép toàn bộ `google-apps-script/Code.gs` trong ZIP vào đó rồi lưu; ID Sheet đã điền sẵn. Tài khoản triển khai phải có quyền sửa Sheet này.
2. Vào **Cài đặt dự án**, bật **Hiển thị tệp kê khai appsscript.json trong trình chỉnh sửa**, rồi quay lại trình chỉnh sửa.
3. Trong `appsscript.json` trên Google, thêm hoặc sửa khối `webapp` đúng như bên dưới. File mẫu hoàn chỉnh có trong `google-apps-script/appsscript.json` của ZIP; nếu dự án hiện có cấu hình khác, giữ những mục đó và chỉ cập nhật khối `webapp`.

   ```json
   "webapp": {
     "access": "ANYONE_ANONYMOUS",
     "executeAs": "USER_DEPLOYING"
   }
   ```

   Đặt khối này trong đối tượng JSON ngoài cùng; thêm dấu phẩy giữa các mục khi cần. `ANYONE_ANONYMOUS` cho phép khách chưa đăng nhập. `ANYONE` chỉ cho người đã đăng nhập Google. `USER_DEPLOYING` dùng quyền của tài khoản triển khai để ghi Sheet.

4. Lưu rồi vào **Triển khai → Quản lý bản triển khai**, chọn đúng bản `/exec` đang dùng, bấm bút chì và chọn **Phiên bản mới**. Kiểm tra **Thực thi với tư cách: Tôi** và quyền truy cập bao gồm người chưa đăng nhập.
5. Bấm **Triển khai** và cấp quyền cho mã của bạn. Nếu phải tạo bản triển khai mới để đổi quyền, sao chép URL `/exec` mới vào `src/config.ts` → `sheetScriptUrl`.
6. Mở `/exec` trong cửa sổ ẩn danh. Khi triển khai đúng mã đi kèm, phải thấy `{"ok":true,"service":"MicroTech booking endpoint"}` mà không cần đăng nhập. Đây chỉ là kiểm tra khả năng gọi API.
7. Cập nhật website bằng mã trong ZIP, gửi một đơn thử ở `/booking` rồi tìm đúng mã đơn trong tab Support Requests để xác nhận việc ghi dữ liệu.

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
const SHEET_NAME = 'Support Requests'; // không có dấu cách đầu/cuối
```

Ví dụ link bảng tính là `https://docs.google.com/spreadsheets/d/ABC123xyz/edit#gid=0` thì sửa thành:

```js
const SPREADSHEET_ID = 'ABC123xyz';
```

Chỉ chèn phần giữa `/d/` và `/edit`, không chèn toàn bộ đường dẫn vào `SPREADSHEET_ID`.

`SHEET_NAME` là tên tab ở cạnh dưới bảng tính, không phải tên file Google Sheet. Bản này dùng tab `Support Requests` đã được sửa tên cho khớp với API. Nếu tên không khớp, API báo lỗi `Sheet tab not found` và không tự tạo tab khác; kiểm tra cả dấu cách đầu/cuối trước khi triển khai lại.

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

Điền một đơn thử ở `/booking`, giữ mã đơn trên trang kết quả, rồi mở Sheet → tab **Support Requests** (không có dấu cách đầu/cuối). Có dòng cùng mã đơn mới xác nhận việc ghi thành công. Do website gửi bằng `no-cors`, thông báo đã gửi đi không tự xác nhận Google đã ghi dữ liệu.

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

Nguồn đối chiếu: [Google Apps Script Web apps](https://developers.google.com/apps-script/guides/web), [Google – quyền ứng dụng web](https://developers.google.com/apps-script/manifest/web-app-api-executable), [Google – mở và sửa appsscript.json](https://developers.google.com/apps-script/concepts/manifests), [Google – cập nhật bản triển khai](https://developers.google.com/apps-script/concepts/deployments), [Google Content Service](https://developers.google.com/apps-script/guides/content#redirects), [MDN no-cors](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode).
