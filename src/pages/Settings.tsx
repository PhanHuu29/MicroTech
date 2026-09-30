import { useState, type ChangeEvent } from 'react'
import { IMAGE_SLOTS, DEFAULT_SRC, type ImageKey } from '../lib/images'
import { fileToDataUrl, sendToSheet, useSettings } from '../lib/settings'

const SCRIPT = `function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(['Mã đơn','Thời gian','Họ tên','SĐT','Email','Dịch vụ','Thiết bị','HĐH','Mô tả','Lịch','Hình thức','Giá']);
  sh.appendRow([d.code, new Date(d.createdAt), d.name, "'" + d.phone, d.email, d.service, d.device, d.os, d.issue,
    d.date ? d.date + ' ' + d.slot : d.urgency, d.method, d.price || '']);
  return ContentService.createTextOutput('ok');
}`

export default function Settings() {
  const { s, set, reset } = useSettings()
  const [msg, setMsg] = useState('')
  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 2600) }

  const setImage = (key: ImageKey, val: string | null) => {
    const images = { ...s.images }
    if (val) images[key] = val; else delete images[key]
    return set({ images })
  }
  const upload = (key: ImageKey, max: number) => async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    try { flash(setImage(key, await fileToDataUrl(f, max)) ? 'Đã thay ảnh' : 'Ảnh quá nặng, hãy chọn ảnh nhỏ hơn') }
    catch { flash('Không đọc được ảnh') }
  }
  const test = async () => {
    const ok = await sendToSheet(s.sheetScriptUrl, { code: 'MT-TEST', createdAt: Date.now(), name: 'Dòng thử nghiệm', phone: '0000000000', email: 'test@example.com', service: 'Test', device: '-', os: '-', issue: 'Kiểm tra kết nối', urgency: '-', method: '-' })
    flash(ok ? 'Đã gửi dòng thử nghiệm – hãy kiểm tra Google Sheet' : 'URL Apps Script chưa hợp lệ (phải bắt đầu bằng https://script.google.com/)')
  }

  return (
    <section className="wrap page narrow">
      <h1>Tùy chỉnh website</h1>
      <p className="muted">Thay đổi được lưu trên trình duyệt này và áp dụng ngay. Muốn thay cho mọi khách truy cập, ghi đè file trong thư mục <code>public/images/</code>.</p>

      <div className="card-set"><h2>Thương hiệu & liên kết</h2>
        <label>Tên thương hiệu<input value={s.brand} onChange={(e) => set({ brand: e.target.value })} /></label>
        <label>Facebook<input type="url" value={s.facebook} onChange={(e) => set({ facebook: e.target.value })} placeholder="https://facebook.com/…" /></label>
        <label>YouTube<input type="url" value={s.youtube} onChange={(e) => set({ youtube: e.target.value })} placeholder="https://youtube.com/…" /></label>
        <label>Zalo<input type="url" value={s.zalo} onChange={(e) => set({ zalo: e.target.value })} placeholder="https://zalo.me/…" /></label>
      </div>

      <div className="card-set"><h2>Hình ảnh trên website</h2>
        {IMAGE_SLOTS.map((slot) => (
          <div className="up" key={slot.key}>
            <div className={'thumb' + (slot.key === 'cover' ? ' cover-thumb' : ' logo-thumb')}><img src={s.images[slot.key] || DEFAULT_SRC[slot.key]} alt="" /></div>
            <div className="up-info"><b>{slot.label}</b><small>{s.images[slot.key] ? 'Đang dùng ảnh tải lên' : 'Đang dùng ảnh mặc định'}</small></div>
            <label className="btn btn-ghost btn-sm filebtn">Thay ảnh<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={upload(slot.key, slot.max)} /></label>
            {s.images[slot.key] && <button className="link" onClick={() => setImage(slot.key, null)}>Dùng ảnh mặc định</button>}
          </div>
        ))}
      </div>

      <div className="card-set"><h2>Google Sheet cá nhân</h2>
        <p className="muted">Mỗi yêu cầu đặt hỗ trợ sẽ được thêm thành một dòng mới trong bảng tính của bạn.</p>
        <label>Liên kết Google Sheet<input type="url" value={s.sheetUrl} onChange={(e) => set({ sheetUrl: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/…" /></label>
        <label>URL Apps Script (web app)<input type="url" value={s.sheetScriptUrl} onChange={(e) => set({ sheetScriptUrl: e.target.value })} placeholder="https://script.google.com/macros/s/…/exec" /></label>
        <label className="check"><input type="checkbox" checked={s.showSheetOnSuccess} onChange={(e) => set({ showSheetOnSuccess: e.target.checked })} /> Hiện liên kết Google Sheet trên trang đặt lịch thành công (không nên bật nếu bảng tính chứa dữ liệu khách hàng)</label>
        <div className="row">
          {s.sheetUrl && <a className="btn btn-sm" href={s.sheetUrl} target="_blank" rel="noopener noreferrer">Mở Google Sheet</a>}
          <button className="btn btn-ghost btn-sm" disabled={!s.sheetScriptUrl} onClick={test}>Gửi dòng thử nghiệm</button>
        </div>
        <details><summary>Cách kết nối (3 bước)</summary>
          <ol>
            <li>Mở Google Sheet → <b>Tiện ích mở rộng → Apps Script</b>, dán đoạn mã dưới đây.</li>
            <li><b>Triển khai → Ứng dụng web</b>: thực thi bằng tài khoản của bạn, quyền truy cập <b>Bất kỳ ai</b>.</li>
            <li>Sao chép URL <code>/exec</code> vào ô phía trên.</li>
          </ol>
          <pre><code>{SCRIPT}</code></pre>
          <button className="link" onClick={() => navigator.clipboard?.writeText(SCRIPT).then(() => flash('Đã sao chép mã'))}>Sao chép mã</button>
        </details>
      </div>

      <button className="link danger" onClick={() => { reset(); flash('Đã khôi phục mặc định') }}>Khôi phục mặc định</button>
      <p className={'toast' + (msg ? ' show' : '')} role="status">{msg}</p>
    </section>
  )
}
