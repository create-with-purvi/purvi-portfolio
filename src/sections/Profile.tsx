import { motion } from 'motion/react'
import { SectionHead } from '../components/SectionHead'
import { site, stats, waLink } from '../data/site'
import { ease } from '../lib/hooks'
import { Avatar } from './profile/Avatar'
import { Clients } from './profile/Clients'
import { Highlights } from './profile/Highlights'
import { PostGrid } from './profile/PostGrid'
import { ChevronDown, GridIcon, MenuIcon, MoreHIcon, PlusSquareIcon, ReelsIcon } from './reels/icons'

const brandsStat = stats.find((s) => s.label === 'Brands')
const industriesStat = stats.find((s) => s.label === 'Industries')
const langStat = stats.find((s) => s.label === 'Languages')

const MINI_STATS = [
  { value: `${brandsStat?.value ?? 9}`, label: 'brands' },
  { value: `${industriesStat?.value ?? 8}`, label: 'industries' },
  { value: `${langStat?.value ?? 2}`, label: 'languages' },
]

const btn =
  'inline-flex h-11 items-center justify-center rounded-lg px-6 text-[14px] font-semibold transition-[transform,background-color] duration-300 active:scale-[0.97] sm:h-9'

function Buttons({ className }: { className?: string }) {
  return (
    <div className={className}>
      <a href={site.instagram.url} target="_blank" rel="noreferrer" data-cursor="OPEN" className={`${btn} flex-1 bg-red text-white hover:bg-[#ff2230] sm:flex-none`}>
        Follow
      </a>
      <a href={waLink()} target="_blank" rel="noreferrer" data-cursor="OPEN" className={`${btn} flex-1 bg-paper/12 text-paper hover:bg-paper/20 sm:flex-none`}>
        Message
      </a>
    </div>
  )
}

function Bio({ className, name = true }: { className?: string; name?: boolean }) {
  return (
    <div className={className}>
      {name && <p className="font-semibold text-paper">{site.name}</p>}
      <p className="text-paper/50">{site.role}</p>
      <p className="text-paper/90">{site.roles.slice(1).join(' · ')}</p>
      <p className="text-paper/90">
        <span aria-hidden>📍 </span>
        {site.city}, India
      </p>
    </div>
  )
}

export default function Profile() {
  return (
    <section id="profile" className="relative overflow-x-clip bg-ink pb-24 lg:pb-40">
      <div className="px-5 pt-28 sm:px-8 sm:pt-36 lg:px-12">
        <SectionHead index="03" label="On Instagram" top="LIVE ON" bottom="THE GRID" aside={['DESIGNING', 'IDEAS INTO', 'STORIES.']} />
      </div>

      <div className="mx-auto mt-12 max-w-[999px] sm:px-8 lg:mt-20">
        <motion.div
          className="relative bg-black pb-0 sm:rounded-[28px] sm:border sm:border-paper/10 sm:p-1 sm:pt-0 sm:shadow-[0_40px_120px_-40px_rgba(244,8,22,0.25)]"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.1, ease }}
        >
          <div aria-hidden className="flex h-12 items-center justify-between border-b border-paper/10 px-4 sm:hidden">
            <span className="flex items-center gap-1 text-[17px] font-bold text-paper">
              {site.instagram.handle}
              <ChevronDown className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="flex items-center gap-5 text-paper">
              <PlusSquareIcon className="h-6 w-6" strokeWidth={1.8} />
              <MenuIcon className="h-6 w-6" strokeWidth={1.8} />
            </span>
          </div>

          <header className="px-4 pt-5 sm:px-10 sm:pt-12 md:px-14">
            <div className="flex items-center gap-6 sm:items-start sm:gap-12 md:gap-20">
              <Avatar className="w-[92px] sm:mt-1 sm:w-[150px] md:w-[168px]" />
              <div className="min-w-0 flex-1">
                <div className="hidden flex-wrap items-center gap-x-5 gap-y-3 sm:flex">
                  <h3 className="text-[22px] font-normal text-paper">{site.instagram.handle}</h3>
                  <Buttons className="flex gap-2" />
                  <MoreHIcon aria-hidden className="h-6 w-6 text-paper/80" />
                </div>
                <p className="mb-2 text-[15px] font-semibold text-paper sm:hidden">{site.name}</p>
                <ul className="flex justify-between gap-2 text-center sm:hidden">
                  {MINI_STATS.map((s) => (
                    <li key={s.label} className="flex flex-col">
                      <span className="text-[17px] font-bold leading-tight text-paper">{s.value}</span>
                      <span className="text-[13px] text-paper/70">{s.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 hidden gap-9 text-[16px] text-paper sm:flex">
                  <span>
                    <b className="font-semibold">{MINI_STATS[0].value}</b> {MINI_STATS[0].label}
                  </span>
                  <span>
                    <b className="font-semibold">{MINI_STATS[1].value}</b> {MINI_STATS[1].label}
                  </span>
                  <span className="font-semibold">{langStat?.note ?? 'Hindi + English'}</span>
                </p>
                <Bio className="mt-5 hidden text-[15px] leading-[1.45] sm:block" />
              </div>
            </div>
            <Bio name={false} className="mt-4 text-[14px] leading-[1.45] sm:hidden" />
            <Buttons className="mt-4 flex gap-2 sm:hidden" />
          </header>

          <div className="mt-7 px-4 sm:mt-12 sm:px-10 md:px-14">
            <Highlights />
          </div>

          <div aria-hidden className="mt-5 flex border-t border-paper/10 sm:mt-10">
            <span className="relative flex h-12 flex-1 items-center justify-center gap-2 text-paper">
              <GridIcon className="h-6 w-6 sm:h-4 sm:w-4" strokeWidth={1.8} />
              <span className="hidden text-[12px] font-semibold uppercase tracking-[0.12em] sm:inline">Posts</span>
              <span className="absolute bottom-0 left-1/2 h-[2px] w-16 -translate-x-1/2 rounded-full bg-paper sm:w-24" />
            </span>
            <span className="relative flex h-12 flex-1 items-center justify-center gap-2 text-paper/45">
              <ReelsIcon className="h-6 w-6 sm:h-4 sm:w-4" strokeWidth={1.8} />
              <span className="hidden text-[12px] font-semibold uppercase tracking-[0.12em] sm:inline">Reels</span>
            </span>
          </div>

          <PostGrid />
        </motion.div>

        <div className="mt-16 px-5 sm:px-0 lg:mt-24">
          <Clients />
        </div>
      </div>
    </section>
  )
}
