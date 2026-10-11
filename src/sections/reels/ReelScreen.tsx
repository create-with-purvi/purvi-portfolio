import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Img } from '../../components/Img'
import type { Reel } from '../../data/site'
import { byId, src } from '../../data/work'
import { ease } from '../../lib/hooks'
import {
  CameraIcon,
  ChevronDown,
  CommentIcon,
  HeartIcon,
  HomeIcon,
  MoreIcon,
  PlayIcon,
  PlusSquareIcon,
  ReelsIcon,
  SearchIcon,
  ShareIcon,
} from './icons'

type Props = {
  reel: Reel
  active: boolean
  playing: boolean
  paused: boolean
  onTap: () => void
  sizes: string
}

export function ReelScreen({ reel, active, playing, paused, onTap, sizes }: Props) {
  const [liked, setLiked] = useState(false)
  const [burst, setBurst] = useState(0)
  const [bigHeart, setBigHeart] = useState(0)
  const lastTap = useRef(0)
  const tapTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(tapTimer.current), [])

  const like = () => {
    setLiked(true)
    setBurst((b) => b + 1)
  }

  const handleTap = () => {
    if (!active) {
      onTap()
      return
    }
    const now = performance.now()
    if (now - lastTap.current < 280) {
      window.clearTimeout(tapTimer.current)
      lastTap.current = 0
      like()
      setBigHeart((b) => b + 1)
      return
    }
    lastTap.current = now
    window.clearTimeout(tapTimer.current)
    tapTimer.current = window.setTimeout(onTap, 280)
  }

  const run: CSSProperties = { animationPlayState: playing ? 'running' : 'paused' }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" onClick={handleTap}>
      <div className="absolute inset-x-0 bottom-[13cqw] top-0 overflow-hidden">
        {active && reel.video ? (
          <VideoPlayer reel={reel} playing={playing} />
        ) : active ? (
          <FramePlayer frames={reel.frames} playing={playing} sizes={sizes} />
        ) : (
          <FrameLayer id={reel.poster} k={0} still sizes={sizes} />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[34cqw] bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[13cqw] z-10 h-[78cqw] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-[13.5cqw] z-20 flex items-center justify-between px-[5cqw] text-white">
        <span className="flex items-center gap-[1cqw] text-[6.2cqw] font-bold tracking-tight">
          Reels
          <ChevronDown className="h-[4.4cqw] w-[4.4cqw]" strokeWidth={2.6} />
        </span>
        <CameraIcon className="h-[7cqw] w-[7cqw]" strokeWidth={1.8} />
      </div>

      <span className="pointer-events-none absolute left-[5cqw] top-[24cqw] z-20 flex items-center gap-[1.4cqw] rounded-[1.4cqw] bg-black/45 px-[2cqw] py-[0.9cqw] text-[2.9cqw] font-bold tracking-[0.14em] text-white backdrop-blur-sm">
        <span className="reel-rec h-[1.9cqw] w-[1.9cqw] rounded-full bg-red shadow-[0_0_6px_#f40816]" style={run} />
        REC
      </span>

      {active && (
        <button
          type="button"
          aria-label={paused ? `Play ${reel.brand} reel` : `Pause ${reel.brand} reel`}
          onClick={(e) => {
            e.stopPropagation()
            onTap()
          }}
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-1/2 focus-visible:top-[40%] focus-visible:z-30 focus-visible:min-h-11 focus-visible:-translate-x-1/2 focus-visible:rounded-full focus-visible:bg-black/70 focus-visible:px-5 focus-visible:text-[3.6cqw] focus-visible:font-semibold focus-visible:text-white"
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      )}

      <AnimatePresence>
        {active && paused && (
          <motion.span
            key="paused"
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 -ml-[9cqw] -mt-[9cqw] flex h-[18cqw] w-[18cqw] items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md"
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease }}
          >
            <PlayIcon className="ml-[1cqw] h-[8cqw] w-[8cqw]" />
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bigHeart > 0 && (
          <motion.span
            key={bigHeart}
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 -ml-[14cqw] -mt-[14cqw] h-[28cqw] w-[28cqw] text-red drop-shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, scale: 0.2, rotate: -14 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1.15, 1, 1.1], rotate: [-14, 6, 0, 0], y: [0, 0, 0, -40] }}
            transition={{ duration: 1, times: [0, 0.25, 0.6, 1], ease: 'easeOut' }}
            onAnimationComplete={() => setBigHeart(0)}
          >
            <HeartIcon filled className="h-full w-full" strokeWidth={0} />
          </motion.span>
        )}
      </AnimatePresence>

      <div className="absolute bottom-[19cqw] right-[2.2cqw] z-20 flex flex-col items-center gap-[3.4cqw] text-white">
        <button
          type="button"
          aria-label={liked ? 'Unlike reel' : 'Like reel'}
          aria-pressed={liked}
          onClick={(e) => {
            e.stopPropagation()
            if (liked) setLiked(false)
            else like()
          }}
          className="relative -m-[2cqw] flex min-h-11 min-w-11 items-center justify-center p-[2cqw]"
        >
          <motion.span
            key={`heart-${burst}`}
            className={liked ? 'text-red' : 'text-white'}
            initial={burst ? { scale: 0.5 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 13 }}
          >
            <HeartIcon filled={liked} className="h-[7.6cqw] w-[7.6cqw] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
          </motion.span>
          {burst > 0 && liked && <Burst key={`burst-${burst}`} />}
        </button>
        <RailIcon>
          <CommentIcon className="h-[7.2cqw] w-[7.2cqw]" />
        </RailIcon>
        <RailIcon>
          <ShareIcon className="h-[7cqw] w-[7cqw]" />
        </RailIcon>
        <RailIcon>
          <MoreIcon className="h-[6cqw] w-[6cqw]" />
        </RailIcon>
        <span
          aria-hidden
          className="reel-disc mt-[1cqw] block h-[7.4cqw] w-[7.4cqw] overflow-hidden rounded-[1.8cqw] border-[0.5cqw] border-white bg-ink"
          style={run}
        >
          <img src={src(reel.poster)} alt="" className="h-full w-full object-cover" draggable={false} />
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-[16cqw] left-[4.4cqw] right-[17cqw] z-20 text-white">
        <div className="flex items-center gap-[2.2cqw]">
          <span className="flex h-[8cqw] w-[8cqw] shrink-0 items-center justify-center rounded-full bg-red text-[3.8cqw] font-bold ring-[0.4cqw] ring-white/90">
            {reel.brand.charAt(0)}
          </span>
          <span className="truncate text-[3.7cqw] font-semibold">{reel.brand}</span>
          <span className="shrink-0 rounded-[2cqw] border-[0.3cqw] border-white/75 px-[2.4cqw] py-[0.7cqw] text-[3.2cqw] font-semibold">
            Follow
          </span>
        </div>
        <p className="mt-[2.4cqw] truncate text-[3.6cqw] leading-snug text-white/95">{reel.caption}</p>
        <div className="mt-[2.2cqw] flex w-[62cqw] items-center gap-[1.6cqw] rounded-full bg-white/15 py-[0.9cqw] pl-[2.2cqw] pr-[1cqw] text-[3.1cqw] backdrop-blur-sm">
          <span aria-hidden>♫</span>
          <span className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_88%,transparent)]">
            <span className="reel-marquee flex w-max whitespace-nowrap" style={run}>
              <span className="pr-[6cqw]">Original audio · {reel.brand}</span>
              <span className="pr-[6cqw]" aria-hidden>
                Original audio · {reel.brand}
              </span>
            </span>
          </span>
        </div>
      </div>

      <TabBar />
    </div>
  )
}

