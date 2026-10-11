import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Img } from '../../components/Img'
import { byId } from '../../data/work'
import { ui } from '../../lib/ui'
import { CommentIcon, HeartIcon, PinIcon } from '../reels/icons'

export const GRID = [
  'build-higher',
  'summer-camp',
  'navratri',
  'why-upgrad',
  'ganesh-chaturthi',
  'charcoal-panel',
  'impossible',
  'her-future',
  'har-khiladi',
  'uv-marble-walls',
  'republic-day',
  'admission-open',
  'doubts-to-confidence',
  'sapno-ko-hakikat',
  'makar-sankranti',
].filter((id) => byId[id])

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const scatter = GRID.map((_, i) => {
  const r = rng(i * 7919 + 2024)
  const col = i % 3
  const side = col - 1 || (r() < 0.5 ? -1 : 1) * 0.35
  return {
    dx: side * (45 + r() * 85) + (r() - 0.5) * 40,
    dy: (r() - 0.3) * 150,
    rot: (r() - 0.5) * 40,
    scale: 0.66 + r() * 0.5,
    z: Math.floor(r() * 10),
  }
})

const settle = (t: number) => t * t * (3 - 2 * t)

export function PostGrid() {
  const reduce = !!useReducedMotion()
  return (
    <div className="grid grid-cols-3 gap-[3px] sm:gap-1">
      {GRID.map((id, i) => (
        <Tile key={id} id={id} i={i} reduce={reduce} />
      ))}
    </div>
  )
}

function Tile({ id, i, reduce }: { id: string; i: number; reduce: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)
  const item = byId[id]
  const s = scatter[i]
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.32'] })
  const k = useTransform(scrollYProgress, (p) => (reduce ? 0 : 1 - settle(Math.min(1, Math.max(0, p)))))
  const x = useTransform(k, (v) => `${v * s.dx}%`)
  const y = useTransform(k, (v) => `${v * s.dy}%`)
  const rotate = useTransform(k, (v) => v * s.rot)
  const scale = useTransform(k, (v) => 1 + v * (s.scale - 1))
  const shadow = useTransform(k, (v) => Math.min(1, v * 2.2))
  const zIndex = useTransform(k, (v) => (v > 0.02 ? 10 + s.z : 0))
  const lastRow = GRID.length - 3
  const round = i === lastRow ? 'sm:rounded-bl-[24px]' : i === GRID.length - 1 ? 'sm:rounded-br-[24px]' : ''

  return (
    <motion.button
      ref={ref}
      type="button"
      data-cursor="VIEW"
      aria-label={`View ${item.title} — ${item.brand}`}
      onClick={() => ui.openLightbox(GRID, i)}
      style={{ x, y, rotate, scale, zIndex }}
      className="group relative block aspect-[4/5] w-full overflow-visible will-change-transform focus-visible:z-20"
    >
      <motion.span
        aria-hidden
        style={{ opacity: shadow }}
        className={`pointer-events-none absolute inset-0 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(248,248,248,0.06)] ${round}`}
      />
      <span className={`absolute inset-0 overflow-hidden ${round}`}>
        <Img
          item={item}
          sizes="(max-width: 640px) 34vw, 312px"
          className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-[1.04]"
        />
      </span>
      {i < 2 && (
        <PinIcon aria-hidden className="absolute right-2 top-2 h-4 w-4 rotate-45 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:h-5 sm:w-5" />
      )}
      <span className={`pointer-events-none absolute inset-0 flex items-center justify-center gap-6 bg-black/45 ${round} text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100`}>
        <HeartIcon filled className="h-6 w-6" strokeWidth={0} />
        <CommentIcon className="h-6 w-6 fill-white" strokeWidth={0} />
      </span>
    </motion.button>
  )
}
