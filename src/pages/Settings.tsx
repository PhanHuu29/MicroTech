import { useRef, useState, useEffect, type ChangeEvent } from 'react'
import { IMAGE_SLOTS, DEFAULT_SRC, type ImageKey } from '../lib/images'
import { fileToDataUrl, useSettings, type Settings as SiteSettings } from '../lib/settings'
import { isAppsScriptUrl, isSheetUrl, sendToSheet } from '../lib/sheet'
import { usePreferences } from '../lib/preferences'
import { Icon } from '../components/Icon'
import { CONFIG } from '../config'
import SCRIPT from '../../google-apps-script/Code.gs?raw'

const IMAGE_LABELS: Record<ImageKey, [string, string]> = {
  logoIcon: ['Logo biểu tượng M', 'M logo icon'], logoText: ['Logo chữ MicroTech', 'MicroTech wordmark'], cover: ['Ảnh cover', 'Cover image'],
  iconSupport: ['Icon hỗ trợ từ xa', 'Remote support icon'], iconInstall: ['Icon cài phần mềm', 'Software setup icon'], iconFix: ['Icon xử lý lỗi', 'Troubleshooting icon'], iconIt: ['Icon IT Support', 'IT support icon'], iconBusiness: ['Icon doanh nghiệp', 'Business IT icon'],
  whyQuote: ['Báo giá rõ ràng', 'Clear pricing'], whySecure: ['Bảo mật thông tin', 'Privacy'], whyRemote: ['Hỗ trợ từ xa', 'Remote support'],
  socialFacebook: ['Facebook', 'Facebook'], socialYoutube: ['YouTube', 'YouTube'], socialZalo: ['Zalo', 'Zalo'], socialEmail: ['Email', 'Email'],
}
export default function Settings() {
  const { s, set, reset } = useSettings()
  const { tr } = usePreferences()
  const [message, setMessage] = useState('')
  const [testing, setTesting] = useState(false)
  const testPending = useRef(false)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const flash = (text: string) => {
    setMessage(text); window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(''), 4200)
  }
  const update = (patch: Partial<SiteSettings>) => {
    if (!set(patch)) flash(tr('Không thể lưu: bộ nhớ trình duyệt đã đầy hoặc bị chặn.', 'Could not save: browser storage is full or blocked.'))
  }
  const setImage = (key: ImageKey, value: string | null) => {
    const images = { ...s.images }
    if (value) images[key] = value
    else delete images[key]
    if (set({ images })) flash(tr('Đã cập nhật ảnh trên thiết bị này', 'Image updated on this device'))
    else flash(tr('Không đủ bộ nhớ để lưu ảnh. Hãy dùng ảnh nhỏ hơn.', 'Not enough storage. Please use a smaller image.'))
  }
  const upload = (key: ImageKey, max: number) => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try { setImage(key, await fileToDataUrl(file, max)) }
    catch { flash(tr('Không đọc được ảnh', 'Could not read this image')) }
    event.target.value = ''
  }
  const copy = async (value: string) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(value)
      flash(tr('Đã sao chép', 'Copied'))
    } catch { flash(tr('Không thể sao chép tự động. Hãy chọn mã để sao chép thủ công.', 'Automatic copying is unavailable. Select the code to copy it manually.')) }
  }
  const globalConfig = `/** Cấu hình chung cho website. */\nexport const CONFIG = ${JSON.stringify({
    ...CONFIG, brand: s.brand, hotline: s.hotline, email: s.email,
    social: { facebook: s.facebook, youtube: s.youtube, zalo: s.zalo, email: s.socialEmail },
    sheetScriptUrl: s.sheetScriptUrl.trim(), sheetUrl: s.sheetUrl.trim(), showSheetOnSuccess: s.showSheetOnSuccess,
  }, null, 2)} as const\n`
  const test = async () => {
    if (testPending.current) return
    testPending.current = true; setTesting(true)
    try {
      const result = await sendToSheet(s.sheetScriptUrl, {
        code: `MT-TEST-${Date.now()}`, createdAt: Date.now(), name: 'MicroTech Test', phone: '0000000000', email: 'test@example.com',
        service: 'Test connection', device: 'Windows', os: 'Test', issue: 'Kiểm tra kết nối MicroTech', urgency: 'Test', method: 'Test',
      })
      flash(result === 'sent' ? tr('Đã gửi dòng thử. Mở Google Sheet để kiểm tra dòng MT-TEST.', 'Test sent. Open Google Sheet and check for an MT-TEST row.') : result === 'invalid' ? tr('Hãy dán URL triển khai Apps Script kết thúc bằng /exec.', 'Paste the Apps Script deployment URL ending in /exec.') : tr('Không gửi được. Kiểm tra kết nối và quyền triển khai.', 'Could not send. Check your connection and deployment access.'))
    } finally { testPending.current = false; setTesting(false) }
  }
  return <section className="wrap page narrow settings-page">
    <span className="eyebrow">{tr('CẤU HÌNH MICROTECH', 'MICROTECH SETTINGS')}</span>
    <h1>{tr('Tùy chỉnh website', 'Website settings')}</h1>
    <p className="note">{tr('Các thay đổi tại đây chỉ áp dụng trên trình duyệt này. Để áp dụng cho tất cả khách, sao chép cấu hình vào src/config.ts rồi build và triển khai lại.', 'Changes here apply only to this browser. For all visitors, copy the configuration to src/config.ts, then rebuild and redeploy.')}</p>
    <div className="card-set glass">
      <h2>{tr('Thương hiệu & liên hệ nhanh', 'Brand & quick contact')}</h2>
      <label>{tr('Tên thương hiệu', 'Brand name')}<input value={s.brand} onChange={(event) => update({ brand: event.target.value })} /></label>
      <label>Hotline<input type="tel" value={s.hotline} onChange={(event) => update({ hotline: event.target.value })} placeholder="0377 339 643" /></label>
      <label>{tr('Email liên hệ', 'Contact email')}<input type="email" value={s.email} onChange={(event) => update({ email: event.target.value })} /></label>
      <label>{tr('Link Zalo trên cover', 'Zalo link on cover')}<input type="url" value={s.zalo} onChange={(event) => update({ zalo: event.target.value })} placeholder="https://zalo.me/0377339643" /></label>
      <label>Facebook<input type="url" value={s.facebook} onChange={(event) => update({ facebook: event.target.value })} placeholder="https://facebook.com/..." /></label>
      <label>YouTube<input type="url" value={s.youtube} onChange={(event) => update({ youtube: event.target.value })} placeholder="https://youtube.com/..." /></label>
      <label>{tr('Link icon email', 'Email icon link')}<input value={s.socialEmail} onChange={(event) => update({ socialEmail: event.target.value })} placeholder="mailto:hello@example.com" /></label>
      <small>{tr('Để trống hotline hoặc Zalo để ẩn nút tương ứng.', 'Leave the hotline or Zalo empty to hide its button.')}</small>
    </div>
    <div className="card-set glass" id="sheet-settings">
      <h2>{tr('Google Sheet cá nhân', 'Your Google Sheet')}</h2>
      <p className="muted">{tr('URL Apps Script nhận đơn; link Google Sheet mở bảng tính. Đây là hai đường dẫn khác nhau.', 'The Apps Script URL receives orders; the Google Sheet link opens your spreadsheet. These are different links.')}</p>
      <label>{tr('URL Apps Script nhận đơn (/exec)', 'Apps Script booking URL (/exec)')}<input type="url" value={s.sheetScriptUrl} onChange={(event) => update({ sheetScriptUrl: event.target.value })} placeholder="https://script.google.com/macros/s/DEPLOYMENT_ID/exec" aria-invalid={!!s.sheetScriptUrl && !isAppsScriptUrl(s.sheetScriptUrl)} aria-describedby={s.sheetScriptUrl && !isAppsScriptUrl(s.sheetScriptUrl) ? 'script-url-error' : undefined} /></label>
      {s.sheetScriptUrl && !isAppsScriptUrl(s.sheetScriptUrl) && <small id="script-url-error" className="danger" role="alert">{tr('Cần URL script.google.com/macros/s/.../exec; không dùng link googleusercontent.com/macros/echo hoặc /dev.', 'Use script.google.com/macros/s/.../exec, not a googleusercontent.com/macros/echo or /dev link.')}</small>}
      <label>{tr('Link Google Sheet cá nhân', 'Personal Google Sheet link')}<input type="url" value={s.sheetUrl} onChange={(event) => update({ sheetUrl: event.target.value })} placeholder="https://docs.google.com/spreadsheets/d/SHEET_ID/edit" aria-invalid={!!s.sheetUrl && !isSheetUrl(s.sheetUrl)} aria-describedby={s.sheetUrl && !isSheetUrl(s.sheetUrl) ? 'sheet-url-error' : undefined} /></label>
      {s.sheetUrl && !isSheetUrl(s.sheetUrl) && <small id="sheet-url-error" className="danger" role="alert">{tr('Dán link bảng tính Google Sheets (docs.google.com/spreadsheets/d/...).', 'Paste the spreadsheet link (docs.google.com/spreadsheets/d/...).')}</small>}
      <label className="check"><input type="checkbox" checked={s.showSheetOnSuccess} onChange={(event) => update({ showSheetOnSuccess: event.target.checked })} /><span>{tr('Hiện nút “Mở Google Sheet” sau khi khách điền đơn', 'Show “Open Google Sheet” after a customer submits a request')}</span></label>
      <small>{tr('Khách vẫn cần quyền xem bảng tính. Nếu chứa thông tin của nhiều khách, giữ Sheet riêng tư hoặc dùng một Sheet riêng để chia sẻ.', 'Customers still need permission to view the sheet. Keep a multi-customer sheet private or use a separate sheet for sharing.')}</small>
      <div className="row">{isSheetUrl(s.sheetUrl) && <a className="btn btn-ghost btn-sm" href={s.sheetUrl} target="_blank" rel="noopener noreferrer"><Icon name="external" />{tr('Mở Google Sheet', 'Open Google Sheet')}</a>}<button type="button" className="btn btn-sm" disabled={testing || !isAppsScriptUrl(s.sheetScriptUrl)} onClick={() => void test()}>{testing ? tr('Đang gửi…', 'Sending…') : tr('Gửi dòng thử nghiệm', 'Send a test row')}</button></div>
      <details><summary>{tr('Hướng dẫn kết nối từng bước', 'Step-by-step connection guide')}</summary>
        <ol className="guide-steps"><li>{tr('Mở bảng tính của bạn → Tiện ích mở rộng → Apps Script.', 'Open your spreadsheet → Extensions → Apps Script.')}</li><li>{tr('Dán mã bên dưới. Thay SPREADSHEET_ID bằng phần ID nằm giữa /d/ và /edit trong link Sheet.', 'Paste the code below. Replace SPREADSHEET_ID with the ID between /d/ and /edit in your Sheet link.')}</li><li>{tr('Triển khai → Bản triển khai mới → Ứng dụng web. Thực thi bằng tài khoản của bạn; quyền truy cập: Bất kỳ ai.', 'Deploy → New deployment → Web app. Execute as your account; access: Anyone.')}</li><li>{tr('Cấp quyền, sao chép URL /exec và dán vào ô URL Apps Script. Dán link bảng tính vào ô Link Google Sheet.', 'Authorize, copy the /exec URL into the Apps Script field, and paste your spreadsheet link into the Google Sheet field.')}</li><li>{tr('Gửi dòng thử và mở tab Don_hang để kiểm tra. Bật hiện link Sheet nếu cần. Sao chép cấu hình bên dưới để triển khai cho mọi khách.', 'Send a test row and check the Don_hang tab. Enable the Sheet link if needed. Copy the configuration below to deploy it for all visitors.')}</li></ol>
        <pre><code>{SCRIPT}</code></pre><button type="button" className="link" onClick={() => void copy(SCRIPT)}>{tr('Sao chép mã Apps Script', 'Copy Apps Script code')}</button>
      </details>
      <small>{tr('Trình duyệt không đọc được kết quả ghi do no-cors. Dòng MT-TEST xuất hiện trong Sheet mới xác nhận kết nối thành công.', 'The browser cannot read the write result with no-cors. An MT-TEST row in your Sheet confirms the connection.')}</small>
    </div>
    <div className="card-set glass">
      <h2>{tr('Cấu hình cho mọi khách truy cập', 'Configuration for all visitors')}</h2>
      <p className="muted">{tr('Thay nội dung src/config.ts bằng đoạn dưới rồi chạy build và triển khai lại.', 'Replace src/config.ts with the code below, then build and redeploy.')}</p>
      <details><summary>{tr('Xem cấu hình hiện tại', 'View current configuration')}</summary><pre><code>{globalConfig}</code></pre></details>
      <button type="button" className="btn btn-ghost" onClick={() => void copy(globalConfig)}>{tr('Sao chép cấu hình', 'Copy configuration')}</button>
    </div>
    <div className="card-set glass">
      <h2>{tr('Hình ảnh trên website', 'Website images')}</h2><p className="muted">{tr('Thay ảnh tại đây để xem thử trên thiết bị này. Để đổi cho mọi khách, thay file trong public/images/. Cover dùng hình bên phải; chữ và nút do website hiển thị.', 'Preview replacement images on this device. For all visitors, replace files in public/images/. The cover shows the right side of the image; text and buttons are rendered by the website.')}</p>
      {IMAGE_SLOTS.map((slot) => <div className="up" key={slot.key}><div className={'thumb' + (slot.key === 'cover' ? ' cover-thumb' : ' logo-thumb')}><img src={s.images[slot.key] || DEFAULT_SRC[slot.key]} alt={tr(...IMAGE_LABELS[slot.key])} /></div><div className="up-info"><b>{tr(...IMAGE_LABELS[slot.key])}</b><small>{s.images[slot.key] ? tr('Ảnh tải lên', 'Uploaded image') : tr('Ảnh mặc định', 'Default image')}</small></div><label className="btn btn-ghost btn-sm filebtn">{tr('Thay ảnh', 'Change image')}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={upload(slot.key, slot.max)} /></label>{s.images[slot.key] && <button type="button" className="link" onClick={() => setImage(slot.key, null)}>{tr('Dùng mặc định', 'Use default')}</button>}</div>)}
    </div>
    <button type="button" className="link danger" onClick={() => { reset(); flash(tr('Đã khôi phục cấu hình mặc định', 'Default configuration restored')) }}>{tr('Khôi phục cấu hình mặc định trên thiết bị', 'Restore defaults on this device')}</button>
    <p className={'toast' + (message ? ' show' : '')} role="status">{message}</p>
  </section>
}
