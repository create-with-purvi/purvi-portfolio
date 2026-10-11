import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { byId, src, type WorkItem } from '../data/work'
import { cn, ease } from '../lib/hooks'
import { lockScroll, unlockScroll } from '../lib/lenis'
import { ui, useUI } from '../lib/ui'
import { CarouselGlyph } from '../sections/feed/CarouselGlyph'
import { Img } from './Img'

type Pan = { offset: { x: number; y: number }; velocity: { x: number; y: number } }

const pad = (v: number) => String(v).padStart(2, '0')

const slide = {
  enter: (d: number) => ({ opacity: 0, scale: 0.92, x: d * 90, clipPath: 'inset(7% 7% 7% 7% round 24px)' }),
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    clipPath: 'inset(0% 0% 0% 0% round 14px)',
    transition: { duration: 0.75, ease },
  },
  exit: (d: number) => ({
    opacity: 0,
    scale: 0.96,
    x: d * -90,
    clipPath: 'inset(0% 0% 0% 0% round 14px)',
    transition: { duration: 0.35, ease },
  }),
}

const fadeOnly = {
  enter: { opacity: 0, clipPath: 'inset(0% 0% 0% 0% round 14px)' },
  center: { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 14px)', transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

function fitSize(item: WorkItem, stage: { w: number; h: number }) {
  if (!stage.w || !stage.h) return { w: 0, h: 0 }
  const s = Math.min(stage.w / item.w, stage.h / item.h, 2.4)
  return { w: Math.round(item.w * s), h: Math.round(item.h * s) }
}

export default function Lightbox() {
  const { lightbox } = useUI()
  const ids = lightbox ? lightbox.ids.filter((id) => byId[id]) : []
  const start = lightbox ? Math.max(0, ids.indexOf(lightbox.ids[lightbox.index])) : 0
  return <AnimatePresence>{lightbox && ids.length > 0 && <Viewer key="lightbox" ids={ids} start={start} />}</AnimatePresence>
}

function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-5', dir < 0 && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function Viewer({ ids, start }: { ids: string[]; start: number }) {
  const reduce = useReducedMotion()
  const n = ids.length
  const [[index, dir], setNav] = useState<[number, number]>(() => [Math.min(start, n - 1), 0])
  const item = byId[ids[index]]
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const dragged = useRef(false)
  const firstStrip = useRef(true)
  const [stage, setStage] = useState({ w: 0, h: 0 })
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const fade = useTransform(y, [0, 360], [1, 0.15])
  const shrink = useTransform(y, [0, 360], [1, 0.82])
  const chrome = useTransform(y, [0, 140], [1, 0])

  const go = useCallback((d: 1 | -1) => setNav(([i]) => [(i + d + n) % n, d]), [n])
  const jump = useCallback((j: number) => setNav(([i]) => (i === j ? [i, 0] : [j, j > i ? 1 : -1])), [])
  const close = useCallback(() => ui.closeLightbox(), [])

  useEffect(() => {
    lockScroll()
    return () => unlockScroll()
  }, [])

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    rootRef.current?.focus({ preventScroll: true })
    return () => prev?.focus?.({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'ArrowRight' && n > 1) {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft' && n > 1) {
        e.preventDefault()
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, go, n])

  useEffect(() => {
    for (const d of [1, -1, 2]) {
      if (n <= 1) break
      const img = new Image()
      img.decoding = 'async'
      img.src = src(ids[(index + d + n) % n], 'l')
    }
  }, [ids, index, n])

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => setStage({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    const el = strip?.querySelector<HTMLElement>(`[data-i="${index}"]`)
    if (!strip || !el) return
    const left = el.offsetLeft - strip.clientWidth / 2 + el.offsetWidth / 2
    strip.scrollTo({ left, behavior: firstStrip.current || reduce ? 'auto' : 'smooth' })
    firstStrip.current = false
  }, [index, reduce])

  const trapTab = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab') return
    const root = rootRef.current
    if (!root) return
    const items = [...root.querySelectorAll<HTMLElement>('button:not([disabled]),[tabindex="0"]')].filter(
      (el) => el.offsetParent !== null
    )
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (document.activeElement === root) {
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const onDragEnd = (_: unknown, info: Pan) => {
    const { offset: o, velocity: v } = info
    requestAnimationFrame(() => {
      dragged.current = false
    })
    if (o.y > 110 || (v.y > 700 && o.y > 24)) {
      animate(y, y.get() + 160, { duration: 0.35, ease })
      close()
      return
    }
    if (n > 1 && (o.x < -70 || v.x < -600)) go(1)
    else if (n > 1 && (o.x > 70 || v.x > 600)) go(-1)
    animate(x, 0, { type: 'spring', stiffness: 380, damping: 36 })
    animate(y, 0, { type: 'spring', stiffness: 380, damping: 36 })
  }

  const fit = fitSize(item, stage)
  const slides = item.carousel ? ids.filter((id) => byId[id].carousel === item.carousel) : []
  const variants = reduce ? fadeOnly : slide

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title}, ${item.brand}`}
      data-no-hearts
      tabIndex={-1}
      onKeyDown={trapTab}
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden overscroll-contain text-paper outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.45, ease } }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease } }}
    >
      <motion.div aria-hidden className="absolute inset-0 bg-ink" style={{ opacity: fade }} />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: fade }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={item.id}
            className="absolute left-[35%] top-[35%] h-[30%] w-[30%]"
            style={{
              backgroundColor: item.color,
              backgroundImage: `url(${src(item.id, 's')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(14px) saturate(1.6)',
              scale: 4,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,10,0.15)_0%,rgba(10,10,10,0.7)_65%,#0a0a0a_100%)]" />
      </motion.div>

      <motion.header
        style={{ opacity: chrome }}
        className="relative z-10 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),14px)] md:px-10 md:pt-7"
      >
        <p className="kicker tabular-nums text-paper/45">
          <span className="text-paper">{pad(index + 1)}</span>
          <span className="mx-2 text-red">/</span>
          {pad(n)}
        </p>
        <button
          type="button"
          aria-label="Close viewer"
          data-cursor="TAP"
          onClick={close}
          className="grid size-11 place-items-center rounded-full border border-paper/20 bg-ink/40 backdrop-blur-md transition-colors duration-300 hover:border-red hover:bg-red md:size-12"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </motion.header>

      <div className="relative z-0 flex min-h-0 flex-1 px-5 py-4 md:px-28 md:py-5">
        <div ref={stageRef} className="relative min-h-0 flex-1">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            drag={n > 1 ? true : 'y'}
            dragDirectionLock
            dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
            dragElastic={{ top: 0.08, right: 0.5, bottom: 0.9, left: 0.5 }}
            dragMomentum={false}
            onDragStart={() => {
              dragged.current = true
            }}
            onDragEnd={onDragEnd}
            onClick={(e) => {
              if (!dragged.current && e.target === e.currentTarget) close()
            }}
            style={{ x, y, scale: shrink }}
          >
            <AnimatePresence initial={!reduce} custom={dir} mode="popLayout">
              <motion.img
                key={item.id}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                src={src(item.id, 'l')}
                width={item.w}
                height={item.h}
                alt={`${item.title} — ${item.brand}`}
                draggable={false}
                decoding="async"
                className="block max-w-none select-none object-contain"
                style={{
                  width: fit.w,
                  height: fit.h,
                  backgroundColor: item.color,
                  backgroundImage: `url(${src(item.id, 's')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </AnimatePresence>
          </motion.div>

          {n > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                data-cursor="TAP"
                onClick={() => go(-1)}
                className="absolute -left-20 top-1/2 hidden size-14 -translate-y-1/2 place-items-center rounded-full border border-paper/20 bg-ink/40 backdrop-blur-md transition-colors duration-300 hover:border-red hover:bg-red md:grid"
              >
                <Arrow dir={-1} />
              </button>
              <button
                type="button"
                aria-label="Next"
                data-cursor="TAP"
                onClick={() => go(1)}
                className="absolute -right-20 top-1/2 hidden size-14 -translate-y-1/2 place-items-center rounded-full border border-paper/20 bg-ink/40 backdrop-blur-md transition-colors duration-300 hover:border-red hover:bg-red md:grid"
              >
                <Arrow dir={1} />
              </button>
            </>
          )}
        </div>
      </div>

      <motion.footer
        style={{ opacity: chrome }}
        className="relative z-10 flex flex-col gap-4 px-5 pb-[max(env(safe-area-inset-bottom),18px)] md:flex-row md:items-end md:gap-10 md:px-10 md:pb-8"
      >
        <div className="flex min-w-0 items-end justify-between gap-4 md:w-[44%] md:shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={item.id}
              className="min-w-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease }}
            >
              <p className="kicker flex items-center gap-3 text-red">
                <span className="truncate">{item.brand}</span>
                {slides.length > 1 && (
                  <span className="flex shrink-0 items-center gap-1.5 text-paper/70">
                    <CarouselGlyph className="size-3" />
                    <span className="tabular-nums">
                      {slides.indexOf(item.id) + 1}/{slides.length}
                    </span>
                  </span>
                )}
              </p>
              <h3 className="display mt-2 line-clamp-2 min-h-[1.9em] pb-[0.04em] leading-[0.95] text-[clamp(1.75rem,2.8vw,2.75rem)] text-paper md:line-clamp-1 md:min-h-0">{item.title}</h3>
            </motion.div>
          </AnimatePresence>
          {n > 1 && (
            <div className="flex shrink-0 gap-2 md:hidden">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => go(-1)}
                className="grid size-11 place-items-center rounded-full border border-paper/20 bg-ink/40 backdrop-blur-md active:bg-red"
              >
                <Arrow dir={-1} />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => go(1)}
                className="grid size-11 place-items-center rounded-full border border-paper/20 bg-ink/40 backdrop-blur-md active:bg-red"
              >
                <Arrow dir={1} />
              </button>
            </div>
          )}
        </div>

        {n > 1 && (
          <div ref={stripRef} data-lenis-prevent className="no-scrollbar relative -mx-5 min-w-0 flex-1 overflow-x-auto px-5 py-1 md:mx-0 md:px-1">
            <div className="flex w-max gap-2 md:ml-auto">
              {ids.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  data-i={i}
                  tabIndex={i === index ? 0 : -1}
                  aria-label={`Show ${byId[id].title}`}
                  aria-current={i === index}
                  onClick={() => jump(i)}
                  className={cn(
                    'relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-ink-3 transition-[opacity,box-shadow] duration-300 md:h-[68px] md:w-[54px]',
                    i === index ? 'opacity-100 ring-2 ring-red ring-offset-2 ring-offset-ink' : 'opacity-40 hover:opacity-90'
                  )}
                >
                  <Img item={byId[id]} size="s" sizes="56px" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.footer>
    </motion.div>
  )
}
