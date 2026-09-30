import type { StatusId } from './data'

export interface Order {
  code: string; createdAt: number; status: StatusId
  service: string; device: string; os: string; issueKind?: string; brand?: string
  issue: string; urgency: string; date?: string; slot?: string; method: string
  name: string; phone: string; email: string; price?: string; note?: string
}
const KEY = 'microtech.orders'
export const loadOrders = (): Order[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
/** Demo persistence. Replace with API calls once a backend exists. */
export function saveOrder(o: Omit<Order, 'code' | 'createdAt' | 'status'>): Order {
  const all = loadOrders()
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const n = all.filter((x) => x.code.includes(ymd)).length + 1
  const order: Order = { ...o, code: `MT-${ymd}-${String(n).padStart(3, '0')}`, createdAt: Date.now(), status: 'received' }
  try { localStorage.setItem(KEY, JSON.stringify([...all, order])) } catch { /* storage unavailable */ }
  return order
}
export const digits = (s: string) => s.replace(/\D/g, '')
export const findOrder = (code: string, phone: string) =>
  loadOrders().find((o) => o.code === code.trim().toUpperCase() && digits(o.phone) === digits(phone))
