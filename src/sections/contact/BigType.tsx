import { motion, motionValue, useReducedMotion, useSpring, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cn, useIsTouch } from '../../lib/hooks'

const LINES = [
  { text: 'LET’S', className: 'text-paper' },
  { text: 'TALK', className: 'text-red text-right' },
]

type Cell = { s: MotionValue<number>; k: MotionValue<number>; y: MotionValue<number> }

const SPRING = { stiffness: 260, damping: 16, mass: 0.5 }

function Letter({ ch, cell, touch, reduce, index }: { ch: string; cell: Cell; touch: boolean; reduce: boolean | null; index: number }) {
  const scaleY = useSpring(cell.s, SPRING)
  const skewX = useSpring(cell.k, SPRING)
  const y = useSpring(cell.y, SPRING)
  return (
    <motion.span data-letter className="relative inline-block origin-bottom will-change-transform" style={reduce ? undefined : { scaleY, skewX, y }}>
      <motion.span
        className="inline-block cursor-grab active:cursor-grabbing"
        data-cursor="DRAG"
        data-no-hearts
        drag={reduce ? false : touch ? 'x' : true}
        dragSnapToOrigin
        dragElastic={0.55}
        dragTransition={{ bounceStiffness: 420, bounceDamping: 14 }}
        whileDrag={{ scale: 1.08, rotate: index % 2 ? 6 : -6 }}
      >
        {ch}
      </motion.span>
    </motion.span>
  )
}

export function BigType({ children }: { children?: ReactNode }) {
  const reduce = useReducedMotion()
  const touch = useIsTouch()
  const boxRef = useRef<HTMLDivElement>(null)
  const centers = useRef<{ x: number; y: number }[]>([])
  const [cells] = useState<Cell[]>(() =>
    LINES.flatMap((l) => [...l.text]).map(() => ({ s: motionValue(1), k: motionValue(0), y: motionValue(0) }))
  )

  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return
    const measure = () => {
      centers.current = [...box.querySelectorAll<HTMLElement>('[data-letter]')].map((el) => ({
        x: el.offsetLeft + el.offsetWidth / 2,
        y: el.offsetTop + el.offsetHeight / 2,
      }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [])

  const move = (clientX: number, clientY: number) => {
    const box = boxRef.current
    if (!box || reduce) return
    const r = box.getBoundingClientRect()
    const lx = clientX - r.left
    const ly = clientY - r.top
    const R = Math.max(160, r.width * 0.24)
    centers.current.forEach((c, i) => {
      const cell = cells[i]
      if (!cell) return
      const dx = lx - c.x
      const dy = ly - c.y
      const t = Math.max(0, 1 - Math.hypot(dx, dy) / R)
      const f = t * t * (3 - 2 * t)
      cell.s.set(1 + 0.14 * f)
      cell.k.set(Math.max(-1, Math.min(1, -dx / R)) * 14 * f)
      cell.y.set(-f * r.width * 0.008)
    })
  }

  const relax = () => cells.forEach((c) => (c.s.set(1), c.k.set(0), c.y.set(0)))

  let n = 0
  return (
    <div
      ref={boxRef}
      className="@container relative select-none"
      onPointerMove={(e) => move(e.clientX, e.clientY)}
      onPointerLeave={relax}
      onPointerCancel={relax}
      onPointerUp={(e) => e.pointerType !== 'mouse' && relax()}
    >
      <h2 aria-label="Let's talk" className="display leading-[0.9]">
        {LINES.map((line) => (
          <span key={line.text} aria-hidden className={cn('block whitespace-nowrap text-[42cqw] lg:text-[31cqw]', line.className)}>
            {[...line.text].map((ch) => {
              const i = n++
              return <Letter key={i} ch={ch} cell={cells[i]} touch={touch} reduce={reduce} index={i} />
            })}
          </span>
        ))}
      </h2>
      {children}
    </div>
  )
}
