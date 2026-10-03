# Hướng dẫn MicroTech – glass, Việt–Anh, sáng/tối và Google Sheet

**Tính năng đánh giá dịch vụ:** xem `HUONG_DAN_DANH_GIA.md` để cập nhật Apps Script và tạo tab Reviews trước khi sử dụng. API đặt đơn đã hoạt động; tính năng đánh giá mới cần triển khai mã Code.gs 1.2.0.

**Bản 1.2.0 đã sửa tên tab nhận đơn: `Support Requests` không có dấu cách đầu/cuối. API `/exec` đã ghi được đơn TEST vào Sheet và dòng dữ liệu đã được đọc lại ngày 03/10/2026.** Cấu hình website chỉ chỉnh trong mã nguồn; trang Settings và việc lưu cấu hình quản trị trong trình duyệt đã được bỏ. Xem **`CHEN_LINK_SHEET_VA_API.md`** để kiểm tra kết nối và dùng hàm `testWriteOrder` khi chạy từ trình chỉnh sửa Apps Script.

## 1. Những phần đã nâng cấp

- Header, thẻ dịch vụ, form và khối liên hệ có nền kính mờ, viền sáng và bóng đổ.
- Cover giữ hình laptop của bản gốc; chữ và nút chuyển thành nội dung web để đổi được Việt–Anh.
- Nút Zalo mở đúng đường dẫn; hotline dùng `tel:` để mở thao tác gọi trên thiết bị hỗ trợ.
- Nút đặt lịch nâng lên khi rê chuột, có gợn sáng khi bấm. Trên mobile, nút đặt nổi ở cạnh dưới xuất hiện khi nút chính rời màn hình, giúp liên hệ trên cover vẫn dễ bấm. Trang đặt lịch và kết quả có hiệu ứng xuất hiện.
- VI / EN trên header đổi ngôn ngữ toàn bộ giao diện, kể cả form, lỗi nhập liệu, giá và tra cứu.
- Biểu tượng mặt trăng / mặt trời đổi sáng–tối. Mặc định theo thiết bị, sau khi tự chọn sẽ nhớ lựa chọn.
- Ngôn ngữ và theme được giữ khi tải lại trang. Đổi ngôn ngữ trong lúc điền form không xóa nội dung.
- Người bật giảm chuyển động trên thiết bị sẽ thấy giao diện ít chuyển động hơn.

## 2. Phân biệt hai đường dẫn Google

| Cấu hình | Dán đường dẫn nào? | Chức năng |
| --- | --- | --- |
| `sheetScriptUrl` | `https://script.google.com/macros/s/DEPLOYMENT_ID/exec` | Nhận dữ liệu đơn và ghi thêm dòng |
| `sheetUrl` | `https://docs.google.com/spreadsheets/d/SHEET_ID/edit` | Mở bảng tính khi bấm nút |
| `showSheetOnSuccess` | `true` hoặc `false` | Bật/tắt nút mở Sheet sau khi khách điền đơn |

Dán link bảng tính vào `sheetScriptUrl` sẽ không ghi được đơn. Ngược lại, link Script không dùng để mở bảng tính.

**URL bản cũ là `script.googleusercontent.com/macros/echo?...`: đây là link chuyển hướng dùng một lần của Google Content Service. Bản này đã điền URL triển khai `/exec` ổn định bạn gửi. Không thay bằng link `/echo` hoặc `/dev`.**

## 3. Tạo Sheet và mã nhận đơn

