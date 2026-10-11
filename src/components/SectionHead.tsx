import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn, ease } from '../lib/hooks'
import { Mask } from './Mask'

type Props = {
  index: string
  label: string
  top: ReactNode
  bottom: ReactNode
  aside?: string[]
  className?: string
  size?: 'lg' | 'xl'
}

export function SectionHead({ index, label, top, bottom, aside, className, size = 'lg' }: Props) {
  return (
    <header className={cn('relative flex items-end justify-between gap-6', className)}>
      <div>
        <motion.p
          className="kicker mb-5 flex items-center gap-3 text-paper/60"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <span className="text-red">{index}</span>
          <span className="h-px w-8 bg-paper/30" />
          {label}
        </motion.p>
        <h2
          className={cn(
            'display',
            size === 'xl' ? 'text-[clamp(4rem,15vw,15rem)]' : 'text-[clamp(3.25rem,10.5vw,10rem)]'
          )}
        >
          <Mask>{top}</Mask>
          <Mask delay={0.08} className="text-red">
            {bottom}
          </Mask>
        </h2>
      </div>
      {aside && (
        <motion.div
          className="hidden shrink-0 pb-3 text-right sm:block"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
        >
          {aside.map((line) => (
            <p key={line} className="text-[13px] font-semibold uppercase leading-[1.55] tracking-[0.2em] text-paper/85">
              {line}
            </p>
          ))}
          <motion.span
            className="ml-auto mt-3 block h-[5px] w-16 origin-right bg-red"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
          />
        </motion.div>
      )}
    </header>
  )
}
