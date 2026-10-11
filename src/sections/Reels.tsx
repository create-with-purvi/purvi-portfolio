import { useReducedMotion } from 'motion/react'
import { SectionHead } from '../components/SectionHead'
import { useIsDesktop } from '../lib/hooks'
import { DesktopReels } from './reels/DesktopReels'
import { MobileReels } from './reels/MobileReels'

export default function Reels() {
  const desktop = useIsDesktop()
  const reduce = !!useReducedMotion()
  return (
    <section id="reels" className="relative overflow-x-clip bg-ink pb-16 lg:pb-0">
      <div className="px-5 pt-28 sm:px-8 sm:pt-36 lg:px-12">
        <SectionHead index="02" label="Reels" top="REELS THAT" bottom="STOP THUMBS" aside={['SHOT.', 'EDITED.', 'POSTED.']} />
      </div>
      {desktop ? <DesktopReels reduce={reduce} /> : <MobileReels reduce={reduce} />}
    </section>
  )
}
