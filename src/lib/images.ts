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

  socialFacebook: '/images/icons8-facebook-100.png',
  socialYoutube: '/images/social-youtube.svg',
  socialZalo: '/images/icons8-zalo-100.png',
  socialEmail: '/images/icons8-gmail-100.png',
} as const

export type ImageKey = keyof typeof IMAGES
