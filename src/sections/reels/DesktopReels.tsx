import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useRef, useState, type ReactNode } from 'react'
import { reels } from '../../data/site'
import { ease } from '../../lib/hooks'
import { scrollToTarget } from '../../lib/lenis'
import { Phone } from './Phone'
import { ReelScreen } from './ReelScreen'
import { usePageVisible } from './usePageVisible'

const N = reels.length
const TILT = 1
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const dwell = (x: number) => {
  const k = Math.min(Math.floor(x), N - 1)
  const f = x - k
  return k + inOut(clamp((f - 0.2) / 0.6, 0, 1))
}

export function DesktopReels({ reduce }: { reduce: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const pos = useTransform(scrollYProgress, (v) => dwell(clamp(v, 0, 1) * (N - 1)))
  const word = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  const [active, setActive] = useState(0)
  const [pausedId, setPausedId] = useState<string | null>(null)
  const inView = useInView(stage, { amount: 0.35 })
  const visible = usePageVisible()

  useMotionValueEvent(pos, 'change', (v) => {
    const a = clamp(Math.round(v), 0, N - 1)
    setActive((prev) => (prev === a ? prev : a))
  })

  const goTo = (i: number) => {
    const el = wrap.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    scrollToTarget(top + (span * i) / (N - 1))
  }

  const reel = reels[active]

  return (
    <div ref={wrap} className="relative h-[320vh]">
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

        <div className="relative h-[min(78vh,760px)] w-[calc(min(78vh,760px)*0.4877)]">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-[5%] left-1/2 h-[7%] w-[150%] -translate-x-1/2 rounded-[50%] bg-black/80 blur-2xl"
          />
          {reels.map((r, i) => (
            <CarouselPhone key={r.id} i={i} pos={pos} reduce={reduce}>
              <ReelScreen
                reel={r}
                active={i === active}
                paused={pausedId === r.id}
                playing={i === active && pausedId !== r.id && inView && visible && !reduce}
                onTap={() => {
                  if (i === active) setPausedId((p) => (p === r.id ? null : r.id))
                  else goTo(i)
                }}
                sizes="380px"
              />
            </CarouselPhone>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-10 left-5 sm:left-8 lg:left-12">
          <p className="kicker flex items-center gap-2 text-paper/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />
            Now playing
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
          <p className="serif-accent mt-1 text-2xl text-paper/60">{reel.caption.replace(/\s*\p{Extended_Pictographic}.*$/u, '').toLowerCase()}</p>
        </div>

        <div className="pointer-events-none absolute bottom-10 right-5 text-right sm:right-8 lg:right-12">
          <p className="display text-[3.2rem] leading-none text-paper">
            {String(active + 1).padStart(2, '0')}
            <span className="ml-2 align-top text-xl text-paper/40">/ {String(N).padStart(2, '0')}</span>
          </p>
          <div className="mt-4 h-[3px] w-40 overflow-hidden bg-paper/15">
            <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-red" />
          </div>
          <p className="kicker mt-3 text-paper/40">Scroll to flip</p>
        </div>
      </div>
    </div>
  )
}

function CarouselPhone({
  i,
  pos,
  reduce,
  children,
}: {
  i: number
  pos: MotionValue<number>
  reduce: boolean
  children: ReactNode
}) {
  const d = useTransform(pos, (p) => ((((i - p) % N) + N + N / 2) % N) - N / 2)
  const x = useTransform(d, (v) => {
    const a = Math.abs(v)
    const s = Math.sign(v)
    return `${s * (a <= 1 ? a * 82 : 82 + (a - 1) * 52)}%`
  })
  const z = useTransform(d, (v) => -Math.min(Math.abs(v), 3) * 230)
  const rotateY = useTransform(d, (v) => (reduce ? 0 : TILT * (clamp(v, -1, 1) * 38 + clamp(v - clamp(v, -1, 1), -2, 2) * 8)))
  const scale = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 2.5) * 0.12)
  const dim = useTransform(d, (v) => Math.min(Math.abs(v), 1) * 0.55 + Math.max(0, Math.min(Math.abs(v), 3) - 1) * 0.15)
  const zIndex = useTransform(d, (v) => 50 - Math.round(Math.abs(v) * 10))
  const opacity = useTransform(d, (v) => clamp((2.45 - Math.abs(v)) / 0.45, 0, 1))

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ x, z, rotateY, scale, zIndex, opacity, transformPerspective: 1600 }}
      data-cursor="PLAY"
    >
      <Phone className="h-full w-full">
        {children}
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-50 bg-black" style={{ opacity: dim }} />
      </Phone>
    </motion.div>
  )
}
