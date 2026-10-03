import { createContext, useContext, useState, type ReactNode } from 'react'
import { CONFIG } from '../config'
import type { ImageKey } from './images'

export interface Settings {
  brand: string
  hotline: string
  email: string
  images: Partial<Record<ImageKey, string>>
  facebook: string
  youtube: string
  zalo: string
  socialEmail: string
  sheetScriptUrl: string
  sheetUrl: string
  showSheetOnSuccess: boolean
}
const DEFAULTS: Settings = {
  brand: CONFIG.brand, hotline: CONFIG.hotline, email: CONFIG.email, images: {},
  facebook: CONFIG.social.facebook, youtube: CONFIG.social.youtube,
  zalo: CONFIG.social.zalo, socialEmail: CONFIG.social.email,
  sheetScriptUrl: CONFIG.sheetScriptUrl, sheetUrl: CONFIG.sheetUrl,
  showSheetOnSuccess: CONFIG.showSheetOnSuccess,
}
const KEY = 'microtech.settings'
const load = (): Settings => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return DEFAULTS
    const o = stored as Partial<Settings> & { logo?: string; cover?: string }
    const strings = Object.fromEntries(Object.entries(o).filter(([k, v]) => k in DEFAULTS && typeof v === 'string'))
    return {
      ...DEFAULTS, ...strings,
      showSheetOnSuccess: typeof o.showSheetOnSuccess === 'boolean' ? o.showSheetOnSuccess : DEFAULTS.showSheetOnSuccess,
      images: { ...(o.logo ? { logoIcon: o.logo } : {}), ...(o.cover ? { cover: o.cover } : {}), ...(o.images || {}) },
    }
  } catch { return DEFAULTS }
}
interface Ctx { s: Settings; set: (p: Partial<Settings>) => boolean; reset: () => void }
const C = createContext<Ctx>({ s: DEFAULTS, set: () => false, reset: () => {} })
export const useSettings = () => useContext(C)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(load)
  const set = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch }
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { return false }
    setS(next)
    return true
  }
  const reset = () => {
    try { localStorage.removeItem(KEY) } catch { /* unavailable storage */ }
    setS(DEFAULTS)
  }
  return <C.Provider value={{ s, set, reset }}>{children}</C.Provider>
}

/** Thu nhỏ ảnh trước khi lưu cấu hình trên thiết bị. */
export function fileToDataUrl(file: File, maxW: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width), canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const context = canvas.getContext('2d')
      if (!context) { URL.revokeObjectURL(url); reject(new Error('Cannot process image')); return }
      context.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Cannot read image')) }
    img.src = url
  })
}
