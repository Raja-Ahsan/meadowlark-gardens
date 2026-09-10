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

const NEAR_WHITE = /^(#fff(?:fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*[\d.]+\s*\))$/i

/**
 * Clean Quill / table-editor HTML for save + public display.
 * Removes editor chrome and unreadable white text colors baked into live content.
 */
export function cleanRichTextHtml(html: string): string {
  if (!html) return ''

  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('temporary').forEach(el => el.remove())

  doc.querySelectorAll('.ql-cell-focused, .ql-cell-selected').forEach(el => {
    el.classList.remove('ql-cell-focused', 'ql-cell-selected')
    if (!el.classList.length) el.removeAttribute('class')
  })

  doc.querySelectorAll<HTMLElement>('[style]').forEach(el => {
    const color = (el.style.color || '').trim()
    if (color && NEAR_WHITE.test(color)) {
      el.style.removeProperty('color')
    }
    if (!el.getAttribute('style')?.trim()) {
      el.removeAttribute('style')
    }
  })

  return doc.body.innerHTML
}
