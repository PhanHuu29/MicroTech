import { useEffect } from 'react'

/** Hiệu ứng nổi + gợn sáng cho chuột, bàn phím và cảm ứng. */
export function usePressFx() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const press = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>('.btn, .svc2')
      if (!element) return
      const rect = element.getBoundingClientRect()
      element.style.setProperty('--press-x', `${event.detail ? event.clientX - rect.left : rect.width / 2}px`)
      element.style.setProperty('--press-y', `${event.detail ? event.clientY - rect.top : rect.height / 2}px`)
      element.classList.remove('is-pressed')
      void element.offsetWidth
      element.classList.add('is-pressed')
    }
    const finish = (event: AnimationEvent) => {
      if (event.animationName === 'press-glow') (event.target as Element)?.classList.remove('is-pressed')
    }
    document.addEventListener('click', press)
    document.addEventListener('animationend', finish)
    return () => { document.removeEventListener('click', press); document.removeEventListener('animationend', finish) }
  }, [])
}
