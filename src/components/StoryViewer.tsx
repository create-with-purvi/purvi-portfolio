import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { waLink } from '../data/site'
import { byId, categories, inCategory, src } from '../data/work'
import { cn, ease, useMediaQuery } from '../lib/hooks'
import { lockScroll, unlockScroll } from '../lib/lenis'
import { ui, useUI } from '../lib/ui'
import { CloseIcon, HeartIcon, PauseIcon, PlayIcon } from '../sections/reels/icons'
import { usePageVisible } from '../sections/reels/usePageVisible'

const DURATION = 5
const GROUPS = categories.map((c) => ({ ...c, items: inCategory(c.id) })).filter((g) => g.items.length > 0)
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const cubeEase = [0.55, 0.05, 0.25, 1] as const

export default function StoryViewer() {
  const { story } = useUI()
  return <AnimatePresence>{story && <Viewer key="story" group={story.group} />}</AnimatePresence>
}

type Gesture = {
  id: number
  x: number
  y: number
  t: number
  mode: 'none' | 'cube' | 'close'
  hold: number
  held: boolean
}

function Viewer({ group }: { group: string }) {
  const reduce = !!useReducedMotion()
  const visible = usePageVisible()
  const wide = useMediaQuery('(min-width: 640px)')
  const desktop = useMediaQuery('(min-width: 1024px)')
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))

  const [cat, setCat] = useState(() => Math.max(0, GROUPS.findIndex((g) => g.id === group)))
  const [item, setItem] = useState(0)
  const [held, setHeld] = useState(false)
  const [manual, setManual] = useState(false)
  const [loadedKey, setLoadedKey] = useState('')
  const [side, setSide] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  const pos = useMotionValue(cat)
  const dragY = useMotionValue(0)
  const prog = useMotionValue(0)
  const ctrl = useRef<AnimationPlaybackControls | null>(null)
  const busy = useRef(false)
  const gesture = useRef<Gesture | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  const cardH = wide ? Math.min(vp.h * 0.92, 940) : vp.h
  const cardW = wide ? Math.min((cardH * 9) / 16, vp.w - 32) : vp.w
  const cardScale = useTransform(dragY, [0, 600], [1, 0.82])
  const backdropOpacity = useTransform(dragY, [0, 400], [1, 0])

  const g = GROUPS[cat]
  const cur = g.items[Math.min(item, g.items.length - 1)]
  const key = `${cat}-${item}`
  const paused = held || manual || !visible || loadedKey !== key || side !== null || dragging

  const close = () => ui.closeStory()

  const goCat = (to: number) => {
    if (busy.current) return
    if (to >= GROUPS.length) {
      close()
      return
    }
    if (to < 0) return
    if (reduce) {
      pos.set(to)
      setCat(to)
      setItem(0)
      return
    }
    busy.current = true
    setSide(to)
    animate(pos, to, {
      duration: 0.8,
      ease: cubeEase,
      onComplete: () => {
        busy.current = false
        setCat(to)
        setItem(0)
        setSide(null)
      },
    })
  }

  const next = () => {
    if (busy.current) return
    if (item < g.items.length - 1) setItem(item + 1)
    else goCat(cat + 1)
  }

  const prev = () => {
    if (busy.current) return
    if (item > 0) setItem(item - 1)
    else if (cat > 0) goCat(cat - 1)
    else if (ctrl.current) {
      ctrl.current.time = 0
      prog.set(0)
    }
  }

  const nextRef = useRef(next)
  const prevRef = useRef(prev)
  nextRef.current = next
  prevRef.current = prev

  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  useEffect(() => {
    lockScroll()
    const before = document.activeElement as HTMLElement | null
    dialog.current?.focus({ preventScroll: true })
    return () => {
      unlockScroll()
      before?.focus?.({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        ui.closeStory()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextRef.current()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevRef.current()
      } else if (e.key === 'Tab' && dialog.current) {
        const f = Array.from(dialog.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')).filter(
          (el) => el.offsetParent !== null
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        const a = document.activeElement
        if (e.shiftKey && (a === first || a === dialog.current)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && a === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  useEffect(() => {
    prog.set(0)
    const c = animate(prog, 1, { duration: DURATION, ease: 'linear', onComplete: () => nextRef.current() })
    c.pause()
    ctrl.current = c
    return () => {
      c.stop()
      if (ctrl.current === c) ctrl.current = null
    }
  }, [key, prog])

  useEffect(() => {
    const c = ctrl.current
    if (!c) return
    if (paused) c.pause()
    else c.play()
  }, [paused, key])

  useEffect(() => {
    const nextItem = g.items[item + 1] ?? GROUPS[cat + 1]?.items[0]
    if (!nextItem) return
    const im = new Image()
    im.src = src(nextItem.id, 'l')
  }, [cat, item, g])

  useEffect(() => {
    const t = window.setTimeout(() => setLoadedKey((k) => (k === key ? k : key)), 4000)
    return () => window.clearTimeout(t)
  }, [key])

  const endGesture = () => {
    const gs = gesture.current
    if (gs) window.clearTimeout(gs.hold)
    gesture.current = null
    setDragging(false)
    setHeld(false)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busy.current || gesture.current) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      void 0
    }
    const hold = window.setTimeout(() => {
      if (gesture.current && gesture.current.mode === 'none') {
        gesture.current.held = true
        setHeld(true)
      }
    }, 200)
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), mode: 'none', hold, held: false }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const gs = gesture.current
    if (!gs || gs.id !== e.pointerId) return
    const dx = e.clientX - gs.x
    const dy = e.clientY - gs.y
    if (gs.mode === 'none') {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) && !reduce) gs.mode = 'cube'
      else if (dy > 12 && dy > Math.abs(dx)) gs.mode = 'close'
      else return
      window.clearTimeout(gs.hold)
      setHeld(false)
      setDragging(true)
    }
    if (gs.mode === 'cube') {
      const dir = dx < 0 ? 1 : -1
      const to = cat + dir
      const valid = to >= 0 && to < GROUPS.length
      const want = valid ? to : null
      if (want !== side) setSide(want)
      const raw = -dx / cardW
      pos.set(cat + (valid ? clamp(raw, -1, 1) : raw * 0.2))
    } else {
      dragY.set(Math.max(0, dy))
    }
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const gs = gesture.current
    if (!gs || gs.id !== e.pointerId) return
    const dx = e.clientX - gs.x
    const dy = e.clientY - gs.y
    const dt = Math.max(1, performance.now() - gs.t)
    if (gs.mode === 'none') {
      const wasHeld = gs.held
      endGesture()
      if (wasHeld || e.type === 'pointercancel') return
      const rect = stage.current?.getBoundingClientRect()
      if (!rect) return
      if (e.clientX - rect.left < rect.width / 3) prevRef.current()
      else nextRef.current()
      return
    }
    if (gs.mode === 'close') {
      endGesture()
      if (dy > 110 || dy / dt > 0.6) close()
      else animate(dragY, 0, { type: 'spring', stiffness: 420, damping: 36 })
      return
    }
    const dir: 1 | -1 = dx < 0 ? 1 : -1
    const to = cat + dir
    const commit = Math.abs(dx) > cardW * 0.22 || Math.abs(dx) / dt > 0.5
    endGesture()
    if (to >= GROUPS.length && commit) {
      close()
      return
    }
    if (to >= 0 && to < GROUPS.length && commit) {
      busy.current = true
      setSide(to)
      animate(pos, to, {
        duration: 0.45,
        ease: [0.2, 0.8, 0.3, 1],
        onComplete: () => {
          busy.current = false
          setCat(to)
          setItem(0)
          setSide(null)
        },
      })
      return
    }
    busy.current = true
    animate(pos, cat, {
      type: 'spring',
      stiffness: 380,
      damping: 34,
      onComplete: () => {
        busy.current = false
        setSide(null)
      },
    })
  }

  const faces = side === null ? [cat] : [cat, side]
  const sideCards = desktop ? [-1, 1].map((o) => cat + o).filter((c) => c >= 0 && c < GROUPS.length) : []

  return (
    <motion.div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${g.label} stories`}
      tabIndex={-1}
      data-no-hearts
      data-lenis-prevent
      className="fixed inset-0 z-[85] flex items-center justify-center overflow-hidden outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      <motion.div aria-hidden className="absolute inset-0 bg-black" style={{ opacity: backdropOpacity }}>
        {wide && (
          <>
            <AnimatePresence initial={false}>
              <motion.img
                key={cur.id}
                src={src(cur.id)}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full scale-125 object-cover blur-[60px] brightness-[0.35] saturate-150"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/45" />
          </>
        )}
      </motion.div>

      {sideCards.map((c) => (
        <SideCard
          key={c}
          c={c}
          offset={c - cat}
          cardW={cardW}
          cardH={cardH}
          onOpen={() => goCat(c)}
        />
      ))}

      {wide && (
        <>
          <NavButton label="Previous story" dir={-1} cardW={cardW} onClick={() => prevRef.current()} />
          <NavButton label="Next story" dir={1} cardW={cardW} onClick={() => nextRef.current()} />
        </>
      )}

      <motion.div
        className="relative"
        style={{ width: cardW, height: cardH }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.45, ease }}
      >
        <motion.div
          ref={stage}
          className="absolute inset-0 touch-none select-none [-webkit-touch-callout:none]"
          style={{ y: dragY, scale: cardScale, perspective: cardW * 2.2 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          {faces.map((c) => (
            <Face
              key={c}
              c={c}
              item={c === cat ? item : 0}
              live={c === cat && side === null}
              pos={pos}
              width={cardW}
              rounded={wide}
              prog={prog}
              hideUi={held}
              paused={manual}
              liked={!!liked[`${c}-${c === cat ? item : 0}`]}
              onLoaded={(k) => setLoadedKey(k)}
              onClose={close}
              onTogglePause={() => setManual((m) => !m)}
              onLike={() => setLiked((l) => ({ ...l, [key]: !l[key] }))}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function Face({
  c,
  item,
  live,
  pos,
  width,
  rounded,
  prog,
  hideUi,
  paused,
  liked,
  onLoaded,
  onClose,
  onTogglePause,
  onLike,
}: {
  c: number
  item: number
  live: boolean
  pos: MotionValue<number>
  width: number
  rounded: boolean
  prog: MotionValue<number>
  hideUi: boolean
  paused: boolean
  liked: boolean
  onLoaded: (key: string) => void
  onClose: () => void
  onTogglePause: () => void
  onLike: () => void
}) {
  const g = GROUPS[c]
  const it = g.items[Math.min(item, g.items.length - 1)]
  const cover = byId[g.cover] ?? g.items[0]
  const k = `${c}-${item}`
  const half = width / 2
  const transform = useTransform(pos, (p) => {
    const a = clamp((c - p) * 90, -90, 90)
    return `translateZ(${-half}px) rotateY(${a}deg) translateZ(${half}px)`
  })
  const shade = useTransform(pos, (p) => Math.min(1, Math.abs(c - p)) * 0.75)
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()

  return (
    <motion.div
      className={cn('absolute inset-0 overflow-hidden bg-ink [backface-visibility:hidden]', rounded && 'rounded-2xl')}
      style={{ transform }}
    >
      <img
        src={src(it.id)}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl brightness-[0.4] saturate-150"
        style={{ backgroundColor: it.color }}
      />
      <img
        key={it.id}
        src={src(it.id, 'l')}
        alt={`${it.title} — ${it.brand}`}
        draggable={false}
        onLoad={() => live && onLoaded(k)}
        onError={() => live && onLoaded(k)}
        ref={(el) => {
          if (el && live && el.complete && el.naturalWidth) onLoaded(k)
        }}
        className="absolute inset-0 h-full w-full object-contain"
      />

      <motion.div
        className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/65 via-black/25 to-transparent px-3 pb-10 pt-3 transition-opacity duration-300"
        style={{ opacity: hideUi ? 0 : 1 }}
      >
        <div className="flex gap-1">
          {g.items.map((x, i) => (
            <span key={x.id} className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/35">
              <motion.span
                className="block h-full w-full origin-left bg-white"
                style={{ scaleX: i < item ? 1 : i === item && live ? prog : 0 }}
              />
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-2.5 text-white">
          <span className="block h-9 w-9 shrink-0 rounded-full bg-[conic-gradient(#f40816,#ff7a00,#ff2d87,#f40816)] p-[2px]">
            <img src={src(cover.id)} alt="" draggable={false} className="h-full w-full rounded-full border-2 border-black object-cover" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[14px] font-semibold">{g.label}</span>
            <span className="block truncate text-[12px] text-white/70">{it.brand}</span>
          </span>
          {live && (
            <>
              <button
                type="button"
                aria-label={paused ? 'Play stories' : 'Pause stories'}
                onPointerDown={stop}
                onClick={onTogglePause}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
              >
                {paused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
              </button>
              <button
                type="button"
                aria-label="Close stories"
                onPointerDown={stop}
                onClick={onClose}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pb-[max(16px,env(safe-area-inset-bottom))] pt-12 transition-opacity duration-300"
        style={{ opacity: hideUi ? 0 : 1 }}
      >
        {live ? (
          <>
            <a
              href={waLink(`Hi Purvi! I saw your ${g.label} work. Let's talk.`)}
              target="_blank"
              rel="noreferrer"
              onPointerDown={stop}
              className="flex h-11 flex-1 items-center rounded-full border border-white/45 px-4 text-[14px] text-white/85 transition-colors hover:border-white"
            >
              Reply on WhatsApp
            </a>
            <button
              type="button"
              aria-label={liked ? 'Unlike' : 'Like'}
              aria-pressed={liked}
              onPointerDown={stop}
              onClick={onLike}
              className="flex h-11 w-11 items-center justify-center"
            >
              <motion.span
                key={String(liked)}
                initial={liked ? { scale: 0.4 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 14 }}
                className={liked ? 'text-red' : 'text-white'}
              >
                <HeartIcon filled={liked} className="h-7 w-7" />
              </motion.span>
            </button>
          </>
        ) : (
          <span className="h-11" />
        )}
      </motion.div>

      <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-black" style={{ opacity: shade }} />
    </motion.div>
  )
}

