import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '../lib/hooks'

type Mode = 'idle' | 'link' | 'label'

export default function Cursor() {
  const fine = useMediaQuery('(pointer: fine) and (hover: hover)')
  if (!fine) return null
  return <CursorInner />
}

function CursorInner() {
  const reduce = useReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const spring = reduce ? { stiffness: 2000, damping: 100 } : { stiffness: 420, damping: 36, mass: 0.6 }
  const rx = useSpring(x, spring)
  const ry = useSpring(y, spring)
  const [mode, setMode] = useState<Mode>('idle')
  const [label, setLabel] = useState('')
  const [visible, setVisible] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-cursor')
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null
      const tagged = t?.closest<HTMLElement>('[data-cursor]')
      if (tagged?.dataset.cursor) {
        setLabel(tagged.dataset.cursor)
        setMode('label')
        return
      }
      setMode(t?.closest('a, button, [role="button"], label, summary') ? 'link' : 'idle')
    }
    const leave = () => setVisible(false)
    const press = () => setDown(true)
    const release = () => setDown(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', press, { passive: true })
    window.addEventListener('pointerup', release, { passive: true })
    document.addEventListener('mouseleave', leave)
    return () => {
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
      document.removeEventListener('mouseleave', leave)
    }
  }, [x, y])

  const ringSize = mode === 'label' ? 92 : mode === 'link' ? 56 : 34
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          animate={{
            width: ringSize,
            height: ringSize,
            backgroundColor: mode === 'label' ? 'rgba(244,8,22,1)' : mode === 'link' ? 'rgba(248,248,248,0.08)' : 'rgba(248,248,248,0)',
            borderColor: mode === 'label' ? 'rgba(244,8,22,0)' : 'rgba(248,248,248,0.55)',
            scale: down ? 0.82 : 1,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          style={{ borderWidth: 1, borderStyle: 'solid' }}
        >
          <AnimatePresence mode="wait">
            {mode === 'label' && (
              <motion.span
                key={label}
                className="kicker text-[10px] tracking-[0.18em] text-white"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-red"
          animate={{ width: mode === 'label' ? 0 : 7, height: mode === 'label' ? 0 : 7 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  )
}
