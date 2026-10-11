import { motion, useTransform, type MotionValue } from 'motion/react'
import { Img } from '../../components/Img'
import { byId } from '../../data/work'
import { cn } from '../../lib/hooks'
import { ui } from '../../lib/ui'

export type Spot = {
  id: string
  left: string
  top: string
  w: string
  rot: number
  depth: number
  layer: 'back' | 'mid' | 'front'
  drift: [number, number]
  float: number
  hideShort?: 'phone' | 'desk'
}

const LAYER = { back: 'z-[5]', mid: 'z-20', front: 'z-40' }
const SHORT = { phone: '[@media(max-height:720px)]:hidden', desk: '[@media(max-height:780px)]:hidden' }

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn('h-[1.05em] w-[1.05em] fill-none stroke-current', className)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const HEART = 'M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.6 3.3 4.4 6.7-1.7 4.7-9.2 9.3-9.2 9.3Z'
const COMMENT = 'M20.5 11.6a8.4 8.4 0 0 1-12.2 7.5L3.5 20.5l1.4-4.6A8.4 8.4 0 1 1 20.5 11.6Z'
const SHARE = 'M21.5 3 10.2 14.2M21.5 3l-7 18-4.3-6.8L3.5 10l18-7Z'
const SAVE = 'M18.5 21 12 16.4 5.5 21V4.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V21Z'

type Props = {
  spot: Spot
  index: number
  ids: string[]
  sx: MotionValue<number>
  sy: MotionValue<number>
  sp: MotionValue<number>
  go: boolean
  reduce: boolean
}

export function PostCard({ spot, index, ids, sx, sy, sp, go, reduce }: Props) {
  const item = byId[spot.id]
  const { depth, rot, drift } = spot
  const x = useTransform(() => sx.get() * depth * -42 + sp.get() * drift[0] * depth * 520)
  const y = useTransform(() => sy.get() * depth * -30 + sp.get() * drift[1] * depth * 520)
  const rotate = useTransform(sp, (v) => rot + v * drift[0] * 16)
  const rotateY = useTransform(sx, (v) => v * 18)
  const rotateX = useTransform(sy, (v) => v * -14)
  if (!item) return null

  return (
    <motion.div
      className={cn('absolute', LAYER[spot.layer], spot.hideShort && SHORT[spot.hideShort])}
      style={{ left: spot.left, top: spot.top, width: spot.w, x, y, rotate }}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0, rotate: spot.rot > 0 ? 24 : -24 }}
        animate={go ? (reduce ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }) : undefined}
        transition={
          reduce
            ? { duration: 0.6, delay: 0.3 + index * 0.06 }
            : { type: 'spring', stiffness: 150, damping: 13, mass: 0.9, delay: 0.75 + index * 0.09 }
        }
      >
        <div className="hero-float" style={{ animationDuration: `${spot.float}s`, animationDelay: `${-index * 1.3}s` }}>
          <motion.button
            type="button"
            data-cursor="VIEW"
            data-no-hearts
            aria-label={`Open ${item.title} — ${item.brand}`}
            onClick={() => ui.openLightbox(ids, index)}
            className="group block w-full overflow-hidden rounded-[10px] bg-ink-2 text-left shadow-[0_30px_60px_-18px_rgba(0,0,0,0.85)] ring-1 ring-paper/10 md:rounded-[14px]"
            style={{ rotateX, rotateY, transformPerspective: 900 }}
            whileHover={reduce ? undefined : { scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Img
              item={item}
              size="s"
              eager
              fetchPriority="low"
              className="pointer-events-none block aspect-[4/5] w-full object-cover"
            />
            <span className="flex items-center gap-[0.55em] px-[0.7em] py-[0.55em] text-[clamp(10px,1vw,14px)] text-paper/85">
              <Icon d={HEART} className="transition-colors duration-300 group-hover:fill-red group-hover:stroke-red" />
              <Icon d={COMMENT} />
              <Icon d={SHARE} />
              <Icon d={SAVE} className="ml-auto" />
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
