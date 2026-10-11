import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { RefObject } from 'react'
import { Img } from '../../components/Img'
import { WhatsAppIcon } from '../../components/WhatsAppIcon'
import { waLink } from '../../data/site'
import { byId } from '../../data/work'
import { cn } from '../../lib/hooks'

export type Service = { id: string; title: string; tags: string[]; cover: string }

type Theme = { card: string; title: string; stroke: string; pill: string; meta: string; cta: string; slab: string }

const THEMES: Theme[] = [
  {
    card: 'bg-ink-2 text-paper ring-paper/10',
    title: 'text-paper',
    stroke: 'rgba(244,8,22,0.95)',
    pill: 'border-paper/20 text-paper/85',
    meta: 'text-paper/45',
    cta: 'bg-red text-white',
    slab: 'bg-red',
  },
  {
    card: 'bg-paper text-ink ring-ink/10',
    title: 'text-ink',
    stroke: 'rgba(10,10,10,0.85)',
    pill: 'border-ink/20 text-ink/80',
    meta: 'text-ink/45',
    cta: 'bg-ink text-paper',
    slab: 'bg-ink',
  },
  {
    card: 'bg-red text-paper ring-white/15',
    title: 'text-paper',
    stroke: 'rgba(248,248,248,0.95)',
    pill: 'border-paper/40 text-paper',
    meta: 'text-paper/70',
    cta: 'bg-paper text-ink',
    slab: 'bg-ink',
  },
  {
    card: 'bg-ink-3 text-paper ring-paper/10',
    title: 'text-paper',
    stroke: 'rgba(248,248,248,0.7)',
    pill: 'border-paper/20 text-paper/85',
    meta: 'text-paper/45',
    cta: 'bg-red text-white',
    slab: 'bg-paper',
  },
  {
    card: 'bg-paper-2 text-ink ring-ink/10',
    title: 'text-ink',
    stroke: 'rgba(244,8,22,0.95)',
    pill: 'border-ink/20 text-ink/80',
    meta: 'text-ink/45',
    cta: 'bg-red text-white',
    slab: 'bg-red',
  },
]

const TILT = [7, -6, 5, -7, 6]

type Props = {
  service: Service
  index: number
  total: number
  top: number
  nextTop: number
  own: RefObject<HTMLDivElement | null>
  next: RefObject<HTMLDivElement | null> | null
}

export function ServiceCard({ service, index, total, top, nextTop, own, next }: Props) {
  const reduce = useReducedMotion()
  const theme = THEMES[index % THEMES.length]
  const cover = byId[service.cover]
  const tilt = TILT[index % TILT.length]

  const { scrollYProgress: enter } = useScroll({ target: own, offset: ['start end', `start ${top}px`] })
  const { scrollYProgress: covered } = useScroll({ target: next ?? own, offset: ['start end', `start ${nextTop}px`] })

  const isLast = !next
  const scale = useTransform(covered, [0, 1], [1, isLast || reduce ? 1 : 0.92])
  const shade = useTransform(covered, [0, 1], [0, isLast || reduce ? 0 : 0.62])
  const rotate = useTransform([enter, covered], ([e, c]: number[]) => (reduce ? tilt * 0.6 : tilt * (1.5 - e) - (isLast ? 0 : c * tilt * 0.9)))
  const imgY = useTransform([enter, covered], ([e, c]: number[]) => (reduce ? 0 : (1 - e) * 120 - (isLast ? 0 : c * 60)))
  const titleY = useTransform(enter, [0, 1], [reduce ? 0 : 60, 0])
  const slabRotate = useTransform(rotate, (r) => -r * 0.9 - tilt * 0.4)

  return (
    <motion.article
      style={{ top, scale }}
      className={cn(
        'sticky flex h-[calc(100svh-150px)] origin-top flex-col overflow-hidden rounded-[24px] p-5 ring-1 will-change-transform sm:p-8 md:h-[72vh] md:min-h-[540px] md:rounded-[28px] lg:p-12',
        theme.card
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-end gap-4">
          <span
            className="display text-[64px] leading-[0.8] md:text-[clamp(6rem,11vw,11rem)]"
            style={{ color: 'transparent', WebkitTextStroke: `1.5px ${theme.stroke}` }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={cn('kicker pb-1 text-[10px]', theme.meta)}>/ {String(total).padStart(2, '0')}</span>
        </div>
        <a
          href={waLink(`Hi Purvi! I'm interested in ${service.title}.`)}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="OPEN"
          aria-label={`Ask about ${service.title} on WhatsApp`}
          className={cn(
            'group flex h-11 shrink-0 items-center gap-2 rounded-full pl-2 pr-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-transform duration-500 ease-[var(--ease-expo)] hover:scale-105 md:h-12 md:pr-5',
            theme.cta
          )}
        >
          <span className="grid h-8 w-8 place-items-center">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          <span className="hidden md:inline">Enquire</span>
        </a>
      </div>

      <motion.div style={{ y: titleY }} className="relative z-10 mt-7 md:mt-auto md:w-[62%]">
        <h3 className={cn('display text-[13.5vw] leading-[0.86] md:text-[clamp(3.75rem,8vw,9.25rem)]', theme.title)}>{service.title}</h3>
        <ul className="mt-5 flex flex-wrap gap-2 md:mt-8 md:gap-3">
          {service.tags.map((t) => (
            <li
              key={t}
              className={cn('flex h-9 items-center rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.16em] md:h-11 md:px-5 md:text-[12px]', theme.pill)}
            >
              {t}
            </li>
          ))}
        </ul>
      </motion.div>

      {cover && (
        <motion.div
          style={{ rotate, y: imgY }}
          className="pointer-events-none relative z-0 ml-auto mt-auto w-[74%] max-w-[300px] translate-x-[8%] translate-y-[16%] md:absolute md:right-[8%] md:top-1/2 md:mt-0 md:w-[min(26%,38vh)] md:max-w-[380px] md:translate-x-0 md:-translate-y-1/2"
        >
          <motion.div aria-hidden style={{ rotate: slabRotate }} className={cn('absolute inset-0 rounded-[18px] opacity-90', theme.slab)} />
          <div className="relative overflow-hidden rounded-[18px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)] ring-1 ring-black/10">
            <Img item={cover} sizes="(max-width: 768px) 56vw, 26vw" className="block h-auto w-full" />
          </div>
        </motion.div>
      )}

      <motion.div aria-hidden style={{ opacity: shade }} className="pointer-events-none absolute inset-0 z-20 bg-ink" />
    </motion.article>
  )
}
