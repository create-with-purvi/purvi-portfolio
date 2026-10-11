import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { src, type WorkItem } from '../data/work'
import { cn } from '../lib/hooks'

type Props = {
  item: WorkItem
  size?: 's' | 'l'
  eager?: boolean
  className?: string
  sizes?: string
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'>

export function Img({ item, size, eager, className, sizes = '(max-width: 640px) 70vw, 30vw', style, ...rest }: Props) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true)
  }, [])
  const srcSet = size ? undefined : `${src(item.id, 's')} 480w, ${src(item.id, 'l')} ${item.w}w`
  return (
    <img
      ref={ref}
      src={src(item.id, size ?? 's')}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={item.w}
      height={item.h}
      alt={`${item.title} — ${item.brand}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      style={{ backgroundColor: item.color, ...style }}
      className={cn('transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0', className)}
      {...rest}
    />
  )
}
