import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/hooks'

const NOTES = [
  { icon: '✦', title: 'New post', body: 'ASP Cranes' },
  { icon: '▶', title: 'Reel ready', body: 'TICA Cricket Academy' },
  { icon: '🪔', title: 'Festive pack', body: 'DB Sons' },
  { icon: 'अ', title: 'Hindi + English', body: 'Captions that connect' },
  { icon: '✓', title: 'Content calendar', body: 'Planned. Posted.' },
]

type Props = { go: boolean; active: boolean; reduce: boolean; className?: string }

function Chip({ n }: { n: number }) {
  const k = n % NOTES.length
  const note = NOTES[k]
  return (
    <>
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-[15px] leading-none',
          k === 3 ? 'bg-paper font-deva text-lg font-bold text-ink' : 'bg-red text-white'
        )}
      >
        {note.icon}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-semibold text-paper">{note.title}</span>
          <span className="shrink-0 text-[10px] text-paper/40">now</span>
        </span>
        <span className="block truncate text-[12px] text-paper/60">{note.body}</span>
      </span>
    </>
  )
}

const CHIP =
  'flex items-center gap-2.5 rounded-[18px] border border-paper/10 bg-ink-2/95 p-2 pr-3.5 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.9)]'

export function Chips({ go, active, reduce, className }: Props) {
  const [stack, setStack] = useState<number[]>([])
  const seq = useRef(0)
  const max = 3

  useEffect(() => {
    if (!go) return
    if (reduce) {
      setStack([1, 0])
      return
    }
    if (!active) return
    const push = () => {
      const n = seq.current++
      setStack((s) => [n, ...s].slice(0, max))
    }
    let iv = 0
    const first = window.setTimeout(
      () => {
        push()
        iv = window.setInterval(push, 2300)
      },
      seq.current === 0 ? 1700 : 600
    )
    return () => {
      window.clearTimeout(first)
      window.clearInterval(iv)
    }
  }, [go, active, reduce])

  return (
    <div aria-hidden className={cn('pointer-events-none relative h-[60px] w-[min(250px,64vw)] lg:w-[280px]', className)}>
      <AnimatePresence initial={false}>
        {stack.map((n, i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: -26, scale: 0.9 }}
            animate={{ opacity: i === 0 ? 1 : i === 1 ? 0.55 : 0, y: i * 9, scale: 1 - i * 0.07 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className={cn(CHIP, 'absolute inset-x-0 top-0 origin-bottom')}
            style={{ zIndex: 10 - i }}
          >
            <Chip n={n} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
