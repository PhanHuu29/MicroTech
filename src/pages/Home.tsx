import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DEVICES, SERVICES, URGENCY } from '../lib/data'
import { Img } from '../components/Img'
import { Icon } from '../components/Icon'
import { useTilt } from '../hooks/useTilt'
import { CONFIG } from '../config'
import { usePreferences } from '../lib/preferences'
import { ReviewsPreview } from '../components/Reviews'

const WHY = [
  ['whyQuote', 'Báo giá rõ ràng', 'Clear pricing', 'Xác nhận chi phí trước khi bắt đầu hỗ trợ.', 'Know the cost before your support session starts.'],
  ['whySecure', 'Bảo mật thông tin', 'Your privacy matters', 'Dữ liệu và thông tin cá nhân được bảo mật.', 'Your data and personal information stay private.'],
  ['whyRemote', 'Hỗ trợ từ xa', 'Help, wherever you are', 'Kết nối nhanh chóng, tiết kiệm thời gian di chuyển.', 'Get connected quickly and skip the travel time.'],
] as const

function QuickBook() {
  const nav = useNavigate()
  const { tr } = usePreferences()
  const [f, setF] = useState({ device: '', service: '', detail: '', urgency: 'today' })
  const change = (key: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [key]: e.target.value })
  const go = (event: FormEvent) => {
    event.preventDefault()
    try {
      const previous = JSON.parse(sessionStorage.getItem('microtech.draft') || '{}')
      sessionStorage.setItem('microtech.draft', JSON.stringify({ ...previous, ...f }))
    } catch { /* usable without storage */ }
    nav(f.service ? `/booking?service=${f.service}` : '/booking')
  }
  const titles = [tr('Chọn dịch vụ', 'Service'), tr('Thiết bị', 'Device'), tr('Chọn lịch', 'Schedule'), tr('Xác nhận', 'Confirm')]
  return <form className="qb glass reveal" onSubmit={go} id="quick">
    <div className="qb-head">
      <div><span className="eyebrow">{tr('BẮT ĐẦU TẠI ĐÂY', 'START HERE')}</span><h2>{tr('Bạn cần hỗ trợ gì?', 'How can we help?')}</h2><p className="muted">{tr('Chọn nhu cầu, MicroTech sẽ hỗ trợ bạn bước tiếp theo.', 'Tell us what you need. We will guide you from there.')}</p></div>
      <ol className="mini" aria-hidden="true">{titles.map((title, i) => <li key={i} className={i === 0 ? 'on' : ''}><i>{i + 1}</i><span>{title}</span></li>)}</ol>
    </div>
    <div className="qb-grid">
      <label>{tr('Loại thiết bị', 'Device type')}<select value={f.device} onChange={change('device')}><option value="">{tr('Chọn thiết bị', 'Select a device')}</option>{DEVICES.map((d) => <option key={d}>{d}</option>)}</select></label>
      <label>{tr('Dịch vụ cần hỗ trợ', 'Support service')}<select value={f.service} onChange={change('service')}><option value="">{tr('Chọn dịch vụ', 'Select a service')}</option>{SERVICES.map((service) => <option key={service.id} value={service.id}>{tr(service.title, service.titleEn)}</option>)}</select></label>
      <label>{tr('Mô tả lỗi', 'Describe the issue')}<textarea rows={3} value={f.detail} onChange={change('detail')} placeholder={tr('Máy của bạn đang gặp vấn đề gì?', 'What is happening with your device?')} /></label>
      <div className="qb-side">
        <label>{tr('Thời gian cần hỗ trợ', 'When do you need help?')}<select value={f.urgency} onChange={change('urgency')}>{Object.entries(URGENCY).map(([key, labels]) => <option key={key} value={key}>{tr(labels[0], labels[1])}</option>)}</select></label>
        <button className="btn btn-lg" type="submit">{tr('Tiếp tục đặt lịch', 'Continue booking')}<Icon name="arrow" /></button>
        <small>{tr('Không cần tài khoản · Báo giá trước khi thực hiện', 'No account needed · Get a quote before we begin')}</small>
      </div>
    </div>
  </form>
}

