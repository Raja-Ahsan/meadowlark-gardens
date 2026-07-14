import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { PublicSiteSettings } from '@/types'

const STORAGE_KEY = 'mg_site_settings'

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

type SiteSettingsContextValue = PublicSiteSettings & { ready: boolean }

const SiteSettingsContext = createContext<SiteSettingsContextValue>({ ...defaults, ready: false })

function readCachedSettings(): PublicSiteSettings | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return null
  }
}

function readInitialSettings(): PublicSiteSettings {
  const fromWindow = window.__SITE_SETTINGS__
  if (fromWindow) return { ...defaults, ...fromWindow }

  const cached = readCachedSettings()
  if (cached) return cached

  return defaults
}

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
  const [settings, setSettings] = useState<PublicSiteSettings>(readInitialSettings)
  const [ready, setReady] = useState(() => Boolean(window.__SITE_SETTINGS__ || readCachedSettings()))

  useEffect(() => {
    const initial = readInitialSettings()
    applyFavicon(initial.favicon)
    if (initial.siteName) document.title = initial.siteName
  }, [])

  useEffect(() => {
    api.getSiteSettings()
      .then(({ settings: s }) => {
        setSettings(s)
        setReady(true)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s))
        applyFavicon(s.favicon)
        if (s.siteName) document.title = s.siteName
      })
      .catch(() => setReady(true))
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ ...settings, ready }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
