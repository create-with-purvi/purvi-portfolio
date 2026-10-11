import { motion } from 'motion/react'
import { clients } from '../../data/site'
import { ease } from '../../lib/hooks'

const igUrl = (v: string) => (/^https?:\/\//.test(v) ? v : `https://www.instagram.com/${v.replace(/^@/, '')}/`)

export function Clients() {
  return (
    <div>
      <p className="kicker flex items-center gap-3 text-paper/55">
        <span className="h-px w-8 bg-red" />
        Pages I design for
      </p>
      <motion.ul
        className="mt-6 flex flex-wrap gap-2.5"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        variants={{ show: { transition: { staggerChildren: 0.055 } } }}
      >
        {clients.map((c) => {
          const inner = (
            <>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red to-red-deep text-[12px] font-bold text-white">
                {c.name.replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase()}
              </span>
              <span className="pr-1">{c.name}</span>
            </>
          )
          const pill =
            'flex min-h-11 items-center gap-2.5 rounded-full border border-paper/12 bg-paper/[0.04] py-1.5 pl-1.5 pr-4 text-[14px] font-medium text-paper/90 transition-colors duration-300'
          return (
            <motion.li
              key={c.name}
              variants={{
                hidden: { opacity: 0, y: 16, scale: 0.92 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease } },
              }}
            >
              {c.instagram ? (
                <a
                  href={igUrl(c.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="OPEN"
                  className={`${pill} hover:border-red hover:bg-red/10`}
                >
                  {inner}
                </a>
              ) : (
                <span className={pill}>{inner}</span>
              )}
            </motion.li>
          )
        })}
      </motion.ul>
    </div>
  )
}
