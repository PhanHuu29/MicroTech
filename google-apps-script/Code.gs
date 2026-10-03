/**
 * MicroTech: nhận đơn từ website vào Google Sheet cá nhân.
 * Đã điền ID bảng tính MicroTech – Support Requests.
 * Sao chép mã này vào Apps Script rồi triển khai phiên bản mới dạng Ứng dụng web.
 */
const SPREADSHEET_ID = '1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w';
// Tên tab hiện có bắt đầu bằng một dấu cách. Giữ nguyên dấu cách trong dấu nháy.
const SHEET_NAME = 'Support Requests';
const HEADERS = ['Mã đơn', 'Thời gian', 'Họ tên', 'SĐT', 'Email', 'Dịch vụ', 'Thiết bị', 'HĐH', 'Mô tả', 'Lịch', 'Hình thức', 'Giá', 'Trạng thái'];

function output(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function cell(value, maxLength) {
  const text = String(value == null ? '' : value).slice(0, maxLength || 5000);
  // Lưu nội dung người dùng dưới dạng văn bản, tránh biến thành công thức Sheet.
  return /^\s*[=+\-@]/.test(text) ? "'" + text : text;
}
function doGet() {
  return output({ ok: true, service: 'MicroTech booking endpoint' });
}
function doPost(e) {
  let lock;
  let acquired = false;
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Missing request body');
    if (e.postData.contents.length > 25000) throw new Error('Request too large');
    const d = JSON.parse(e.postData.contents);
    if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('Invalid request');
    if (!/^MT-(?:TEST-)?[A-Za-z0-9-]{1,60}$/.test(String(d.code || ''))) throw new Error('Invalid order code');
    ['name', 'phone', 'email', 'service', 'device', 'os', 'issue', 'method'].forEach(function (key) {
      if (typeof d[key] !== 'string' || !d[key].trim()) throw new Error('Missing field: ' + key);
    });
    if (!Number.isFinite(d.createdAt) || !Number.isFinite(new Date(d.createdAt).getTime())) throw new Error('Invalid timestamp');
    if (SPREADSHEET_ID === 'DAN_ID_GOOGLE_SHEET_CUA_BAN') throw new Error('Configure SPREADSHEET_ID first');
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    acquired = true;
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet tab not found: "' + SHEET_NAME + '"');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    // Thử gửi lại cùng mã đơn không tạo thêm một đơn trùng.
    if (sheet.getLastRow() > 1 && sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(d.code).matchEntireCell(true).findNext()) {
      return output({ ok: true, duplicate: true, code: d.code });
    }
    sheet.appendRow([
      cell(d.code, 80), new Date(d.createdAt), cell(d.name, 100), "'" + String(d.phone).slice(0, 30),
      cell(d.email, 200), cell(d.service, 120), cell(d.device, 120), cell(d.os, 120), cell(d.issue, 4000),
      cell(d.date ? d.date + ' ' + (d.slot || '') : d.urgency, 120), cell(d.method, 120), cell(d.price, 120), 'Đã nhận yêu cầu',
    ]);
    SpreadsheetApp.flush();
    return output({ ok: true, code: d.code });
  } catch (error) {
    console.error(error);
    return output({ ok: false, message: String(error && error.message || error) });
  } finally {
    if (lock && acquired) lock.releaseLock();
  }
}
