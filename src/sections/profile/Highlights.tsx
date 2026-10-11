import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { byId, categories, src } from '../../data/work'
import { cn, ease } from '../../lib/hooks'
import { ui } from '../../lib/ui'
import { ChevronLeft, ChevronRight } from '../reels/icons'

export function Highlights() {
  const ref = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const measure = () => {
      raf = 0
      const start = el.scrollLeft <= 2
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
      setEdges((p) => (p.start === start && p.end === end ? p : { start, end }))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    el.addEventListener('scroll', on, { passive: true })
    const ro = new ResizeObserver(on)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', on)
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  const page = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' })
  }

  const fadeL = edges.start ? '#000' : 'transparent'
  const fadeR = edges.end ? '#000' : 'transparent'
  const mask = `linear-gradient(90deg, ${fadeL} 0, #000 56px, #000 calc(100% - 56px), ${fadeR} 100%)`

  return (
    <div className="relative">
      <motion.ul
        ref={ref}
        className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 py-2 sm:-mx-8 sm:scroll-px-8 sm:gap-6 sm:px-8 lg:gap-7"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      >
        {categories.map((cat) => {
          const cover = byId[cat.cover]
          return (
            <motion.li
              key={cat.id}
              className="shrink-0 snap-start"
              variants={{
                hidden: { opacity: 0, y: 18, scale: 0.85 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease } },
              }}
            >
              <button
                type="button"
                data-cursor="OPEN"
                aria-label={`Open ${cat.label} stories`}
                onClick={() => ui.openStory(cat.id)}
                className="group flex w-[72px] flex-col items-center gap-2 sm:w-[88px]"
              >
                <span className="relative block h-[68px] w-[68px] rounded-full p-[3px] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-105 group-active:scale-95 sm:h-[86px] sm:w-[86px]">
                  <span className="absolute inset-0 rounded-full border border-paper/25 transition-colors duration-300 group-hover:border-red" />
                  <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,#f40816,#ff7a00,#ff2d87,#f40816)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  <span className="relative block h-full w-full overflow-hidden rounded-full border-[3px] border-black bg-ink-3">
                    {cover && (
                      <img
                        src={src(cover.id)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-110"
                        style={{ backgroundColor: cover.color }}
                      />
                    )}
                  </span>
                </span>
                <span className="max-w-full truncate text-[12px] font-semibold text-paper/90">{cat.short}</span>
              </button>
            </motion.li>
          )
        })}
      </motion.ul>
      <ScrollArrow dir={-1} hidden={edges.start} onClick={() => page(-1)} />
      <ScrollArrow dir={1} hidden={edges.end} onClick={() => page(1)} />
    </div>
  )
}

function ScrollArrow({ dir, hidden, onClick }: { dir: 1 | -1; hidden: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir < 0 ? 'Scroll highlights left' : 'Scroll highlights right'}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden}
      onClick={onClick}
      className={cn(
        'absolute top-[calc(0.5rem+43px)] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center transition-opacity duration-300 [@media(hover:hover)]:sm:flex',
        dir < 0 ? '-left-5' : '-right-5',
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-110">
        {dir < 0 ? <ChevronLeft className="h-4 w-4" strokeWidth={2.6} /> : <ChevronRight className="h-4 w-4" strokeWidth={2.6} />}
      </span>
    </button>
  )
}
