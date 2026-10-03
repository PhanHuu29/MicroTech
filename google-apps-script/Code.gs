/**
 * MicroTech: nhận đơn và đánh giá dịch vụ vào Google Sheet cá nhân.
 * Đã điền ID bảng tính MicroTech – Support Requests.
 * Sao chép mã này vào Apps Script rồi triển khai phiên bản mới dạng Ứng dụng web.
 */
const SPREADSHEET_ID = '1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w';
// Tên tab nhận đơn không có dấu cách đầu/cuối.
const SHEET_NAME = 'Support Requests';
const HEADERS = ['Mã đơn', 'Thời gian', 'Họ tên', 'SĐT', 'Email', 'Dịch vụ', 'Thiết bị', 'HĐH', 'Mô tả', 'Lịch', 'Hình thức', 'Giá', 'Trạng thái'];
const REVIEWS_SHEET_NAME = 'Reviews';
const REVIEW_HEADERS = ['Mã đánh giá', 'Thời gian', 'Tên hiển thị', 'Dịch vụ', 'Số sao', 'Nhận xét', 'Trạng thái', 'Mã xác nhận', 'Đồng ý công khai'];
const REVIEW_SERVICES = ['install', 'trouble', 'it', 'business'];

function output(value, callback) {
  const json = JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  if (callback) {
    // Chỉ nhận tên callback do frontend tạo, không cho chèn mã JavaScript.
    if (!/^mt_reviews_[a-f0-9]{32}$/.test(String(callback))) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, message: 'Invalid callback' })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function cell(value, maxLength) {
  const text = String(value == null ? '' : value).slice(0, maxLength || 5000);
  // Lưu nội dung người dùng dưới dạng văn bản, tránh biến thành công thức Sheet.
  return /^\s*[=+\-@]/.test(text) ? "'" + text : text;
}
function doGet(e) {
  const p = e && e.parameter || {};
  try {
    if (p.action === 'reviews') return output(publicReviews(p), p.callback);
    if (p.action === 'review-status') return output(reviewReceiptStatus(p), p.callback);
    if (p.action) throw new Error('Unknown action');
    return output({ ok: true, service: 'MicroTech booking endpoint' });
  } catch (error) {
    console.error(error);
    // Không đưa thông tin bảng tính, mã đơn, SĐT hoặc lỗi nội bộ ra API công khai.
    return output({ ok: false, message: 'Reviews unavailable' }, p.callback);
  }
}
function doPost(e) {
  let lock;
  let acquired = false;
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Missing request body');
    if (e.postData.contents.length > 25000) throw new Error('Request too large');
    const d = JSON.parse(e.postData.contents);
    if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('Invalid request');
    if (d.action === 'review') {
      validateReview(d);
      lock = LockService.getScriptLock();
      lock.waitLock(10000);
      acquired = true;
      return output(writeReview(d));
    }
    if (d.action && d.action !== 'booking') throw new Error('Unknown action');
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

function reviewSpreadsheet() {
  if (SPREADSHEET_ID === 'DAN_ID_GOOGLE_SHEET_CUA_BAN') throw new Error('Configure SPREADSHEET_ID first');
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}
function assertReviewHeaders(sheet) {
  if (sheet.getLastRow() === 0) return;
  const headers = sheet.getRange(1, 1, 1, REVIEW_HEADERS.length).getValues()[0];
  if (!headers || REVIEW_HEADERS.some(function (header, index) { return String(headers[index]) !== header; })) {
    throw new Error('Reviews tab has unexpected columns; keep existing data and check its headers');
  }
}
function ensureReviewsSheet() {
  const spreadsheet = reviewSpreadsheet();
  const sheet = spreadsheet.getSheetByName(REVIEWS_SHEET_NAME) || spreadsheet.insertSheet(REVIEWS_SHEET_NAME);
  assertReviewHeaders(sheet);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(REVIEW_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, REVIEW_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}
function validateReview(d) {
  if (!/^MT-RV-[a-f0-9-]{36}$/.test(String(d.id || ''))) throw new Error('Invalid review ID');
  if (!/^[a-f0-9-]{36}$/.test(String(d.receipt || ''))) throw new Error('Invalid receipt');
  if (typeof d.name !== 'string' || d.name.trim().length < 2 || d.name.trim().length > 60) throw new Error('Invalid display name');
  if (!Number.isInteger(d.rating) || d.rating < 1 || d.rating > 5) throw new Error('Rating must be 1 to 5');
  if (REVIEW_SERVICES.indexOf(d.service) < 0) throw new Error('Invalid service');
  if (typeof d.comment !== 'string' || d.comment.trim().length < 10 || d.comment.trim().length > 1200) throw new Error('Invalid review comment');
  if (d.consent !== true) throw new Error('Publishing consent is required');
}
function findReviewRow(sheet, id) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  const match = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  return match ? sheet.getRange(match.getRow(), 1, 1, REVIEW_HEADERS.length).getValues()[0] : null;
}
function writeReview(d) {
  const sheet = ensureReviewsSheet();
  const previous = findReviewRow(sheet, d.id);
  if (previous) {
    if (String(previous[7]) !== d.receipt) throw new Error('Invalid receipt');
    return { ok: true, kind: 'review', id: d.id, status: 'pending', duplicate: true };
  }
  // Dùng thời gian máy chủ. Mọi số sao đều chờ duyệt, không tự tạo đánh giá mẫu.
  sheet.appendRow([d.id, new Date(), cell(d.name.trim(), 60), d.service, d.rating, cell(d.comment.trim(), 1200), 'Chờ duyệt', d.receipt, true]);
  SpreadsheetApp.flush();
  return { ok: true, kind: 'review', id: d.id, status: 'pending' };
}
function reviewReceiptStatus(p) {
  const response = { ok: true, kind: 'review-status', received: false };
  if (!/^MT-RV-[a-f0-9-]{36}$/.test(String(p.id || '')) || !/^[a-f0-9-]{36}$/.test(String(p.receipt || ''))) return response;
  const sheet = reviewSpreadsheet().getSheetByName(REVIEWS_SHEET_NAME);
  if (sheet) assertReviewHeaders(sheet);
  const row = findReviewRow(sheet, p.id);
  response.received = !!row && String(row[7]) === p.receipt;
  return response;
}
function publicReviews(p) {
  const sheet = reviewSpreadsheet().getSheetByName(REVIEWS_SHEET_NAME);
  if (sheet) assertReviewHeaders(sheet);
  const rows = sheet && sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, REVIEW_HEADERS.length).getValues() : [];
  const reviews = [];
  const distribution = [0, 0, 0, 0, 0];
  rows.forEach(function (row) {
    const status = String(row[6]).trim().toLowerCase();
    const consent = row[8] === true || String(row[8]).trim().toLowerCase() === 'true';
    const rating = Number(row[4]);
    const createdAt = new Date(row[1]).getTime();
    if ((status !== 'đã duyệt' && status !== 'approved') || !consent || !Number.isInteger(rating) || rating < 1 || rating > 5 || !Number.isFinite(createdAt) || REVIEW_SERVICES.indexOf(String(row[3])) < 0) return;
    distribution[rating - 1]++;
    reviews.push({ id: String(row[0]), createdAt: createdAt, name: String(row[2]), service: String(row[3]), rating: rating, comment: String(row[5]) });
  });
  const count = reviews.length;
  const summary = { count: count, average: count ? distribution.reduce(function (sum, n, index) { return sum + n * (index + 1); }, 0) / count : 0, distribution: distribution };
  reviews.sort(function (a, b) { return b.createdAt - a.createdAt || b.id.localeCompare(a.id); });
  const filtered = reviews.filter(function (r) { return (!p.service || r.service === p.service) && (!p.rating || String(r.rating) === p.rating); });
  const offset = Math.max(0, Math.floor(Number(p.offset) || 0));
  const limit = Math.max(1, Math.min(12, Math.floor(Number(p.limit) || 6)));
  return { ok: true, kind: 'reviews', reviews: filtered.slice(offset, offset + limit), summary: summary, total: filtered.length, nextOffset: offset + limit < filtered.length ? offset + limit : null };
}

