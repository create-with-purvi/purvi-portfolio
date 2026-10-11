import { useInView } from 'motion/react'
import { useRef } from 'react'
import { portrait } from '../../data/work'
import { site } from '../../data/site'
import { cn } from '../../lib/hooks'
import './profile.css'

export function Avatar({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  return (
    <div ref={ref} className={cn('relative aspect-square shrink-0', className)}>
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div className="ig-ring absolute -inset-[20%]" style={{ animationPlayState: inView ? 'running' : 'paused' }} />
      </div>
      <div className="absolute inset-[3px] rounded-full bg-black p-[3px] sm:inset-[4px] sm:p-[5px]">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_35%,#ff3b3b_0%,#f40816_45%,#a8000b_100%)]">
          <img
            src={portrait.s}
            srcSet={`${portrait.s} 316w, ${portrait.l} ${portrait.w}w`}
            sizes="(min-width: 640px) 220px, 140px"
            alt={site.name}
            width={portrait.w}
            height={portrait.h}
            draggable={false}
            className="absolute left-[-14%] top-[4%] w-[128%] max-w-none drop-shadow-[0_6px_14px_rgba(80,0,0,0.55)]"
          />
        </div>
      </div>
    </div>
  )
}
