import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { CONFIG } from '../config'

export type Language = 'vi' | 'en'
export type Theme = 'light' | 'dark'
export type Translate = (vi: string, en: string) => string
const read = (key: string) => { try { return localStorage.getItem(key) } catch { return null } }
const initialLanguage = (): Language => read('microtech.language') === 'en' ? 'en' : read('microtech.language') === 'vi' ? 'vi' : CONFIG.defaultLanguage
const initialTheme = (): Theme => {
  const stored = read('microtech.theme')
  if (stored === 'light' || stored === 'dark') return stored
  return CONFIG.defaultTheme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : CONFIG.defaultTheme
}
interface Preferences {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  toggleTheme: () => void
  tr: Translate
}
const C = createContext<Preferences>({ language: 'vi', setLanguage: () => {}, theme: 'light', toggleTheme: () => {}, tr: (vi) => vi })
export const usePreferences = () => useContext(C)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [manualTheme, setManualTheme] = useState(() => !!read('microtech.theme'))
  useEffect(() => {
    document.documentElement.lang = language
    try { localStorage.setItem('microtech.language', language) } catch { /* still usable */ }
  }, [language])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#091122' : '#f3f7ff')
    if (manualTheme) { try { localStorage.setItem('microtech.theme', theme) } catch { /* still usable */ } }
  }, [theme, manualTheme])
  useEffect(() => {
    if (manualTheme || CONFIG.defaultTheme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const change = () => setTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [manualTheme])
  const toggleTheme = () => { setManualTheme(true); setTheme((old) => old === 'light' ? 'dark' : 'light') }
  return <C.Provider value={{ language, setLanguage, theme, toggleTheme, tr: (vi, en) => language === 'vi' ? vi : en }}>{children}</C.Provider>
}
