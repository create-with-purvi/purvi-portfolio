import { motion } from 'motion/react'
import { byId, categories, src } from '../../data/work'
import { ease } from '../../lib/hooks'
import { ui } from '../../lib/ui'

export function Highlights() {
  return (
    <motion.ul
      className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 py-2 sm:-mx-8 sm:scroll-px-8 sm:gap-6 sm:px-8 lg:gap-7"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {categories.map((cat) => {
        const cover = byId[cat.cover]
        return (
          <motion.li
            key={cat.id}
            className="shrink-0 snap-start"
            variants={{
              hidden: { opacity: 0, y: 18, scale: 0.85 },
              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease } },
            }}
          >
            <button
              type="button"
              data-cursor="OPEN"
              aria-label={`Open ${cat.label} stories`}
              onClick={() => ui.openStory(cat.id)}
              className="group flex w-[76px] flex-col items-center gap-2 sm:w-[88px]"
            >
              <span className="relative block h-[68px] w-[68px] rounded-full sm:h-[86px] sm:w-[86px] p-[3px] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-105 group-active:scale-95">
                <span className="absolute inset-0 rounded-full border border-paper/25 transition-colors duration-300 group-hover:border-red" />
                <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,#f40816,#ff7a00,#ff2d87,#f40816)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span className="relative block h-full w-full overflow-hidden rounded-full border-[3px] border-black bg-ink-3">
                  {cover && (
                    <img
                      src={src(cover.id)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-110"
                      style={{ backgroundColor: cover.color }}
                    />
                  )}
                </span>
              </span>
              <span className="max-w-full truncate text-[12px] font-semibold text-paper/90">{cat.short}</span>
            </button>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}
