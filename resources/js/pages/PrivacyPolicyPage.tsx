import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { cleanRichTextHtml } from '@/lib/text'
import type { LegalPage } from '@/types'

export default function PrivacyPolicyPage() {
  const [page, setPage] = useState<LegalPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.getLegalPage('privacy-policy')
      .then(res => {
        setPage(res.page)
        if (res.page.metaTitle) document.title = res.page.metaTitle
      })
      .catch(() => setError('This page could not be found.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="bg-white border-b border-forest-100">
        <div className="max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-800 font-sans font-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          {loading ? (
            <div className="h-10 w-64 bg-forest-100/60 rounded-lg animate-pulse" />
          ) : error ? (
            <h1 className="font-display font-700 text-2xl text-forest-900">{error}</h1>
          ) : (
            <h1
              className="font-display font-700 text-forest-900"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            >
              {page?.title || 'Privacy Policy'}
            </h1>
          )}
        </div>
      </div>

      <div className="max-w-[78rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading && (
          <div className="bg-white rounded-2xl border border-forest-100 p-8 space-y-4 animate-pulse">
            <div className="h-4 bg-forest-100 rounded w-full" />
            <div className="h-4 bg-forest-100 rounded w-5/6" />
            <div className="h-4 bg-forest-100 rounded w-4/6" />
          </div>
        )}

        {!loading && !error && page && (
          <article
            className="legal-content bg-white rounded-2xl border border-forest-100 p-6 md:p-10 shadow-sm"
            dangerouslySetInnerHTML={{ __html: cleanRichTextHtml(page.content) }}
          />
        )}

        {!loading && !error && !page && (
          <div className="bg-white rounded-2xl border border-forest-100 p-8 md:p-10 shadow-sm">
            <h2 className="font-display font-700 text-xl text-forest-900 mb-6">
              Privacy Policy
            </h2>
            <div className="space-y-4 text-forest-800 font-body leading-relaxed">
              <p>
                At Meadowlark Gardens, we respect your privacy and are committed to protecting your personal data. This policy explains what information we collect, how we use it, and your rights.
              </p>
              <p>
                We may collect your name, email address, phone number, billing and shipping addresses, and order history when you shop with us or create an account.
              </p>
              <p>
                We use your information to process orders, provide customer support, send order updates, and improve our services. We do not sell your personal information to third parties.
              </p>
              <p>
                If you have questions about this privacy policy, please contact us through our contact page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
