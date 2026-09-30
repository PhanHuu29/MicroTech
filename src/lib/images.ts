/**
 * Toàn bộ ảnh trên website.
 * Muốn thay ảnh: đổi đường dẫn bên dưới.
 *
 * File nội bộ đặt trong public/images/
 * Ví dụ: '/images/cover.jpg'
 *
 * Hoặc có thể dùng URL ảnh bên ngoài.
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
 * Settings.tsx sử dụng khi chưa có ảnh tùy chỉnh.
 */
export const DEFAULT_SRC: Record<ImageKey, string> = {
  ...IMAGES,
}

/**
 * Danh sách ảnh có thể thay đổi trong trang Settings.
 *
 * max = chiều rộng tối đa của ảnh sau khi resize (pixel).
 */
export const IMAGE_SLOTS: Array<{
  key: ImageKey
  label: string
  max: number
}> = [
  {
    key: 'logoIcon',
    label: 'Logo biểu tượng',
    max: 600,
  },
  {
    key: 'logoText',
    label: 'Logo MicroTech',
    max: 1200,
  },
  {
    key: 'cover',
    label: 'Ảnh cover',
    max: 1940,
  },

  {
    key: 'iconSupport',
    label: 'Icon hỗ trợ từ xa',
    max: 600,
  },
  {
    key: 'iconInstall',
    label: 'Icon cài phần mềm',
    max: 600,
  },
  {
    key: 'iconFix',
    label: 'Icon xử lý lỗi',
    max: 600,
  },
  {
    key: 'iconIt',
    label: 'Icon IT Support',
    max: 600,
  },
  {
    key: 'iconBusiness',
    label: 'Icon doanh nghiệp',
    max: 600,
  },

  {
    key: 'whyQuote',
    label: 'Báo giá trước',
    max: 600,
  },
  {
    key: 'whySecure',
    label: 'Bảo mật thông tin',
    max: 600,
  },
  {
    key: 'whyRemote',
    label: 'Hỗ trợ từ xa',
    max: 600,
  },

  {
    key: 'socialFacebook',
    label: 'Facebook',
    max: 300,
  },
  {
    key: 'socialYoutube',
    label: 'YouTube',
    max: 300,
  },
  {
    key: 'socialZalo',
    label: 'Zalo',
    max: 300,
  },
]