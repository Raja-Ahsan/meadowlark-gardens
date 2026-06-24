import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const COLLAPSED_LINES = 7

interface Props {
  text: string
}

const contentClass =
  'text-sm font-body text-forest-700 leading-relaxed whitespace-pre-line max-w-none'

export default function ExpandableDescription({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  const measureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setExpanded(false)
  }, [text])

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return

    const checkOverflow = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
      if (!lineHeight || Number.isNaN(lineHeight)) {
        setShowToggle(el.scrollHeight > el.clientHeight + 2)
        return
      }
      setShowToggle(el.scrollHeight > lineHeight * COLLAPSED_LINES + 2)
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [text])

  if (!text.trim()) return null

  return (
    <div className="mb-6 relative">
      {/* Hidden full-height copy used to detect if text exceeds 7 lines */}
      <div
        ref={measureRef}
        className={`${contentClass} absolute left-0 right-0 top-0 opacity-0 pointer-events-none -z-10`}
        aria-hidden="true"
      >
        {text}
      </div>

      <div
        className={contentClass}
        style={
          expanded
            ? undefined
            : {
                display: '-webkit-box',
                WebkitLineClamp: COLLAPSED_LINES,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {text}
      </div>

      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="mt-2 text-sm font-sans font-600 text-forest-700 underline underline-offset-2 hover:text-forest-900 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Learn more about this item'}
        </button>
      )}
    </div>
  )
}
