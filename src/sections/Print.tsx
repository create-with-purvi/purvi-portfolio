import { useReducedMotion } from 'motion/react'
import { SectionHead } from '../components/SectionHead'
import { useIsDesktop } from '../lib/hooks'
import PrintPinned from './print/PrintPinned'
import PrintRails from './print/PrintRails'

export default function Print() {
  const desktop = useIsDesktop()
  const reduce = useReducedMotion()
  const pinned = desktop && !reduce
  return (
    <section id="print" className="relative overflow-x-clip bg-ink pt-28 pb-10 sm:pt-36 lg:pb-0">
      <div className="px-5 sm:px-8 lg:px-12">
        <SectionHead index="04" label="Beyond the feed" top="Off the" bottom="Screen" aside={['Making', 'Brands', 'Stand out.']} />
      </div>
      {pinned ? <PrintPinned /> : <PrintRails />}
    </section>
  )
}
