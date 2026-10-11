import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import { initLenis } from './lib/lenis'
import { ui, useUI } from './lib/ui'
import Preloader from './sections/Preloader'
import Nav from './sections/Nav'
import Hero from './sections/Hero'
import Proof from './sections/Proof'
import Cursor from './components/Cursor'
import Hearts from './components/Hearts'
import FloatingWhatsApp from './components/FloatingWhatsApp'

const FeedWall = lazy(() => import('./sections/FeedWall'))
const Reels = lazy(() => import('./sections/Reels'))
const Profile = lazy(() => import('./sections/Profile'))
const Print = lazy(() => import('./sections/Print'))
const Services = lazy(() => import('./sections/Services'))
const Process = lazy(() => import('./sections/Process'))
const Contact = lazy(() => import('./sections/Contact'))
const Lightbox = lazy(() => import('./components/Lightbox'))
const StoryViewer = lazy(() => import('./components/StoryViewer'))

const SECTIONS: [string, ComponentType][] = [
  ['hero', Hero],
  ['proof', Proof],
  ['feed', FeedWall],
  ['reels', Reels],
  ['profile', Profile],
  ['print', Print],
  ['services', Services],
  ['process', Process],
  ['contact', Contact],
]

const params = new URLSearchParams(window.location.search)
const only = params.get('only')?.split(',')

function seenPreloader() {
  try {
    return sessionStorage.getItem('pv-seen') === '1'
  } catch {
    return false
  }
}

const showPreloader = only ? only.includes('preloader') : !params.has('nopre') && !seenPreloader()

export default function App() {
  const { lightbox, story } = useUI()
  const [lbMounted, setLbMounted] = useState(false)
  const [storyMounted, setStoryMounted] = useState(false)

  useEffect(() => {
    initLenis()
    if (!showPreloader) ui.setReady()
  }, [])
  useEffect(() => {
    if (lightbox) setLbMounted(true)
  }, [lightbox])
  useEffect(() => {
    if (story) setStoryMounted(true)
  }, [story])

  const sections = only ? SECTIONS.filter(([id]) => only.includes(id)) : SECTIONS
  const chrome = !only || only.includes('chrome')

  return (
    <>
      {showPreloader && <Preloader />}
      {chrome && <Nav />}
      <main>
        {sections.map(([id, Section]) => (
          <Suspense key={id} fallback={<div className="min-h-screen" />}>
            <Section />
          </Suspense>
        ))}
      </main>
      {chrome && <FloatingWhatsApp />}
      <Hearts />
      <Cursor />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
        <div className="grain" />
      </div>
      <Suspense>
        {lbMounted && <Lightbox />}
        {storyMounted && <StoryViewer />}
      </Suspense>
    </>
  )
}
