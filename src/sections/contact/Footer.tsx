import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { site } from '../../data/site'
import { scrollToTarget } from '../../lib/lenis'

const WORD = site.first.toUpperCase()

function Rise({ ch, i, progress }: { ch: string; i: number; progress: MotionValue<number> }) {
  const start = 0.05 + i * 0.07
  const y = useTransform(progress, [start, start + 0.55], ['105%', '0%'])
  const rotate = useTransform(progress, [start, start + 0.55], [8, 0])
  return (
    <span aria-hidden className="inline-block overflow-hidden pb-[0.02em] align-bottom">
      <motion.span className="inline-block origin-bottom-left will-change-transform" style={{ y, rotate }}>
        {ch}
      </motion.span>
    </span>
  )
}

export function Footer() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const dot = useTransform(scrollYProgress, [0.75, 1], [0, 1])
  const year = new Date().getFullYear()

  return (
    <footer ref={ref} className="relative mt-24 border-t border-paper/10 pt-8 lg:mt-32">
      <div className="@container px-5 sm:px-8 lg:px-12">
        <p className="display flex items-end whitespace-nowrap text-[45.5cqw] leading-[0.8] text-paper">
          <span className="sr-only">{site.first}</span>
          {[...WORD].map((ch, i) =>
            reduce ? (
              <span key={i} aria-hidden className="inline-block">
                {ch}
              </span>
            ) : (
              <Rise key={i} ch={ch} i={i} progress={scrollYProgress} />
            )
          )}
          <motion.span
            aria-hidden
            style={reduce ? undefined : { scale: dot }}
            className="mb-[0.005em] ml-[0.035em] inline-block h-[0.105em] w-[0.105em] shrink-0 rounded-full bg-red"
          />
        </p>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4 px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] sm:items-center sm:px-8 lg:px-12">
        <p className="kicker flex flex-col gap-2 text-[10px] text-paper/45 sm:flex-row sm:items-center sm:gap-3">
          <span>
            © {year} {site.name}
          </span>
          <span aria-hidden className="hidden text-red sm:inline">
            ●
          </span>
          <span>Designed for the scroll</span>
        </p>
        <button
          type="button"
          onClick={() => scrollToTarget(0)}
          aria-label="Back to top"
          className="group kicker flex h-12 shrink-0 items-center gap-3 rounded-full border border-paper/15 p-1.5 text-[10px] text-paper/75 transition-colors hover:border-paper/40 hover:text-paper sm:h-11 sm:pl-5"
        >
          <span className="hidden sm:inline">Back to top</span>
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-paper text-ink sm:h-8 sm:w-8">
            <span className="relative block h-4 w-4 overflow-hidden">
              <span className="absolute inset-0 grid place-items-center transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">↑</span>
              <span className="absolute inset-0 grid translate-y-full place-items-center transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0">
                ↑
              </span>
            </span>
          </span>
        </button>
      </div>
    </footer>
  )
}
