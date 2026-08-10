type Props = {
  text: string
  className?: string
}

export default function Ticker({ text, className = '' }: Props) {
  const segment = (
    <span className="flex shrink-0 items-center">
      <span className="ticker-content px-8 text-sm font-sans font-600 text-red-600 tracking-wide uppercase whitespace-nowrap">
        {text}
      </span>
      <span className="px-8 text-red-500" aria-hidden="true">•</span>
    </span>
  )

  return (
    <div
      className={`overflow-hidden bg-yellow-300 border-b border-yellow-400 ${className}`}
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
