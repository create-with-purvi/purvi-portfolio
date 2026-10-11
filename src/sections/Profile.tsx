import { motion } from 'motion/react'
import { SectionHead } from '../components/SectionHead'
import { site, waLink } from '../data/site'
import { ease } from '../lib/hooks'
import { Avatar } from './profile/Avatar'
import { Clients } from './profile/Clients'
import { Highlights } from './profile/Highlights'
import { PostGrid } from './profile/PostGrid'
import { ChevronDown, GridIcon, MenuIcon, MoreHIcon, PlusSquareIcon, ReelsIcon } from './reels/icons'

const COUNTS = site.instagram.counts.map((c) => ({ value: c.value.toLocaleString('en-IN'), label: c.label }))

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 192 192" className={className} aria-hidden fill="currentColor">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.194 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553ZM98.44 129.507c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.114 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274Z" />
    </svg>
  )
}

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
  const ig = site.instagram
  return (
    <div className={className}>
      {name && <p className="font-semibold text-paper">{site.name}</p>}
      <p className="text-paper/50">{ig.category}</p>
      {ig.bio.map((line) => (
        <p key={line} className="text-paper/90">
          {line}
        </p>
      ))}
      <p className="text-paper/90">
        <span aria-hidden>📍 </span>
        {ig.location}
      </p>
      <a
        href={ig.threads.url}
        target="_blank"
        rel="noreferrer"
        data-cursor="OPEN"
        className="mt-1 inline-flex min-h-6 items-center gap-1.5 font-semibold text-paper transition-colors hover:text-red"
      >
        <ThreadsIcon className="h-[14px] w-[14px]" />
        <span>{ig.threads.handle}</span>
        <span className="sr-only">on Threads</span>
      </a>
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
                  {COUNTS.map((s) => (
                    <li key={s.label} className="flex flex-col">
                      <span className="text-[17px] font-bold leading-tight text-paper">{s.value}</span>
                      <span className="text-[13px] text-paper/70">{s.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 hidden gap-9 text-[16px] text-paper sm:flex">
                  {COUNTS.map((c) => (
                    <span key={c.label}>
                      <b className="font-semibold">{c.value}</b> {c.label}
                    </span>
                  ))}
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
