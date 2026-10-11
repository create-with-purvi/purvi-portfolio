import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn, ease } from '../lib/hooks'

type Props = {
  children: ReactNode
  delay?: number
  className?: string
  once?: boolean
  as?: 'span' | 'div'
}

export function Mask({ children, delay = 0, className, once = true, as = 'span' }: Props) {
  const reduce = useReducedMotion()
  const Inner = as === 'div' ? motion.div : motion.span
  const Outer = as
  return (
    <Outer className={cn('block overflow-hidden pb-[0.06em] -mb-[0.06em]', className)}>
      <Inner
        className="block will-change-transform"
        initial={reduce ? { opacity: 0 } : { y: '110%', rotate: 2 }}
        whileInView={reduce ? { opacity: 1 } : { y: '0%', rotate: 0 }}
        viewport={{ once, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.1, ease, delay }}
      >
        {children}
      </Inner>
    </Outer>
  )
}
