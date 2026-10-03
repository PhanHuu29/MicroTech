import { SERVICES, URGENCY, METHODS, type StatusId, type UrgencyId } from './data'
import type { Translate } from './preferences'

export interface Order {
  code: string; createdAt: number; status: StatusId
  service: string; serviceId?: string; device: string; os: string; issueKind?: string; brand?: string
  issue: string; urgency: string; urgencyId?: UrgencyId; date?: string; slot?: string; method: string; methodId?: keyof typeof METHODS
  name: string; phone: string; email: string; price?: string; note?: string
}
const KEY = 'microtech.orders'
export const loadOrders = (): Order[] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(value) ? value.filter((o) => o && typeof o.code === 'string' && typeof o.phone === 'string') : []
  } catch { return [] }
}
/** Lưu trên thiết bị; mã ngẫu nhiên tránh trùng giữa các khách gửi vào cùng Sheet. */
export function saveOrder(input: Omit<Order, 'code' | 'createdAt' | 'status'>): Order {
  const ymd = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()).replace(/-/g, '')
  const random = Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()
  const order: Order = { ...input, code: `MT-${ymd}-${random}`, createdAt: Date.now(), status: 'received' }
  try { localStorage.setItem(KEY, JSON.stringify([...loadOrders(), order])) } catch { /* caller checks persistence and offers contact */ }
  return order
}
export const digits = (s: string) => s.replace(/\D/g, '')
export const normalizePhone = (s: string) => digits(s).replace(/^84(?=\d{9}$)/, '0')
export const findOrder = (code: string, phone: string) => loadOrders().find((o) => o.code === code.trim().toUpperCase() && normalizePhone(o.phone) === normalizePhone(phone))
export function orderService(order: Pick<Order, 'service' | 'serviceId'>, tr: Translate) {
  const service = SERVICES.find((s) => s.id === order.serviceId || s.title === order.service)
  return service ? tr(service.title, service.titleEn) : order.service
}
export function orderUrgency(order: Pick<Order, 'urgency' | 'urgencyId'>, tr: Translate) {
  const key = order.urgencyId || (Object.keys(URGENCY) as UrgencyId[]).find((id) => URGENCY[id][0] === order.urgency)
  return key ? tr(URGENCY[key][0], URGENCY[key][1]) : order.urgency
}
export function orderMethod(order: Pick<Order, 'method' | 'methodId'>, tr: Translate) {
  const key = order.methodId || (Object.keys(METHODS) as (keyof typeof METHODS)[]).find((id) => METHODS[id][0] === order.method)
  return key ? tr(METHODS[key][0], METHODS[key][1]) : order.method
}
