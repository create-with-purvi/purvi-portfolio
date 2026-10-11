import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useRef, useState, type PointerEvent } from 'react'
import { WhatsAppIcon } from '../../components/WhatsAppIcon'
import { waLink } from '../../data/site'
import { cn } from '../../lib/hooks'

const SPRING = { stiffness: 170, damping: 15, mass: 0.5 }

export function MagneticCTA({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const btnRef = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)
  const ix = useTransform(sx, (v) => v * 0.45)
  const iy = useTransform(sy, (v) => v * 0.45)
  const [hover, setHover] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const pull = (e: PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse') return
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.38)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.38)
  }
  const release = () => {
    x.set(0)
    y.set(0)
  }
  const at = (e: PointerEvent) => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  return (
    <div className={cn('relative -m-16 p-16', className)} onPointerMove={pull} onPointerLeave={release}>
      <motion.a
        ref={btnRef}
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="OPEN"
        data-no-hearts
        aria-label="Chat on WhatsApp"
        style={{ x: sx, y: sy }}
        onPointerEnter={(e) => {
          at(e)
          setHover(true)
        }}
        onPointerLeave={(e) => {
          at(e)
          setHover(false)
        }}
        whileTap={{ scale: 0.94 }}
        className="group relative grid aspect-square w-[min(44vw,176px)] place-items-center rounded-full bg-red text-white shadow-[0_30px_80px_-20px_rgba(244,8,22,0.75)] sm:w-[200px] lg:w-[220px]"
      >
        <span aria-hidden className="pv-ring pointer-events-none absolute inset-0 rounded-full border border-red" />
        <span aria-hidden className="pv-ring pv-ring-2 pointer-events-none absolute inset-0 rounded-full border border-red" />
        <span aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
          <span
            className={cn(
              'absolute aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper transition-transform duration-700 ease-[var(--ease-expo)]',
              hover ? 'scale-100' : 'scale-0'
            )}
            style={{ left: `${origin.x}%`, top: `${origin.y}%` }}
          />
        </span>
        <motion.span
          style={{ x: ix, y: iy }}
          className={cn('relative flex flex-col items-center gap-2 text-center transition-colors duration-500', hover ? 'text-red' : 'text-white')}
        >
          <WhatsAppIcon className="h-9 w-9 lg:h-11 lg:w-11" />
          <span className="text-[11px] font-semibold uppercase leading-tight tracking-[0.16em] lg:text-[12px]">
            Chat on
            <br />
            WhatsApp
          </span>
        </motion.span>
      </motion.a>
    </div>
  )
}
