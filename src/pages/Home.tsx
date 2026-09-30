import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DEVICES, SERVICES } from '../lib/data'
import { Img } from '../components/Img'
import { useTilt } from '../hooks/useTilt'
import { CONFIG } from '../config'

const WHY = [
  ['whyQuote', 'Báo giá trước', 'Hiển thị chi phí rõ ràng trước khi đặt lịch, không phát sinh.'],
  ['whySecure', 'Bảo mật thông tin', 'Cam kết bảo mật dữ liệu và thông tin cá nhân của bạn.'],
  ['whyRemote', 'Hỗ trợ từ xa', 'Kết nối nhanh chóng, xử lý sự cố tiện lợi, tiết kiệm thời gian.'],
] as const

function QuickBook() {
  const nav = useNavigate()
  const [f, setF] = useState({ device: '', service: '', detail: '', urgency: 'today' })
  const set = (k: string) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const go = (e: FormEvent) => {
    e.preventDefault()
    try { sessionStorage.setItem('microtech.draft', JSON.stringify({ device: f.device, detail: f.detail, urgency: f.urgency })) } catch { /* ignore */ }
    nav(f.service ? `/booking?service=${f.service}` : '/booking')
  }
  return (
    <form className="qb reveal" onSubmit={go} id="quick">
      <div className="qb-head">
        <div><h2>Đặt lịch hỗ trợ</h2><p className="muted">Chỉ vài bước đơn giản để nhận hỗ trợ từ đội ngũ MicroTech</p></div>
        <ol className="mini" aria-hidden>{['Chọn dịch vụ', 'Thông tin thiết bị', 'Chọn lịch', 'Xác nhận'].map((t, i) => <li key={t} className={i === 0 ? 'on' : ''}><i>{i + 1}</i><span>{i + 1}. {t}</span></li>)}</ol>
      </div>
      <div className="qb-grid">
        <label>Loại thiết bị<select value={f.device} onChange={set('device')}><option value="">Chọn loại thiết bị</option>{DEVICES.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label>Dịch vụ cần hỗ trợ<select value={f.service} onChange={set('service')}><option value="">Chọn dịch vụ cần hỗ trợ</option>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
        <label>Mô tả lỗi<textarea rows={4} value={f.detail} onChange={set('detail')} placeholder="Mô tả chi tiết tình trạng lỗi của bạn…" /></label>
        <div className="qb-side">
          <label>Ngày & giờ hỗ trợ<select value={f.urgency} onChange={set('urgency')}><option value="30m">Trong 30 phút</option><option value="today">Trong hôm nay</option><option value="schedule">Chọn giờ hẹn</option></select></label>
          <button className="btn btn-lg">TIẾP TỤC ›</button>
          <small>Ảnh/video lỗi có thể tải lên ở bước sau (JPG, PNG, MP4, tối đa 5MB).</small>
        </div>
      </div>
    </form>
  )
}

export default function Home() {
  const nav = useNavigate()
  const hero = useRef<HTMLElement>(null)
  useTilt(hero)
  return (
    <>
      <section className="hero3" ref={hero}>
        <h1 className="sr">Hỗ trợ phần mềm nhanh, đặt lịch trực tuyến</h1>
        <div className="banner">
          <div className="banner-inner">
            <Img k="cover" className="banner-img" />
            <span className="scan" aria-hidden />
            <span className="hud" aria-hidden><i /><i /><i /><i /></span>
            <span className="orbit" aria-hidden />
            <span className="tile t1" aria-hidden><span><Img k="iconSupport" /></span></span>
            <span className="tile t2" aria-hidden><span className="ok">✓</span></span>
            <Link to="/booking" className="banner-cta" aria-label="Đặt hỗ trợ ngay"
              style={{ left: `${CONFIG.coverCta.left}%`, top: `${CONFIG.coverCta.top}%`, width: `${CONFIG.coverCta.width}%`, height: `${CONFIG.coverCta.height}%` }} />
          </div>
        </div>
      </section>

      <section id="services" className="sheet">
        <div className="wrap">
          <h2 className="center dots reveal">Dịch vụ nổi bật</h2>
          <p className="center muted reveal">Giải pháp hỗ trợ phần mềm và IT toàn diện cho cá nhân & doanh nghiệp</p>
          <div className="grid4">
            {SERVICES.map((s, i) => (
              <button key={s.id} className="svc2 reveal" style={{ '--i': i } as CSSProperties} onClick={() => nav(`/booking?service=${s.id}`)}>
                <Img k={s.img} className="svc-img" />
                <b>{s.title}</b><span>{s.desc}</span><i aria-hidden>›</i>
                <em className="sr">Chọn dịch vụ</em>
              </button>
            ))}
          </div>
          <QuickBook />
          <h2 className="center dots why-h reveal">Vì sao nên chọn MicroTech?</h2>
          <div className="why">
            {WHY.map(([k, t, d], i) => <div key={t} className="reveal" style={{ '--i': i } as CSSProperties}><Img k={k} className="why-img" /><div><b>{t}</b><p>{d}</p></div></div>)}
          </div>
        </div>
      </section>
    </>
  )
}
