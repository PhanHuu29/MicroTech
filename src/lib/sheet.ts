/** Gửi đơn tới Google Apps Script web app. `no-cors` nên chỉ phát hiện được lỗi mạng, không đọc được phản hồi. */
export async function sendToSheet(scriptUrl: string, order: object): Promise<boolean> {
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(scriptUrl)) return false
  try {
    await fetch(scriptUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(order) })
    return true
  } catch { return false }
}
