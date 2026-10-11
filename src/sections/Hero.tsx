import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { WhatsAppIcon } from '../components/WhatsAppIcon'
import { waLink } from '../data/site'
import { portrait } from '../data/work'
import { cn, ease, useIsDesktop, useIsTouch } from '../lib/hooks'
import { scrollToTarget } from '../lib/lenis'
import { useUI } from '../lib/ui'
import { BigWord } from './hero/BigWord'
import { Chips } from './hero/Chips'
import { PostCard, type Spot } from './hero/PostCard'
import { useActive } from './hero/useActive'
import './hero/hero.css'

const DESK: Spot[] = [
  { id: 'lifting-india', left: '3%', top: '31%', w: 'clamp(140px,min(14vw,22svh),240px)', rot: -8, depth: 1, layer: 'mid', drift: [-0.9, -0.7], float: 6.4 },
  { id: 'why-upgrad', left: '80%', top: '12%', w: 'clamp(120px,min(12.5vw,21svh),220px)', rot: 7, depth: 0.85, layer: 'mid', drift: [0.8, -0.9], float: 7.2 },
  { id: 'summer-camp', left: '26%', top: '10%', w: 'clamp(100px,9vw,160px)', rot: -5, depth: 0.45, layer: 'back', drift: [-0.4, -1], float: 8 },
  { id: 'uv-marble-walls', left: '89%', top: '55%', w: 'clamp(120px,min(12vw,20svh),210px)', rot: -7, depth: 1.15, layer: 'front', drift: [1, -0.5], float: 5.8 },
  { id: 'ganesh-chaturthi', left: '18.5%', top: '50%', w: 'clamp(100px,9vw,160px)', rot: 6, depth: 0.75, layer: 'mid', drift: [-1, -0.8], float: 6.8, hideShort: 'desk' },
  { id: 'jalebi', left: '57%', top: '6%', w: 'clamp(90px,8vw,140px)', rot: 10, depth: 0.35, layer: 'back', drift: [0.3, -1], float: 7.6 },
]

const MOBILE: Spot[] = [
  { id: 'lifting-india', left: '-8%', top: '37%', w: 'min(28vw,190px)', rot: -9, depth: 1, layer: 'mid', drift: [-0.8, -0.8], float: 6.2 },
  { id: 'why-upgrad', left: '79%', top: '33%', w: 'min(27vw,180px)', rot: 9, depth: 0.9, layer: 'mid', drift: [0.8, -0.8], float: 7 },
  { id: 'ganesh-chaturthi', left: '-4%', top: '57%', w: 'min(22vw,150px)', rot: 8, depth: 0.75, layer: 'front', drift: [-0.9, -0.6], float: 7.8, hideShort: 'phone' },
  { id: 'uv-marble-walls', left: '82%', top: '55%', w: 'min(22vw,150px)', rot: -6, depth: 0.75, layer: 'front', drift: [0.9, -0.6], float: 6.6, hideShort: 'phone' },
]

const clamp1 = (v: number) => Math.max(-1, Math.min(1, v))

