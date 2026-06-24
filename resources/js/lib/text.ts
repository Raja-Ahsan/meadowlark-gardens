/** Truncate text to a maximum number of words, appending ellipsis when shortened. */
export function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text.trim()
  return `${words.slice(0, maxWords).join(' ')}…`
}

/** Truncate text to a maximum character count, appending ellipsis when shortened. */
export function truncateChars(text: string, maxChars: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxChars) return trimmed
  return `${trimmed.slice(0, maxChars).trimEnd()}…`
}
