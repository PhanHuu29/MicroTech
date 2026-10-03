import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Booking from './pages/Booking'
import Track from './pages/Track'
import { SERVICES } from './lib/data'
import { Img } from './components/Img'
import { Icon } from './components/Icon'
import { useReveal, useScrollFx } from './hooks/useScroll'
import { usePressFx } from './hooks/usePressFx'
import { CONFIG } from './config'
import { usePreferences } from './lib/preferences'
import Cursor from './components/Cursor'

const Logo = () => {
  const [pop, setPop] = useState(false)
  const { pathname, hash } = useLocation()
  const { tr } = usePreferences()
  return <Link to="/" className={'logo' + (pop ? ' popped' : '')} aria-label={`${CONFIG.brand} – ${tr('trang chủ', 'home')}`} onClick={() => {
    setPop(true)
    if (pathname === '/' && !hash) window.scrollTo({ top: 0, behavior: 'smooth' })
  }}>
    <Img k="logoIcon" className="logo-icon" onAnimationEnd={() => setPop(false)} />
    {CONFIG.brand === 'MicroTech' ? <Img k="logoText" className="logo-text" /> : <b>{CONFIG.brand}</b>}
  </Link>
}

export default function App() {
  const { pathname, hash } = useLocation()
  const { language, setLanguage, theme, toggleTheme, tr } = usePreferences()
  const [open, setOpen] = useState(false)
  const [heroCtaVisible, setHeroCtaVisible] = useState(true)
  useScrollFx()
  useReveal(pathname)
  usePressFx()
  useEffect(() => {
    document.title = `${CONFIG.brand} – ${tr('Đặt hỗ trợ IT online trong 1 phút', 'Book IT support online in one minute')}`
    document.querySelector('meta[name="description"]')?.setAttribute('content', tr(
      `${CONFIG.brand} – cài đặt phần mềm, xử lý lỗi và hỗ trợ IT từ xa. Đặt hỗ trợ online trong 1 phút.`,
      `${CONFIG.brand} – software setup, troubleshooting and remote IT support. Book online in one minute.`,
    ))
  }, [CONFIG.brand, language])
  useEffect(() => {
    setOpen(false)
    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])
  useEffect(() => {
    if (pathname !== '/') return
    const button = document.querySelector('.booking-cta')
    if (!button || !('IntersectionObserver' in window)) { setHeroCtaVisible(false); return }
    const observer = new IntersectionObserver(([entry]) => setHeroCtaVisible(entry.isIntersecting), { rootMargin: '-76px 0px 0px 0px' })
    observer.observe(button)
    return () => observer.disconnect()
  }, [pathname])
  const onBooking = pathname.startsWith('/booking')
  return <>
    <a href="#content" className="skip">{tr('Đến nội dung chính', 'Skip to content')}</a>
    <Cursor />
    <div className="progress" aria-hidden="true" />
    <header className="nav glass">
      <div className="wrap nav-in">
        <Logo />
        <nav id="main-menu" aria-label={tr('Điều hướng chính', 'Main navigation')} className={open ? 'links open' : 'links'}>
          <Link to="/#services" onClick={() => setOpen(false)}>{tr('Dịch vụ', 'Services')}</Link>
          <NavLink to="/pricing">{tr('Bảng giá', 'Pricing')}</NavLink>
          <NavLink to="/booking">{tr('Đặt hỗ trợ', 'Book support')}</NavLink>
          <NavLink to="/track">{tr('Tra cứu đơn', 'Track request')}</NavLink>
        </nav>
        <div className="nav-controls">
          <div className="language-switch" role="group" aria-label={tr('Ngôn ngữ', 'Language')}>
            <button type="button" lang="vi" aria-label="Tiếng Việt" aria-pressed={language === 'vi'} onClick={() => setLanguage('vi')}>VI</button>
            <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
          </div>
          <button type="button" className="icon-btn theme-toggle" aria-label={theme === 'light' ? tr('Chuyển chế độ tối', 'Switch to dark mode') : tr('Chuyển chế độ sáng', 'Switch to light mode')} title={theme === 'light' ? tr('Chế độ tối', 'Dark mode') : tr('Chế độ sáng', 'Light mode')} onClick={toggleTheme}>
            <Icon name={theme === 'light' ? 'moon' : 'sun'} />
          </button>
          <button className="icon-btn burger" type="button" aria-controls="main-menu" aria-expanded={open} aria-label={tr(open ? 'Đóng menu' : 'Mở menu', open ? 'Close menu' : 'Open menu')} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button>
        </div>
        <Link to="/booking" className="btn btn-sm desk"><Icon name="calendar" />{tr('Đặt hỗ trợ', 'Book support')}</Link>
      </div>
    </header>
    <main id="content" tabIndex={-1}>
      <div key={pathname} className="route-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/track" element={<Track />} />
          <Route path="*" element={<section className="wrap page"><h1>{tr('Không tìm thấy trang', 'Page not found')}</h1><Link className="btn" to="/">{tr('Về trang chủ', 'Back to home')}</Link></section>} />
        </Routes>
      </div>
    </main>
    <footer className="foot">
      <div className="wrap foot-in">
        <div className="foot-brand"><Logo /><p>{tr('Giải pháp phần mềm và hỗ trợ IT đáng tin cậy.', 'Reliable software solutions and IT support.')}</p></div>
        <div><h3>{tr('Dịch vụ', 'Services')}</h3>{SERVICES.map((service) => <Link key={service.id} to={`/booking?service=${service.id}`}>{tr(service.title, service.titleEn)}</Link>)}</div>
        <div><h3>{tr('Hỗ trợ', 'Support')}</h3><Link to="/pricing">{tr('Bảng giá', 'Pricing')}</Link><Link to="/booking">{tr('Đặt hỗ trợ', 'Book support')}</Link><Link to="/track">{tr('Tra cứu đơn', 'Track request')}</Link></div>
        <div><h3>{tr('Liên hệ', 'Contact')}</h3>
          {CONFIG.hotline && <a className="foot-phone" href={`tel:${CONFIG.hotline.replace(/[^\d+]/g, '')}`}><Icon name="phone" />{CONFIG.hotline}</a>}
          {CONFIG.email && <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>}
          <div className="social">
            {CONFIG.social.facebook && <a href={CONFIG.social.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Img k="socialFacebook" /></a>}
            {CONFIG.social.youtube && <a href={CONFIG.social.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer"><Img k="socialYoutube" /></a>}
            {CONFIG.social.zalo && <a href={CONFIG.social.zalo} aria-label="Zalo" target="_blank" rel="noopener noreferrer"><Img k="socialZalo" /></a>}
            {CONFIG.social.email && <a href={CONFIG.social.email} aria-label="Email" target="_blank" rel="noopener noreferrer"><Img k="socialEmail" /></a>}
          </div>
        </div>
        <p className="policy">{tr(`${CONFIG.brand} chỉ hỗ trợ phần mềm, tài khoản và bản quyền hợp pháp do khách hàng sở hữu. Chúng tôi không hỗ trợ bypass iCloud/FRP, truy cập tài khoản, xâm nhập dữ liệu cá nhân hoặc vượt qua khóa bảo mật. Thông tin khách hàng được bảo mật trong suốt quá trình hỗ trợ.`, `${CONFIG.brand} only supports software, accounts and licences legally owned by customers. We do not bypass iCloud/FRP locks, access others' accounts, intrude on personal data or defeat security locks. Your information stays private throughout the support session.`)}</p>
        <div className="foot-bottom"><span>© {new Date().getFullYear()} {CONFIG.brand}</span></div>
      </div>
    </footer>
    {!onBooking && (pathname !== '/' || !heroCtaVisible) && <Link to="/booking" className="btn fab"><Icon name="calendar" />{tr('Đặt hỗ trợ ngay', 'Book support now')}<Icon name="arrow" /></Link>}
  </>
}
