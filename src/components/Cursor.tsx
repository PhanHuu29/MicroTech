import { useEffect, useRef } from 'react'

/** Desktop-only cursor FX: soft glow + trailing ring that grows on links and stretches in the scroll direction. The native cursor stays visible. */
export default function Cursor() {
  const glow = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, gx = x, gy = y, raf = 0, lastY = scrollY, timer = 0
    const loop = () => {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2; gx += (x - gx) * 0.08; gy += (y - gy) * 0.08
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`
      if (glow.current) glow.current.style.transform = `translate3d(${gx}px,${gy}px,0)`
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`
      raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY
      root.classList.add('cursor-on')
      const hot = (e.target as Element | null)?.closest('a,button,select,label,input,textarea,summary')
      ring.current?.classList.toggle('hot', !!hot)
    }
    const scroll = () => {
      const d = scrollY - lastY; lastY = scrollY
      if (!ring.current || d === 0) return
      ring.current.dataset.dir = d > 0 ? 'down' : 'up'
      ring.current.classList.add('scrolling')
      clearTimeout(timer)
      timer = window.setTimeout(() => ring.current?.classList.remove('scrolling'), 220)
    }
    const out = () => root.classList.remove('cursor-on')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', scroll, { passive: true })
    document.addEventListener('mouseleave', out)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer)
      window.removeEventListener('pointermove', move); window.removeEventListener('scroll', scroll)
      document.removeEventListener('mouseleave', out); root.classList.remove('cursor-on')
    }
  }, [])

  return (
    <div aria-hidden>
      <div ref={glow} className="cur-glow" />
      <div ref={ring} className="cur-ring"><span /></div>
      <div ref={dot} className="cur-dot" />
    </div>
  )
}
