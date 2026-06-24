/** Normalize uploaded/local image paths so they work on any host (e.g. 127.0.0.1:8000 vs localhost). */
export function mediaUrl(path?: string | null): string {
  if (!path) return ''

  if (path.startsWith('/storage/')) return path

  const localMatch = path.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/storage\/.+)$/i)
  if (localMatch) return localMatch[1]

  if (path.startsWith('http://') || path.startsWith('https://')) return path

  return `/storage/${path.replace(/^\/+/, '')}`
}
