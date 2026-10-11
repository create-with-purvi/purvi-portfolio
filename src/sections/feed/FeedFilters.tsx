import { AnimatePresence, motion } from 'motion/react'
import { cn, ease } from '../../lib/hooks'

export type FilterOption = { id: string; label: string; count: number }

type Props = {
  options: FilterOption[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function FeedFilters({ options, value, onChange, className }: Props) {
  return (
    <div role="toolbar" aria-label="Filter posts by category" className={cn('no-scrollbar flex gap-2 overflow-x-auto', className)}>
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            data-cursor="TAP"
            onClick={() => onChange(o.id)}
            className={cn(
              'relative flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300',
              active
                ? 'border-red text-white'
                : 'border-paper/15 bg-ink/55 text-paper/75 backdrop-blur-md hover:border-paper/40 hover:text-paper'
            )}
          >
            {active && (
              <motion.span
                layoutId="feed-chip"
                className="absolute inset-0 rounded-full bg-red shadow-[0_8px_30px_-6px_rgba(244,8,22,0.7)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
            <span className={cn('relative text-[9px] tabular-nums', active ? 'text-white/75' : 'text-paper/40')}>{o.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export function PostCount({ count, className }: { count: number; className?: string }) {
  return (
    <p className={cn('kicker flex items-center gap-2 text-paper/70', className)} aria-live="polite">
      <span className="relative inline-flex h-[1.25em] min-w-[2ch] justify-end overflow-hidden text-paper tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-110%' }}
            transition={{ duration: 0.5, ease }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
      posts
    </p>
  )
}
