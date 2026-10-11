import { useEffect, useState, type RefObject } from 'react'

export function useActive(ref: RefObject<Element | null>, margin = '0px') {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let inView = false
    let visible = document.visibilityState === 'visible'
    const update = () => setActive(inView && visible)
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting
        update()
      },
      { rootMargin: margin }
    )
    io.observe(el)
    const onVis = () => {
      visible = document.visibilityState === 'visible'
      update()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ref, margin])
  return active
}
