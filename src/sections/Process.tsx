import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useRef, useState } from 'react'
import { SectionHead } from '../components/SectionHead'
import { Img } from '../components/Img'
import { process, site, waLink } from '../data/site'
import { byId, portrait } from '../data/work'
import { cn, ease, useIsDesktop } from '../lib/hooks'
import { scrollToTarget } from '../lib/lenis'

const pad = (n: number) => String(n).padStart(2, '0')
const N = process.length

export default function Process() {
  const desktop = useIsDesktop()
  return (
    <section id="process" className="relative overflow-x-clip bg-ink pt-28 sm:pt-36">
      <div className="px-5 sm:px-8 lg:px-12">
        <SectionHead index="06" label="Process" top="How it" bottom="Works" />
      </div>
      {desktop ? <Stories /> : <Timeline />}
    </section>
  )
}

function Avatar({ size = 44 }: { size?: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full bg-[conic-gradient(from_200deg,#f40816,#ff7a3d,#f40816,#a8000b,#f40816)] p-[2px]"
      style={{ width: size, height: size }}
    >
      <span className="block h-full w-full overflow-hidden rounded-full border-2 border-ink bg-ink-3">
        <img src={portrait.s} alt="" width={portrait.w} height={portrait.h} className="h-full w-full scale-[1.6] object-cover object-[50%_6%] [transform-origin:50%_12%]" loading="lazy" />
      </span>
    </span>
  )
}

function Segment({ i, progress, active, onClick }: { i: number; progress: MotionValue<number>; active: boolean; onClick: () => void }) {
  const fill = useTransform(progress, (p) => Math.max(0, Math.min(1, p * N - i)))
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Step ${i + 1}: ${process[i].title}`}
      aria-current={active ? 'step' : undefined}
      className="group flex flex-1 flex-col gap-3 pt-3 text-left"
    >
      <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-paper/15">
        <motion.span style={{ scaleX: fill }} className="absolute inset-0 origin-left rounded-full bg-paper" />
      </span>
      <span className={cn('kicker flex items-center gap-2 text-[10px] transition-colors duration-500', active ? 'text-paper' : 'text-paper/35 group-hover:text-paper/70')}>
        <span className={active ? 'text-red' : ''}>{pad(i + 1)}</span>
        {process[i].title}
      </span>
    </button>
  )
}

function Stories() {
  const reduce = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const [state, setState] = useState({ active: 0, dir: 1 })
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const a = Math.min(N - 1, Math.max(0, Math.floor(p * N)))
    if (a !== state.active) setState({ active: a, dir: a > state.active ? 1 : -1 })
  })
  const glow = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])

  const go = (i: number) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const top = wrap.getBoundingClientRect().top + window.scrollY
    const span = wrap.offsetHeight - window.innerHeight
    scrollToTarget(top + span * ((i + 0.08) / N))
  }

  const step = process[state.active]
  const { dir } = state
  const slide = reduce ? 0 : 140

  return (
    <div ref={wrapRef} className="relative mt-10 h-[280vh]">
      <ol className="sr-only">
        {process.map((p, i) => (
          <li key={p.id}>
            {pad(i + 1)} {p.title}: {p.line}
          </li>
        ))}
      </ol>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-12 pb-12 pt-24">
        <motion.div
          aria-hidden
          style={{ x: glow }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,8,22,0.22),transparent_62%)]"
        />

        <div className="relative flex items-center gap-4">
          <Avatar />
          <p className="flex items-baseline gap-3 text-[15px]">
            <span className="font-semibold text-paper">Purvi Agarwal</span>
            <span className="text-paper/45">Process</span>
            <span className="text-paper/30">· now</span>
          </p>
          <p className="kicker ml-auto text-paper/45">
            <span className="text-paper">{pad(state.active + 1)}</span> / {pad(N)}
          </p>
        </div>

        <div className="relative mt-4 flex gap-3">
          {process.map((p, i) => (
            <Segment key={p.id} i={i} progress={scrollYProgress} active={i === state.active} onClick={() => go(i)} />
          ))}
        </div>

        <div className="relative grid flex-1 grid-cols-12 items-center gap-8">
          <div aria-hidden className="col-span-4 grid overflow-hidden">
            <AnimatePresence initial={false} custom={dir}>
              <motion.span
                key={step.id}
                custom={dir}
                className="display col-start-1 row-start-1 block text-[clamp(10rem,min(46vh,26vw),30rem)] leading-[0.8] text-red"
                variants={{
                  enter: (d: number) => ({ y: reduce ? 0 : `${d * 100}%`, opacity: reduce ? 0 : 1 }),
                  center: { y: '0%', opacity: 1 },
                  exit: (d: number) => ({ y: reduce ? 0 : `${-d * 100}%`, opacity: reduce ? 0 : 1 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.9, ease }}
              >
                {pad(state.active + 1)}
              </motion.span>
            </AnimatePresence>
          </div>
          <div aria-hidden className="col-span-5 grid">
            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={step.id}
                custom={dir}
                className="col-start-1 row-start-1"
                variants={{
                  enter: (d: number) => ({ x: d * slide, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: -d * slide, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease }}
              >
                <h3 className="display text-[clamp(4.5rem,8vw,8.5rem)] text-paper">{step.title}</h3>
                <p className="mt-6 max-w-[30ch] text-[clamp(1.25rem,1.8vw,1.75rem)] leading-snug text-paper/70">{step.line}</p>
                {state.active < N - 1 ? (
                  <p className="kicker mt-10 flex items-center gap-3 text-paper/40">
                    Next
                    <span className="h-px w-8 bg-paper/25" />
                    <span className="text-paper/70">{process[state.active + 1].title}</span>
                  </p>
                ) : (
                  <p className="kicker mt-10 flex items-center gap-3 text-red">
                    <span className="h-px w-8 bg-red" />
                    Repeat. Grow.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="col-span-3 flex justify-end [perspective:1400px]">
            <div className="grid aspect-[9/16] w-[min(100%,35vh,350px)]">
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={step.id}
                  custom={dir}
                  className="col-start-1 row-start-1 [backface-visibility:hidden]"
                  variants={{
                    enter: (d: number) => ({ rotateY: reduce ? 0 : d * 75, x: reduce ? 0 : `${d * 50}%`, opacity: 0, transformOrigin: d > 0 ? '0% 50%' : '100% 50%' }),
                    center: { rotateY: 0, x: '0%', opacity: 1 },
                    exit: (d: number) => ({ rotateY: reduce ? 0 : -d * 75, x: reduce ? 0 : `${-d * 50}%`, opacity: 0, transformOrigin: d > 0 ? '100% 50%' : '0% 50%' }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.85, ease }}
                >
                  <StoryCard i={state.active} progress={scrollYProgress} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const STORY_ART = ['dream-high', 'vaswani-navratri', 'same-space', 'heavy-moves']

function StoryCard({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const item = byId[STORY_ART[i % STORY_ART.length]]
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[22px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)] ring-1 ring-paper/10"
      style={{ background: `linear-gradient(170deg, ${item?.color ?? '#1f1f1f'}, #0a0a0a 95%)` }}
    >
      <div className="absolute inset-x-3 top-3 flex gap-1">
        {process.map((p, k) => (
          <MiniBar key={p.id} k={k} progress={progress} />
        ))}
      </div>
      <div className="absolute inset-x-3 top-6 flex items-center gap-2">
        <Avatar size={26} />
        <span className="text-[12px] font-semibold text-white">{site.instagram.handle}</span>
        <span className="text-[11px] text-white/60">{pad(i + 1)}</span>
      </div>
      {item && (
        <div className="absolute inset-x-[7%] top-1/2 -translate-y-1/2 overflow-hidden rounded-[10px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)]">
          <Img item={item} sizes="22vw" className="block h-auto w-full" />
        </div>
      )}
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="OPEN"
        className="absolute inset-x-3 bottom-3 flex h-11 items-center justify-between rounded-full border border-white/35 px-4 text-[12px] text-white/80 transition-colors hover:border-white hover:text-white"
      >
        Send message
        <span aria-hidden>➤</span>
      </a>
    </div>
  )
}

function MiniBar({ k, progress }: { k: number; progress: MotionValue<number> }) {
  const fill = useTransform(progress, (p) => Math.max(0, Math.min(1, p * N - k)))
  return (
    <span className="relative block h-[2px] flex-1 overflow-hidden rounded-full bg-white/30">
      <motion.span style={{ scaleX: fill }} className="absolute inset-0 origin-left bg-white" />
    </span>
  )
}

function Timeline() {
  const reduce = useReducedMotion()
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 60%', 'end 60%'] })
  return (
    <div className="px-5 pb-10 sm:px-8">
      <div className="mt-12 flex items-center gap-3">
        <Avatar size={40} />
        <p className="text-[14px]">
          <span className="font-semibold text-paper">Purvi Agarwal</span>
          <span className="ml-2 text-paper/45">Process</span>
        </p>
      </div>
      <ol ref={listRef} className="relative mt-8">
        <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-[2px] rounded-full bg-paper/12" />
        <motion.span
          aria-hidden
          style={{ scaleY: reduce ? 1 : scrollYProgress }}
          className="absolute bottom-6 left-[19px] top-6 w-[2px] origin-top rounded-full bg-red"
        />
        {process.map((p, i) => (
          <TimelineStep key={p.id} i={i} />
        ))}
      </ol>
    </div>
  )
}

function TimelineStep({ i }: { i: number }) {
  const reduce = useReducedMotion()
  const dotRef = useRef<HTMLSpanElement>(null)
  const lit = useInView(dotRef, { margin: '100000px 0px -40% 0px' })
  return (
    <li className="relative grid grid-cols-[40px_1fr] gap-5 py-7">
      <span ref={dotRef} className="relative z-10 mt-2 grid h-10 w-10 place-items-center">
        <span className={cn('absolute inset-0 rounded-full border bg-ink transition-colors duration-500', lit ? 'border-red/60' : 'border-paper/15')} />
        <motion.span
          animate={{ scale: lit ? 1 : 0.4, opacity: lit ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          className="absolute inset-[5px] rounded-full bg-red shadow-[0_0_24px_rgba(244,8,22,0.7)]"
        />
        <span className="relative text-[11px] font-semibold text-paper">{pad(i + 1)}</span>
      </span>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '0px 0px -20% 0px' }}
        transition={{ duration: 0.9, ease }}
      >
        <span
          className="display block text-[22vw] leading-[0.8] sm:text-[16vw]"
          style={{ color: 'transparent', WebkitTextStroke: '1.2px rgba(244,8,22,0.9)' }}
          aria-hidden
        >
          {pad(i + 1)}
        </span>
        <h3 className="display -mt-[6vw] text-[13vw] text-paper sm:text-[9vw]">{process[i].title}</h3>
        <p className="mt-3 text-[16px] leading-snug text-paper/65">{process[i].line}</p>
      </motion.div>
    </li>
  )
}
