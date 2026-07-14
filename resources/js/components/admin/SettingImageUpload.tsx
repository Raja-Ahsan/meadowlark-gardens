import { useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'

interface Props {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  folder?: string
  accept?: string
  previewClass?: string
}

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1'

export default function SettingImageUpload({
  label,
  hint,
  value,
  onChange,
  folder = 'branding',
  accept = 'image/*,.ico',
  previewClass = 'h-12 max-w-[200px] object-contain',
}: Props) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await api.uploadFile(file, folder)
      onChange(mediaUrl(res.url))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint && <p className="text-xs text-sage-500 mb-2">{hint}</p>}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {value && (
          <div className="shrink-0 p-2 bg-cream-50 border border-forest-100 rounded-xl">
            <img src={mediaUrl(value)} alt="" className={previewClass} />
          </div>
        )}
        <div className="flex-1 w-full space-y-2">
          <input
            className={inputClass}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Image URL or upload file"
          />
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-100 text-forest-700 rounded-lg text-xs font-600 cursor-pointer hover:bg-forest-200">
              <ImagePlus className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" accept={accept} className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-terra-600 hover:bg-terra-50 rounded-lg text-xs font-600"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
