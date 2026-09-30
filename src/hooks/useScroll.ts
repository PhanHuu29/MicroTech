import { useEffect } from 'react'

/** Writes scroll state to CSS variables/classes on <html>: --scroll-y, --progress, .scrolled */
export function useScrollFx() {
  useEffect(() => {
    const root = document.documentElement
    let ticking = false
    const update = () => {
      const y = window.scrollY, max = root.scrollHeight - window.innerHeight
      root.style.setProperty('--scroll-y', String(Math.round(y)))
      root.style.setProperty('--progress', String(max > 0 ? Math.min(y / max, 1) : 0))
      root.classList.toggle('scrolled', y > 24)
      ticking = false
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])
}

/** Adds `.in` to every `.reveal` element the first time it scrolls into view. Re-scans when `dep` changes (route change). */
export function useReveal(dep: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal:not(.in)')
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((e) => e.classList.add('in')); return
    }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) }
    }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [dep])
}
