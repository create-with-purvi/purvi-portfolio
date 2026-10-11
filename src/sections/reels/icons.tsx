import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = (p: P): P => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...p,
})

export const HeartPath = 'M12 20.6s-7.6-4.55-9.35-9.3C1.4 7.86 3.5 4.4 7 4.4c2.04 0 3.6 1.08 5 2.9 1.4-1.82 2.96-2.9 5-2.9 3.5 0 5.6 3.46 4.35 6.9C19.6 16.05 12 20.6 12 20.6Z'

export function HeartIcon({ filled, ...p }: P & { filled?: boolean }) {
  return (
    <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}>
      <path d={HeartPath} />
    </svg>
  )
}

export function CommentIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M20.66 16.85A9.6 9.6 0 1 0 17 20.5l4.2 1.1Z" />
    </svg>
  )
}

export function ShareIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M21.5 2.6 10.3 13.4M21.5 2.6 14.6 21.2l-4.3-7.8-7.9-4.2Z" />
    </svg>
  )
}

export function MoreIcon(p: P) {
  return (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}

export function MoreHIcon(p: P) {
  return (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  )
}

export function CameraIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.6-2.2h6.4L16.8 6h1.7A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" />
      <circle cx="12" cy="12.8" r="3.6" />
    </svg>
  )
}

export function ChevronDown(p: P) {
  return (
    <svg {...base(p)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function PlayIcon(p: P) {
  return (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <path d="M7 4.8v14.4a1 1 0 0 0 1.52.85l11.5-7.2a1 1 0 0 0 0-1.7L8.52 3.95A1 1 0 0 0 7 4.8Z" />
    </svg>
  )
}

export function PauseIcon(p: P) {
  return (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
    </svg>
  )
}

export function GridIcon(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  )
}

export function ReelsIcon(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M3 8.5h18M8.5 3l3 5.5M14.5 3l3 5.5" />
      <path d="M10.2 12.2v5.2l4.4-2.6Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function HomeIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3.5 10.2 12 3.5l8.5 6.7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1Z" />
    </svg>
  )
}

export function SearchIcon(p: P) {
  return (
    <svg {...base(p)}>
      <circle cx="10.8" cy="10.8" r="7" />
      <path d="m16 16 5 5" />
    </svg>
  )
}

export function PlusSquareIcon(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

export function MenuIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M3.5 6h17M3.5 12h17M3.5 18h17" />
    </svg>
  )
}

export function CloseIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  )
}

export function PinIcon(p: P) {
  return (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <path d="M15.6 2.6a1 1 0 0 0-1.6.3l-1.3 2.8-4.6 3.1-3.4-.2a1 1 0 0 0-.8 1.7l3.6 3.6-4.6 5.9 5.9-4.6 3.6 3.6a1 1 0 0 0 1.7-.8l-.2-3.4 3.1-4.6 2.8-1.3a1 1 0 0 0 .3-1.6Z" />
    </svg>
  )
}

export function SpeakerOnIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M4 9.5h3.2L12 5.2v13.6l-4.8-4.3H4Z" fill="currentColor" stroke="none" />
      <path d="M15.6 8.8a4.6 4.6 0 0 1 0 6.4M18.4 6a8.4 8.4 0 0 1 0 12" />
    </svg>
  )
}

export function SpeakerOffIcon(p: P) {
  return (
    <svg {...base(p)}>
      <path d="M4 9.5h3.2L12 5.2v13.6l-4.8-4.3H4Z" fill="currentColor" stroke="none" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </svg>
  )
}

export function ChevronLeft(p: P) {
  return (
    <svg {...base(p)}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  )
}

export function ChevronRight(p: P) {
  return (
    <svg {...base(p)}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
}

export function CarouselIcon(p: P) {
  return (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <path d="M7 3h11a3 3 0 0 1 3 3v11a1 1 0 0 1-1 1h-1V7a2 2 0 0 0-2-2H6V4a1 1 0 0 1 1-1Z" />
      <rect x="3" y="7" width="13" height="14" rx="2.5" />
    </svg>
  )
}
