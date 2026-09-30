import { useEffect, type RefObject } from 'react'

/** Pointer-driven 3D tilt: sets --rx/--ry (degrees) and --mx/--my (% for the sheen) on the element. */
export function useTilt(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2))
        el.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2))
        el.style.setProperty('--mx', (x * 100).toFixed(1))
        el.style.setProperty('--my', (y * 100).toFixed(1))
      })
    }
    const leave = () => { el.style.setProperty('--ry', '0'); el.style.setProperty('--rx', '0') }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [ref])
}
