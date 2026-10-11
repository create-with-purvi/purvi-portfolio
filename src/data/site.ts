export const site = {
  name: 'Purvi Agarwal',
  first: 'Purvi',
  last: 'Agarwal',
  role: 'Social Media Manager',
  roles: ['Social Media Manager', 'Reels Creator', 'Content Designer'],
  city: 'Raipur',
  region: 'Chhattisgarh, India',
  serviceArea: ['Raipur', 'Bhilai', 'Durg'],
  timezone: 'Asia/Kolkata',
  instagram: { handle: 'purvi.creates', url: 'https://www.instagram.com/purvi.creates/' },
  email: 'hello@purviagarwal.in',
  whatsapp: '919999999999',
  phoneDisplay: '+91 99999 99999',
  waText: "Hi Purvi! I saw your portfolio and I'd love to talk about my brand's social media.",
  available: true,
}

export const waLink = (text: string = site.waText) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`

export const mailLink = (subject = 'New project') =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}`

export const stats = [
  { value: 15, suffix: '', label: 'Brands' },
  { value: 12, suffix: '', label: 'Industries' },
  { value: 90, suffix: '+', label: 'Designs' },
  { value: 12, suffix: '', label: 'Reels', note: 'AI edits included' },
]

export const services = [
  { id: 'smm', title: 'Social Media Management', tags: ['Strategy', 'Calendar', 'Posting'], cover: 'heavy-moves' },
  { id: 'reels', title: 'Reels', tags: ['Shoot', 'Edit', 'Trends'], cover: 'summer-camp' },
  { id: 'creatives', title: 'Post & Ad Creatives', tags: ['Static', 'Carousel', 'Ads'], cover: 'why-upgrad' },
  { id: 'festive', title: 'Festival Campaigns', tags: ['Every festival', 'On-brand', 'On time'], cover: 'ganesh-chaturthi' },
  { id: 'brand', title: 'Brand & Print', tags: ['Cards', 'Letterheads', 'Billboards'], cover: 'cards-msj' },
]

export const process = [
  { id: 'brief', title: 'Brief', line: 'Your brand, goals, audience.' },
  { id: 'plan', title: 'Plan', line: 'Content calendar + festival map.' },
  { id: 'create', title: 'Create', line: 'Shoot reels. Design posts.' },
  { id: 'grow', title: 'Post & Grow', line: 'Publish, track, improve.' },
]

export const clients = [
  { name: 'ASP Cranes', instagram: '' },
  { name: 'upGrad', instagram: '' },
  { name: 'TICA Cricket Academy', instagram: '' },
  { name: 'MathScienceyJr', instagram: '' },
  { name: "Interior's World", instagram: '' },
  { name: 'DB Sons', instagram: '' },
  { name: 'Tulsi Provision Store', instagram: '' },
  { name: 'Vaswani Group', instagram: '' },
  { name: 'Rajat Group', instagram: '' },
  { name: 'Pristine Dental', instagram: '' },
  { name: 'Blue Door Interiors', instagram: '' },
  { name: 'GS Traders', instagram: '' },
  { name: 'Bansod Realtor', instagram: '' },
  { name: 'Nut Khut Sweets', instagram: '' },
  { name: 'Agrawal Surface Solution', instagram: '' },
]

export type Reel = {
  id: string
  brand: string
  caption: string
  video?: string
  poster: string
  frames: string[]
}

export const reels: Reel[] = [
  { id: 'r1', brand: 'ASP Cranes', caption: 'We lift you up 🏗️', poster: 'build-higher', frames: ['build-higher', 'impossible', 'steady-safe', 'guess-who-am-i'] },
  { id: 'r2', brand: 'TICA Cricket Academy', caption: 'Summer camp is ON 🏏', poster: 'summer-camp', frames: ['summer-camp', 'har-khiladi', 'sapno-ko-hakikat', 'cricket-star'] },
  { id: 'r3', brand: "Interior's World", caption: 'Walls that talk ✨', poster: 'uv-marble-walls', frames: ['uv-marble-walls', 'interiors-reflect', 'charcoal-panel', 'uv-marble-sheets'] },
  { id: 'r4', brand: 'upGrad', caption: 'Your next chapter 🎓', poster: 'admission-open', frames: ['admission-open', 'focus-learning', 'still-thinking', 'better-tomorrow'] },
  { id: 'r5', brand: 'DB Sons', caption: 'Festive, but make it dry fruits 🪔', poster: 'ganesh-chaturthi', frames: ['ganesh-chaturthi', 'guru-purnima', 'raksha-bandhan-db', 'gandhi-jayanti-db'] },
]

const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`

export type RealReel = {
  id: string
  brand: string
  caption: string
  tag: 'AI edit' | 'Reel' | 'Motion'
  video: string
  full?: string
  poster: string
  aspect: '9:16' | '4:5'
}

const reel = (id: string, brand: string, caption: string, tag: RealReel['tag'], aspect: RealReel['aspect'] = '9:16'): RealReel => ({
  id,
  brand,
  caption,
  tag,
  aspect,
  video: media(`${id}-p.mp4`),
  full: tag === 'Motion' ? undefined : media(`${id}.mp4`),
  poster: media(`${id}.jpg`),
})

export const realReels: RealReel[] = [
  reel('asp-why-choose', 'ASP Cranes', 'Delay afford nahi? Choose ASP 🏗️', 'AI edit'),
  reel('bluedoor-elem', 'Blue Door Interiors', 'Inside ELEM with Blue Door ✨', 'Reel'),
  reel('upgrad-ai-truck', 'upGrad', 'Admissions open — delivered 🚚', 'AI edit'),
  reel('gs-wpc', 'GS Traders', 'PVC + WPC + 7D, one wall 🧱', 'Reel'),
  reel('bansod-rama', 'Bansod Realtor', '1280 sq.ft. of possibility 🏢', 'Reel'),
  reel('pristine-ai', 'Pristine Dental', 'A dental story, made with AI 🦷', 'AI edit'),
  reel('upgrad-digital', 'upGrad', 'Digital marketing, decoded 📈', 'Reel'),
  reel('asp-cherry-picker', 'ASP Cranes', 'Why are man lifts called cherry pickers? 🍒', 'AI edit'),
  reel('gs-uv-sheet', 'GS Traders', 'Light wali sheet? UV sheet ✨', 'Reel'),
  reel('bansod-hanumanta', 'Bansod Realtor', 'Space. Convenience. Business. 🏙️', 'Reel'),
  reel('gs-panels', 'GS Traders', 'Ready stock, ready walls 🪵', 'Reel'),
  reel('nutkhut-gulab-jamun', 'Nut Khut Sweets', 'Gulab jamun, in motion 🍯', 'Motion', '4:5'),
]
