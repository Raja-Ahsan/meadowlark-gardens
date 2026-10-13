import { useEffect, useRef } from 'react'

interface Leaf {
  x: number
  y: number
  size: number
  speed: number
  drift: number
  sway: number
  swaySpeed: number
  phase: number
  rotation: number
  spin: number
  color: string
  alpha: number
  depth: number
}

interface Orb {
  x: number
  y: number
  r: number
  color: string
  vx: number
  vy: number
}

type Variant = 'light' | 'dark'

const PALETTES: Record<Variant, { leaves: string[]; orbs: string[]; vein: string }> = {
  light: {
    leaves: ['#448647', '#67a469', '#98c49a', '#336b36', '#c3ddc4', '#d98a5f'],
    orbs: ['rgba(152,196,154,0.35)', 'rgba(195,221,196,0.45)', 'rgba(217,138,95,0.18)', 'rgba(103,164,105,0.22)'],
    vein: 'rgba(255,255,255,0.7)',
  },
  dark: {
    leaves: ['#67a469', '#98c49a', '#448647', '#c3ddc4', '#d98a5f'],
    orbs: ['rgba(68,134,71,0.35)', 'rgba(103,164,105,0.22)', 'rgba(217,138,95,0.14)', 'rgba(51,107,54,0.4)'],
    vein: 'rgba(15,31,17,0.55)',
  },
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function makeLeaf(w: number, h: number, anywhere: boolean, colors: string[]): Leaf {
  const depth = rand(0.4, 1)
  return {
    x: rand(-40, w + 40),
    y: anywhere ? rand(-h * 0.2, h) : rand(-120, -30),
    size: rand(10, 22) * depth,
    speed: rand(0.25, 0.7) * depth,
    drift: rand(-0.15, 0.25),
    sway: rand(12, 40),
    swaySpeed: rand(0.006, 0.016),
    phase: rand(0, Math.PI * 2),
    rotation: rand(0, Math.PI * 2),
    spin: rand(-0.012, 0.012),
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: rand(0.35, 0.8) * depth,
    depth,
  }
}

function drawLeaf(ctx: CanvasRenderingContext2D, leaf: Leaf, x: number, y: number, vein: string) {
  const s = leaf.size
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(leaf.rotation)
  ctx.globalAlpha = leaf.alpha
  ctx.fillStyle = leaf.color
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.bezierCurveTo(s * 0.75, -s * 0.55, s * 0.7, s * 0.45, 0, s)
  ctx.bezierCurveTo(-s * 0.7, s * 0.45, -s * 0.75, -s * 0.55, 0, -s)
  ctx.fill()
  ctx.globalAlpha = leaf.alpha * 0.55
  ctx.strokeStyle = vein
  ctx.lineWidth = Math.max(0.6, s * 0.06)
  ctx.beginPath()
  ctx.moveTo(0, -s * 0.85)
  ctx.quadraticCurveTo(s * 0.08, 0, 0, s * 1.15)
  ctx.stroke()
  ctx.restore()
}

/** Decorative animated background of drifting leaves and soft light. Fills its positioned parent. */
export default function LeafCanvas({ className = '', variant = 'light' }: { className?: string; variant?: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const palette = PALETTES[variant]

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let leaves: Leaf[] = []
    let orbs: Orb[] = []
    let frame = 0
    let raf = 0
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.round(Math.min(60, Math.max(18, (width * height) / 26000)))
      leaves = Array.from({ length: count }, () => makeLeaf(width, height, true, palette.leaves))
      orbs = Array.from({ length: 6 }, (_, i) => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(Math.min(width, height) * 0.18, Math.min(width, height) * 0.38),
        color: palette.orbs[i % palette.orbs.length],
        vx: rand(-0.12, 0.12),
        vy: rand(-0.08, 0.08),
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04

      for (const orb of orbs) {
        if (!reduceMotion) {
          orb.x += orb.vx
          orb.y += orb.vy
          if (orb.x < -orb.r || orb.x > width + orb.r) orb.vx *= -1
          if (orb.y < -orb.r || orb.y > height + orb.r) orb.vy *= -1
        }
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        g.addColorStop(0, orb.color)
        g.addColorStop(1, orb.color.replace(/[\d.]+\)$/, '0)'))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const leaf of leaves) {
        if (!reduceMotion) {
          leaf.y += leaf.speed
          leaf.x += leaf.drift
          leaf.rotation += leaf.spin
          if (leaf.y - leaf.size > height + 20 || leaf.x < -80 || leaf.x > width + 80) {
            Object.assign(leaf, makeLeaf(width, height, false, palette.leaves))
          }
        }
        const swayX = Math.sin(frame * leaf.swaySpeed + leaf.phase) * leaf.sway
        const parallaxX = pointer.x * 18 * leaf.depth
        const parallaxY = pointer.y * 12 * leaf.depth
        drawLeaf(ctx, leaf, leaf.x + swayX + parallaxX, leaf.y + parallaxY, palette.vein)
      }
      ctx.globalAlpha = 1
      frame++
    }

    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      if (reduceMotion) draw()
      else raf = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') cancelAnimationFrame(raf)
      else start()
    }

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    resize()
    start()

    const ro = new ResizeObserver(() => { resize(); if (reduceMotion) draw() })
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointermove', onPointer, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [variant])

  return <canvas ref={canvasRef} aria-hidden className={`absolute inset-0 pointer-events-none ${className}`} />
}
