import { useCallback, useRef } from 'react'

const DRAG_THRESHOLD = 5

/**
 * Lets mouse users click-and-drag a horizontally scrollable container.
 * Touch and pen input keep the browser's native scrolling.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const cleanupRef = useRef<(() => void) | null>(null)

  return useCallback((el: T | null) => {
    cleanupRef.current?.()
    cleanupRef.current = null
    if (!el) return

    let startX = 0
    let startScroll = 0
    let pointerId: number | null = null
    let dragged = false

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      if (el.scrollWidth <= el.clientWidth) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return
      pointerId = e.pointerId
      startX = e.clientX
      startScroll = el.scrollLeft
      dragged = false
    }

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return
      const dx = e.clientX - startX
      if (!dragged && Math.abs(dx) < DRAG_THRESHOLD) return
      if (!dragged) {
        dragged = true
        el.setPointerCapture(e.pointerId)
        el.style.cursor = 'grabbing'
        el.style.userSelect = 'none'
      }
      el.scrollLeft = startScroll - dx
    }

    const endDrag = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return
      pointerId = null
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      el.style.cursor = ''
      el.style.userSelect = ''
    }

    const onClickCapture = (e: MouseEvent) => {
      if (!dragged) return
      dragged = false
      e.preventDefault()
      e.stopPropagation()
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)
    el.addEventListener('click', onClickCapture, true)

    cleanupRef.current = () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', endDrag)
      el.removeEventListener('pointercancel', endDrag)
      el.removeEventListener('click', onClickCapture, true)
    }
  }, [])
}