function SideCard({
  c,
  offset,
  cardW,
  cardH,
  onOpen,
}: {
  c: number
  offset: number
  cardW: number
  cardH: number
  onOpen: () => void
}) {
  const g = GROUPS[c]
  const first = g.items[0]
  const cover = byId[g.cover] ?? first
  const w = cardW * 0.44
  const h = cardH * 0.44
  const x = offset * (cardW / 2 + 96 + w / 2)
  return (
    <motion.button
      type="button"
      data-cursor="OPEN"
      aria-label={`Open ${g.label} stories`}
      onClick={onOpen}
      className="group absolute left-1/2 top-1/2 overflow-hidden rounded-xl"
      style={{ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2 }}
      initial={{ opacity: 0, x: x + offset * 40 }}
      animate={{ opacity: 1, x }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease }}
    >
      <img src={src(first.id)} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 bg-black/65 transition-colors duration-300 group-hover:bg-black/40" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 text-white">
        <span className="block h-14 w-14 rounded-full bg-[conic-gradient(#f40816,#ff7a00,#ff2d87,#f40816)] p-[2.5px]">
          <img src={src(cover.id)} alt="" draggable={false} className="h-full w-full rounded-full border-[3px] border-black object-cover" />
        </span>
        <span className="max-w-full truncate text-[13px] font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{g.label}</span>
      </span>
    </motion.button>
  )
}

function NavButton({ label, dir, cardW, onClick }: { label: string; dir: -1 | 1; cardW: number; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black shadow-lg transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-white"
      style={{ marginLeft: dir * (cardW / 2 + 44) - 22 }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={dir < 0 ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} />
      </svg>
    </button>
  )
}
