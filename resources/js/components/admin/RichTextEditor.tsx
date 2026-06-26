import { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '280px' }: Props) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link'],
      [{ align: [] }],
      ['clean'],
    ],
  }), [])

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link', 'align',
  ]

  return (
    <div className="rich-text-editor rounded-xl border border-forest-200 overflow-hidden bg-white">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  )
}
