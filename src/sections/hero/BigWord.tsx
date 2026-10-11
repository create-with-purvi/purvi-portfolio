import { animate, motion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, type RefObject } from 'react'
import { cn, ease } from '../../lib/hooks'

type LetterApi = { el: HTMLSpanElement; set: (t: number, dir: number) => void; cx: number; cy: number }

const LINES = [
  { word: 'SOCIAL', origin: '50% 100%', base: 'text-paper', alt: 'text-red' },
  { word: 'MEDIA', origin: '50% 0%', base: 'text-red', alt: 'text-paper' },
] as const

function pageOffset(el: HTMLElement) {
  let x = 0
  let y = 0
  let n: HTMLElement | null = el
  while (n) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y }
}

function Letter({
  ch,
  line,
  delay,
  go,
  reduce,
  register,
}: {
  ch: string
  line: 0 | 1
  delay: number
  go: boolean
  reduce: boolean
  register: (api: LetterApi | null) => void
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const p = useSpring(0, { stiffness: 320, damping: 13, mass: 0.6 })
  const sk = useSpring(0, { stiffness: 260, damping: 15, mass: 0.6 })
  const scaleY = useTransform(p, (v) => 1 + v * 0.34)
  const scaleX = useTransform(p, (v) => 1 - v * 0.04)
  const hidden = useTransform(p, [0.06, 0.8], [104, 0])
  const wrapY = useTransform(hidden, (v) => `${line ? -v : v}%`)
  const glyphY = useTransform(hidden, (v) => `${line ? v : -v}%`)
  const { origin, base, alt } = LINES[line]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const api: LetterApi = {
      el,
      cx: 0,
      cy: 0,
      set: (t, dir) => {
        p.set(t)
        sk.set(-dir * 13 * t)
      },
    }
    register(api)
    return () => register(null)
  }, [p, sk, register])

  return (
    <motion.span
      ref={ref}
      className="relative -my-[0.06em] block overflow-hidden py-[0.06em] will-change-transform"
      style={{ scaleY, scaleX, skewX: sk, transformOrigin: origin }}
    >
      <motion.span
        className="relative block"
        initial={reduce ? { opacity: 0 } : { y: '118%', rotate: line ? -6 : 6 }}
        animate={go ? (reduce ? { opacity: 1 } : { y: '0%', rotate: 0 }) : undefined}
        transition={{ duration: reduce ? 0.6 : 1.15, ease, delay }}
      >
        <span className={cn('block', base)}>{ch}</span>
        <motion.span aria-hidden className="absolute inset-x-0 -inset-y-[0.05em] block overflow-hidden" style={{ y: wrapY }}>
          <motion.span className={cn('block py-[0.05em]', alt)} style={{ y: glyphY }}>
            {ch}
          </motion.span>
        </motion.span>
      </motion.span>
    </motion.span>
  )
}

type Props = {
  go: boolean
  reduce: boolean
  zone: RefObject<HTMLElement | null>
  x1: MotionValue<number>
  x2: MotionValue<number>
  desktop: boolean
}

