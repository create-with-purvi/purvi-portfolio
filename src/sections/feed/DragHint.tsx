import { AnimatePresence, motion } from 'motion/react'
import { ease } from '../../lib/hooks'

export function DragHint({ show, label = 'Drag to explore' }: { show: boolean; label?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10, filter: 'blur(8px)' }}
            transition={{ duration: 0.8, ease, delay: 0.3 }}
            className="flex items-center gap-3 rounded-full border border-paper/15 bg-ink/65 py-2 pl-2 pr-5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md"
          >
            <span className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-red text-white">
              <motion.span
                className="absolute left-1 text-[10px] leading-none"
                animate={{ opacity: [0.2, 1, 0.2], x: [2, -1, 2] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                ‹
              </motion.span>
              <motion.svg
                viewBox="0 0 24 24"
                className="size-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ x: [-3, 3, -3], rotate: [-10, 8, -10] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10" />
                <path d="M12 9.5a1.5 1.5 0 0 1 3 0V11" />
                <path d="M15 10.5a1.5 1.5 0 0 1 3 0V12" />
                <path d="M18 11.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.2a6 6 0 0 1-4.6-2.2L4.6 16.4a1.6 1.6 0 0 1 2.3-2.2L9 16V11" />
              </motion.svg>
              <motion.span
                className="absolute right-1 text-[10px] leading-none"
                animate={{ opacity: [0.2, 1, 0.2], x: [-2, 1, -2] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                ›
              </motion.span>
            </span>
            <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-paper">
              {label} <span className="text-red">✦</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
