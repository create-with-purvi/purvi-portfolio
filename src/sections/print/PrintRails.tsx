import { motion, useReducedMotion, useScroll } from 'motion/react'
import { useRef } from 'react'
import { Img } from '../../components/Img'
import { ease } from '../../lib/hooks'
import { ui } from '../../lib/ui'
import { aspect, groups, indexOf, kindLabel, orderedIds, pad2, type PrintGroup } from './data'
import './print.css'

const TILT = [-1.6, 1.2, -0.8, 1.8]

export default function PrintRails() {
  return (
    <div className="mt-14 flex flex-col gap-14 sm:mt-20 sm:gap-20">
      {groups.map((g, gi) => (
        <Rail key={g.kind} group={g} gi={gi} />
      ))}
    </div>
  )
}

function Rail({ group, gi }: { group: PrintGroup; gi: number }) {
  const reduce = useReducedMotion()
  const railRef = useRef<HTMLDivElement>(null)
  const { scrollXProgress } = useScroll({ container: railRef })
  const widest = Math.max(...group.items.map(aspect))
  const height = `min(46vh, 360px, calc(84vw / ${widest.toFixed(4)}))`
  return (
    <div className="relative">
      <div className="px-5 sm:flex sm:items-start sm:justify-between sm:gap-4 sm:px-8 lg:px-12">
        <p className="kicker mb-3 flex items-center gap-2 text-[10px] text-paper/55 sm:order-2 sm:mb-1">
          <span className="text-red">{pad2(gi + 1)}</span>
          <span className="h-px w-4 bg-paper/25" />
          {pad2(group.items.length)} pieces
          <span aria-hidden className="pv-nudge text-paper/80">
            →
          </span>
        </p>
        <motion.h3
          className="display text-[18vw] leading-[0.8] sm:text-[12vw]"
          style={{ color: 'transparent', WebkitTextStroke: '1.2px rgba(248,248,248,0.32)' }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.1, ease }}
        >
          {group.word}
        </motion.h3>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar relative -mt-[5vw] flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-5 pb-16 pt-4 [scroll-padding-inline:20px] sm:-mt-[3vw] sm:px-8 sm:[scroll-padding-inline:32px] lg:px-12"
        aria-label={`${group.word}, swipe for more`}
        role="region"
        tabIndex={0}
      >
        {group.items.map((item, i) => {
          const index = indexOf(item.id)
          return (
            <motion.div
              key={item.id}
              className="relative shrink-0 snap-start"
              style={{ height, aspectRatio: `${item.w} / ${item.h}` }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: reduce ? 0 : TILT[(i + gi) % TILT.length] }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 1, ease, delay: Math.min(i, 3) * 0.08 }}
            >
              <motion.button
                type="button"
                data-cursor="VIEW"
                data-no-hearts
                aria-label={`View ${item.title}, ${item.brand}`}
                onClick={() => ui.openLightbox(orderedIds, index)}
                whileTap={{ scale: 0.96 }}
                className="block h-full w-full overflow-hidden rounded-[16px] bg-ink-3 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.95)] ring-1 ring-paper/10"
              >
                <Img item={item} sizes="(max-width: 640px) 80vw, 40vw" className="h-full w-full object-cover" />
              </motion.button>
              <p className="absolute left-0.5 top-full mt-3 max-w-full">
                <span className="kicker block truncate text-[9.5px] text-paper/45">
                  <span className="text-red">{pad2(index + 1)}</span> {kindLabel(item)}
                </span>
                <span className="mt-1 block truncate text-[13px] font-medium text-paper/85">{item.brand}</span>
              </p>
            </motion.div>
          )
        })}
        <div aria-hidden className="w-px shrink-0" />
      </div>

      <div className="mx-5 mt-2 h-px bg-paper/12 sm:mx-8 lg:mx-12">
        <motion.div style={{ scaleX: scrollXProgress }} className="h-full origin-left bg-red" />
      </div>
    </div>
  )
}
