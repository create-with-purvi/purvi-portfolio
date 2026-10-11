import { motion, useReducedMotion } from 'motion/react'
import { SectionHead } from '../components/SectionHead'
import { realReels } from '../data/site'
import { ease, useIsDesktop } from '../lib/hooks'
import { DesktopReels } from './reels/DesktopReels'
import { MobileReels } from './reels/MobileReels'

const aiCount = realReels.filter((r) => r.tag === 'AI edit').length

export default function Reels() {
  const desktop = useIsDesktop()
  const reduce = !!useReducedMotion()
  return (
    <section id="reels" className="relative overflow-x-clip bg-ink pb-16 lg:pb-0">
      <div className="px-5 pt-28 sm:px-8 sm:pt-36 lg:px-12">
        <SectionHead index="02" label="Reels" top="REELS THAT" bottom="STOP THUMBS" aside={['SHOT.', 'EDITED.', 'POSTED.']} />
        <motion.div
          className="mt-8 flex flex-wrap items-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
        >
          <span className="kicker flex h-9 items-center gap-2 rounded-full bg-red px-4 text-white shadow-[0_0_24px_rgba(244,8,22,0.45)]">
            <span aria-hidden>✦</span>
            AI edits · {aiCount}
          </span>
          <span className="kicker flex h-9 items-center rounded-full border border-paper/15 bg-paper/[0.04] px-4 text-paper/70">
            {realReels.length} reels
          </span>
        </motion.div>
      </div>
      {desktop ? <DesktopReels reduce={reduce} /> : <MobileReels reduce={reduce} />}
    </section>
  )
}
