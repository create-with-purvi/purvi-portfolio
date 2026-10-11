export function CarouselGlyph({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="1.5" y="4.5" width="10" height="10" rx="2" />
      <path d="M5 2.2h7.3a1.5 1.5 0 0 1 1.5 1.5V11" strokeLinecap="round" />
    </svg>
  )
}
