export type FeedTile = {
  id: string
  category: string
  color: string
  small: boolean
  carousel: boolean
  url: string
}

export type FeedSceneOptions = {
  host: HTMLElement
  tiles: FeedTile[]
  onOpen: (tile: number) => void
  onFirstDrag: () => void
  onLost: () => void
}

export type FeedScene = {
  setFilter: (category: string | null) => void
  setPaused: (paused: boolean) => void
  dispose: () => void
}
