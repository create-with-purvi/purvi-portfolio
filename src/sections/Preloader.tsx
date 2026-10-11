import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type CSSProperties } from 'react'
import { site } from '../data/site'
import { cn, easeQuart } from '../lib/hooks'
import { lockScroll, unlockScroll } from '../lib/lenis'
import { ui } from '../lib/ui'
import './hero/preloader.css'

const WORDS = [
  { text: 'HELLO', cls: 'font-display text-paper' },
  { text: 'नमस्ते', cls: 'font-deva font-bold text-paper text-[1.04em]' },
  { text: 'JAI JOHAR', cls: 'font-display text-paper' },
  { text: 'PURVI', cls: 'font-display text-red' },
]

const STEP = 190
const WIPE = 0.58
const LAG = 0.08

type Phase = 'idle' | 'words' | 'exit' | 'done'

export default function Preloader() {
  const reduce = !!useReducedMotion()
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    try {
      sessionStorage.setItem('pv-seen', '1')
    } catch {
      /* storage blocked */
    }
    window.scrollTo(0, 0)
    lockScroll()
    const raf = requestAnimationFrame(lockScroll)
    let alive = true
    const start = () => {
      if (alive) setPhase((p) => (p === 'idle' ? 'words' : p))
    }
    const t = window.setTimeout(start, 150)
    Promise.all([document.fonts?.load('400 1em Anton'), document.fonts?.load('700 1em Khand', 'नमस्ते')]).then(start, start)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      unlockScroll()
    }
  }, [])

  useEffect(() => {
    if (!reduce) return
    ui.setReady()
    const t = window.setTimeout(() => setPhase('exit'), 300)
    return () => window.clearTimeout(t)
  }, [reduce])

  useEffect(() => {
    if (phase !== 'words' || reduce) return
    const timers = WORDS.map((_, k) => window.setTimeout(() => setI(k), k * STEP))
    timers.push(
      window.setTimeout(() => {
        ui.setReady()
        setPhase('exit')
      }, WORDS.length * STEP)
    )
    return () => timers.forEach(clearTimeout)
  }, [phase, reduce])

  useEffect(() => {
    if (phase !== 'exit') return
    const t = window.setTimeout(
      () => {
        unlockScroll()
        setPhase('done')
      },
      (reduce ? 0.4 : WIPE + LAG) * 1000 + 30
    )
    return () => window.clearTimeout(t)
  }, [phase, reduce])

  if (phase === 'done') return null
  const exiting = phase === 'exit'

  if (reduce) {
    return (
      <motion.div
        aria-hidden
        className="fixed inset-0 z-[80] grid place-items-center bg-ink"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <span className="display text-[clamp(64px,19vw,230px)] text-red">PURVI</span>
      </motion.div>
    )
  }

  return (
    <div
      aria-hidden
      data-no-hearts
      className={cn('fixed inset-0 z-[80] overflow-hidden', phase !== 'idle' && 'pv-run')}
      style={{ '--pv-step': `${STEP}ms` } as CSSProperties}
    >
      <motion.div
        className="absolute inset-0 bg-red"
        animate={{ y: exiting ? '-100%' : '0%' }}
        transition={{ duration: WIPE, ease: easeQuart, delay: exiting ? LAG : 0 }}
      />
      <motion.div
        className="absolute inset-0 flex flex-col bg-ink"
        animate={{ y: exiting ? '-100%' : '0%' }}
        transition={{ duration: WIPE, ease: easeQuart }}
      >
        <div className="px-3 pt-[max(12px,env(safe-area-inset-top))] md:px-6 md:pt-5">
          <div className="flex gap-1">
            {WORDS.map((w, k) => (
              <span key={w.text} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-paper/20">
                <span className="pv-seg absolute inset-0 rounded-full bg-paper" style={{ animationDelay: `${k * STEP}ms` }} />
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-red font-display text-[15px] text-white ring-2 ring-ink">P</span>
            <span className="text-[13px] font-semibold text-paper">{site.instagram.handle}</span>
            <span className="text-[13px] text-paper/45">now</span>
          </div>
        </div>

        <motion.div
          className="grid flex-1 place-items-center"
          animate={exiting ? { y: '-22vh', opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: WIPE * 0.85, ease: easeQuart }}
        >
          {WORDS.map((w, k) => (
            <span
              key={w.text}
              className={cn(
                'block whitespace-nowrap text-[clamp(64px,22vw,250px)] uppercase leading-[0.9] [grid-area:1/1]',
                w.cls,
                phase !== 'idle' && k === i ? 'pv-word' : 'opacity-0'
              )}
            >
              {w.text}
            </span>
          ))}
        </motion.div>

        <div className="flex items-end justify-between px-3 pb-[max(14px,env(safe-area-inset-bottom))] md:px-6 md:pb-6">
          <span className="kicker text-paper/50">{site.name}</span>
          <span className="kicker tabular-nums text-paper/50">
            0{i + 1} / 0{WORDS.length}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
