/** Cấu hình website – chỉnh sửa trực tiếp trong file này. Đường dẫn ảnh nằm ở src/lib/images.ts */
export const CONFIG = {
  brand: 'MicroTech',
  hotline: '0377 339 643',
  email: '[email MicroTech]',
  // Liên kết mạng xã hội. Để chuỗi rỗng '' để ẩn icon tương ứng.
  social: {
    facebook: '',
    youtube: '',
    zalo: 'https://zalo.me/0377339643',
  },
  // Google Sheet: mỗi đơn đặt hỗ trợ sẽ được ghi thêm 1 dòng.
  // sheetScriptUrl = URL "/exec" của Google Apps Script (xem README). Để rỗng nếu chưa dùng.
  // Vùng bấm được đặt lên nút "ĐẶT HỖ TRỢ NGAY" vẽ sẵn trong ảnh cover (đơn vị % theo kích thước ảnh).
  // Đổi ảnh cover thì chỉnh 4 số này cho trùng với nút trong ảnh mới.
  coverCta: { left: 6, top: 59.8, width: 28.8, height: 12.8 },
  sheetScriptUrl: '',
  sheetUrl: '',            // liên kết tới bảng tính của bạn (dùng cho mục đích tham khảo)
  showSheetOnSuccess: false, // true = hiện liên kết sheet cho khách sau khi đặt lịch (không khuyến nghị)
}
