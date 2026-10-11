import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/hooks'
import './reels.css'

type Props = {
  children: ReactNode
  className?: string
  screenClassName?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>

export function Phone({ children, className, screenClassName, ...rest }: Props) {
  return (
    <div className={cn('@container relative aspect-[71.5/146.6] select-none', className)} {...rest}>
      <span aria-hidden className="phone-btn absolute -left-[1.1cqw] top-[16.5%] h-[4.6%] w-[1.6cqw] rounded-l-[1cqw]" />
      <span aria-hidden className="phone-btn absolute -left-[1.1cqw] top-[24%] h-[8.4%] w-[1.6cqw] rounded-l-[1cqw]" />
      <span aria-hidden className="phone-btn absolute -left-[1.1cqw] top-[34%] h-[8.4%] w-[1.6cqw] rounded-l-[1cqw]" />
      <span aria-hidden className="phone-btn absolute -right-[1.1cqw] top-[27%] h-[13%] w-[1.6cqw] rounded-r-[1cqw]" />
      <div className="phone-frame absolute inset-0 rounded-[18.5cqw] p-[1.15cqw]">
        <div className="h-full w-full rounded-[17.4cqw] bg-black p-[3.1cqw]">
          <div
            data-no-hearts
            className={cn(
              'relative h-full w-full overflow-hidden rounded-[14.6cqw] bg-black [clip-path:inset(0_round_14.6cqw)]',
              screenClassName
            )}
          >
            {children}
            <StatusBar />
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[2.7cqw] z-30 flex h-[8.4cqw] w-[29cqw] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[2.6cqw]"
            >
              <span className="h-[2.6cqw] w-[2.6cqw] rounded-full bg-[radial-gradient(circle_at_35%_35%,#3b4a6b_0%,#121826_55%,#05070c_100%)]" />
            </span>
            <span aria-hidden className="phone-glass pointer-events-none absolute inset-0 z-40" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[13.5cqw] items-center justify-between px-[8.5cqw] pt-[0.6cqw] text-white"
    >
      <span className="text-[4cqw] font-semibold tracking-tight">9:41</span>
      <span className="flex items-center gap-[1.3cqw]">
        <svg viewBox="0 0 18 12" className="h-[2.9cqw] w-auto" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[2.9cqw] w-auto" fill="currentColor">
          <path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .6 10.4 10.4 0 0 0 .8 3.5L2 4.8a8.6 8.6 0 0 1 6-2.4Z" />
          <path d="M8 6c1.3 0 2.5.5 3.4 1.3l1.3-1.3A6.6 6.6 0 0 0 8 4.2 6.6 6.6 0 0 0 3.3 6l1.3 1.3C5.5 6.5 6.7 6 8 6Z" />
          <path d="M8 9.4 10 7.9A3 3 0 0 0 8 7.2a3 3 0 0 0-2 .7Z" transform="translate(0 1.4)" />
        </svg>
        <span className="relative flex h-[3.1cqw] w-[6.4cqw] items-center rounded-[1cqw] border-[0.3cqw] border-white/45 p-[0.35cqw]">
          <span className="h-full w-[78%] rounded-[0.5cqw] bg-white" />
          <span className="absolute -right-[0.9cqw] top-1/2 h-[1.2cqw] w-[0.5cqw] -translate-y-1/2 rounded-r-full bg-white/45" />
        </span>
      </span>
    </div>
  )
}
