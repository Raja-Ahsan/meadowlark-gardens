import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import AnnouncementList from '@/components/announcements/AnnouncementList'
import type { Announcement } from '@/types'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Announcements & Upcoming | Meadowlark Gardens'
    api.getAnnouncements()
      .then(res => setAnnouncements(res.announcements))
      .catch(() => setError('Announcements could not be loaded. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="bg-white border-b border-forest-100">
        <div className="max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <p className="text-xs font-sans font-700 text-forest-600 tracking-widest uppercase mb-2">
            News from the garden
          </p>
          <h1
            className="font-display font-700 text-forest-900"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
          >
            Announcements &amp; Upcoming
          </h1>
        </div>
      </div>

      <div className="max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnnouncementList announcements={announcements} loading={loading} error={error} />
      </div>
    </div>
  )
}
