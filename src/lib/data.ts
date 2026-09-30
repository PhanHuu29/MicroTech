import type { ImageKey } from './images'
export const SERVICES: readonly { id: string; img: ImageKey; title: string; desc: string }[] = [
  { id: 'install', img: 'iconInstall', title: 'Cài phần mềm', desc: 'Office, driver, máy in, font và phần mềm chuyên dụng' },
  { id: 'trouble', img: 'iconFix', title: 'Xử lý lỗi', desc: 'Lỗi phần mềm, lỗi cập nhật, xung đột ứng dụng, máy chậm' },
  { id: 'it', img: 'iconIt', title: 'IT Support', desc: 'Hỗ trợ từ xa cho cá nhân và văn phòng' },
  { id: 'business', img: 'iconBusiness', title: 'Doanh nghiệp', desc: 'Triển khai phần mềm, bảo trì hệ thống công ty' },
]

export const DEVICES = ['Windows', 'macOS', 'Android', 'iPhone'] as const
export const OS_VERSIONS: Record<string, string[]> = {
  Windows: ['Windows 10', 'Windows 11', 'Khác'],
  macOS: ['macOS Sequoia', 'macOS Sonoma', 'macOS Ventura', 'Khác'],
  Android: ['Android 15', 'Android 14', 'Android 13', 'Khác'],
  iPhone: ['iOS 18', 'iOS 17', 'iOS 16', 'Khác'],
}
export const IPHONE_ISSUES = ['Cập nhật', 'Lỗi ứng dụng', 'Khôi phục thiết bị']

export const SLOTS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '19:00 - 20:00']

export const STATUSES = [
  { id: 'received', label: 'Đã nhận yêu cầu', msg: 'MicroTech đã nhận được yêu cầu của bạn' },
  { id: 'review', label: 'Đang xem xét', msg: 'Đang xem xét sự cố để báo giá' },
  { id: 'scheduled', label: 'Đã lên lịch', msg: 'Lịch hỗ trợ của bạn đã được xác nhận' },
  { id: 'progress', label: 'Đang xử lý', msg: 'Kỹ thuật viên đang xử lý yêu cầu của bạn' },
  { id: 'done', label: 'Hoàn tất', msg: 'Dịch vụ hỗ trợ đã hoàn tất' },
] as const
export type StatusId = (typeof STATUSES)[number]['id']

export const PRICING = [
  ['Office / Driver / Font / Máy in', '50.000đ'],
  ['Phần mềm thiết kế & dựng video', '80.000đ'],
  ['Gói phần mềm học tập / làm việc', '200.000đ'],
  ['Xử lý lỗi & hỗ trợ IT từ xa', '50.000đ'],
  ['Android / iPhone / Doanh nghiệp', 'Liên hệ'],
] as const
