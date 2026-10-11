import { Fragment, createRef, useMemo } from 'react'
import { SectionHead } from '../components/SectionHead'
import { services } from '../data/site'
import { useMediaQuery } from '../lib/hooks'
import { ServiceCard } from './services/ServiceCard'

export default function Services() {
  const wide = useMediaQuery('(min-width: 768px)')
  const refs = useMemo(() => services.map(() => createRef<HTMLDivElement>()), [])
  const base = wide ? 96 : 76
  const step = wide ? 14 : 10
  const topOf = (i: number) => base + i * step
  return (
    <section id="services" className="relative overflow-x-clip bg-ink pt-28 sm:pt-36">
      <div className="px-5 sm:px-8 lg:px-12">
        <SectionHead index="05" label="Services" top="What I" bottom="Do" aside={['Design.', 'Create.', 'Inspire.']} />
      </div>
      <div className="relative mt-12 px-3 pb-[14vh] sm:px-6 md:mt-20 lg:px-10">
        {services.map((s, i) => (
          <Fragment key={s.id}>
            <div ref={refs[i]} aria-hidden className="h-0" />
            <ServiceCard
              service={s}
              index={i}
              total={services.length}
              top={topOf(i)}
              nextTop={topOf(i + 1)}
              own={refs[i]}
              next={refs[i + 1] ?? null}
            />
            {i < services.length - 1 && <div aria-hidden className="h-[22vh] md:h-[30vh]" />}
          </Fragment>
        ))}
      </div>
    </section>
  )
}