1. Mở [Sheet MicroTech – Support Requests](https://docs.google.com/spreadsheets/d/1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w/edit), hoặc bảng tính khác nếu bạn muốn đổi.
2. Trong link `https://docs.google.com/spreadsheets/d/ABC123xyz/edit`, phần `ABC123xyz` là ID bảng tính.
3. Vào **Tiện ích mở rộng → Apps Script**.
4. Mở file `google-apps-script/Code.gs` trong bộ mã nguồn này. Sao chép toàn bộ mã vào Apps Script.
5. Bản ZIP đã điền dòng cấu hình:

```js
const SPREADSHEET_ID = '1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w';
const SHEET_NAME = 'Support Requests'; // không có dấu cách đầu/cuối
```

Chỉ khi đổi sang bảng tính khác mới thay thành:

```js
const SPREADSHEET_ID = 'ABC123xyz'; // thay bằng ID THẬT của bạn
```

6. Giữ `SHEET_NAME = 'Support Requests'` cho bảng bạn gửi, hoặc thay đúng tên tab đang có nếu đổi bảng. Khi không tìm thấy tab, mã báo lỗi và không tạo tab khác để tránh ghi nhầm chỗ. Lỗi trước đây do tên tab thực tế có một dấu cách đầu trong khi API đang chạy tìm tên không có dấu cách; tên tab đã được sửa cho khớp.
7. Lưu mã. Trong cài đặt dự án Apps Script và **Tệp → Cài đặt** của Sheet, đặt múi giờ Việt Nam nếu muốn hiển thị giờ Việt Nam; bảng bạn gửi hiện có múi giờ America/Los_Angeles. Định dạng cột B trong Sheet thành ngày và giờ.
8. Để thử ngay trong trình chỉnh sửa, chọn **`testWriteOrder` → Chạy**. Hàm tự cung cấp dữ liệu mẫu, gọi `doPost` và ghi một dòng TEST. Tìm mã `MT-TEST-...` trong Sheet để xác nhận. Chọn trực tiếp `doPost` rồi bấm Chạy sẽ báo `Missing request body` vì chưa có dữ liệu HTTP POST. Sau khi triển khai API, thử thêm một đơn trên form `/booking` để kiểm tra khách chưa đăng nhập gửi được đơn.

Bảng sẽ có 13 cột: Mã đơn, Thời gian, Họ tên, SĐT, Email, Dịch vụ, Thiết bị, HĐH, Mô tả, Lịch, Hình thức, Giá, Trạng thái. Nếu dùng một tab cũ có cột khác thứ tự, đổi sang một tên tab mới trước khi thử.

Mã có kiểm tra dữ liệu, giữ SĐT dạng văn bản, tránh biến nội dung nhập thành công thức, và không thêm dòng trùng khi gửi lại cùng mã đơn. Mã đơn mới có phần ngẫu nhiên để hạn chế trùng giữa các khách.

## 4. Triển khai Apps Script và lấy URL nhận đơn

1. Chọn **Triển khai → Bản triển khai mới**.
2. Chọn loại **Ứng dụng web**.
3. **Thực thi với tư cách:** tài khoản của bạn.
4. **Ai có quyền truy cập:** Bất kỳ ai, để khách không phải đăng nhập Google mới gửi được đơn. Nếu tài khoản Workspace không có lựa chọn này, cần kiểm tra giới hạn của tổ chức.
5. Bấm **Triển khai**, cấp quyền cho mã của chính bạn.
6. Sao chép URL ứng dụng web kết thúc bằng `/exec` ngay trong hộp triển khai.
7. Đừng sao chép URL `googleusercontent.com` sau khi mở link trong trình duyệt: đó là URL chuyển hướng.

Khi sửa mã Apps Script sau này, vào quản lý bản triển khai, chọn phiên bản mới rồi triển khai lại. Cập nhật website nếu URL `/exec` thay đổi.

## 5. Chèn link vào website cho mọi khách

Mở `src/config.ts`. Chỉ thay ba giá trị sau, giữ các mục còn lại:

Bản ZIP đã điền đúng hai link; nút mở Sheet hiện được ẩn. Ví dụ bên dưới chỉ dùng khi bạn đổi sang bảng tính hoặc bản triển khai khác.

```ts
sheetScriptUrl: 'https://script.google.com/macros/s/DEPLOYMENT_ID_THAT/exec',
sheetUrl: 'https://docs.google.com/spreadsheets/d/SHEET_ID_THAT/edit',
showSheetOnSuccess: true,
```

- Muốn khách điền xong thấy nút **Mở Google Sheet**: đặt `showSheetOnSuccess: true` và điền link Sheet hợp lệ.
- Muốn ẩn nút mở Sheet với khách: đặt `showSheetOnSuccess: false`; bạn vẫn mở bảng tính trực tiếp bằng link riêng.
- Link không tự cấp quyền xem. Giữ Sheet chứa nhiều khách ở chế độ riêng tư; nếu cần công khai thông tin, dùng bảng chia sẻ riêng không chứa thông tin của các khách khác.
- Nếu Sheet riêng tư, bạn vẫn mở được khi đăng nhập tài khoản có quyền; khách có thể gặp yêu cầu cấp quyền.

Link Sheet chỉ là một nút mở bảng tính, không ảnh hưởng việc ghi đơn. Việc ghi đơn phụ thuộc URL Script và bản triển khai của bạn.

## 6. Chỉ chỉnh cấu hình trong mã nguồn

| Muốn thay gì? | Sửa ở đâu? |
| --- | --- |
| Tên thương hiệu, hotline, email, Zalo, mạng xã hội | `src/config.ts` |
| API nhận đơn, link Sheet, bật/tắt nút mở Sheet | `src/config.ts`, ba mục có chú thích `[1]`, `[2]`, `[3]` |
| Mặc định Việt/Anh và sáng/tối | `src/config.ts` |
| Logo, cover, icon | `src/lib/images.ts` hoặc thay file ảnh trong `public/images/` |
| Nội dung dịch vụ, giá, khung giờ, bản dịch tương ứng | `src/lib/data.ts` |

Lưu file, chạy `pnpm.cmd build` rồi cập nhật mã lên Vercel để mọi khách nhận bản mới. Đổi cấu hình trong trình duyệt hoặc dữ liệu `microtech.settings` còn lại từ bản cũ không ảnh hưởng bản mới.

Website không còn giao diện hay đường dẫn quản trị Settings. Nút VI/EN và sáng/tối vẫn dành cho khách chọn giao diện, chỉ ghi nhớ ngôn ngữ/theme trên thiết bị của khách.

Để thử kết nối, mở `/booking`, điền một đơn thử đủ bốn bước, bấm xác nhận rồi mở tab **Support Requests** (không có dấu cách đầu/cuối) trong Google Sheet. Tìm đúng mã đơn được hiển thị trên trang kết quả. Có dòng cùng mã đơn mới xác nhận việc ghi đã thành công.

## 7. Chèn Zalo và hotline trên cover

Trong `src/config.ts`:

```ts
hotline: '0377 339 643',
social: {
  facebook: 'https://www.facebook.com/microtech247',
  youtube: '',
  zalo: 'https://zalo.me/0377339643',
  email: 'mailto:email-cua-ban@example.com',
},
```

Số hotline có thể có dấu cách để dễ đọc; website tự bỏ khoảng cách trong link gọi. Link Zalo lấy số liên kết với tài khoản Zalo thật của bạn. Trên máy tính, link `tel:` cần ứng dụng hỗ trợ gọi.

Để trống Zalo hoặc hotline sẽ ẩn nút tương ứng. Lưu cấu hình trong mã nguồn, chạy build rồi triển khai lại.

## 8. Đổi mặc định ngôn ngữ và theme

Trong `src/config.ts`:

```ts
defaultLanguage: 'vi' as 'vi' | 'en',
defaultTheme: 'system' as 'light' | 'dark' | 'system',
```

`defaultLanguage`: `vi` là tiếng Việt, `en` là tiếng Anh. `defaultTheme`: `system` theo thiết bị, `light` luôn sáng lúc mở lần đầu, `dark` luôn tối lúc mở lần đầu.

Lựa chọn khách đã lưu ưu tiên hơn mặc định. Nội dung song ngữ của trang nằm trong các file `src/pages/`, dịch vụ/giá nằm trong `src/lib/data.ts`.

Ảnh vẫn dùng file `public/images/cover.jpg` của bạn. Website chỉ hiển thị phần minh họa bên phải để tránh chữ tiếng Việt nằm trong ảnh khi chọn English. Muốn giữ nguyên cả một ảnh cover mới, cần dùng ảnh không có chữ rồi điều chỉnh phần crop trong `src/styles.css`.

## 9. Chạy và cập nhật repo hiện có trên Windows

Giải nén, sao lưu thư mục MicroTech hiện có. Chép mã mới vào repo hiện tại và giữ thư mục `.git` của repo đó. ZIP cập nhật không kèm `.git`, `node_modules` hay bản build cũ.

**Nếu chép đè vào thư mục cũ, xóa hai file `src/pages/Settings.tsx` và `src/lib/settings.tsx`.** Giải nén không tự xóa các file cũ đã bị bỏ. Bạn cũng có thể chạy bản mới từ một thư mục giải nén sạch.

Trong Command Prompt tại thư mục có `package.json`:

```bat
npm.cmd install -g pnpm@9.12.0
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

Khi sẵn sàng:

```bat
pnpm.cmd build
pnpm.cmd test:sheet
git add .
git commit -m "Configure MicroTech in source only"
git push origin main
```

Nếu đã có pnpm 9.12.0, bỏ qua lệnh cài pnpm. Dùng `.cmd` trên PowerShell giúp tránh lỗi chặn `npm.ps1` / `pnpm.ps1`.

Vercel: Framework Preset **Vite**, Build Command **pnpm build**, Output Directory **dist**. File `vercel.json` đã thêm rewrite để mở trực tiếp `/booking`, `/pricing`, `/track` hoặc tải lại các trang đó.

## 10. Kiểm tra sau khi cấu hình thật

| Kiểm tra | Kết quả cần thấy |
| --- | --- |
| Bấm VI / EN | Header, cover, form và lỗi đổi ngôn ngữ |
| Bấm mặt trăng / mặt trời rồi tải lại | Giữ chế độ bạn chọn |
| Bấm Zalo / hotline trên cover | Mở đúng link / số điện thoại |
| Điền và gửi đơn thử | Xuất hiện dòng có cùng mã đơn trong tab Support Requests |
| Điền form 4 bước | Có mã đơn, thông tin tóm tắt và liên hệ nhanh |
| Bật link Sheet | Trang kết quả có nút Mở Google Sheet |
| Tắt link Sheet | Trang kết quả không hiển thị nút đó |
| Mở `/settings` của bản cũ | Hiện Không tìm thấy trang, không có form sửa cấu hình |

Website dùng `no-cors`, nên **“đã gửi đi” không khẳng định Google đã ghi thành công**: cần kiểm tra dòng trong Sheet. Nếu không thấy dòng, kiểm tra ID, quyền triển khai, URL `/exec`, phiên bản mã mới và mục Executions của Apps Script.

Tra cứu hiện vẫn chỉ dùng dữ liệu trên cùng trình duyệt/thiết bị đặt đơn; chưa lấy trạng thái cập nhật từ Sheet. Việc đổi trạng thái trong Sheet không tự đổi trên trang tra cứu. Tệp ảnh/video trên form chỉ ghi tên, chưa tải tệp lên Drive; gửi tệp qua Zalo.

## Tài liệu đối chiếu

- [Google Apps Script – Web apps](https://developers.google.com/apps-script/guides/web)
- [Google Content Service – Redirects](https://developers.google.com/apps-script/guides/content#redirects)
- [MDN – Request mode / no-cors](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode)
- [Vercel – Vite SPA deep linking](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)
