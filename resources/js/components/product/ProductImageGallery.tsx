import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { mediaUrl } from '@/lib/media'

interface GalleryImage {
  id: string
  path: string
}

interface Props {
  images: GalleryImage[]
  selectedPath: string
  onSelect: (path: string) => void
  alt: string
  /** Optional override for main display (e.g. variation image) */
  displayPath?: string
}

const ZOOM_SCALE = 2.25

export default function ProductImageGallery({
  images,
  selectedPath,
  onSelect,
  alt,
  displayPath,
}: Props) {
  const [zooming, setZooming] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const mainPath = displayPath || selectedPath
  const mainSrc = mediaUrl(mainPath)

  const allPaths = (() => {
    const paths = images.map(i => i.path)
    if (displayPath && !paths.includes(displayPath)) {
      return [displayPath, ...paths]
    }
    return paths.length ? paths : [mainPath]
  })()

  const openLightbox = useCallback((path?: string) => {
    const target = path || mainPath
    const idx = allPaths.findIndex(p => p === target)
    setLightboxIndex(idx >= 0 ? idx : 0)
    setLightboxOpen(true)
  }, [allPaths, mainPath])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const goPrev = useCallback(() => {
    setLightboxIndex(i => (i - 1 + allPaths.length) % allPaths.length)
  }, [allPaths.length])

  const goNext = useCallback(() => {
    setLightboxIndex(i => (i + 1) % allPaths.length)
  }, [allPaths.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, closeLightbox, goPrev, goNext])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    setOrigin({ x, y })
  }

  const handleDoubleClick = () => openLightbox(mainPath)

  return (
    <>
      <div className="space-y-4">
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-forest-100 shadow-sm cursor-zoom-in group"
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => { setZooming(false); setOrigin({ x: 50, y: 50 }) }}
          onMouseMove={handleMouseMove}
          onDoubleClick={handleDoubleClick}
          role="img"
          aria-label={`${alt}. Hover to zoom. Double-click for full view.`}
        >
          <img
            src={mainSrc}
            alt={alt}
            draggable={false}
            className="w-full h-full object-cover select-none transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform: zooming ? `scale(${ZOOM_SCALE})` : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          />

          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-sans font-600 text-forest-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
            <ZoomIn className="w-3.5 h-3.5" />
            Double-click for full view
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map(img => (
              <button
                key={img.id}
                type="button"
                onClick={() => onSelect(img.path)}
                onDoubleClick={() => openLightbox(img.path)}
                className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedPath === img.path ? 'border-forest-600' : 'border-transparent hover:border-forest-300'
                }`}
                title="Click to select · Double-click to enlarge"
              >
                <img src={mediaUrl(img.path)} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Full size product image"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {allPaths.length > 1 && (
            <>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); goPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); goNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <div
            className="relative max-w-[min(96vw,1200px)] max-h-[90vh] w-full flex flex-col items-center px-4"
            onClick={e => e.stopPropagation()}
            onDoubleClick={closeLightbox}
          >
            <img
              src={mediaUrl(allPaths[lightboxIndex])}
              alt={alt}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain select-none"
              draggable={false}
            />
            {allPaths.length > 1 && (
              <p className="mt-4 text-white/70 text-sm font-sans">
                {lightboxIndex + 1} / {allPaths.length}
              </p>
            )}
            <p className="mt-2 text-white/50 text-xs font-sans">Double-click or press Esc to close</p>
          </div>
        </div>
      )}
    </>
  )
}
