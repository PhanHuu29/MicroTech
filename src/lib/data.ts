import type { ImageKey } from './images'
export const SERVICES: readonly { id: string; img: ImageKey; title: string; titleEn: string; desc: string; descEn: string }[] = [
  { id: 'install', img: 'iconInstall', title: 'Cài phần mềm', titleEn: 'Software setup', desc: 'Office, driver, máy in, font và phần mềm chuyên dụng', descEn: 'Office, drivers, printers, fonts and specialist apps' },
  { id: 'trouble', img: 'iconFix', title: 'Xử lý lỗi', titleEn: 'Troubleshooting', desc: 'Lỗi phần mềm, lỗi cập nhật, xung đột ứng dụng, máy chậm', descEn: 'App errors, updates, software conflicts and slow devices' },
  { id: 'it', img: 'iconIt', title: 'IT Support', titleEn: 'IT Support', desc: 'Hỗ trợ từ xa cho cá nhân và văn phòng', descEn: 'Remote assistance for individuals and small offices' },
  { id: 'business', img: 'iconBusiness', title: 'Doanh nghiệp', titleEn: 'Business IT', desc: 'Triển khai phần mềm, bảo trì hệ thống công ty', descEn: 'Software deployment and ongoing business IT support' },
]
export const DEVICES = ['Windows', 'macOS', 'Android', 'iPhone'] as const
export const OS_VERSIONS: Record<string, string[]> = {
  Windows: ['Windows 11', 'Windows 10', 'Khác'],
  macOS: ['macOS Sequoia', 'macOS Sonoma', 'macOS Ventura', 'Khác'],
  Android: ['Android 15', 'Android 14', 'Android 13', 'Khác'],
  iPhone: ['iOS 18', 'iOS 17', 'iOS 16', 'Khác'],
}
export const IPHONE_ISSUES = [
  ['Cập nhật', 'Software update'], ['Lỗi ứng dụng', 'App issue'], ['Khôi phục thiết bị', 'Device restore'],
] as const
export const SLOTS = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '19:00 - 20:00']
export const URGENCY = { '30m': ['Trong 30 phút', 'Within 30 minutes'], today: ['Trong hôm nay', 'Today'], schedule: ['Chọn giờ hẹn', 'Schedule a time'] } as const
export type UrgencyId = keyof typeof URGENCY
export const METHODS = { remote: ['Hỗ trợ từ xa', 'Remote support'], onsite: ['Hỗ trợ tại chỗ', 'On-site support'] } as const
export const STATUSES = [
  { id: 'received', label: 'Đã lưu yêu cầu', labelEn: 'Request saved', msg: 'Yêu cầu đã được lưu trên thiết bị này. MicroTech sẽ xác nhận lịch qua Zalo hoặc điện thoại.', msgEn: 'Your request is saved on this device. MicroTech will confirm the appointment via Zalo or phone.' },
  { id: 'review', label: 'Đang xem xét', labelEn: 'Under review', msg: 'Đang xem xét sự cố để báo giá', msgEn: 'We are reviewing your issue to prepare a quote.' },
  { id: 'scheduled', label: 'Đã lên lịch', labelEn: 'Scheduled', msg: 'Lịch hỗ trợ của bạn đã được xác nhận', msgEn: 'Your support appointment has been confirmed.' },
  { id: 'progress', label: 'Đang xử lý', labelEn: 'In progress', msg: 'Kỹ thuật viên đang xử lý yêu cầu của bạn', msgEn: 'A technician is working on your request.' },
  { id: 'done', label: 'Hoàn tất', labelEn: 'Completed', msg: 'Dịch vụ hỗ trợ đã hoàn tất', msgEn: 'Your support service has been completed.' },
] as const
export type StatusId = (typeof STATUSES)[number]['id']
export const PRICING = [
  { title: 'Office / Driver / Font / Máy in', titleEn: 'Office / Drivers / Fonts / Printers', price: 50000 },
  { title: 'Phần mềm thiết kế & dựng video', titleEn: 'Design & video editing software', price: 80000 },
  { title: 'Gói phần mềm học tập / làm việc', titleEn: 'Study / work software bundle', price: 200000 },
  { title: 'Xử lý lỗi & hỗ trợ IT từ xa', titleEn: 'Troubleshooting & remote IT support', price: 50000 },
  { title: 'Android / iPhone / Doanh nghiệp', titleEn: 'Android / iPhone / Business IT', price: null },
] as const
