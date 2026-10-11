import { printWork, type Kind, type WorkItem } from '../../data/work'

export type PrintGroup = { kind: Kind; word: string; label: string; items: WorkItem[] }

const ORDER: { kind: Kind; word: string; label: string }[] = [
  { kind: 'billboard', word: 'Billboards', label: 'Billboard' },
  { kind: 'flyer', word: 'Flyers', label: 'Flyer' },
  { kind: 'card', word: 'Cards', label: 'Business card' },
  { kind: 'letterhead', word: 'Letterheads', label: 'Letterhead' },
]

export const groups: PrintGroup[] = ORDER.map((g) => ({ ...g, items: printWork.filter((w) => w.kind === g.kind) })).filter(
  (g) => g.items.length > 0
)

export const ordered = groups.flatMap((g) => g.items)
export const orderedIds = ordered.map((w) => w.id)
export const indexOf = (id: string) => orderedIds.indexOf(id)

export const kindLabel = (item: WorkItem) => (item.id.startsWith('busstop') ? 'Bus shelter' : ORDER.find((g) => g.kind === item.kind)?.label ?? item.kind)

export const aspect = (item: WorkItem) => item.w / item.h

export const pad2 = (n: number) => String(n).padStart(2, '0')
