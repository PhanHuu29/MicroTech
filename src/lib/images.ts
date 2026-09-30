/**
 * Toàn bộ ảnh trên website. Muốn thay ảnh: đổi đường dẫn bên dưới
 * – file nội bộ đặt trong public/images/ (ví dụ '/images/cover.jpg')
 * – hoặc dùng link ngoài (ví dụ 'https://cdn.example.com/cover.jpg').
 */

export const IMAGES = {
  logoIcon: '/images/logo-icon.png',
  logoText: '/images/logo-text.png',
  cover: '/images/cover.jpg',

  iconSupport: '/images/icon-support.svg',
  iconInstall: '/images/icon-install.svg',
  iconFix: '/images/icon-fix.svg',
  iconIt: '/images/icon-it.svg',
  iconBusiness: '/images/icon-business.svg',

  whyQuote: '/images/why-quote.svg',
  whySecure: '/images/why-secure.svg',
  whyRemote: '/images/why-remote.svg',

  socialFacebook: '/images/social-facebook.svg',
  socialYoutube: '/images/social-youtube.svg',
  socialZalo: '/images/icons8-zalo-100.png',
} as const

export type ImageKey = keyof typeof IMAGES

/**
 * Ảnh mặc định.
 * Settings.tsx dùng object này khi người dùng chưa upload ảnh tùy chỉnh.
 */
export const DEFAULT_SRC: Record<ImageKey, string> = {
  ...IMAGES,
}

/**
 * Danh sách ảnh xuất hiện trong trang Settings.
 *
 * max = kích thước file tối đa tính theo byte.
 */
export const IMAGE_SLOTS: Array<{
  key: ImageKey
  label: string
  max: number
}> = [
  {
    key: 'logoIcon',
    label: 'Logo biểu tượng',
    max: 500_000,
  },
  {
    key: 'logoText',
    label: 'Logo MicroTech',
    max: 800_000,
  },
  {
    key: 'cover',
    label: 'Ảnh cover',
    max: 3_000_000,
  },

  {
    key: 'iconSupport',
    label: 'Icon hỗ trợ từ xa',
    max: 500_000,
  },
  {
    key: 'iconInstall',
    label: 'Icon cài phần mềm',
    max: 500_000,
  },
  {
    key: 'iconFix',
    label: 'Icon xử lý lỗi',
    max: 500_000,
  },
  {
    key: 'iconIt',
    label: 'Icon IT Support',
    max: 500_000,
  },
  {
    key: 'iconBusiness',
    label: 'Icon doanh nghiệp',
    max: 500_000,
  },

  {
    key: 'whyQuote',
    label: 'Báo giá trước',
    max: 500_000,
  },
  {
    key: 'whySecure',
    label: 'Bảo mật thông tin',
    max: 500_000,
  },
  {
    key: 'whyRemote',
    label: 'Hỗ trợ từ xa',
    max: 500_000,
  },

  {
    key: 'socialFacebook',
    label: 'Facebook',
    max: 500_000,
  },
  {
    key: 'socialYoutube',
    label: 'YouTube',
    max: 500_000,
  },
  {
    key: 'socialZalo',
    label: 'Zalo',
    max: 500_000,
  },
]