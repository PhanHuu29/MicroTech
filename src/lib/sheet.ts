export type SheetResult = 'sent' | 'failed' | 'invalid'

/** Chỉ dùng URL triển khai /exec ổn định, không dùng URL chuyển hướng /echo. */
export function isAppsScriptUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && url.hostname === 'script.google.com' && /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)
  } catch { return false }
}
export function isSheetUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && url.hostname === 'docs.google.com' && /^\/spreadsheets\/d\/[A-Za-z0-9_-]+(?:\/|$)/.test(url.pathname)
  } catch { return false }
}

/**
 * no-cors trả phản hồi opaque: 'sent' chỉ nghĩa là fetch đã gửi xong,
 * không khẳng định Apps Script đã ghi thành công. Xem hướng dẫn để kiểm tra Sheet.
 */
export async function sendToSheet(scriptUrl: string, order: object): Promise<SheetResult> {
  if (!isAppsScriptUrl(scriptUrl)) return 'invalid'
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 15000)
  try {
    await fetch(scriptUrl.trim(), {
      method: 'POST', mode: 'no-cors', signal: controller.signal,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(order),
    })
    return 'sent'
  } catch { return 'failed' }
  finally { window.clearTimeout(timeout) }
}
