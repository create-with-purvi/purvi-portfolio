import { useState } from 'react'
import { Img } from '../../components/Img'
import type { WorkItem } from '../../data/work'
import { cn } from '../../lib/hooks'
import { CarouselGlyph } from './CarouselGlyph'

const FIRST = 12

type Props = {
  items: WorkItem[]
  onOpen: (id: string) => void
}

export function FeedGrid({ items, onOpen }: Props) {
  const [all, setAll] = useState(false)
  const shown = all ? items : items.slice(0, FIRST)
  return (
    <div className="px-5 md:px-10">
      <div className="columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-5">
        {shown.map((p) => (
          <button
            key={p.id}
            type="button"
            data-cursor="VIEW"
            onClick={() => onOpen(p.id)}
            aria-label={`Open ${p.title} by ${p.brand}`}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl bg-ink-2 transition-[translate,box-shadow] duration-500 ease-[var(--ease-expo)] hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.9)] md:mb-4"
          >
            <span className="relative block">
              <Img
                item={p}
                className={cn('block h-auto w-full', p.h / p.w > 1.3 && 'aspect-[4/5] object-cover')}
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              {p.carousel && (
                <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-ink/45 text-white backdrop-blur-sm">
                  <CarouselGlyph />
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
      {!all && items.length > FIRST && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setAll(true)}
            className="h-12 rounded-full border border-paper/20 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:border-red hover:text-red"
          >
            Show all {items.length}
          </button>
        </div>
      )}
    </div>
  )
}
