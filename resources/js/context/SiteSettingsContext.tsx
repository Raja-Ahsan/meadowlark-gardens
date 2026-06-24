import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { PublicSiteSettings } from '@/types'

const defaults: PublicSiteSettings = {
  siteName: 'Meadowlark Gardens',
  siteEmail: '',
  sitePhone: '',
  headerLogo: null,
  footerLogo: null,
  favicon: null,
  contactPageSubtitle: "We'd love to hear from you. Our team usually responds within one business day.",
  contactAddress: '1247 Meadowlark Lane\nFranklin, TN 37064',
  contactPhoneNote: 'Mon–Sat 8am – 5pm',
  contactEmailNote: 'We reply within 24 hours',
  businessHoursWeekday: 'Mon–Sat: 8:00am – 5:30pm',
  businessHoursSunday: 'Sunday: 10:00am – 3:00pm',
  footerDescription: 'Rooted in Tennessee, growing since 1998. We cultivate native plants that thrive in our unique climate and support local ecosystems.',
  social: { facebook: '', instagram: '', twitter: '', youtube: '', pinterest: '' },
}

const SiteSettingsContext = createContext<PublicSiteSettings>(defaults)

function applyFavicon(url: string | null) {
  if (!url) return
  const href = mediaUrl(url)
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = href
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSiteSettings>(defaults)

  useEffect(() => {
    api.getSiteSettings()
      .then(({ settings: s }) => {
        setSettings(s)
        applyFavicon(s.favicon)
        if (s.siteName) document.title = s.siteName
      })
      .catch(() => {})
  }, [])

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
