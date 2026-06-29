type Props = {
  text: string
  className?: string
}

export default function Ticker({ text, className = '' }: Props) {
  const segment = (
    <span className="flex shrink-0 items-center">
      <span className="ticker-content px-8 text-sm font-sans font-600 text-amber-900 tracking-wide uppercase whitespace-nowrap">
        {text}
      </span>
      <span className="px-8 text-amber-400" aria-hidden="true">•</span>
    </span>
  )

  return (
    <div
      className={`overflow-hidden bg-amber-50 border-b border-amber-200 ${className}`}
      role="marquee"
      aria-live="polite"
    >
      <div className="ticker-track flex w-max py-2.5">
        {segment}
        {segment}
      </div>
    </div>
  )
}
