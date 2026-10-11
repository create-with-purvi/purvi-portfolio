import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import type { RealReel } from '../../data/site'
import { cn, ease } from '../../lib/hooks'
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
  SpeakerOffIcon,
  SpeakerOnIcon,
} from './icons'

type Props = {
  reel: RealReel
  active: boolean
  near?: boolean
  playing: boolean
  paused: boolean
  sound: boolean
  onTap: () => void
  onSound: (on: boolean) => void
}

const playSafe = (v: HTMLVideoElement, onBlocked?: () => void) => {
  const p = v.play()
  if (p) {
    p.catch((err: unknown) => {
      if (onBlocked && err instanceof DOMException && err.name === 'NotAllowedError') onBlocked()
    })
  }
}

export function ReelScreen({ reel, active, near = true, playing, paused, sound, onTap, onSound }: Props) {
  const [liked, setLiked] = useState(false)
  const [burst, setBurst] = useState(0)
  const [bigHeart, setBigHeart] = useState(0)
  const [loading, setLoading] = useState(false)
  const lastTap = useRef(0)
  const tapTimer = useRef<number | undefined>(undefined)
  const videoRef = useRef<HTMLVideoElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const onSoundRef = useRef(onSound)
  onSoundRef.current = onSound

  const wide = reel.aspect === '4:5'
  const soundOn = sound && !!reel.full
  const want = soundOn && reel.full ? reel.full : reel.video

  useEffect(() => () => window.clearTimeout(tapTimer.current), [])

  useEffect(() => {
    const v = videoRef.current
    if (!active || !v) return
    if (v.getAttribute('src') !== want) {
      v.setAttribute('src', want)
      setLoading(soundOn)
    }
    v.muted = !soundOn
    if (playing) playSafe(v, soundOn ? () => onSoundRef.current(false) : undefined)
    else v.pause()
  }, [active, want, soundOn, playing])

  useEffect(() => {
    if (!active) return
    const v = videoRef.current
    const bar = barRef.current
    return () => {
      if (bar) bar.style.transform = ''
      if (!v) return
      v.pause()
      v.removeAttribute('src')
      v.load()
    }
  }, [active])

  useEffect(() => {
    if (!active || !playing) return
    let raf = 0
    const tick = () => {
      const v = videoRef.current
      const b = barRef.current
      if (v && b && v.duration) b.style.transform = `scaleX(${v.currentTime / v.duration})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, playing])

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

  const toggleSound = (e: MouseEvent) => {
    e.stopPropagation()
    if (!reel.full) return
    const next = !soundOn
    const v = videoRef.current
    if (v) {
      v.setAttribute('src', next ? reel.full : reel.video)
      v.muted = !next
      setLoading(next)
      playSafe(v, next ? () => onSoundRef.current(false) : undefined)
    }
    onSound(next)
  }

  const run: CSSProperties = { animationPlayState: playing ? 'running' : 'paused' }
  const mediaBox = wide ? 'absolute inset-x-0 top-[46%] aspect-[4/5] w-full -translate-y-1/2' : 'absolute inset-0 h-full w-full'

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" onClick={handleTap}>
      <div className="absolute inset-x-0 bottom-[13cqw] top-0 overflow-hidden bg-ink">
        {near && wide && (
          <img
            src={reel.poster}
            alt=""
            aria-hidden
            draggable={false}
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.35] object-cover blur-[16px] brightness-[0.45] saturate-[1.3]"
          />
        )}
        {near && (
          <img
            src={reel.poster}
            alt={`${reel.brand}: ${reel.caption}`}
            draggable={false}
            loading={active ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(mediaBox, 'object-cover', wide && 'shadow-[0_10px_40px_rgba(0,0,0,0.5)]')}
          />
        )}
        {active && (
          <video
            ref={videoRef}
            poster={reel.poster}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            disablePictureInPicture
            onCanPlay={() => setLoading(false)}
            onPlaying={() => setLoading(false)}
            className={cn(mediaBox, 'object-cover')}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 z-20 h-[0.7cqw] bg-white/25">
          <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-white" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[34cqw] bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[13cqw] z-10 h-[80cqw] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-[13.5cqw] z-20 flex items-center justify-between px-[5cqw] text-white">
        <span className="flex items-center gap-[1cqw] text-[6.2cqw] font-bold tracking-tight">
          Reels
          <ChevronDown className="h-[4.4cqw] w-[4.4cqw]" strokeWidth={2.6} />
        </span>
        <CameraIcon className="h-[7cqw] w-[7cqw]" strokeWidth={1.8} />
      </div>

      <div className="pointer-events-none absolute left-[5cqw] top-[24cqw] z-20 flex items-center gap-[1.6cqw]">
        <span className="flex items-center gap-[1.4cqw] rounded-[1.4cqw] bg-black/45 px-[2cqw] py-[0.9cqw] text-[2.9cqw] font-bold tracking-[0.14em] text-white backdrop-blur-sm">
          <span className="reel-rec h-[1.9cqw] w-[1.9cqw] rounded-full bg-red shadow-[0_0_6px_#f40816]" style={run} />
          REC
        </span>
        <TagPill tag={reel.tag} run={run} />
      </div>

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

      <div className="absolute bottom-[29cqw] right-[2.2cqw] z-20 flex flex-col items-center gap-[3.4cqw] text-white">
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
          {near && <img src={reel.poster} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />}
        </span>
      </div>

      {active && reel.full && (
        <button
          type="button"
          aria-label={soundOn ? `Mute ${reel.brand} reel` : `Play ${reel.brand} reel with sound`}
          aria-pressed={soundOn}
          data-reel-sound
          onClick={toggleSound}
          className="group absolute bottom-[14.5cqw] right-[1.4cqw] z-30 flex min-h-11 min-w-11 items-center justify-center p-[1.6cqw]"
        >
          <span
            className={cn(
              'relative flex h-[8.6cqw] w-[8.6cqw] items-center justify-center rounded-full backdrop-blur-md transition-colors duration-300',
              soundOn ? 'bg-white text-black' : 'bg-black/55 text-white group-hover:bg-black/75'
            )}
          >
            {soundOn ? <SpeakerOnIcon className="h-[4.6cqw] w-[4.6cqw]" /> : <SpeakerOffIcon className="h-[4.6cqw] w-[4.6cqw]" />}
            {loading && soundOn && (
              <svg aria-hidden viewBox="0 0 40 40" className="absolute -inset-[1cqw] animate-spin text-red">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="34 120" />
              </svg>
            )}
          </span>
        </button>
      )}

      <div className="pointer-events-none absolute bottom-[16cqw] left-[4.4cqw] right-[15cqw] z-20 text-white">
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
        <div className="mt-[2.2cqw] flex w-[60cqw] items-center gap-[1.6cqw] rounded-full bg-white/15 py-[0.9cqw] pl-[2.2cqw] pr-[1cqw] text-[3.1cqw] backdrop-blur-sm">
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

function TagPill({ tag, run }: { tag: RealReel['tag']; run: CSSProperties }) {
  if (tag === 'AI edit') {
    return (
      <span className="relative flex items-center gap-[1cqw] overflow-hidden rounded-[1.4cqw] bg-red px-[2.2cqw] py-[0.9cqw] text-[2.9cqw] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_14px_rgba(244,8,22,0.65)]">
        <span className="reel-spark" style={run}>
          ✦
        </span>
        AI edit
        <span aria-hidden className="reel-shine pointer-events-none absolute inset-0" style={run} />
      </span>
    )
  }
  return (
    <span className="rounded-[1.4cqw] border-[0.25cqw] border-white/25 bg-white/15 px-[2.2cqw] py-[0.7cqw] text-[2.9cqw] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-md">
      {tag}
    </span>
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
