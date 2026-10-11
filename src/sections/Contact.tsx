import { motion } from 'motion/react'
import { mailLink, site } from '../data/site'
import { ease } from '../lib/hooks'
import { BigType } from './contact/BigType'
import { Clock } from './contact/Clock'
import { Footer } from './contact/Footer'
import { MagneticCTA } from './contact/MagneticCTA'
import './contact/contact.css'

const LINKS = [
  { label: 'Email', value: site.email, href: mailLink(), external: false },
  { label: 'Instagram', value: `@${site.instagram.handle}`, href: site.instagram.url, external: true },
  { label: 'Phone', value: site.phoneDisplay, href: `tel:${site.phoneDisplay.replace(/\s+/g, '')}`, external: false },
]

const PLACES = [`Based in ${site.city}`, `Shoots across ${site.serviceArea.join(', ')}`, 'Remote anywhere']

function Available({ className }: { className?: string }) {
  if (!site.available) return null
  return (
    <p className={`kicker flex items-center gap-2.5 text-[10px] text-paper/80 ${className ?? ''}`}>
      <span className="relative grid h-2.5 w-2.5 place-items-center">
        <span className="pv-pulse absolute inset-0 rounded-full bg-[#2bd96b]" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-[#2bd96b]" />
      </span>
      Available for projects
    </p>
  )
}

function Arrow() {
  return (
    <span aria-hidden className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-paper/15 transition-colors duration-500 group-hover:border-red group-hover:bg-red lg:h-14 lg:w-14">
      <span className="relative block h-5 w-5 overflow-hidden text-[18px] leading-5 lg:text-[20px]">
        <span className="absolute inset-0 grid place-items-center transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full group-hover:translate-x-full">
          ↗
        </span>
        <span className="absolute inset-0 grid -translate-x-full translate-y-full place-items-center transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-0 group-hover:translate-y-0">
          ↗
        </span>
      </span>
    </span>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-x-clip bg-ink pt-28 sm:pt-36">
      <div className="px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <motion.p
            className="kicker flex items-center gap-3 text-paper/60"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <span className="text-red">07</span>
            <span className="h-px w-8 bg-paper/30" />
            Contact
          </motion.p>
          <Available className="hidden sm:flex" />
        </div>

        <div className="mt-8 lg:mt-12">
          <BigType>
            <motion.p
              aria-hidden
              className="serif-accent pointer-events-none absolute bottom-[9cqw] left-[1cqw] w-[20cqw] text-[8cqw] leading-[0.95] text-paper/85 lg:bottom-auto lg:left-auto lg:right-[2cqw] lg:top-[7cqw] lg:w-auto lg:text-[5.5cqw]"
              initial={{ opacity: 0, y: 20, rotate: -4 }}
              whileInView={{ opacity: 1, y: 0, rotate: -4 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease, delay: 0.3 }}
            >
              shall we?
            </motion.p>
            <div className="absolute bottom-[4cqw] left-[1cqw] hidden lg:block">
              <MagneticCTA />
            </div>
          </BigType>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6 lg:hidden">
          <MagneticCTA />
          <div className="flex flex-col items-end text-right">
            <p className="kicker text-[10px] text-paper/45">{site.city} time</p>
            <Clock className="display mt-2 block text-[44px] leading-none text-paper" />
          </div>
        </div>
        <Available className="mt-8 whitespace-nowrap sm:hidden" />

        <div className="mt-14 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-10">
          <ul className="lg:col-span-7">
            {LINKS.map((l, i) => (
              <motion.li
                key={l.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 0.9, ease, delay: i * 0.08 }}
              >
                <a
                  href={l.href}
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  data-cursor="OPEN"
                  className="group flex items-center justify-between gap-4 border-t border-paper/10 py-5 lg:py-7"
                >
                  <span className="min-w-0">
                    <span className="kicker block text-[10px] text-paper/40">{l.label}</span>
                    <span className="relative mt-2 inline-block max-w-full truncate text-[clamp(1.25rem,5.6vw,2.75rem)] font-medium leading-tight tracking-[-0.02em] text-paper">
                      {l.value}
                      <span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-right scale-x-0 bg-red transition-transform duration-700 ease-[var(--ease-expo)] group-hover:origin-left group-hover:scale-x-100" />
                    </span>
                  </span>
                  <Arrow />
                </a>
              </motion.li>
            ))}
          </ul>

          <div className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9">
            <div className="hidden lg:block">
              <p className="kicker text-[10px] text-paper/40">{site.city} time</p>
              <Clock className="display mt-3 block text-[clamp(3.5rem,6vw,6rem)] leading-none text-paper" />
            </div>
            <ul className="flex flex-col gap-3">
              {PLACES.map((p, i) => (
                <motion.li
                  key={p}
                  className="flex items-center gap-3 text-[17px] text-paper/75 lg:text-[19px]"
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.08 }}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
                  {p}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  )
}