function RailIcon({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden className="flex h-[9cqw] items-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
      {children}
    </span>
  )
}

function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <motion.span
        className="absolute left-1/2 top-1/2 -ml-[6cqw] -mt-[6cqw] h-[12cqw] w-[12cqw] rounded-full border-[0.8cqw] border-red"
        initial={{ scale: 0.3, opacity: 1 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      />
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2 - Math.PI / 2
        return (
          <motion.span
            key={k}
            className="absolute left-1/2 top-1/2 -ml-[0.9cqw] -mt-[0.9cqw] h-[1.8cqw] w-[1.8cqw] rounded-full"
            style={{ backgroundColor: k % 2 ? '#ff7a00' : '#f40816' }}
            initial={{ x: '0%', y: '0%', scale: 1, opacity: 1 }}
            animate={{ x: `${Math.cos(a) * 620}%`, y: `${Math.sin(a) * 620}%`, scale: 0.2, opacity: 0 }}
            transition={{ duration: 0.6, ease }}
          />
        )
      })}
    </span>
  )
}

function TabBar() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-[13cqw] items-start justify-around border-t border-white/10 bg-black px-[4cqw] pt-[2.4cqw] text-white"
    >
      <HomeIcon className="h-[6.2cqw] w-[6.2cqw]" strokeWidth={1.8} />
      <SearchIcon className="h-[6.2cqw] w-[6.2cqw]" strokeWidth={1.8} />
      <PlusSquareIcon className="h-[6.2cqw] w-[6.2cqw]" strokeWidth={1.8} />
      <ReelsIcon className="h-[6.2cqw] w-[6.2cqw]" strokeWidth={2.2} />
      <span className="h-[6.2cqw] w-[6.2cqw] rounded-full bg-gradient-to-br from-red to-[#ff7a00] ring-[0.4cqw] ring-white" />
      <span className="absolute bottom-[1.6cqw] left-1/2 h-[1.3cqw] w-[34cqw] -translate-x-1/2 rounded-full bg-white/90" />
    </div>
  )
}

