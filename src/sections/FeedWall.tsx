import { useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SectionHead } from '../components/SectionHead'
import { categories, posts, src } from '../data/work'
import { ui, useUI } from '../lib/ui'
import { DragHint } from './feed/DragHint'
import { FeedFilters, PostCount, type FilterOption } from './feed/FeedFilters'
import { FeedGrid } from './feed/FeedGrid'
import { spreadOrder } from './feed/order'
import type { FeedScene, FeedTile } from './feed/types'

const wall = spreadOrder(posts)
const tiles: FeedTile[] = wall.map((p) => ({
  id: p.id,
  category: p.category,
  color: p.color,
  small: p.lowres,
  url: src(p.id, 's'),
}))

const options: FilterOption[] = [
  { id: 'all', label: 'All', count: posts.length },
  ...categories
    .filter((c) => c.id !== 'print')
    .map((c) => ({ id: c.id, label: c.short, count: posts.filter((p) => p.category === c.id).length })),
]

const inFilter = (filter: string) => (filter === 'all' ? posts : posts.filter((p) => p.category === filter))

function openPost(filter: string, id: string) {
  const list = inFilter(filter)
  const pool = list.some((p) => p.id === id) ? list : posts
  const ids = pool.map((p) => p.id)
  ui.openLightbox(ids, Math.max(0, ids.indexOf(id)))
}

function hasWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

export default function FeedWall() {
  const reduce = useReducedMotion()
  const [glOk, setGlOk] = useState(hasWebGL)
  const gl = glOk && !reduce
  const [filter, setFilter] = useState('all')
  const [dragged, setDragged] = useState(false)
  const [near, setNear] = useState(false)
  const wallRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<FeedScene | null>(null)
  const filterRef = useRef(filter)
  const { lightbox } = useUI()
  const visible = useMemo(() => inFilter(filter), [filter])

  useEffect(() => {
    filterRef.current = filter
    sceneRef.current?.setFilter(filter === 'all' ? null : filter)
  }, [filter])

  useEffect(() => {
    sceneRef.current?.setPaused(!!lightbox)
  }, [lightbox])

  useEffect(() => {
    const el = wallRef.current
    if (!gl || !el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        io.disconnect()
      },
      { rootMargin: '100% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [gl])

  useEffect(() => {
    const host = hostRef.current
    if (!gl || !near || !host) return
    let cancelled = false
    let scene: FeedScene | null = null
    import('./feed/scene')
      .then(({ createFeedScene }) => {
        if (cancelled) return
        try {
          scene = createFeedScene({
            host,
            tiles,
            onOpen: (i) => openPost(filterRef.current, tiles[i].id),
            onFirstDrag: () => setDragged(true),
            onLost: () => setGlOk(false),
          })
        } catch {
          setGlOk(false)
          return
        }
        sceneRef.current = scene
        if (filterRef.current !== 'all') scene.setFilter(filterRef.current)
        scene.setPaused(!!ui.get().lightbox)
      })
      .catch(() => setGlOk(false))
    return () => {
      cancelled = true
      scene?.dispose()
      if (sceneRef.current === scene) sceneRef.current = null
    }
  }, [gl, near])

  return (
    <section id="feed" aria-label="The Feed" className="relative overflow-x-clip bg-ink">
      <div className="px-5 pt-24 md:px-10 md:pt-32 lg:pt-40">
        <SectionHead index="01" label="The Feed" top="THE" bottom="FEED" aside={['VISUALS', 'THAT TELL', 'STORIES.']} />
      </div>

      {gl ? (
        <div
          ref={wallRef}
          data-cursor="DRAG"
          data-no-hearts
          className="relative mt-6 h-[80svh] w-full select-none overflow-hidden md:mt-10 lg:h-screen"
        >
          <div ref={hostRef} className="absolute inset-0" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-ink to-transparent md:h-40" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-linear-to-t from-ink via-ink/75 to-transparent md:h-64"
          />
          <DragHint show={!dragged && filter === 'all'} />
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 pb-6 md:flex-row md:items-center md:gap-8 md:px-10 md:pb-10">
            <PostCount count={visible.length} className="shrink-0 px-5 md:order-2 md:px-0" />
            <FeedFilters
              options={options}
              value={filter}
              onChange={setFilter}
              className="min-w-0 px-5 after:w-1 after:shrink-0 after:content-[''] md:px-0"
            />
          </div>
          <button
            type="button"
            onClick={() => openPost(filter, visible[0].id)}
            className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-5 focus:z-20 focus:rounded-full focus:bg-red focus:px-5 focus:py-3 focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.2em] focus:text-white"
          >
            Open posts in viewer
          </button>
        </div>
      ) : (
        <div className="mt-8 pb-10 md:mt-12">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-8 md:px-10">
            <PostCount count={visible.length} className="shrink-0 px-5 md:order-2 md:px-0" />
            <FeedFilters
              options={options}
              value={filter}
              onChange={setFilter}
              className="min-w-0 px-5 after:w-1 after:shrink-0 after:content-[''] md:px-0"
            />
          </div>
          <FeedGrid items={visible} onOpen={(id) => openPost(filter, id)} />
        </div>
      )}
    </section>
  )
}
