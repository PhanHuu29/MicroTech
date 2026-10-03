import { useState, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { STATUSES } from '../lib/data'
import { findOrder, orderService, orderUrgency, type Order } from '../lib/orders'
import { usePreferences } from '../lib/preferences'

export default function Track() {
  const [params] = useSearchParams()
  const { state } = useLocation()
  const { tr } = usePreferences()
  const [code, setCode] = useState(params.get('code') ?? '')
  const initialPhone = typeof state?.phone === 'string' ? state.phone : ''
  const [phone, setPhone] = useState(initialPhone)
  const [order, setOrder] = useState<Order | null | undefined>(() => params.get('code') && initialPhone ? findOrder(params.get('code')!, initialPhone) ?? null : undefined)
  const search = (event: FormEvent) => { event.preventDefault(); setOrder(findOrder(code, phone) ?? null) }
  const index = order ? Math.max(0, STATUSES.findIndex((s) => s.id === order.status)) : -1
  return <section className="wrap page narrow">
    <span className="eyebrow">{tr('ĐƠN HỖ TRỢ CỦA BẠN', 'YOUR SUPPORT REQUEST')}</span>
    <h1>{tr('Tra cứu đơn hỗ trợ', 'Track your request')}</h1>
    <p className="muted">{tr('Nhập mã đơn và số điện thoại đã dùng khi đặt lịch.', 'Enter your request code and the phone number used to book.')}</p>
    <div className="booking-card glass"><form onSubmit={search} className="form">
      <label>{tr('Mã đơn hỗ trợ', 'Support request code')}<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="MT-20261003-A1B2C3D4" required autoCapitalize="characters" /></label>
      <label>{tr('Số điện thoại', 'Phone number')}<input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
      <button type="submit" className="btn">{tr('Tra cứu đơn', 'Find request')}</button>
    </form></div>
    <p className="muted track-note">{tr('Tra cứu hiện dùng dữ liệu đã lưu trên cùng trình duyệt/thiết bị đặt đơn. Liên hệ MicroTech để biết tiến độ mới nhất.', 'Tracking currently uses requests saved in the same browser and device. Contact MicroTech for the latest progress.')}</p>
    {order === null && <p className="err" role="alert">{tr('Không tìm thấy đơn trên thiết bị này. Kiểm tra mã đơn, số điện thoại hoặc liên hệ MicroTech.', 'No matching request on this device. Check the code and phone number or contact MicroTech.')}</p>}
    {order && <div className="result glass" role="status">
      <h2>{tr(STATUSES[index].label, STATUSES[index].labelEn)}</h2><p className="muted">{tr(STATUSES[index].msg, STATUSES[index].msgEn)}</p>
      <ol className="stepper">{STATUSES.map((status, i) => <li key={status.id} className={i === index ? 'on' : i < index ? 'ok' : ''}><i>{i < index ? '✓' : i + 1}</i><span>{tr(status.label, status.labelEn)}</span></li>)}</ol>
      <dl className="summary">
        <dt>{tr('Dịch vụ', 'Service')}</dt><dd>{orderService(order, tr)}</dd>
        <dt>{tr('Lịch hỗ trợ', 'Support time')}</dt><dd>{order.date ? `${order.date.split('-').reverse().join('/')} · ${order.slot}` : orderUrgency(order, tr)}</dd>
        <dt>{tr('Giá dự kiến', 'Estimated price')}</dt><dd>{order.price ?? tr('Đang chờ báo giá', 'Awaiting a quote')}</dd>
        <dt>{tr('Ghi chú kỹ thuật viên', 'Technician notes')}</dt><dd>{order.note ?? tr('Chưa có ghi chú', 'No notes yet')}</dd>
        <dt>{tr('Kết nối hỗ trợ từ xa', 'Remote support link')}</dt><dd>{index >= 2 ? tr('Sẽ gửi qua Zalo/email trước giờ hẹn', 'Sent via Zalo/email before your appointment') : tr('Gửi sau khi xác nhận lịch', 'Sent after your appointment is confirmed')}</dd>
      </dl>
      <Link to="/reviews#write-review" className="btn btn-ghost">{tr('Đánh giá sau khi sử dụng dịch vụ', 'Review after using the service')}</Link>
    </div>}
  </section>
}