function useFontsReady() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    let alive = true
    const done = () => {
      if (alive) setOk(true)
    }
    const t = window.setTimeout(done, 700)
    document.fonts?.load('400 1em Anton').then(done, done)
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [])
  return ok
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { ready } = useUI()
  const reduce = !!useReducedMotion()
  const desktop = useIsDesktop()
  const touch = useIsTouch()
  const fonts = useFontsReady()
  const go = ready && fonts
  const active = useActive(ref)
  const [hi, setHi] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const still = useMotionValue(0)
  const sp = reduce ? still : scrollYProgress
  const x1 = useTransform(sp, (v) => -v * window.innerWidth * 0.6)
  const x2 = useTransform(sp, (v) => v * window.innerWidth * 0.6)
  const pScale = useTransform(sp, [0, 1], [1, 0.8])
  const pY = useTransform(sp, [0, 1], ['0%', '8%'])
  const fade = useTransform(scrollYProgress, [0, 0.35], [1, 0])
  const lift = useTransform(sp, [0, 0.35], [0, -50])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.9 })
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.9 })

  useEffect(() => {
    if (reduce || !active) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mx.set((e.clientX / window.innerWidth) * 2 - 1)
      my.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    let base: number | null = null
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      if (base == null) base = e.beta
      mx.set(clamp1(e.gamma / 22))
      my.set(clamp1((e.beta - base) / 22))
    }
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown } | undefined
    const tilt = touch && !!DOE && typeof DOE.requestPermission !== 'function'
    window.addEventListener('pointermove', onMove, { passive: true })
    if (tilt) window.addEventListener('deviceorientation', onTilt, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [reduce, active, touch, mx, my])

  useEffect(() => {
    const el = imgRef.current
    if (!el || hi) return
    if (el.getBoundingClientRect().height * window.devicePixelRatio < portrait.h * 0.7) return
    if (!desktop && !go) return
    let alive = true
    const t = window.setTimeout(
      () => {
        const img = new Image()
        img.setAttribute('fetchpriority', desktop ? 'high' : 'low')
        img.src = portrait.l
        img
          .decode()
          .then(() => alive && setHi(true))
          .catch(() => {})
      },
      desktop ? 0 : 900
    )
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [go, desktop, hi])

  const spots = desktop ? DESK : MOBILE
  const ids = spots.map((s) => s.id)
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    animate: go ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease, delay },
  })

  return (
    <section
      ref={ref}
      id="hero"
      aria-label="Intro"
      className={cn(
        'relative h-[100svh] min-h-[620px] touch-pan-y touch-pinch-zoom overflow-clip bg-ink',
        !active && 'hero-paused'
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_78%,rgba(244,8,22,0.16),transparent_70%)]"
      />

      <div className="absolute inset-x-0 top-[80px] z-10 px-3 md:top-[88px] md:px-6 lg:top-[92px] lg:px-10">
        <BigWord go={go} reduce={reduce} zone={ref} x1={x1} x2={x2} desktop={desktop} />
      </div>

      {spots.map((s, i) => (
        <PostCard key={s.id + desktop} spot={s} index={i} ids={ids} sx={sx} sy={sy} sp={sp} go={go} reduce={reduce} />
      ))}

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center lg:inset-x-auto lg:left-[calc(100%-40px-min(46svh,30vw)*1.373)] lg:block lg:-translate-x-1/2"
        style={{ scale: pScale, y: pY, transformOrigin: '50% 100%' }}
      >
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: '42%', opacity: 0 }}
          animate={go ? { y: '0%', opacity: 1 } : undefined}
          transition={{ duration: reduce ? 0.6 : 1.5, ease, delay: 0.18 }}
        >
          <img
            ref={imgRef}
            src={hi ? portrait.l : portrait.s}
            width={portrait.w}
            height={portrait.h}
            alt="Purvi Agarwal in a red blazer, smiling"
            loading="eager"
            fetchPriority="high"
            draggable={false}
            className="block h-[min(68svh,150vw)] w-auto max-w-none [filter:drop-shadow(0_0_18px_rgba(0,0,0,0.75))_drop-shadow(0_30px_50px_rgba(0,0,0,0.6))] md:h-[62svh] lg:h-[min(72svh,820px)]"
          />
        </motion.div>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[45] h-[44%] bg-linear-to-t from-ink via-ink/80 to-transparent lg:h-[26%] lg:via-ink/30"
      />

      <motion.div
        className="absolute bottom-[clamp(250px,34svh,320px)] left-1/2 z-50 -translate-x-1/2 md:bottom-[300px] lg:bottom-12 lg:left-auto lg:right-10 lg:translate-x-0"
        style={{ opacity: fade, y: lift }}
      >
        <Chips go={go} active={active} reduce={reduce} />
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] md:px-6 lg:inset-x-auto lg:bottom-10 lg:left-10 lg:max-w-[420px] lg:px-0 lg:pb-0"
        style={{ opacity: fade, y: lift }}
      >
        <motion.p {...rise(0.95)} className="text-[13px] leading-snug text-paper/65">
          Social media manager &amp; content designer — Raipur, India.
        </motion.p>
        <motion.p {...rise(1.02)} className="mt-2 text-[27px] font-semibold leading-[1.02] tracking-[-0.02em] lg:text-[34px]">
          I make brands <span className="serif-accent text-[1.12em] text-paper">impossible to scroll past.</span>
        </motion.p>
        <motion.div {...rise(1.1)} className="mt-5 grid grid-cols-2 gap-2 md:flex md:gap-3">
          <button
            type="button"
            onClick={() => scrollToTarget('#feed')}
            className="group flex h-[52px] items-center justify-center gap-2 rounded-full bg-red px-4 text-[12px] font-semibold uppercase tracking-[0.1em] lg:px-7 lg:text-[13px] lg:tracking-[0.14em] text-white transition-transform duration-300 hover:scale-[1.04] active:scale-95"
          >
            See the work
            <span className="transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0.5">↓</span>
          </button>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[52px] items-center justify-center gap-2 rounded-full border border-paper/25 bg-ink/40 px-4 text-[12px] font-semibold uppercase tracking-[0.1em] lg:px-7 lg:text-[13px] lg:tracking-[0.14em] text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink active:scale-95"
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            WhatsApp me
          </a>
        </motion.div>
        <motion.p {...rise(1.25)} className="kicker mt-4 flex items-center gap-2 text-[10px] text-paper/45 lg:mt-5">
          Double-tap anywhere <span className="text-[13px] text-red">♥</span>
        </motion.p>
      </motion.div>
    </section>
  )
}
