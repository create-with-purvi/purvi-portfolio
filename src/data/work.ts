import raw from './work.json'

export type Category =
  | 'cranes'
  | 'edtech'
  | 'coaching'
  | 'festive'
  | 'interiors'
  | 'sports'
  | 'dental'
  | 'food'
  | 'surface'
  | 'print'
export type Kind = 'post' | 'flyer' | 'billboard' | 'card' | 'letterhead'

export type WorkItem = {
  id: string
  title: string
  brand: string
  category: Category
  kind: Kind
  w: number
  h: number
  color: string
  lowres: boolean
  carousel?: string
}

export const work = raw as WorkItem[]
export const posts = work.filter((w) => w.kind === 'post')
export const printWork = work.filter((w) => w.kind !== 'post')
export const byId: Record<string, WorkItem> = Object.fromEntries(work.map((w) => [w.id, w]))
export const brands = [...new Set(work.map((w) => w.brand))]

export const src = (id: string, size: 's' | 'l' = 's') =>
  `${import.meta.env.BASE_URL}work/${id}${size === 's' ? '-s' : ''}.webp`

export const portrait = {
  l: `${import.meta.env.BASE_URL}work/purvi.webp`,
  s: `${import.meta.env.BASE_URL}work/purvi-s.webp`,
  w: 736,
  h: 1500,
}

export const categories: { id: Category; label: string; short: string; emoji: string; cover: string }[] = [
  { id: 'cranes', label: 'Cranes & Construction', short: 'Cranes', emoji: '🏗️', cover: 'lifting-india' },
  { id: 'edtech', label: 'EdTech', short: 'upGrad', emoji: '🎓', cover: 'why-upgrad' },
  { id: 'festive', label: 'Festive Campaigns', short: 'Festive', emoji: '🪔', cover: 'vaswani-navratri' },
  { id: 'interiors', label: 'Interiors', short: 'Interiors', emoji: '🛋️', cover: 'same-space' },
  { id: 'sports', label: 'Cricket Academy', short: 'Cricket', emoji: '🏏', cover: 'summer-camp' },
  { id: 'coaching', label: 'Coaching', short: 'Coaching', emoji: '📚', cover: 'her-future' },
  { id: 'dental', label: 'Dental Care', short: 'Dental', emoji: '🦷', cover: 'missing-tooth-1' },
  { id: 'food', label: 'Food & Sweets', short: 'Food', emoji: '🍯', cover: 'jalebi' },
  { id: 'surface', label: 'Home Solutions', short: 'Home', emoji: '🏠', cover: 'modular-kitchen' },
  { id: 'print', label: 'Print & Outdoor', short: 'Print', emoji: '🪧', cover: 'billboard-holi' },
]

export const inCategory = (c: Category) => work.filter((w) => w.category === c && !w.lowres)
