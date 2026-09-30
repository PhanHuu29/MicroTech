import { Link } from 'react-router-dom'
import { PRICING } from '../lib/data'

export default function Pricing() {
  return (
    <section className="wrap page">
      <h1>Bảng giá</h1>
      <p className="muted">Giá khởi điểm cho từng nhóm dịch vụ.</p>
      <table className="price">
        <thead><tr><th>Dịch vụ</th><th>Giá từ</th></tr></thead>
        <tbody>{PRICING.map(([s, p]) => <tr key={s}><td>{s}</td><td><b>{p}</b></td></tr>)}</tbody>
      </table>
      <p className="note">Giá cuối cùng có thể thay đổi tùy tình trạng thiết bị và yêu cầu dịch vụ. MicroTech luôn xác nhận giá trước khi bắt đầu thực hiện.</p>
      <Link to="/booking" className="btn btn-lg">ĐẶT HỖ TRỢ NGAY</Link>
    </section>
  )
}
