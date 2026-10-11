import { useInView } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { reels } from '../../data/site'
import { cn } from '../../lib/hooks'
import { Phone } from './Phone'
import { ReelScreen } from './ReelScreen'
import { usePageVisible } from './usePageVisible'

export function MobileReels({ reduce }: { reduce: boolean }) {
  const scroller = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [pausedId, setPausedId] = useState<string | null>(null)
  const inView = useInView(scroller, { amount: 0.45 })
  const visible = usePageVisible()

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    let raf = 0
    const measure = () => {
      raf = 0
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let dist = Infinity
      Array.from(el.children).forEach((c, i) => {
        const node = c as HTMLElement
        const d = Math.abs(node.offsetLeft + node.offsetWidth / 2 - mid)
        if (d < dist) {
          dist = d
          best = i
        }
      })
      setActive(best)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const goTo = useCallback((i: number) => {
    const el = scroller.current
    const node = el?.children[i] as HTMLElement | undefined
    if (!el || !node) return
    el.scrollTo({ left: node.offsetLeft - (el.clientWidth - node.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' })
  }, [reduce])

  return (
    <div className="relative mt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[45%] h-[110vw] w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,8,22,0.26)_0%,rgba(244,8,22,0.06)_45%,transparent_70%)]"
      />
      <div
        ref={scroller}
        className="no-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[calc((100vw-min(66vw,300px))/2)] py-6"
      >
        {reels.map((r, i) => {
          const on = i === active
          return (
            <div
              key={r.id}
              className={cn(
                'w-[min(66vw,300px)] shrink-0 snap-center snap-always transition-[transform,opacity] duration-500 ease-[var(--ease-expo)]',
                on ? 'scale-100 opacity-100' : 'scale-[0.86] opacity-60'
              )}
            >
              <Phone className="w-full" data-cursor="PLAY">
                <ReelScreen
                  reel={r}
                  active={on}
                  paused={pausedId === r.id}
                  playing={on && pausedId !== r.id && inView && visible && !reduce}
                  onTap={() => {
                    if (on) setPausedId((p) => (p === r.id ? null : r.id))
                    else goTo(i)
                  }}
                  sizes="66vw"
                />
              </Phone>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-center">
        {reels.map((r, i) => (
          <button
            key={r.id}
            type="button"
            aria-label={`Reel ${i + 1}: ${r.brand}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
            className="flex h-11 w-7 items-center justify-center"
          >
            <span
              className={cn(
                'block h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-expo)]',
                i === active ? 'w-5 bg-red' : 'w-1.5 bg-paper/30'
              )}
            />
          </button>
        ))}
      </div>
      <p className="kicker mt-1 text-center text-paper/40">Swipe · tap to pause · double-tap ♥</p>
    </div>
  )
}
