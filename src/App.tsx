import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Booking from './pages/Booking'
import Track from './pages/Track'
import { SERVICES } from './lib/data'
import { CONFIG } from './config'
import { Img } from './components/Img'
import { useReveal, useScrollFx } from './hooks/useScroll'
import Cursor from './components/Cursor'

const Logo = () => {
  const [pop, setPop] = useState(false)
  const { pathname, hash } = useLocation()
  // Already on the home page: the route doesn't change, so scroll back to the top ourselves.
  const goHome = () => {
    setPop(true)
    if (pathname === '/' && !hash) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <Link to="/" className={'logo' + (pop ? ' popped' : '')} aria-label={`${CONFIG.brand} – trang chủ`} onClick={goHome}>
      <Img k="logoIcon" className="logo-icon" onAnimationEnd={() => setPop(false)} />
      <Img k="logoText" className="logo-text" />
    </Link>
  )
}

export default function App() {
  const { pathname, hash } = useLocation()
  useScrollFx()
  useReveal(pathname)
  const [open, setOpen] = useState(false)
  useEffect(() => { document.title = `${CONFIG.brand} – Đặt hỗ trợ IT online trong 1 phút` }, [])
  useEffect(() => {
    setOpen(false)
    const target = hash ? document.querySelector(hash) : null
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: pathname === '/' ? 'smooth' : 'auto' })
  }, [pathname, hash])
  const onBooking = pathname.startsWith('/booking')

  return (
    <>
      <Cursor />
      <div className="progress" aria-hidden />
      <header className="nav">
        <div className="wrap nav-in">
          <Logo />
          <button className="burger" aria-expanded={open} aria-label="Mở menu" onClick={() => setOpen(!open)}>☰</button>
          <nav className={open ? 'links open' : 'links'}>
            <NavLink to="/#services">Dịch vụ</NavLink>
            <NavLink to="/pricing">Bảng giá</NavLink>
            <NavLink to="/booking">Đặt hỗ trợ</NavLink>
            <NavLink to="/track">Tra cứu đơn</NavLink>
          </nav>
          <Link to="/booking" className="btn btn-sm desk">📅 Đặt hỗ trợ</Link>
        </div>
      </header>

      <main>
        <div key={pathname} className="route-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/track" element={<Track />} />
          <Route path="*" element={<section className="wrap page"><h1>Không tìm thấy trang</h1><Link className="btn" to="/">Về trang chủ</Link></section>} />
        </Routes>
        </div>
      </main>

      <footer className="foot">
        <div className="wrap foot-in">
          <div className="foot-brand"><Logo /><p>Giải pháp phần mềm và hỗ trợ IT đáng tin cậy</p></div>
          <div><h3>Dịch vụ</h3>{SERVICES.map((x) => <Link key={x.id} to={`/booking?service=${x.id}`}>{x.title}</Link>)}</div>
          <div><h3>Hỗ trợ</h3><Link to="/pricing">Bảng giá</Link><Link to="/booking">Đặt hỗ trợ</Link><Link to="/track">Tra cứu đơn</Link></div>
          <div><h3>Liên hệ</h3><a href="tel:0377339643">📞 {CONFIG.hotline}</a><span>💬 Inbox / Zalo: {CONFIG.hotline}</span><span>✉️ {CONFIG.email}</span></div>
          <div><h3>Kết nối với chúng tôi</h3>
            <div className="social">
              {CONFIG.social.facebook && <a href={CONFIG.social.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Img k="socialFacebook" /></a>}
              {CONFIG.social.youtube && <a href={CONFIG.social.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer"><Img k="socialYoutube" /></a>}
              {CONFIG.social.zalo && <a href={CONFIG.social.zalo} aria-label="Zalo" target="_blank" rel="noopener noreferrer"><Img k="socialZalo" /></a>}
            </div></div>
          <p className="policy">MicroTech chỉ hỗ trợ phần mềm, tài khoản và bản quyền hợp pháp do khách hàng sở hữu. Chúng tôi không hỗ trợ bypass iCloud/FRP, truy cập tài khoản, xâm nhập dữ liệu cá nhân hoặc vượt qua khóa bảo mật. Thông tin khách hàng được bảo mật trong suốt quá trình hỗ trợ.</p>
        </div>
      </footer>

      {!onBooking && <Link to="/booking" className="btn fab">📅 Đặt hỗ trợ</Link>}
    </>
  )
}
