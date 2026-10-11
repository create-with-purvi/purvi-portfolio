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
  instagram: {
    handle: 'create.with.purvi',
    url: 'https://www.instagram.com/create.with.purvi/',
    category: 'Digital creator',
    counts: [
      { value: 33, label: 'posts' },
      { value: 1576, label: 'followers' },
      { value: 1267, label: 'following' },
    ],
    bio: ['Social media manager', 'Digital Marketer', 'Content creator | Content writer | Content strategist'],
    location: 'Raipur, Chhattisgarh 492001',
    threads: { handle: 'create.with.purvi', url: 'https://www.threads.com/@create.with.purvi' },
  },
  email: 'hello@purviagarwal.in',
  whatsapp: '917974542654',
  phoneDisplay: '+91 79745 42654',
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
