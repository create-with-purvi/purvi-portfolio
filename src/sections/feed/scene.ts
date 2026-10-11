import {
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearFilter,
  LinearMipmapLinearFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three'
import { fragmentShader, vertexShader } from './shaders'
import type { FeedScene, FeedSceneOptions } from './types'

const COLS = 10
const STAGGER = [0, 0.52, 0.16, 0.72, 0.34, 0.88, 0.06, 0.6, 0.26, 0.8]
const PARALLAX = [0, 0.04, -0.025, 0.05, -0.035, 0.025, -0.05, 0.035, -0.015, 0.045]
const GUTTER = 4
const SMALL_SCALE = 0.8
const TAP_SLOP = 6

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const wrap = (v: number, p: number) => v - p * Math.floor((v + p / 2) / p)
const damp = (from: number, to: number, rate: number, dt: number) => to + (from - to) * Math.exp(-rate * dt)
const now = () => performance.now() / 1000

export function createFeedScene({ host, tiles, onOpen, onFirstDrag, onLost }: FeedSceneOptions): FeedScene {
  const uniq = tiles.length
  const rows = Math.ceil(uniq / COLS)
  const n = rows * COLS
  const slotTile = Array.from({ length: n }, (_, s) =>
    s < uniq ? s : (Math.floor(rows / 2) * COLS + Math.floor(COLS / 2) + (s - uniq) * 3) % uniq
  )
  const tileAt = (k: number) => slotTile[k % n]
  const cap = n * 4
  const coarse = matchMedia('(pointer: coarse)').matches
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches

  const renderer = new WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
  renderer.setClearColor(new Color('#0a0a0a'), 1)
  const canvas = renderer.domElement
  canvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;outline:none'
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)

  const scene = new Scene()
  const camera = new PerspectiveCamera(30, 1, 1, 10000)

  const sharp = !coarse && window.innerWidth >= 1024 && window.devicePixelRatio > 1.2
  let cw = sharp ? 320 : coarse || window.innerWidth < 768 ? 224 : 256
  const atlasCols = Math.ceil(Math.sqrt(uniq * 1.25))
  const atlasRows = Math.ceil(uniq / atlasCols)
  const maxTex = Math.min(renderer.capabilities.maxTextureSize, 4096)
  while ((cw + GUTTER * 2) * atlasCols > maxTex || (cw * 1.25 + GUTTER * 2) * atlasRows > maxTex) cw = Math.floor(cw * 0.85)
  const ch = Math.round(cw * 1.25)
  const cellW = cw + GUTTER * 2
  const cellH = ch + GUTTER * 2
  const atlas = document.createElement('canvas')
  atlas.width = cellW * atlasCols
  atlas.height = cellH * atlasRows
  const ctx = atlas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  const texture = new CanvasTexture(atlas)
  texture.colorSpace = SRGBColorSpace
  texture.generateMipmaps = true
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())

  const geometry = new PlaneGeometry(1, 1, 14, 14)
  const aPos = new InstancedBufferAttribute(new Float32Array(cap * 2), 2).setUsage(DynamicDrawUsage)
  const aState = new InstancedBufferAttribute(new Float32Array(cap * 4), 4).setUsage(DynamicDrawUsage)
  const aFx = new InstancedBufferAttribute(new Float32Array(cap * 3), 3).setUsage(DynamicDrawUsage)
  const aAtlas = new InstancedBufferAttribute(new Float32Array(cap * 4), 4)
  const aColor = new InstancedBufferAttribute(new Float32Array(cap * 3), 3)
  const tmp = new Color()
  const base = new Float32Array(cap)
  const flag = new Float32Array(cap)
  for (let k = 0; k < cap; k++) {
    const i = tileAt(k)
    const ac = i % atlasCols
    const ar = Math.floor(i / atlasCols)
    aAtlas.setXYZW(
      k,
      (ac * cellW + GUTTER) / atlas.width,
      1 - (ar * cellH + GUTTER + ch) / atlas.height,
      cw / atlas.width,
      ch / atlas.height
    )
    tmp.set(tiles[i].color)
    aColor.setXYZ(k, tmp.r, tmp.g, tmp.b)
    base[k] = tiles[i].small ? SMALL_SCALE : 1
    flag[k] = tiles[i].carousel ? 1 : 0
  }
  geometry.setAttribute('aPos', aPos)
  geometry.setAttribute('aState', aState)
  geometry.setAttribute('aFx', aFx)
  geometry.setAttribute('aAtlas', aAtlas)
  geometry.setAttribute('aColor', aColor)

  const uniforms = {
    uAtlas: { value: texture },
    uView: { value: new Vector2(1, 1) },
    uTile: { value: new Vector2(1, 1) },
    uVel: { value: new Vector2() },
    uBend: { value: 0 },
    uCurve: { value: 1 },
    uLag: { value: 1.2 },
    uPress: { value: 0 },
    uMargin: { value: 18 },
    uRadius: { value: 16 },
    uHoverAny: { value: 0 },
    uSplit: { value: 0.16 },
    uRed: { value: new Color('#f40816') },
    uFocus: { value: new Vector2() },
    uIcon: { value: 8 },
  }
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  const mesh = new InstancedMesh(geometry, material, cap)
  mesh.frustumCulled = false
  scene.add(mesh)

  const X = new Float32Array(cap)
  const Y = new Float32Array(cap)
  const dim = new Float32Array(cap)
  const dimV = new Float32Array(cap)
  const dimT = new Float32Array(cap)
  const glow = new Float32Array(cap)
  const glowT = new Float32Array(cap)
  const hov = new Float32Array(cap)
  const loaded = new Float32Array(cap)
  const loadedT = new Float32Array(cap)
  const intro = new Float32Array(cap)
  const introV = new Float32Array(cap)
  const introT = new Float32Array(cap)
  const introAt = new Float64Array(cap).fill(Infinity)
  const pendAt = new Float64Array(cap).fill(Infinity)
  const pendDim = new Float32Array(cap)
  const pendGlow = new Float32Array(cap)

  let W = 1
  let H = 1
  let tileW = 1
  let tileH = 1
  let cellX = 0
  let cellY = 0
  let PW = 1
  let PH = 1
  let copiesX = 1
  let copiesY = 1
  let count = n
  let offX = 0
  let offY = 0

  function layout() {
    const w = Math.max(1, host.clientWidth)
    const h = Math.max(1, host.clientHeight)
    const prevCell = cellX
    W = w
    H = h
    const small = w < 640
    const gap = small ? 12 : w < 1024 ? 18 : clamp(w * 0.018, 20, 34)
    tileW = small ? w * 0.44 : w < 1024 ? w * 0.29 : clamp(w * 0.175, 220, 420)
    tileH = tileW * 1.25
    cellX = tileW + gap
    cellY = tileH + gap
    copiesX = clamp(Math.ceil((w * 1.3 + cellX * 2) / (COLS * cellX)), 1, 2)
    copiesY = clamp(Math.ceil((h * 1.3 + cellY * 2) / (rows * cellY)), 1, 2)
    PW = COLS * cellX * copiesX
    PH = rows * cellY * copiesY
    count = n * copiesX * copiesY
    mesh.count = count
    if (prevCell > 0) {
      offX *= cellX / prevCell
      offY *= cellX / prevCell
    }
    const dpr = Math.min(window.devicePixelRatio || 1, coarse || w < 768 ? 1.5 : 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const dist = h / 2 / Math.tan((camera.fov * Math.PI) / 360)
    camera.position.set(0, 0, dist)
    camera.near = dist * 0.05
    camera.far = dist * 6
    camera.updateProjectionMatrix()
    uniforms.uView.value.set(w, h)
    uniforms.uTile.value.set(tileW, tileH)
    uniforms.uCurve.value = dist * 0.12
    uniforms.uMargin.value = small ? 12 : 18
    uniforms.uRadius.value = small ? 10 : 16
    uniforms.uLag.value = small ? 0.8 : 1.1
    uniforms.uIcon.value = small ? 6.5 : 8
  }

  function place() {
    const pw1 = COLS * cellX
    const ph1 = rows * cellY
    for (let k = 0; k < count; k++) {
      const i = k % n
      const copy = Math.floor(k / n)
      const cx = copy % copiesX
      const cy = Math.floor(copy / copiesX)
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const bx = col * cellX + cx * pw1 - pw1 / 2 + cellX / 2
      const by = row * cellY + STAGGER[col] * cellY + cy * ph1 - ph1 / 2
      X[k] = wrap(bx + offX, PW)
      Y[k] = wrap(by + offY * (1 + PARALLAX[col]), PH)
      aPos.setXY(k, X[k], -Y[k])
    }
    aPos.needsUpdate = true
  }

  function scaleOf(k: number) {
    return base[k] * (0.5 + 0.5 * clamp(intro[k], 0, 1)) * (1 - 0.2 * dim[k])
  }

  function hit(clientX: number, clientY: number) {
    const r = canvas.getBoundingClientRect()
    const px = clientX - r.left - r.width / 2
    const py = clientY - r.top - r.height / 2
    for (let k = 0; k < count; k++) {
      const s = scaleOf(k)
      if (Math.abs(px - X[k]) <= (tileW * s) / 2 && Math.abs(py - Y[k]) <= (tileH * s) / 2) return k
    }
    return -1
  }

  let disposed = false
  const ready: number[] = []
  const uploaded = new Uint8Array(uniq)
  let dirty = false
  let lastUpload = now()

  function drawTile(i: number, img: HTMLImageElement) {
    const x = (i % atlasCols) * cellW
    const y = Math.floor(i / atlasCols) * cellH
    const s = Math.max(cellW / img.naturalWidth, cellH / img.naturalHeight)
    const dw = img.naturalWidth * s
    const dh = img.naturalHeight * s
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, cellW, cellH)
    ctx.clip()
    ctx.drawImage(img, x + (cellW - dw) / 2, y + (cellH - dh) / 2, dw, dh)
    ctx.restore()
  }

  layout()
  place()

  const nearest = new Float32Array(uniq).fill(Infinity)
  for (let k = 0; k < count; k++) {
    const i = tileAt(k)
    nearest[i] = Math.min(nearest[i], Math.hypot(X[k], Y[k] * 1.4))
  }
  const loadOrder = tiles.map((_, i) => i).sort((a, b) => nearest[a] - nearest[b])
  for (const i of loadOrder) {
    const img = new Image()
    img.decoding = 'async'
    img.src = tiles[i].url
    img
      .decode()
      .then(() => {
        if (disposed) return
        drawTile(i, img)
        ready.push(i)
        dirty = true
      })
      .catch(() => {})
  }

  let revealed = false
  function reveal() {
    if (revealed) return
    revealed = true
    const t = now()
    const R = Math.hypot(W, H) / 2
    for (let k = 0; k < cap; k++) {
      const d = k < count ? Math.hypot(X[k], Y[k]) : R
      introAt[k] = t + 0.05 + Math.min(1.2, d / R) * 0.6
    }
  }

  function setFilter(category: string | null) {
    const t = now()
    const R = Math.hypot(W, H) / 2
    if (category && mode !== 'drag') {
      const cy = -H * 0.06
      let best = -1
      let bestD = Infinity
      for (let k = 0; k < count; k++) {
        if (tiles[tileAt(k)].category !== category) continue
        const d = Math.hypot(X[k], (Y[k] - cy) * 1.2)
        if (d < bestD) {
          bestD = d
          best = k
        }
      }
      if (best >= 0) {
        inX = inY = 0
        glideX = -X[best]
        glideY = (cy - Y[best]) / (1 + PARALLAX[(best % n) % COLS])
      }
    }
    for (let k = 0; k < cap; k++) {
      const tile = tiles[tileAt(k)]
      const match = !category || tile.category === category
      const d = k < count ? Math.hypot(X[k], Y[k]) : R
      pendAt[k] = t + Math.min(1.2, d / R) * 0.38
      pendDim[k] = match ? 0 : 1
      pendGlow[k] = category && match ? 1 : 0
    }
  }

  let pointerId = -1
  let mode: 'idle' | 'pending' | 'drag' = 'idle'
  let sx = 0
  let sy = 0
  let lx = 0
  let ly = 0
  let lt = 0
  let moved = 0
  let downAt = 0
  let pendX = 0
  let pendY = 0
  let dragVX = 0
  let dragVY = 0
  let inX = 0
  let inY = 0
  let driftAmt = 0
  let driftX = 0.86
  let driftY = 0.5
  let firstDrag = false
  let glideX = 0
  let glideY = 0
  let wheelX = 0
  let wheelSum = 0
  let hovered = -1
  let pointerIn = false
  let pcx = 0
  let pcy = 0

  function endPointer() {
    if (pointerId !== -1 && canvas.hasPointerCapture?.(pointerId)) canvas.releasePointerCapture(pointerId)
    pointerId = -1
    mode = 'idle'
  }

  function throwWall() {
    const recent = performance.now() - lt < 90
    inX = recent ? clamp(dragVX, -70, 70) : 0
    inY = recent ? clamp(dragVY, -70, 70) : 0
    const sp = Math.hypot(inX, inY)
    if (sp > 2) {
      driftX = inX / sp
      driftY = inY / sp
    }
  }

  function onDown(e: PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (pointerId !== -1) return
    pointerId = e.pointerId
    sx = lx = e.clientX
    sy = ly = e.clientY
    lt = performance.now()
    moved = 0
    downAt = lt
    dragVX = dragVY = 0
    inX = inY = 0
    glideX = glideY = 0
    driftAmt = 0
    mode = e.pointerType === 'mouse' ? 'drag' : 'pending'
    if (mode === 'drag') canvas.setPointerCapture(e.pointerId)
  }

  function onMove(e: PointerEvent) {
    if (e.pointerType === 'mouse') {
      pointerIn = true
      pcx = e.clientX
      pcy = e.clientY
    }
    if (e.pointerId !== pointerId) return
    moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy))
    if (mode === 'pending') {
      const ax = Math.abs(e.clientX - sx)
      const ay = Math.abs(e.clientY - sy)
      if (ax > 8 && ax > ay * 1.15) {
        mode = 'drag'
        lx = e.clientX
        ly = e.clientY
        try {
          canvas.setPointerCapture(e.pointerId)
        } catch {
          return
        }
      } else if (ay > 8) {
        endPointer()
        return
      } else return
    }
    if (mode !== 'drag') return
    const t = performance.now()
    const dx = e.clientX - lx
    const dy = e.clientY - ly
    const dt = Math.max(4, t - lt)
    pendX += dx
    pendY += dy
    dragVX += ((dx / dt) * 16.67 - dragVX) * 0.45
    dragVY += ((dy / dt) * 16.67 - dragVY) * 0.45
    lx = e.clientX
    ly = e.clientY
    lt = t
    if (!firstDrag && moved > TAP_SLOP) {
      firstDrag = true
      onFirstDrag()
    }
  }

  function onUp(e: PointerEvent) {
    if (e.pointerId !== pointerId) return
    const tap = moved < TAP_SLOP && performance.now() - downAt < 700
    if (tap) {
      const k = hit(e.clientX, e.clientY)
      if (k >= 0) onOpen(tileAt(k))
    } else if (mode === 'drag') throwWall()
    endPointer()
  }

  function onCancel(e: PointerEvent) {
    if (e.pointerId !== pointerId) return
    if (mode === 'drag') throwWall()
    endPointer()
  }

  function onLeave(e: PointerEvent) {
    if (e.pointerType === 'mouse') pointerIn = false
  }

  function onWheel(e: WheelEvent) {
    if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return
    e.preventDefault()
    const dx = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX
    wheelX -= dx
    wheelSum += Math.abs(dx)
    glideX = glideY = 0
    inX = inY = 0
    driftAmt = 0
    if (dx !== 0) {
      driftX = dx > 0 ? -0.86 : 0.86
      driftY = 0.5
    }
    if (!firstDrag && wheelSum > 40) {
      firstDrag = true
      onFirstDrag()
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (mode === 'drag' && e.cancelable) e.preventDefault()
  }

  function onContextLost(e: Event) {
    e.preventDefault()
    onLost()
  }

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('webglcontextlost', onContextLost)

  let velX = 0
  let velY = 0
  let bend = 0
  let bendV = 0
  let press = 0
  let pressV = 0
  let hoverAny = 0
  let focusX = 0
  let focusY = 0
  let lastScroll = window.scrollY

  function step(dt: number, t: number) {
    const f = dt * 60
    let mx = 0
    let my = 0
    if (mode === 'drag') {
      mx = pendX
      my = pendY
    } else {
      const decay = Math.pow(0.94, f)
      inX *= decay
      inY *= decay
      const gliding = Math.abs(glideX) + Math.abs(glideY) > 0.5
      const idle = Math.hypot(inX, inY) < 0.8 && mode === 'idle' && !gliding
      driftAmt = damp(driftAmt, idle ? (hovered >= 0 ? 0.12 : 1) : 0, 1.6, dt)
      const ds = (tileW / 260) * 0.55
      mx = (inX + driftX * ds * driftAmt) * f
      my = (inY + driftY * ds * driftAmt) * f
      if (gliding) {
        const a = 1 - Math.exp(-3.4 * dt)
        mx += glideX * a
        my += glideY * a
        glideX -= glideX * a
        glideY -= glideY * a
      } else glideX = glideY = 0
      mx += wheelX
    }
    wheelX = 0
    pendX = 0
    pendY = 0
    const sy = window.scrollY
    const dsy = sy - lastScroll
    lastScroll = sy
    if (Math.abs(dsy) < 400) my -= dsy * 0.28
    offX += mx
    offY += my

    const fx = mx / Math.max(f, 0.001)
    const fy = my / Math.max(f, 0.001)
    velX = damp(velX, fx, 9, dt)
    velY = damp(velY, fy, 9, dt)
    const sp = Math.hypot(velX, velY)
    const k = sp > 60 ? 60 / sp : 1
    uniforms.uVel.value.set(velX * k, -velY * k)

    const bendT = Math.min(1, (sp * k) / 40)
    bendV += ((bendT - bend) * 120 - bendV * 10) * dt
    bend += bendV * dt
    uniforms.uBend.value = bend

    let fxT = 0
    let fyT = 0
    if (mode === 'drag') {
      const r = canvas.getBoundingClientRect()
      fxT = clamp(lx - r.left - r.width / 2, -W * 0.4, W * 0.4)
      fyT = clamp(r.top + r.height / 2 - ly, -H * 0.4, H * 0.4)
    }
    focusX = damp(focusX, fxT, 5, dt)
    focusY = damp(focusY, fyT, 5, dt)
    uniforms.uFocus.value.set(focusX, focusY)

    pressV += (((mode === 'drag' ? 1 : 0) - press) * 260 - pressV * 26) * dt
    press += pressV * dt
    uniforms.uPress.value = press

    place()

    hovered = canHover && pointerIn && mode === 'idle' ? hit(pcx, pcy) : -1
    hoverAny = damp(hoverAny, hovered >= 0 ? 1 : 0, 8, dt)
    uniforms.uHoverAny.value = hoverAny

    if (dirty && (ready.length >= 12 || t - lastUpload > 0.5)) {
      dirty = false
      lastUpload = t
      texture.needsUpdate = true
      for (const i of ready) uploaded[i] = 1
      for (let j = 0; j < cap; j++) if (uploaded[tileAt(j)]) loadedT[j] = 1
      ready.length = 0
    }

    for (let j = 0; j < cap; j++) {
      if (t >= pendAt[j]) {
        dimT[j] = pendDim[j]
        glowT[j] = pendGlow[j]
        pendAt[j] = Infinity
      }
      if (t >= introAt[j]) {
        introT[j] = 1
        introAt[j] = Infinity
      }
      dimV[j] += ((dimT[j] - dim[j]) * 140 - dimV[j] * 15) * dt
      dim[j] += dimV[j] * dt
      introV[j] += ((introT[j] - intro[j]) * 110 - introV[j] * 13) * dt
      intro[j] += introV[j] * dt
      glow[j] = damp(glow[j], glowT[j], 7, dt)
      hov[j] = damp(hov[j], j === hovered ? 1 : 0, 9, dt)
      loaded[j] = damp(loaded[j], loadedT[j], 4.5, dt)
      aState.setXYZW(j, dim[j], glow[j], hov[j], loaded[j])
      aFx.setXYZ(j, intro[j], base[j], flag[j])
    }
    aState.needsUpdate = true
    aFx.needsUpdate = true
  }

  let raf = 0
  let running = false
  let inView = false
  let visible = document.visibilityState === 'visible'
  let paused = false
  let last = 0

  function frame() {
    raf = requestAnimationFrame(frame)
    const t = now()
    const dt = clamp(t - last, 0.001, 1 / 30)
    last = t
    step(dt, t)
    renderer.render(scene, camera)
  }

  function sync() {
    const should = !disposed && inView && visible && !paused
    if (should && !running) {
      running = true
      last = now()
      lastScroll = window.scrollY
      raf = requestAnimationFrame(frame)
    } else if (!should && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting
      if (entry.intersectionRatio >= 0.3) reveal()
      sync()
    },
    { threshold: [0, 0.3, 0.6] }
  )
  io.observe(host)

  const ro = new ResizeObserver(() => {
    layout()
    place()
    if (!running) renderer.render(scene, camera)
  })
  ro.observe(host)

  function onVisibility() {
    visible = document.visibilityState === 'visible'
    sync()
  }
  document.addEventListener('visibilitychange', onVisibility)

  renderer.render(scene, camera)

  return {
    setFilter,
    setPaused(p: boolean) {
      paused = p
      if (p) {
        pointerIn = false
        endPointer()
      }
      sync()
    },
    dispose() {
      disposed = true
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onCancel)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      geometry.dispose()
      material.dispose()
      texture.dispose()
      atlas.width = atlas.height = 0
      mesh.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
