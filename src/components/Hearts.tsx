import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ease } from '../lib/hooks'

type Burst = { id: number; x: number; y: number; rot: number }

const BLOCK = 'a, button, input, textarea, select, label, [role="button"], [data-no-hearts]'
const PARTICLES = [0, 1, 2, 3, 4, 5, 6]

function HeartPath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
    </svg>
  )
}

export default function Hearts() {
  const [bursts, setBursts] = useState<Burst[]>([])
  const [toast, setToast] = useState(false)
  const toasted = useRef(false)
  const lastTap = useRef({ t: 0, x: 0, y: 0 })
  const seq = useRef(0)

  useEffect(() => {
    const spawn = (x: number, y: number) => {
      const id = ++seq.current
      setBursts((b) => [...b.slice(-14), { id, x, y, rot: Math.random() * 30 - 15 }])
      window.setTimeout(() => setBursts((b) => b.filter((h) => h.id !== id)), 1300)
      if (!toasted.current) {
        toasted.current = true
        setToast(true)
        window.setTimeout(() => setToast(false), 2800)
      }
    }
    const blocked = (t: EventTarget | null) => !!(t as Element | null)?.closest?.(BLOCK)
    const onDbl = (e: MouseEvent) => {
      if (blocked(e.target)) return
      window.getSelection()?.removeAllRanges()
      spawn(e.clientX, e.clientY)
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || blocked(e.target)) return
      const now = performance.now()
      const p = lastTap.current
      if (now - p.t < 320 && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 36) {
        spawn(e.clientX, e.clientY)
        lastTap.current = { t: 0, x: 0, y: 0 }
      } else {
        lastTap.current = { t: now, x: e.clientX, y: e.clientY }
      }
    }
    window.addEventListener('dblclick', onDbl)
    window.addEventListener('pointerup', onUp, { passive: true })
    return () => {
      window.removeEventListener('dblclick', onDbl)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] overflow-hidden">
      <AnimatePresence>
        {bursts.map((b) => (
          <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
            <motion.div
              className="-translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, rotate: b.rot, opacity: 1 }}
              animate={{ scale: [0, 1.25, 0.95, 1], y: [0, 0, 0, -70], opacity: [1, 1, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.25, 0.4, 1], ease: 'easeOut' }}
            >
              <HeartPath className="h-24 w-24 fill-red drop-shadow-[0_8px_30px_rgba(244,8,22,0.55)]" />
            </motion.div>
            {PARTICLES.map((i) => {
              const a = (i / PARTICLES.length) * Math.PI * 2 + b.rot / 20
              const d = 70 + (i % 3) * 18
              return (
                <motion.div
                  key={i}
                  className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d - 20, scale: [0, 1, 0.6], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.9, ease, delay: 0.08 }}
                >
                  <HeartPath className={i % 2 ? 'h-4 w-4 fill-paper' : 'h-5 w-5 fill-red'} />
                </motion.div>
              )
            })}
          </div>
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-paper/10 bg-ink/80 px-5 py-3 text-sm font-medium text-paper backdrop-blur-md"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.6, ease }}
          >
            <HeartPath className="h-4 w-4 fill-red" />
            You liked this. <span className="serif-accent text-base text-paper/80">Your customers will too.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
