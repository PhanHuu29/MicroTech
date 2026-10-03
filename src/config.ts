/**
 * CẤU HÌNH WEBSITE — CHỈ CHỈNH TRONG FILE NÀY.
 * Website không có trang Settings và không đọc cấu hình quản trị từ trình duyệt.
 * Sau khi sửa: chạy pnpm build rồi cập nhật bản triển khai.
 * Hướng dẫn ngắn: CHEN_LINK_SHEET_VA_API.md.
 */
export const CONFIG = {
  brand: 'MicroTech',
  hotline: '0377 339 643',
  email: '',
  social: {
    facebook: 'https://www.facebook.com/microtech247',
    youtube: '',
    zalo: 'https://zalo.me/0377339643',
    email: 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox',
  },
  // [1] API NHẬN ĐƠN: dán URL Ứng dụng web từ hộp triển khai Google Apps Script.
  // Mẫu: https://script.google.com/macros/s/DEPLOYMENT_ID_CUA_BAN/exec
  // Không dán link bảng tính, link /dev, link /macros/echo hay API key vào đây.
  sheetScriptUrl: 'https://script.google.com/macros/s/AKfycbwNSnefgqZ0q8WSaNYNSzjFe1RifxT0YscvCsCHLplLwhidoTi5XxH0kP3vr-knU_imEA/exec',

  // [2] LINK GOOGLE SHEET: dán đường dẫn đầy đủ của bảng tính cá nhân.
  // Mẫu: https://docs.google.com/spreadsheets/d/ID_SHEET_CUA_BAN/edit
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1nw9lZJPmc1eJ33v_hBlNVruvgOD9_vjldQM_ut5X08w/edit',

  // [3] HIỆN LINK SAU KHI ĐẶT: true = hiện nút Mở Google Sheet; false = ẩn.
  // Mục này không ảnh hưởng việc gửi đơn qua API và không tự cấp quyền xem Sheet.
  showSheetOnSuccess: false,

  // Mặc định cho lần truy cập đầu; khách vẫn có thể đổi ngôn ngữ / sáng-tối.
  defaultLanguage: 'vi' as 'vi' | 'en',
  defaultTheme: 'system' as 'light' | 'dark' | 'system',
}
