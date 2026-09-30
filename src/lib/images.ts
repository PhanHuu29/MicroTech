/**
 * Toàn bộ ảnh trên website. Muốn thay ảnh: đổi đường dẫn bên dưới
 * – file nội bộ đặt trong public/images/ (ví dụ '/images/cover.jpg')
 * – hoặc dùng link ngoài (ví dụ 'https://cdn.example.com/cover.jpg').
 */
export const IMAGES = {
  logoIcon: '/images/logo-icon.png',        // Chữ M (ô bo góc) – chuyển động 3D khi click, ~1.2:1
  logoText: '/images/logo-text.png',        // Chữ "MicroTech" – đứng yên, chỉ nổi lên khi click/hover, nền trong suốt
  cover: '/images/cover.jpg',               // Ảnh bìa NGUYÊN BANNER (~1940x810, tỉ lệ 2.4:1) gồm cả chữ & nút. Nếu đổi ảnh, chỉnh lại vị trí nút bấm: CONFIG.coverCta trong src/config.ts
  iconSupport: '/images/icon-support.svg',  // Thẻ nổi "Hỗ trợ từ xa"
  iconInstall: '/images/icon-install.svg',  // Dịch vụ: Cài phần mềm
  iconFix: '/images/icon-fix.svg',          // Dịch vụ: Xử lý lỗi
  iconIt: '/images/icon-it.svg',            // Dịch vụ: IT Support
  iconBusiness: '/images/icon-business.svg',// Dịch vụ: Doanh nghiệp
  whyQuote: '/images/why-quote.svg',        // Vì sao chọn: Báo giá trước
  whySecure: '/images/why-secure.svg',      // Vì sao chọn: Bảo mật thông tin
  whyRemote: '/images/why-remote.svg',      // Vì sao chọn: Hỗ trợ từ xa
  socialFacebook: '/images/social-facebook.svg',
  socialYoutube: '/images/social-youtube.svg',
  socialZalo: '/images/icons8-zalo-100.png',
} as const
export type ImageKey = keyof typeof IMAGES
