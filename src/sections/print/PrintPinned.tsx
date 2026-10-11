import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Img } from '../../components/Img'
import { waLink } from '../../data/site'
import type { WorkItem } from '../../data/work'
import { cn, ease } from '../../lib/hooks'
import { scrollToTarget } from '../../lib/lenis'
import { ui } from '../../lib/ui'
import { aspect, groups, indexOf, kindLabel, orderedIds, pad2 } from './data'
import './print.css'

type Layout = { items: { left: number; width: number }[]; groups: number[]; vw: number }

const PRESETS = [
  { h: 60, y: -5, r: -2.2 },
  { h: 50, y: 7, r: 1.8 },
  { h: 66, y: -1, r: -1 },
  { h: 55, y: 5, r: 2.4 },
]

const STROKE = { color: 'transparent', WebkitTextStroke: '1.5px rgba(248,248,248,0.2)' } as const

export default function PrintPinned() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const layout = useRef<Layout>({ items: [], groups: [], vw: window.innerWidth })
  const [dims, setDims] = useState({ dist: 0, vh: window.innerHeight })
  const dist = useMotionValue(0)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const tr = track.getBoundingClientRect()
      const items = [...track.querySelectorAll<HTMLElement>('[data-pi]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { left: r.left - tr.left, width: r.width }
      })
      const groupsL = [...track.querySelectorAll<HTMLElement>('[data-pg]')].map((el) => el.getBoundingClientRect().left - tr.left)
      const vw = document.documentElement.clientWidth
      const d = Math.max(0, track.offsetWidth - vw)
      layout.current = { items, groups: groupsL, vw }
      dist.set(d)
      setDims((p) => (p.dist === d && p.vh === window.innerHeight ? { ...p } : { dist: d, vh: window.innerHeight }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [dist])

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 240, damping: 40, mass: 0.3 })
  const x = useTransform([smooth, dist], ([p, d]: number[]) => -p * d)
  const hint = useTransform(smooth, [0, 0.04], [1, 0])

  const [active, setActive] = useState(0)
  useMotionValueEvent(x, 'change', (v) => {
    const { groups: gl, vw } = layout.current
    let a = 0
    gl.forEach((l, i) => {
      if (l + v < vw * 0.55) a = i
    })
    if (a !== active) setActive(a)
  })

  const jump = (g: number) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const top = wrap.getBoundingClientRect().top + window.scrollY
    const l = layout.current.groups[g] ?? 0
    const target = g === 0 ? 0 : Math.min(dims.dist, Math.max(0, l - layout.current.vw * 0.04))
    scrollToTarget(top + target + 2)
  }

  return (
    <div ref={wrapRef} className="relative" style={{ height: dims.dist + dims.vh }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex h-full w-max items-center pl-[6vw] pr-[14vw] will-change-transform">
          {groups.map((g, gi) => (
            <Group key={g.kind} gi={gi} x={x} layout={layout} word={g.word} active={gi === active}>
              {g.items.map((item, i) => (
                <Frame key={item.id} item={item} preset={PRESETS[(i + gi) % PRESETS.length]} x={x} layout={layout} />
              ))}
            </Group>
          ))}
          <div className="flex h-full shrink-0 flex-col justify-center pl-[9vw]">
            <p className="kicker flex items-center gap-3 text-paper/50">
              <span className="h-px w-8 bg-red" />
              Print · Outdoor · Stationery
            </p>
            <p className="display mt-5 text-[15vh]">Your brand</p>
            <p className="display text-[15vh] text-red">is next?</p>
            <a
              href={waLink('Hi Purvi! I need print design for my brand.')}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="OPEN"
              className="group mt-9 inline-flex h-14 w-fit items-center gap-3 rounded-full bg-paper pl-7 pr-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-500 hover:bg-red hover:text-white"
            >
              Get print designed
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 ease-[var(--ease-expo)] group-hover:rotate-[-45deg]">
                →
              </span>
            </a>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-[6vw] pb-7">
          <div className="pointer-events-auto relative flex items-end justify-between gap-6">
            <div className="flex gap-1 sm:gap-6">
              {groups.map((g, i) => (
                <button
                  key={g.kind}
                  type="button"
                  onClick={() => jump(i)}
                  className={cn(
                    'kicker flex h-11 items-center gap-2 transition-colors duration-500',
                    i === active ? 'text-paper' : 'text-paper/35 hover:text-paper/70'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full transition-colors duration-500', i === active ? 'bg-red' : 'bg-paper/25')} />
                  {g.word}
                </button>
              ))}
            </div>
            <motion.p style={{ opacity: hint }} className="kicker flex h-11 items-center gap-3 text-paper/60">
              Scroll
              <span aria-hidden className="pv-nudge text-red">
                →
              </span>
            </motion.p>
          </div>
          <div className="relative mt-2 h-px w-full bg-paper/15">
            <motion.div style={{ scaleX: smooth }} className="absolute inset-0 origin-left bg-red" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Group({
  gi,
  x,
  layout,
  word,
  active,
  children,
}: {
  gi: number
  x: MotionValue<number>
  layout: React.RefObject<Layout>
  word: string
  active: boolean
  children: React.ReactNode
}) {
  const wordX = useTransform(x, (v) => {
    const { groups: gl, vw } = layout.current
    const l = gl[gi] ?? 0
    return 0.32 * (vw * 0.08 - (l + v))
  })
  return (
    <div data-pg className="relative flex h-full items-center gap-[5.5vw] pl-[7vw] first:pl-0">
      <motion.span
        aria-hidden
        style={{ x: wordX, ...STROKE }}
        animate={{ opacity: active ? 1 : 0.45 }}
        transition={{ duration: 0.8, ease }}
        className="display pointer-events-none absolute left-[2vw] top-[13vh] select-none whitespace-nowrap text-[31vh] leading-none will-change-transform"
      >
        {word}
      </motion.span>
      {children}
    </div>
  )
}

function Frame({
  item,
  preset,
  x,
  layout,
}: {
  item: WorkItem
  preset: (typeof PRESETS)[number]
  x: MotionValue<number>
  layout: React.RefObject<Layout>
}) {
  const index = indexOf(item.id)
  const ar = aspect(item)
  const imgX = useTransform(x, (v) => {
    const { items, vw } = layout.current
    const m = items[index]
    if (!m) return 0
    const c = m.left + m.width / 2 + v
    const n = Math.max(-1.4, Math.min(1.4, (c - vw / 2) / vw))
    return -n * m.width * 0.06
  })
  return (
    <div
      data-pi
      className="relative shrink-0"
      style={{
        height: `min(${preset.h}vh, calc(46vw / ${ar.toFixed(4)}))`,
        aspectRatio: `${item.w} / ${item.h}`,
        transform: `translateY(${preset.y}vh)`,
      }}
    >
      <motion.button
        type="button"
        data-cursor="VIEW"
        aria-label={`View ${item.title}, ${item.brand}`}
        onClick={() => ui.openLightbox(orderedIds, index)}
        initial={{ rotate: preset.r, y: 40, opacity: 0 }}
        animate={{ rotate: preset.r }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={{ rotate: 0, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22, opacity: { duration: 0.8, ease }, y: { duration: 1, ease } }}
        className="group block h-full w-full"
      >
        <span className="relative block h-full w-full overflow-hidden rounded-[18px] bg-ink-3 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95),0_10px_30px_-12px_rgba(0,0,0,0.7)] ring-1 ring-paper/10">
          <motion.span style={{ x: imgX }} className="absolute inset-0 block scale-[1.13] will-change-transform">
            <Img item={item} sizes="46vw" className="h-full w-full object-cover" />
          </motion.span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink/25 via-transparent to-paper/10 opacity-80 transition-opacity duration-500 group-hover:opacity-30" />
        </span>
      </motion.button>
      <p className="kicker absolute left-1 top-full mt-4 flex items-center gap-2 whitespace-nowrap text-[10px] text-paper/55">
        <span className="text-red">{pad2(index + 1)}</span>
        <span className="h-px w-4 bg-paper/25" />
        {kindLabel(item)}
        <span className="text-paper/30">·</span>
        <span className="text-paper/80">{item.brand}</span>
      </p>
    </div>
  )
}
