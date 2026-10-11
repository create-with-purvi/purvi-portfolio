import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'motion/react'
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { clients, stats } from '../data/site'
import { cn, ease } from '../lib/hooks'
import { useActive } from './hero/useActive'

const SERVICES = ['Reels', 'Festival creatives', 'Ad posts', 'Billboards', 'Branding', 'Hindi + English']

type BandProps = {
  children: ReactNode
  base: number
  dir: 1 | -1
  factor: MotionValue<number>
  active: boolean
  reduce: boolean
  className?: string
}

function Band({ children, base, dir, factor, active, reduce, className }: BandProps) {
  const copyRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  const [copies, setCopies] = useState(3)
  const x = useMotionValue(0)
  const heading = useRef<1 | -1>(1)
  const drag = useRef<{ id: number; x: number } | null>(null)

  useEffect(() => {
    const el = copyRef.current
    if (!el) return
    const measure = () => {
      const cw = el.offsetWidth
      setW(cw)
      if (cw) setCopies(Math.max(2, Math.ceil((window.innerWidth * 1.3) / cw) + 1))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [])

  const wrap = (v: number) => (w ? ((((v % w) + w) % w) - w) : v)

  useAnimationFrame((_, delta) => {
    if (!active || reduce || !w || drag.current) return
    const f = factor.get()
    if (f < -0.02) heading.current = -1
    else if (f > 0.02) heading.current = 1
    const speed = base * (1 + Math.abs(f) * 1.6)
    x.set(wrap(x.get() + dir * heading.current * speed * (Math.min(delta, 64) / 1000)))
  })

  return (
    <div
      className={cn('touch-pan-y select-none overflow-hidden whitespace-nowrap', className)}
      data-cursor="DRAG"
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        drag.current = { id: e.pointerId, x: e.clientX }
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d || d.id !== e.pointerId) return
        x.set(wrap(x.get() + (e.clientX - d.x)))
        d.x = e.clientX
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <motion.div className="flex w-max will-change-transform" style={{ x }}>
        {Array.from({ length: copies }, (_, k) => (
          <div key={k} ref={k === 0 ? copyRef : undefined} className="flex shrink-0 items-center" aria-hidden={k > 0}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function Stat({ value, suffix, label, note, index }: (typeof stats)[number] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = num.current
    if (!el || !inView) return
    if (reduce) {
      el.textContent = String(value)
      return
    }
    const ctl = animate(0, value, {
      duration: 1.6 + index * 0.15,
      ease: [0.16, 1, 0.3, 1],
      delay: index * 0.08,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v))
      },
    })
    return () => ctl.stop()
  }, [inView, reduce, value, index])

  return (
    <motion.div
      ref={ref}
      className="group relative flex h-full flex-col px-4 py-6 md:px-8 md:py-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease, delay: index * 0.08 }}
    >
      <p className="kicker flex items-center gap-2 text-paper/50">
        <span className="text-red">0{index + 1}</span>
        {label}
      </p>
      <p className="display mt-4 flex items-start text-[clamp(6.5rem,13vw,11.5rem)] leading-[0.82] transition-transform duration-700 ease-[var(--ease-expo)] lg:group-hover:-translate-y-2">
        <span ref={num} className="tabular-nums">
          {reduce ? value : 0}
        </span>
        {suffix && <span className="text-[0.55em] leading-none text-red">{suffix}</span>}
      </p>
      <p className={cn('mt-3 text-[15px] text-paper/60', !note && 'hidden lg:invisible lg:block')}>
        <span className="serif-accent text-[1.15em] text-paper/80">{note ?? '—'}</span>
      </p>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left scale-x-0 bg-red transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100"
      />
    </motion.div>
  )
}

export default function Proof() {
  const ref = useRef<HTMLElement>(null)
  const active = useActive(ref, '100px')
  const reduce = !!useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [-2000, 0, 2000], [-4, 0, 4], { clamp: false })

  return (
    <section ref={ref} id="proof" aria-label="Clients and numbers" className="relative overflow-x-clip bg-ink pb-16 pt-4 md:pb-24 md:pt-6">
      <h2 className="sr-only">Clients</h2>
      <ul className="sr-only">
        {clients.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>

      <div aria-hidden className="relative h-[180px] md:h-[280px]">
        <div className="absolute inset-x-[-10vw] top-1/2 -mt-[30px] -translate-y-1/2 rotate-[3deg] md:-mt-[34px]">
          <Band
            base={40}
            dir={1}
            factor={factor}
            active={active}
            reduce={reduce}
            className="border-y border-paper/15 bg-ink-2 py-2.5 md:py-3.5"
          >
            {SERVICES.map((s) => (
              <Fragment key={s}>
                <span className="display px-4 text-[30px] text-paper/90 [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1.2px_currentColor] md:px-6 md:text-[52px] md:[-webkit-text-stroke:1.5px_currentColor]">
                  {s}
                </span>
                <span className="text-[18px] text-red md:text-[28px]">✦</span>
              </Fragment>
            ))}
          </Band>
        </div>
        <div className="absolute inset-x-[-10vw] top-1/2 mt-[30px] -translate-y-1/2 -rotate-[3deg] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] md:mt-[34px]">
          <Band base={54} dir={-1} factor={factor} active={active} reduce={reduce} className="bg-red py-2.5 md:py-3.5">
            {clients.map((c) => (
              <Fragment key={c.name}>
                <span className="display px-4 text-[30px] text-white md:px-6 md:text-[52px]">{c.name}</span>
                <span className="text-[18px] text-ink md:text-[28px]">✦</span>
              </Fragment>
            ))}
          </Band>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[1440px] px-3 md:mt-10 md:px-10">
        <div className="grid grid-cols-2 border-y border-paper/10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                'border-paper/10',
                i % 2 === 1 && 'border-l',
                i >= 2 && 'border-t lg:border-t-0',
                i === 2 && 'lg:border-l'
              )}
            >
              <Stat {...s} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
