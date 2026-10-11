import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { WhatsAppIcon } from '../components/WhatsAppIcon'
import { mailLink, site, waLink } from '../data/site'
import { cn, ease, easeQuart } from '../lib/hooks'
import { lockScroll, scrollToTarget, unlockScroll } from '../lib/lenis'
import { useUI } from '../lib/ui'

const LINKS = [
  { href: '#feed', label: 'Work' },
  { href: '#reels', label: 'Reels' },
  { href: '#profile', label: 'Instagram' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' },
]

function Roll({ children }: { children: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute inset-0 block translate-y-full text-red transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0">
        {children}
      </span>
    </span>
  )
}

export default function Nav() {
  const { ready } = useUI()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const last = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const d = y - last.current
    last.current = y
    if (open) return
    if (y < 120) setHidden(false)
    else if (d > 6) setHidden(true)
    else if (d < -6) setHidden(false)
  })

  useEffect(() => {
    if (!open) return
    lockScroll()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('keydown', esc)
      unlockScroll()
    }
  }, [open])

  const go = (href: string) => {
    if (open) {
      setOpen(false)
      window.setTimeout(() => scrollToTarget(href), 380)
    } else {
      scrollToTarget(href)
    }
  }

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[60] px-4 pt-3 md:px-8 md:pt-5"
        initial={{ y: -90, opacity: 0 }}
        animate={ready ? { y: hidden ? -110 : 0, opacity: 1 } : { y: -90, opacity: 0 }}
        transition={{ duration: 0.8, ease, delay: ready && last.current === 0 ? 0.5 : 0 }}
      >
        <nav className="flex items-center justify-between gap-4" aria-label="Main">
          <button
            onClick={() => scrollToTarget(0)}
            className="flex h-11 items-center gap-1.5 rounded-full bg-ink/40 px-3 backdrop-blur-md md:bg-transparent md:px-0 md:backdrop-blur-none"
            aria-label="Back to top"
          >
            <span className="font-display text-[26px] uppercase leading-none tracking-tight">{site.first}</span>
            <span className="mt-2 h-2 w-2 rounded-full bg-red" />
          </button>

          <div className="hidden items-center gap-1 rounded-full border border-paper/10 bg-ink/55 p-1.5 backdrop-blur-xl lg:flex">
            {LINKS.slice(0, 4).map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
                className="group rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-paper/85 transition-colors hover:bg-paper/5"
              >
                <Roll>{l.label}</Roll>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {site.available && (
              <span className="hidden items-center gap-2 rounded-full border border-paper/10 bg-ink/55 px-4 py-2.5 text-[12px] font-medium text-paper/80 backdrop-blur-xl xl:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Available for projects
              </span>
            )}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                go('#contact')
              }}
              className="group hidden h-11 items-center rounded-full bg-red px-6 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-transform duration-300 hover:scale-105 md:flex"
            >
              <Roll>Let's talk</Roll>
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative z-[70] flex h-11 items-center gap-2.5 rounded-full border border-paper/15 bg-ink/60 pl-4 pr-3 text-[12px] font-semibold uppercase tracking-[0.16em] backdrop-blur-xl lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? 'Close' : 'Menu'}
              <span className="relative block h-3 w-5">
                <span className={cn('absolute left-0 h-[2px] w-5 bg-paper transition-all duration-500 ease-[var(--ease-expo)]', open ? 'top-[5px] rotate-45' : 'top-0')} />
                <span className={cn('absolute left-0 h-[2px] bg-red transition-all duration-500 ease-[var(--ease-expo)]', open ? 'top-[5px] w-5 -rotate-45' : 'top-[10px] w-3')} />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[58] flex flex-col bg-ink px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-24 lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 48px) 36px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 48px) 36px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 48px) 36px)' }}
            transition={{ duration: 0.75, ease: easeQuart }}
            data-no-hearts
          >
            <ul className="flex flex-1 flex-col justify-center gap-1">
              {LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault()
                      go(l.href)
                    }}
                    className="flex items-baseline gap-3 py-1"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.06 }}
                  >
                    <span className="kicker text-red">0{i + 1}</span>
                    <span className="display text-[17vw] leading-[0.9]">{l.label}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.45 }}
            >
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-14 items-center justify-center gap-3 rounded-full bg-red text-sm font-semibold uppercase tracking-[0.14em] text-white"
              >
                <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-full border border-paper/15 text-[13px] font-medium">
                  Instagram ↗
                </a>
                <a href={mailLink()} className="flex h-12 items-center justify-center rounded-full border border-paper/15 text-[13px] font-medium">
                  Email ↗
                </a>
              </div>
              <p className="kicker pt-2 text-center text-paper/40">
                {site.city}, India · {site.available ? 'Available for projects' : 'Booked'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