export default function Home() {
  const nav = useNavigate()
  const hero = useRef<HTMLElement>(null)
  const { tr } = usePreferences()
  useTilt(hero)
  return <>
    <section className="hero3" ref={hero}>
      <div className="wrap hero-layout">
        <div className="hero-copy">
          <span className="chip glass"><span className="live-dot" />{tr('Hỗ trợ cá nhân & doanh nghiệp', 'For individuals & businesses')}</span>
          <h1>{tr('Có lỗi phần mềm?', 'A software issue?')}<br /><span className="grad">{tr('MicroTech giúp bạn.', 'MicroTech can help.')}</span></h1>
          <p className="lead">{tr('Cài phần mềm, xử lý sự cố và hỗ trợ IT từ xa. Đặt lịch trực tuyến chỉ trong 1 phút.', 'Software setup, troubleshooting and remote IT support. Book online in just one minute.')}</p>
          <div className="row hero-actions">
            <Link to="/booking" className="btn btn-lg booking-cta"><Icon name="calendar" />{tr('Đặt hỗ trợ ngay', 'Book support now')}<Icon name="arrow" /></Link>
            <Link to="/pricing" className="btn btn-ghost">{tr('Xem bảng giá', 'View pricing')}</Link>
          </div>
          <ul className="ticks"><li>{tr('Báo giá rõ ràng', 'Clear pricing')}</li><li>{tr('Bảo mật dữ liệu', 'Private & secure')}</li><li>{tr('Kết nối từ xa', 'Remote support')}</li></ul>
        </div>
        <div className="banner glass">
          <div className="banner-inner">
            <Img k="cover" className="banner-img" loading="eager" alt={tr('Laptop và các biểu tượng hỗ trợ phần mềm MicroTech', 'Laptop and MicroTech software support icons')} />
            <span className="art-shade" aria-hidden="true" />
            <span className="art-label glass"><Icon name="spark" />Windows · macOS · Mobile</span>
            <span className="scan" aria-hidden="true" />
            <div className="cover-contact glass" aria-label={tr('Liên hệ nhanh', 'Quick contact')}>
              {CONFIG.social.zalo && <a href={CONFIG.social.zalo} target="_blank" rel="noopener noreferrer" className="contact-link zalo-contact"><Img k="socialZalo" /><span><small>{tr('NHẮN TIN', 'MESSAGE US')}</small><b>{tr('Chat qua Zalo', 'Chat on Zalo')}</b></span><Icon name="external" /></a>}
              {CONFIG.hotline && <a href={`tel:${CONFIG.hotline.replace(/[^\d+]/g, '')}`} className="contact-link hotline-contact" aria-label={`${tr('Gọi hotline', 'Call hotline')} ${CONFIG.hotline}`}><span className="contact-icon"><Icon name="phone" /></span><span><small>HOTLINE</small><b>{CONFIG.hotline}</b></span></a>}
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="services" className="sheet">
      <div className="wrap">
        <div className="section-head reveal"><span className="eyebrow">{tr('DỊCH VỤ CỦA MICROTECH', 'MICROTECH SERVICES')}</span><h2>{tr('Để công nghệ đơn giản hơn.', 'Make technology simpler.')}</h2><p className="muted">{tr('Chọn dịch vụ phù hợp với thiết bị và nhu cầu của bạn.', 'Find the right help for your device and your needs.')}</p></div>
        <div className="grid4">{SERVICES.map((service, i) => <button type="button" key={service.id} className="svc2 glass reveal" style={{ '--i': i } as CSSProperties} onClick={() => nav(`/booking?service=${service.id}`)}>
          <Img k={service.img} className="svc-img" /><b>{tr(service.title, service.titleEn)}</b><span>{tr(service.desc, service.descEn)}</span><i aria-hidden="true"><Icon name="arrow" /></i><em className="sr">{tr('Chọn dịch vụ', 'Select service')}</em>
        </button>)}</div>
        <QuickBook />
        <div className="section-head why-h reveal"><span className="eyebrow">{tr('AN TÂM KHI ĐẶT LỊCH', 'BOOK WITH CONFIDENCE')}</span><h2>{tr('Vì sao chọn MicroTech?', 'Why MicroTech?')}</h2></div>
        <div className="why">{WHY.map(([key, viTitle, enTitle, viDesc, enDesc], i) => <div key={key} className="glass reveal" style={{ '--i': i } as CSSProperties}><Img k={key} className="why-img" /><div><b>{tr(viTitle, enTitle)}</b><p>{tr(viDesc, enDesc)}</p></div></div>)}</div>
      </div>
    </section>
    <ReviewsPreview />
  </>
}
