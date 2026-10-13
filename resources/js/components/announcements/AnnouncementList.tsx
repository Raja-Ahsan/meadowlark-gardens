import { CalendarDays, Megaphone } from 'lucide-react'
import { mediaUrl } from '@/lib/media'
import { cleanRichTextHtml } from '@/lib/text'
import { formatAnnouncementDate } from '@/lib/announcements'
import type { Announcement } from '@/types'

function hasRichContent(html: string): boolean {
  if (!html) return false
  return /<(img|iframe|video|table)\b/i.test(html) || html.replace(/<[^>]*>|&nbsp;/g, '').trim() !== ''
}

interface Props {
  announcements: Announcement[]
  loading: boolean
  error?: string
  emptyMessage?: string
}

export default function AnnouncementList({
  announcements,
  loading,
  error,
  emptyMessage = 'No announcements right now. Check back soon!',
}: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-forest-100 p-6 space-y-3 animate-pulse">
            <div className="h-5 bg-forest-100 rounded w-1/3" />
            <div className="h-4 bg-forest-100 rounded w-full" />
            <div className="h-4 bg-forest-100 rounded w-4/6" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-terra-600">{error}</p>
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-forest-100 p-10 text-center">
        <Megaphone className="w-10 h-10 text-sage-400 mx-auto mb-3" />
        <p className="text-sage-600 font-body">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {announcements.map(a => (
        <article
          key={a.id}
          className="bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden md:flex"
        >
          {a.image && (
            <div className="md:w-72 shrink-0 aspect-[16/9] md:aspect-auto bg-forest-50">
              <img src={mediaUrl(a.image)} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5 md:p-7 min-w-0 flex-1">
            {a.eventDate && (
              <p className="inline-flex items-center gap-1.5 text-xs font-sans font-700 text-forest-600 uppercase tracking-wide mb-2">
                <CalendarDays className="w-4 h-4" />
                {formatAnnouncementDate(a.eventDate)}
              </p>
            )}
            <h2 className="font-display font-700 text-xl md:text-2xl text-forest-900 leading-snug break-words">
              {a.title}
            </h2>
            {a.excerpt && (
              <p className="mt-2 text-sage-600 font-body leading-relaxed break-words">{a.excerpt}</p>
            )}
            {hasRichContent(a.content) && (
              <div
                className="legal-content mt-4 break-words"
                dangerouslySetInnerHTML={{ __html: cleanRichTextHtml(a.content) }}
              />
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
