import { useEffect, useMemo, useRef, useState } from 'react'
import { site } from '../../data/site'

export function Clock({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [now, setNow] = useState(() => new Date())
  const [paused, setPaused] = useState(false)
  const fmt = useMemo(
    () => new Intl.DateTimeFormat('en-US', { timeZone: site.timezone, hour: '2-digit', minute: '2-digit', hour12: true }),
    []
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let id: number | undefined
    let inView = false
    const tick = () => setNow(new Date())
    const stop = () => {
      if (id !== undefined) window.clearInterval(id)
      id = undefined
    }
    const sync = () => {
      const run = inView && !document.hidden
      setPaused(!run)
      if (run && id === undefined) {
        tick()
        id = window.setInterval(tick, 1000)
      } else if (!run) stop()
    }
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      sync()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', sync)
    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  const parts = fmt.formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return (
    <span ref={ref} className={paused ? `pv-paused ${className ?? ''}` : className}>
      <time dateTime={now.toISOString()} className="tabular-nums">
        {get('hour')}
        <span className="pv-blink">:</span>
        {get('minute')}
      </time>
      <span className="ml-2 font-sans text-[max(11px,0.2em)] font-semibold uppercase tracking-[0.18em] opacity-60">{get('dayPeriod')} IST</span>
    </span>
  )
}
