import { useEffect, useMemo, useRef, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill-new'
import QuillTableBetter from 'quill-table-better'
import 'react-quill-new/dist/quill.snow.css'
import 'quill-table-better/dist/quill-table-better.css'

Quill.register({
  'modules/table-better': QuillTableBetter,
}, true)

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

type TableBetterModule = {
  hideTools?: () => void
  clearHistorySelected?: () => void
  deleteTableTemporary?: (source?: string) => void
}

/** Strip editor-only markup before persisting HTML. */
function cleanEditorHtml(html: string): string {
  if (!html) return ''

  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('temporary').forEach(el => el.remove())

  doc.querySelectorAll('.ql-cell-focused, .ql-cell-selected').forEach(el => {
    el.classList.remove('ql-cell-focused', 'ql-cell-selected')
    if (!el.classList.length) el.removeAttribute('class')
  })

  return doc.body.innerHTML
}

/** Load HTML via updateContents — setContents breaks quill-table-better tables. */
function initEditorHtml(editor: Quill, html: string) {
  const delta = editor.clipboard.convert({ html: html || '' })
  editor.setContents([], 'silent')
  editor.updateContents(delta, 'silent')
  editor.setSelection(0, 'silent')
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '280px' }: Props) {
  const quillRef = useRef<ReactQuill>(null)
  const lastEmitted = useRef<string | null>(null)
  const isHydrating = useRef(false)
  const [generation, setGeneration] = useState(0)

  // Remount only when parent resets content from outside (open/create/edit).
  useEffect(() => {
    if (lastEmitted.current === null) {
      lastEmitted.current = value
      return
    }
    if (value !== lastEmitted.current) {
      lastEmitted.current = value
      setGeneration(g => g + 1)
    }
  }, [value])

  // After mount/remount, inject HTML with updateContents so tables render.
  useEffect(() => {
    const editor = quillRef.current?.getEditor()
    if (!editor) return

    const html = cleanEditorHtml(value || '')
    isHydrating.current = true
    initEditorHtml(editor, html)
    lastEmitted.current = html
    // Allow Quill's silent updates to settle before accepting user onChange.
    requestAnimationFrame(() => {
      isHydrating.current = false
    })
  }, [generation])

  const modules = useMemo(() => ({
    table: false,
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link'],
      [{ align: [] }],
      ['table-better'],
      ['clean'],
    ],
    'table-better': {
      language: 'en_US',
      menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
      toolbarTable: true,
    },
    keyboard: {
      bindings: QuillTableBetter.keyboardBindings,
    },
  }), [])

  const emitCleanHtml = (html: string) => {
    if (isHydrating.current) return

    const editor = quillRef.current?.getEditor()
    const tableModule = editor?.getModule('table-better') as TableBetterModule | undefined
    tableModule?.hideTools?.()
    tableModule?.clearHistorySelected?.()

    const cleaned = cleanEditorHtml(html)
    lastEmitted.current = cleaned
    onChange(cleaned)
  }

  return (
    <div className="rich-text-editor rounded-xl border border-forest-200 overflow-hidden bg-white">
      <ReactQuill
        key={generation}
        ref={quillRef}
        theme="snow"
        onChange={emitCleanHtml}
        modules={modules}
        placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  )
}
