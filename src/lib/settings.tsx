import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Order } from './orders'
import type { ImageKey } from './images'

export interface Settings {
  brand: string
  images: Partial<Record<ImageKey, string>> // data-URL overrides; missing = file in public/images
  facebook: string
  youtube: string
  zalo: string
  sheetScriptUrl: string // Google Apps Script web-app URL that receives each submission
  sheetUrl: string       // link to the personal Google Sheet
  showSheetOnSuccess: boolean
}
const DEFAULTS: Settings = { brand: 'MicroTech', images: {}, facebook: '', youtube: '', zalo: 'https://zalo.me/0377339643', sheetScriptUrl: '', sheetUrl: '', showSheetOnSuccess: false }
const KEY = 'microtech.settings'

const load = (): Settings => {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || '{}')
    const images = { ...(o.logo ? { logo: o.logo } : {}), ...(o.cover ? { cover: o.cover } : {}), ...(o.images || {}) } // migrate v1 fields
    return { ...DEFAULTS, ...o, images }
  } catch { return DEFAULTS }
}
interface Ctx { s: Settings; set: (p: Partial<Settings>) => boolean; reset: () => void }
const C = createContext<Ctx>({ s: DEFAULTS, set: () => false, reset: () => {} })
export const useSettings = () => useContext(C)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>(load)
  useEffect(() => { document.title = `${s.brand} – Đặt hỗ trợ IT online trong 1 phút` }, [s.brand])
  /** returns false when the browser storage quota is exceeded */
  const set = (p: Partial<Settings>) => {
    const next = { ...s, ...p }
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { return false }
    setS(next); return true
  }
  const reset = () => { try { localStorage.removeItem(KEY) } catch { /* ignore */ } setS(DEFAULTS) }
  return <C.Provider value={{ s, set, reset }}>{children}</C.Provider>
}

/** Downscale an uploaded image so it fits comfortably in localStorage. */
export function fileToDataUrl(file: File, maxW: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, maxW / img.width), c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('Không đọc được ảnh'))
    img.src = url
  })
}

/** Posts a submission to the Google Apps Script web app. `no-cors` means we can't read the reply, only detect network failure. */
export async function sendToSheet(scriptUrl: string, order: Order | Record<string, unknown>): Promise<boolean> {
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(scriptUrl)) return false
  try {
    await fetch(scriptUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(order) })
    return true
  } catch { return false }
}
