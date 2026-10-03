import { Link } from 'react-router-dom'
import { PRICING } from '../lib/data'
import { usePreferences } from '../lib/preferences'
import { Icon } from '../components/Icon'

export default function Pricing() {
  const { tr, language } = usePreferences()
  return <section className="wrap page">
    <span className="eyebrow">{tr('CHI PHÍ MINH BẠCH', 'TRANSPARENT PRICING')}</span>
    <h1>{tr('Bảng giá dịch vụ', 'Service pricing')}</h1>
    <p className="muted">{tr('Giá khởi điểm cho từng nhóm dịch vụ.', 'Starting prices for each service category.')}</p>
    <div className="table-wrap glass"><table className="price">
      <thead><tr><th scope="col">{tr('Dịch vụ', 'Service')}</th><th scope="col">{tr('Giá từ', 'From')}</th></tr></thead>
      <tbody>{PRICING.map((item) => <tr key={item.title}><td>{tr(item.title, item.titleEn)}</td><td><b>{item.price === null ? tr('Liên hệ', 'Contact us') : new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(item.price)}</b></td></tr>)}</tbody>
    </table></div>
    <p className="note">{tr('Giá cuối cùng tùy tình trạng thiết bị và yêu cầu dịch vụ. MicroTech luôn xác nhận giá trước khi bắt đầu thực hiện.', 'Final pricing depends on your device and request. MicroTech confirms the cost before starting any work.')}</p>
    <Link to="/booking" className="btn btn-lg"><Icon name="calendar" />{tr('Đặt hỗ trợ ngay', 'Book support now')}<Icon name="arrow" /></Link>
  </section>
}
