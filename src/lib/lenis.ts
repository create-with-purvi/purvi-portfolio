import Lenis from 'lenis'

let instance: Lenis | null = null

export function initLenis() {
  if (instance) return instance
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  instance = new Lenis({ autoRaf: true, lerp: 0.1 })
  ;(window as unknown as { __lenis: Lenis }).__lenis = instance
  return instance
}

export const getLenis = () => instance

export function scrollToTarget(target: string | number | HTMLElement, offset = 0) {
  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.4 })
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  el?.scrollIntoView({ behavior: 'smooth' })
}

export function lockScroll() {
  instance?.stop()
  document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  instance?.start()
  document.documentElement.style.overflow = ''
}