export function BigWord({ go, reduce, zone, x1, x2, desktop }: Props) {
  const letters = useRef<(LetterApi | null)[]>([])
  const registers = useRef<((api: LetterApi | null) => void)[]>([])
  const interacted = useRef(false)

  const reg = (i: number) =>
    (registers.current[i] ??= (api: LetterApi | null) => {
      letters.current[i] = api
    })

  useEffect(() => {
    const root = zone.current
    if (!root || reduce) return
    const all = () => letters.current.filter(Boolean) as LetterApi[]
    let raf = 0
    let px = -9999
    let py = -9999
    let rootPos = { x: 0, y: 0 }
    let touching = false
    let releaseT = 0

    const measure = () => {
      rootPos = pageOffset(root)
      for (const l of all()) {
        const o = pageOffset(l.el)
        l.cx = o.x - rootPos.x + l.el.offsetWidth / 2
        l.cy = o.y - rootPos.y + l.el.offsetHeight / 2
      }
    }

    const radius = () => Math.max(130, Math.min(360, window.innerWidth * 0.24))

    const run = () => {
      raf = 0
      const r = root.getBoundingClientRect()
      const R = radius()
      const ls = letters.current
      ls.forEach((l, i) => {
        if (!l) return
        const lx = r.left + l.cx + (i < 6 ? x1.get() : x2.get())
        const ly = r.top + l.cy
        const dx = px - lx
        const dy = (py - ly) * 1.15
        const d = Math.hypot(dx, dy)
        let t = Math.max(0, 1 - d / R)
        t = t * t * (3 - 2 * t)
        l.set(t, Math.max(-1, Math.min(1, dx / R)))
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    const point = (x: number, y: number) => {
      px = x
      py = y
      schedule()
    }
    const release = () => {
      px = -9999
      py = -9999
      schedule()
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !touching) return
      interacted.current = true
      point(e.clientX, e.clientY)
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      interacted.current = true
      touching = true
      window.clearTimeout(releaseT)
      point(e.clientX, e.clientY)
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      touching = false
      releaseT = window.setTimeout(release, 160)
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') release()
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    document.fonts?.ready.then(measure).catch(() => {})
    root.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerdown', onDown, { passive: true })
    root.addEventListener('pointerleave', onLeave, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(releaseT)
      ro.disconnect()
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      all().forEach((l) => l.set(0, 0))
    }
  }, [zone, reduce, x1, x2])

  useEffect(() => {
    const root = zone.current
    if (!go || reduce || !root) return
    let ctl: ReturnType<typeof animate> | undefined
    const t = window.setTimeout(() => {
      if (interacted.current) return
      const ls = letters.current.filter(Boolean) as LetterApi[]
      if (!ls.length) return
      const R = Math.max(130, Math.min(360, window.innerWidth * 0.24))
      const xs = ls.map((l) => l.cx)
      const from = Math.min(...xs) - R
      const to = Math.max(...xs) + R
      ctl = animate(from, to, {
        duration: desktop ? 1.7 : 1.4,
        ease: [0.45, 0, 0.25, 1],
        onUpdate: (x) => {
          if (interacted.current) return
          ls.forEach((l) => {
            const dx = x - l.cx
            let k = Math.max(0, 1 - Math.abs(dx) / (R * 0.75))
            k = k * k * (3 - 2 * k)
            l.set(k * 0.9, Math.max(-1, Math.min(1, dx / R)))
          })
        },
        onComplete: () => {
          if (!interacted.current) ls.forEach((l) => l.set(0, 0))
        },
      })
    }, 2300)
    return () => {
      window.clearTimeout(t)
      ctl?.stop()
    }
  }, [go, reduce, zone, desktop])

  let k = 0
  return (
    <h1 className="display pointer-events-none select-none tracking-[-0.01em]">
      <span className="sr-only">Purvi Agarwal — social media</span>
      {LINES.map((ln, li) => (
        <motion.span
          key={ln.word}
          aria-hidden
          className={cn(
            'flex',
            li === 0
              ? 'justify-center text-[calc((100vw-24px)/2.475)] md:text-[calc((100vw-48px)/2.475)] lg:justify-start lg:text-[min(46svh,30vw)]'
              : 'justify-center text-[calc((100vw-24px)/2.316)] md:text-[calc((100vw-48px)/2.316)] lg:justify-end lg:text-[min(46svh,30vw)]'
          )}
          style={{ x: li === 0 ? x1 : x2 }}
        >
          {[...ln.word].map((ch, ci) => {
            const i = k++
            return (
              <Letter
                key={ci}
                ch={ch}
                line={li as 0 | 1}
                delay={(reduce ? 0.1 : 0.05) + li * 0.14 + ci * 0.055}
                go={go}
                reduce={reduce}
                register={reg(i)}
              />
            )
          })}
        </motion.span>
      ))}
    </h1>
  )
}
