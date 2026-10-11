import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useRef, useState } from 'react'
import { waLink } from '../data/site'
import { ease } from '../lib/hooks'
import { WhatsAppIcon } from './WhatsAppIcon'

export default function FloatingWhatsApp() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  const [hint, setHint] = useState(false)
  const hinted = useRef(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const contact = document.getElementById('contact')
    const inContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.75 : false
    const next = y > window.innerHeight * 0.85 && !inContact
    if (next !== show) setShow(next)
    if (next && !hinted.current) {
      hinted.current = true
      setHint(true)
      window.setTimeout(() => setHint(false), 3200)
    }
  })

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed z-[70] flex items-center gap-3"
          style={{ right: 'max(16px, env(safe-area-inset-right))', bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 30 }}
          transition={{ duration: 0.6, ease }}
        >
          <AnimatePresence>
            {hint && (
              <motion.span
                className="hidden rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink shadow-xl sm:block"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.5, ease }}
              >
                Chat on WhatsApp
              </motion.span>
            )}
          </AnimatePresence>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Purvi on WhatsApp"
            data-cursor="CHAT"
            className="group relative grid h-14 w-14 place-items-center rounded-full bg-red text-white shadow-[0_12px_40px_-8px_rgba(244,8,22,0.7)] transition-transform duration-300 hover:scale-110 active:scale-95"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-red/50 [animation-duration:2.4s]" />
            <WhatsAppIcon className="relative h-7 w-7" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
