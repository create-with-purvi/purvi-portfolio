import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

export const useIsTouch = () => useMediaQuery('(pointer: coarse)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

export const ease = [0.16, 1, 0.3, 1] as const
export const easeQuart = [0.76, 0, 0.24, 1] as const
