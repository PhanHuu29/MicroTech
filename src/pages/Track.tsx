import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { STATUSES } from '../lib/data'
import { findOrder, type Order } from '../lib/orders'

export default function Track() {
  const [p] = useSearchParams()
  const [code, setCode] = useState(p.get('code') ?? '')
  const [phone, setPhone] = useState(p.get('phone') ?? '')
  const [order, setOrder] = useState<Order | null | undefined>(() =>
    p.get('code') && p.get('phone') ? findOrder(p.get('code')!, p.get('phone')!) ?? null : undefined)

  const search = (e: FormEvent) => { e.preventDefault(); setOrder(findOrder(code, phone) ?? null) }
  const idx = order ? STATUSES.findIndex((s) => s.id === order.status) : -1

  return (
    <section className="wrap page narrow">
      <h1>Tra cứu đơn hỗ trợ</h1>
      <p className="muted">Nhập mã đơn và số điện thoại đã dùng khi đặt lịch.</p>
      <form onSubmit={search} className="form">
        <label>Mã đơn hỗ trợ<input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MT-20261001-001" required /></label>
        <label>Số điện thoại<input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>
        <button className="btn">Tra cứu đơn</button>
      </form>

      {order === null && <p className="err" role="alert">Không tìm thấy đơn. Hãy kiểm tra lại mã đơn và số điện thoại.</p>}
      {order && (
        <div className="result" role="status">
          <h2>{STATUSES[idx].label}</h2><p className="muted">{STATUSES[idx].msg}</p>
          <ol className="stepper">{STATUSES.map((s, i) => <li key={s.id} className={i === idx ? 'on' : i < idx ? 'ok' : ''}><i>{i < idx ? '✓' : i + 1}</i><span>{s.label}</span></li>)}</ol>
          <dl className="summary">
            <dt>Dịch vụ</dt><dd>{order.service}</dd>
            <dt>Lịch hỗ trợ</dt><dd>{order.date ? `${order.date.split('-').reverse().join('/')} · ${order.slot}` : order.urgency}</dd>
            <dt>Giá báo</dt><dd>{order.price ?? 'Đang chờ báo giá'}</dd>
            <dt>Ghi chú kỹ thuật viên</dt><dd>{order.note ?? 'Chưa có ghi chú'}</dd>
            <dt>Liên kết hỗ trợ từ xa</dt><dd>{idx >= 2 ? 'Sẽ được gửi qua Zalo/email trước giờ hẹn' : 'Hiển thị sau khi lịch được xác nhận'}</dd>
          </dl>
        </div>)}
    </section>
  )
}
