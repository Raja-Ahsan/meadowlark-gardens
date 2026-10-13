import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, ShoppingBag, ClipboardList, Mail, Star, Megaphone, UserCheck, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { AppNotification } from '@/types'

const POLL_MS = 60_000

const kindIcons: Record<string, typeof Bell> = {
  order: ShoppingBag,
  application: ClipboardList,
  message: Mail,
  review: Star,
  announcement: Megaphone,
  account: UserCheck,
}

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

interface Props {
  /** `dark` for forest-900 headers, `light` for white headers. */
  variant?: 'light' | 'dark'
}

export default function NotificationBell({ variant = 'dark' }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getNotifications()
      setItems(res.notifications)
      setUnread(res.unreadCount)
      setLoaded(true)
    } catch {
      // keep previous list
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, POLL_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    setOpen(o => !o)
    if (!open) load()
  }

  const openItem = (n: AppNotification) => {
    if (!n.read) {
      setItems(list => list.map(i => (i.id === n.id ? { ...i, read: true } : i)))
      setUnread(c => Math.max(0, c - 1))
      api.markNotificationRead(n.id).catch(() => {})
    }
    setOpen(false)
    if (n.url) navigate(n.url)
  }

  const markAll = () => {
    setItems(list => list.map(i => ({ ...i, read: true })))
    setUnread(0)
    api.markAllNotificationsRead().catch(() => {})
  }

  const buttonClass = variant === 'light'
    ? 'w-10 h-10 rounded-xl text-forest-700 border border-forest-200 hover:bg-forest-50 hover:border-forest-300'
    : 'w-9 h-9 rounded-lg bg-forest-800 hover:bg-forest-700 text-sage-300'

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className={`relative inline-flex items-center justify-center transition-colors focus-ring ${buttonClass}`}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-terra-500 text-white text-[10px] font-700 leading-[1.125rem] text-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 z-50 bg-white text-forest-900 rounded-2xl shadow-xl border border-forest-100 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-forest-100">
            <p className="font-sans font-700 text-sm">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="inline-flex items-center gap-1 text-xs font-600 text-forest-600 hover:text-forest-800">
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto overscroll-contain">
            {!loaded && loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-sage-400" /></div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Bell className="w-8 h-8 text-sage-300 mx-auto mb-2" />
                <p className="text-sm text-sage-500">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-forest-50">
                {items.map(n => {
                  const Icon = kindIcons[n.kind] || Bell
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-cream-50 transition-colors ${n.read ? '' : 'bg-forest-50/60'}`}
                      >
                        <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${n.read ? 'bg-cream-100 text-sage-500' : 'bg-forest-100 text-forest-700'}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className={`text-sm break-words ${n.read ? 'font-500 text-forest-800' : 'font-700 text-forest-900'}`}>{n.title}</span>
                            {!n.read && <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-terra-500" aria-hidden />}
                          </span>
                          {n.message && <span className="block text-xs text-sage-600 mt-0.5 break-words line-clamp-2">{n.message}</span>}
                          <span className="block text-[11px] text-sage-400 mt-1">{timeAgo(n.createdAt)}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