const KB = [
  { kx0: '0%', ky0: '0%', ks0: 1, kx1: '-1%', ky1: '-1.5%', ks1: 1.06 },
  { kx0: '1%', ky0: '1%', ks0: 1.06, kx1: '0%', ky1: '0%', ks1: 1 },
  { kx0: '-1%', ky0: '1.5%', ks0: 1.01, kx1: '1%', ky1: '-1%', ks1: 1.06 },
  { kx0: '0%', ky0: '-2%', ks0: 1.06, kx1: '0%', ky1: '1.5%', ks1: 1.01 },
]

function FrameLayer({ id, k, still, playing, sizes }: { id: string; k: number; still?: boolean; playing?: boolean; sizes: string }) {
  const item = byId[id]
  if (!item) return null
  const v = KB[k % KB.length]
  const style = {
    '--kx0': v.kx0,
    '--ky0': v.ky0,
    '--ks0': v.ks0,
    '--kx1': v.kx1,
    '--ky1': v.ky1,
    '--ks1': v.ks1,
    animationPlayState: playing ? 'running' : 'paused',
  } as CSSProperties
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: item.color }}>
      <img
        src={src(id)}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full scale-[1.35] object-cover blur-[14px] brightness-[0.42] saturate-[1.3]"
      />
      <div className="absolute inset-0 flex items-center justify-center pb-[6cqw]">
        <div className={still ? 'w-full' : 'reel-kb w-full'} style={still ? undefined : style}>
          <Img item={item} sizes={sizes} className="block h-auto w-full shadow-[0_10px_40px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    </div>
  )
}

const TRANSITIONS = [
  { initial: { opacity: 0, scale: 1.08 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 } },
  { initial: { y: '100%' }, animate: { y: '0%' }, exit: { y: '-28%', opacity: 0.3 } },
  { initial: { x: '100%' }, animate: { x: '0%' }, exit: { x: '-30%', opacity: 0.3 } },
  { initial: { opacity: 0, scale: 0.86 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.12 } },
]

function FramePlayer({ frames, playing, sizes }: { frames: string[]; playing: boolean; sizes: string }) {
  const [i, setI] = useState(0)
  const n = frames.length
  const t = TRANSITIONS[i % TRANSITIONS.length]
  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={t.initial}
          animate={t.animate}
          exit={t.exit}
          transition={{ duration: 0.7, ease }}
        >
          <FrameLayer id={frames[i]} k={i} playing={playing} sizes={sizes} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 z-20 h-[0.7cqw] bg-white/25">
        <div
          key={i}
          className="reel-progress h-full w-full bg-white"
          style={{ '--from': i / n, '--to': (i + 1) / n, animationPlayState: playing ? 'running' : 'paused' } as CSSProperties}
          onAnimationEnd={() => setI((x) => (x + 1) % n)}
        />
      </div>
    </>
  )
}

function VideoPlayer({ reel, playing }: { reel: Reel; playing: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing])
  return (
    <>
      <video
        ref={ref}
        src={reel.video}
        poster={src(reel.poster, 'l')}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          if (bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`
        }}
      />
      <div className="absolute inset-x-0 bottom-0 z-20 h-[0.7cqw] bg-white/25">
        <div ref={bar} className="h-full w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-linear" />
      </div>
    </>
  )
}
