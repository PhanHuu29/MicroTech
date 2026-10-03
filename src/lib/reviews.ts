import { isAppsScriptUrl } from './sheet'
import { CONFIG } from '../config'

export interface Review {
  id: string; name: string; service: string; rating: number; comment: string; createdAt: number
}
export interface ReviewSummary { count: number; average: number; distribution: number[] }
export interface ReviewsResponse {
  ok: true; kind: 'reviews'; reviews: Review[]; summary: ReviewSummary; total: number; nextOffset: number | null
}
export interface ReviewSubmission {
  action: 'review'; id: string; receipt: string; name: string; service: string; rating: number; comment: string; consent: true
}
export type ReviewErrorCode = 'unavailable' | 'invalid' | 'unconfirmed'
export class ReviewError extends Error {
  constructor(public code: ReviewErrorCode) { super(code) }
}
const EMPTY_SUMMARY: ReviewSummary = { count: 0, average: 0, distribution: [0, 0, 0, 0, 0] }
export const emptyReviews = (): ReviewsResponse => ({ ok: true, kind: 'reviews', reviews: [], summary: { ...EMPTY_SUMMARY, distribution: [...EMPTY_SUMMARY.distribution] }, total: 0, nextOffset: null })

function endpoint() {
  return CONFIG.sheetScriptUrl
}

/** JSONP is limited to read-only, public review data and a receipt status. */
function readPublic(params: Record<string, string>, signal?: AbortSignal): Promise<unknown> {
  const scriptUrl = endpoint()
  if (!isAppsScriptUrl(scriptUrl)) return Promise.reject(new ReviewError('unavailable'))
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return new Promise((resolve, reject) => {
    const callback = `mt_reviews_${crypto.randomUUID().replace(/-/g, '')}`
    const host = window as unknown as Record<string, unknown>
    const script = document.createElement('script')
    let settled = false
    const cleanup = () => {
      window.clearTimeout(timer); script.remove(); signal?.removeEventListener('abort', abort)
      // A response can arrive after cancellation; retain an inert callback briefly.
      host[callback] = () => {}
      window.setTimeout(() => { delete host[callback] }, 60000)
    }
    const finish = (error?: Error, value?: unknown) => {
      if (settled) return
      settled = true; cleanup()
      if (error) reject(error); else resolve(value)
    }
    const abort = () => finish(new DOMException('Aborted', 'AbortError'))
    const timer = window.setTimeout(() => finish(new ReviewError('unavailable')), 15000)
    host[callback] = (data: unknown) => finish(undefined, data)
    script.onerror = () => finish(new ReviewError('unavailable'))
    script.onload = () => { if (!settled) finish(new ReviewError('unavailable')) }
    const url = new URL(scriptUrl)
    Object.entries({ ...params, callback }).forEach(([key, value]) => url.searchParams.set(key, value))
    script.src = url.toString(); script.async = true; script.referrerPolicy = 'no-referrer'
    signal?.addEventListener('abort', abort, { once: true })
    document.head.appendChild(script)
  })
}

function validReview(value: unknown): value is Review {
  if (!value || typeof value !== 'object') return false
  const r = value as Review
  return typeof r.id === 'string' && typeof r.name === 'string' && typeof r.service === 'string' && typeof r.comment === 'string' && Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5 && Number.isFinite(r.createdAt)
}

export async function loadReviews(options: { service?: string; rating?: string; offset?: number; limit?: number } = {}, signal?: AbortSignal): Promise<ReviewsResponse> {
  const value = await readPublic({ action: 'reviews', service: options.service || '', rating: options.rating || '', offset: String(options.offset || 0), limit: String(options.limit || 6) }, signal)
  if (!value || typeof value !== 'object') throw new ReviewError('unavailable')
  const d = value as ReviewsResponse
  if (!d.ok || d.kind !== 'reviews' || !Array.isArray(d.reviews) || !d.reviews.every(validReview) || !d.summary || !Number.isInteger(d.summary.count) || !Number.isFinite(d.summary.average) || !Array.isArray(d.summary.distribution) || d.summary.distribution.length !== 5 || !d.summary.distribution.every((n) => Number.isInteger(n) && n >= 0) || !Number.isInteger(d.total) || d.total < 0 || !(d.nextOffset === null || (Number.isInteger(d.nextOffset) && d.nextOffset >= 0))) throw new ReviewError('unavailable')
  return d
}

export function createReview(input: Omit<ReviewSubmission, 'action' | 'id' | 'receipt'>): ReviewSubmission {
  return { ...input, name: input.name.trim(), comment: input.comment.trim(), action: 'review', id: `MT-RV-${crypto.randomUUID()}`, receipt: crypto.randomUUID() }
}

/** Do not report success from an opaque POST: confirm the stored ID with its receipt. */
export async function submitReview(review: ReviewSubmission): Promise<void> {
  if (!isAppsScriptUrl(endpoint())) throw new ReviewError('unavailable')
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 15000)
  try {
    await fetch(endpoint(), { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(review), signal: controller.signal })
  } catch { throw new ReviewError('unconfirmed') }
  finally { window.clearTimeout(timer) }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await readPublic({ action: 'review-status', id: review.id, receipt: review.receipt }) as { ok?: boolean; kind?: string; received?: boolean }
      if (response?.ok && response.kind === 'review-status' && response.received === true) return
      if (!response?.ok || response.kind !== 'review-status') throw new ReviewError('unavailable')
    } catch (error) {
      if (attempt === 2) throw error
    }
    if (attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 900))
  }
  throw new ReviewError('unconfirmed')
}