/** Chạy một lần trong trình chỉnh sửa để tạo tab và danh sách trạng thái duyệt. */
function setupReviews() {
  const sheet = ensureReviewsSheet();
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(['Chờ duyệt', 'Đã duyệt', 'Ẩn'], true).setAllowInvalid(false).build();
  const remaining = Math.max(1, sheet.getMaxRows() - 1);
  sheet.getRange(2, 7, remaining, 1).setDataValidation(rule);
  sheet.getRange(2, 2, remaining, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sheet.setColumnWidth(6, 360);
  sheet.getRange(2, 6, remaining, 1).setWrap(true);
  SpreadsheetApp.flush();
  console.log('Tab Reviews đã sẵn sàng. Đổi cột G thành Đã duyệt để công khai, hoặc Ẩn để gỡ khỏi website.');
}

/** Thử luồng đặt đơn từ trình chỉnh sửa mà không gọi doPost trống. */
function testWriteOrder() {
  const now = Date.now();
  const result = JSON.parse(doPost({ postData: { contents: JSON.stringify({ code: 'MT-TEST-' + now, createdAt: now, name: 'TEST MicroTech', phone: '0000000000', email: 'microtech-test@example.com', service: 'TEST ghi Sheet', device: 'Windows', os: 'Windows 11', issue: 'Đơn thử, không phải yêu cầu khách hàng.', urgency: 'TEST', method: 'Hỗ trợ từ xa', price: 'TEST' }) } }).getContent());
  console.log(JSON.stringify(result));
  if (!result.ok) throw new Error(result.message);
  return result;
}
