import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { realReels } from '../../data/site'
import { cn, ease } from '../../lib/hooks'
import { getLenis, scrollToTarget } from '../../lib/lenis'
import { ChevronLeft, ChevronRight } from './icons'
import { Phone } from './Phone'
import { ReelScreen } from './ReelScreen'
import { usePageVisible } from './usePageVisible'

const N = realReels.length
const D = 0.14
const DRAG_PX = 230
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const invInOut = (y: number) => (y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2)
const seg = (x: number) => {
  const k = Math.min(Math.floor(x), N - 1)
  return k + inOut(clamp((x - k - D) / (1 - 2 * D), 0, 1))
}
const rawFor = (q: number) => {
  const c = clamp(q, 0, N - 1)
  const k = Math.min(Math.floor(c), N - 2)
  const y = c - k
  if (y <= 0) return k
  if (y >= 1) return k + 1
  return k + D + invInOut(y) * (1 - 2 * D)
}
const wrapDist = (i: number, a: number) => {
  const d = Math.abs(i - a) % N
  return Math.min(d, N - d)
}
const cleanCaption = (c: string) => c.replace(/\s*\p{Extended_Pictographic}[\s\S]*$/u, '')

export function DesktopReels({ reduce }: { reduce: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const pos = useTransform(scrollYProgress, (v) => seg(clamp(v, 0, 1) * (N - 1)))
  const word = useTransform(scrollYProgress, [0, 1], ['14%', '-14%'])
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  const [active, setActive] = useState(0)
  const [pausedId, setPausedId] = useState<string | null>(null)
  const [soundId, setSoundId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inView = useInView(stage, { amount: 0.35 })
  const visible = usePageVisible()
  const drag = useRef<{ id: number; x: number; q0: number; moved: boolean } | null>(null)
  const swallowClick = useRef(false)

  useMotionValueEvent(pos, 'change', (v) => {
    const a = clamp(Math.round(v), 0, N - 1)
    setActive((prev) => (prev === a ? prev : a))
  })

  useEffect(() => {
    setPausedId(null)
    setSoundId(null)
  }, [active])

  useEffect(() => {
    if (!inView || !visible) setSoundId(null)
  }, [inView, visible])

  const yFor = (raw: number) => {
    const el = wrap.current
    if (!el) return window.scrollY
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    return top + (span * raw) / (N - 1)
  }

  const goTo = (i: number) => scrollToTarget(yFor(clamp(i, 0, N - 1)))

  const jump = (y: number) => {
    const l = getLenis()
    if (l) l.scrollTo(y, { immediate: true, force: true })
    else window.scrollTo(0, y)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.target instanceof Element && e.target.closest('button')) return
    drag.current = { id: e.pointerId, x: e.clientX, q0: pos.get(), moved: false }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    if (!d.moved) {
      if (Math.abs(dx) < 8) return
      d.moved = true
      setDragging(true)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        void 0
      }
    }
    jump(yFor(rawFor(d.q0 - dx / DRAG_PX)))
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (!d.moved) return
    setDragging(false)
    swallowClick.current = true
    window.setTimeout(() => {
      swallowClick.current = false
    }, 60)
    const dx = e.clientX - d.x
    const start = Math.round(d.q0)
    let target = Math.round(clamp(d.q0 - dx / DRAG_PX, 0, N - 1))
    if (target === start && Math.abs(dx) > 40) target = start + (dx < 0 ? 1 : -1)
    goTo(target)
  }

  const reel = realReels[active]

  return (
    <div ref={wrap} className="relative h-[408vh]">
      <div ref={stage} className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.p
            style={{ x: word }}
            className="display whitespace-nowrap text-[30vw] text-transparent [-webkit-text-stroke:1.5px_rgba(248,248,248,0.09)]"
          >
            Reels
          </motion.p>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,8,22,0.28)_0%,rgba(244,8,22,0.08)_40%,transparent_68%)]"
        />

        <div
          className={cn('relative h-[min(78vh,760px)] w-[calc(min(78vh,760px)*0.4877)] touch-pan-y select-none', dragging && 'cursor-grabbing')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(e) => {
            if (!swallowClick.current) return
            swallowClick.current = false
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-[5%] left-1/2 h-[7%] w-[150%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-2xl"
          />
          {realReels.map((r, i) => {
            const on = i === active
            return (
              <CarouselPhone key={r.id} i={i} pos={pos} reduce={reduce}>
                <ReelScreen
                  reel={r}
                  active={on}
                  near={wrapDist(i, active) <= 3}
                  paused={pausedId === r.id}
                  playing={on && pausedId !== r.id && inView && visible && !reduce && !dragging}
                  sound={soundId === r.id}
                  onSound={(v) => {
                    setSoundId(v ? r.id : null)
                    if (v) setPausedId(null)
                  }}
                  onTap={() => {
                    if (on) setPausedId((p) => (p === r.id ? null : r.id))
                    else goTo(i)
                  }}
                />
              </CarouselPhone>
            )
          })}
        </div>

        <div className="pointer-events-none absolute bottom-10 left-5 max-w-[34vw] sm:left-8 lg:left-12">
          <p className="kicker flex items-center gap-2 text-paper/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />
            Now playing
            {reel.tag === 'AI edit' && <span className="text-red">· ✦ AI edit</span>}
          </p>
          <div className="relative mt-3 h-[3.4rem] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={reel.id}
                className="display whitespace-nowrap text-[3.2rem] text-paper"
                initial={{ y: '105%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-105%' }}
                transition={{ duration: 0.7, ease }}
              >
                {reel.brand}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="serif-accent mt-1 truncate text-2xl text-paper/60">{cleanCaption(reel.caption)}</p>
        </div>

        <div className="absolute bottom-10 right-5 flex items-end gap-6 sm:right-8 lg:right-12">
          <div className="flex gap-2">
            <ArrowButton label="Previous reel" disabled={active === 0} onClick={() => goTo(active - 1)}>
              <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            </ArrowButton>
            <ArrowButton label="Next reel" disabled={active === N - 1} onClick={() => goTo(active + 1)}>
              <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
            </ArrowButton>
          </div>
          <div className="pointer-events-none text-right">
            <p className="display text-[3.2rem] leading-none text-paper">
              {String(active + 1).padStart(2, '0')}
              <span className="ml-2 align-top text-xl text-paper/40">/ {String(N).padStart(2, '0')}</span>
            </p>
            <div className="mt-4 h-[3px] w-40 overflow-hidden bg-paper/15">
              <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-red" />
            </div>
            <p className="kicker mt-3 text-paper/40">Scroll or drag</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-paper/20 text-paper transition-[background-color,border-color,opacity,transform] duration-300 hover:border-red hover:bg-red active:scale-95 disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  )
}

function CarouselPhone({ i, pos, reduce, children }: { i: number; pos: MotionValue<number>; reduce: boolean; children: ReactNode }) {
  const d = useTransform(pos, (p) => ((((i - p) % N) + N + N / 2) % N) - N / 2)
  const x = useTransform(d, (v) => {
    const a = Math.abs(v)
    const s = Math.sign(v)
    return `${s * (a <= 1 ? a * 82 : 82 + (a - 1) * 52)}%`
  })
  const z = useTransform(d, (v) => -Math.min(Math.abs(v), 3) * 230)
  const rotateY = useTransform(d, (v) => (reduce ? 0 : clamp(v, -1, 1) * 38 + clamp(v - clamp(v, -1, 1), -2, 2) * 8))
  const scale = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 2.5) * 0.12)
  const dim = useTransform(d, (v) => Math.min(Math.abs(v), 1) * 0.55 + Math.max(0, Math.min(Math.abs(v), 3) - 1) * 0.15)
  const zIndex = useTransform(d, (v) => 50 - Math.round(Math.abs(v) * 10))
  const opacity = useTransform(d, (v) => clamp((2.45 - Math.abs(v)) / 0.45, 0, 1))
  const visibility = useTransform(d, (v) => (Math.abs(v) > 2.45 ? 'hidden' : 'visible'))

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ x, z, rotateY, scale, zIndex, opacity, visibility, transformPerspective: 1600 }}
      data-cursor="PLAY"
    >
      <Phone className="h-full w-full">
        {children}
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-50 bg-black" style={{ opacity: dim }} />
      </Phone>
    </motion.div>
  )
}
