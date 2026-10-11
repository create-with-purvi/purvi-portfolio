# Purvi Agarwal — Portfolio

Vite + React + Tailwind v4 + Motion + Lenis + three.js. Static output, deploy anywhere.

## Run

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # outputs dist/
npm run preview    # serves dist/ on http://127.0.0.1:4173
```

## Deploy (free)

- **Netlify**: drag the `dist/` folder onto app.netlify.com/drop (the `_headers` file sets long caching).
- **Vercel**: `npx vercel` in this folder (framework: Vite, output: `dist`).
- Any static host works; paths are relative (`base: './'`).

## Swap the placeholders — all in `src/data/site.ts`

| What | Field |
| --- | --- |
| Instagram handle + URL | `site.instagram` |
| Email | `site.email` |
| WhatsApp number (country code, no `+`) | `site.whatsapp` |
| Phone shown on page | `site.phoneDisplay` |
| WhatsApp pre-filled message | `site.waText` |
| Client Instagram pages | `clients[].instagram` (chips become links when filled) |
| Open for work badge | `site.available` |

## Add real reels

1. Export each reel as MP4 (H.264, 720×1280, ~2–3 MB, no audio needed) and put it in `public/media/`, e.g. `public/media/asp-cranes.mp4`.
2. In `src/data/site.ts`, add `video: 'media/asp-cranes.mp4'` to that reel. The phone plays the video instead of the slideshow; `poster` stays as the first frame.

Compress with: `ffmpeg -i in.mov -vf scale=720:-2 -c:v libx264 -crf 28 -preset slow -an -movflags +faststart out.mp4`

## Add more work

Put a WebP in `public/work/` as `<id>.webp` (≤1080 px wide) and `<id>-s.webp` (480 px wide), then add an entry to `src/data/work.json`.
