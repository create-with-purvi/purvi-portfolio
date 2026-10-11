import { useSyncExternalStore } from 'react'

type State = {
  ready: boolean
  lightbox: { ids: string[]; index: number } | null
  story: { group: string } | null
}

let state: State = { ready: false, lightbox: null, story: null }
const subs = new Set<() => void>()

const set = (patch: Partial<State>) => {
  state = { ...state, ...patch }
  subs.forEach((f) => f())
}

export const ui = {
  get: () => state,
  subscribe: (f: () => void) => {
    subs.add(f)
    return () => {
      subs.delete(f)
    }
  },
  setReady: () => set({ ready: true }),
  openLightbox: (ids: string[], index = 0) => set({ lightbox: { ids, index } }),
  closeLightbox: () => set({ lightbox: null }),
  openStory: (group: string) => set({ story: { group } }),
  closeStory: () => set({ story: null }),
}

export const useUI = () => useSyncExternalStore(ui.subscribe, ui.get)
