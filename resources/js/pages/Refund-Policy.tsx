import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ShippingPolicyPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
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
          ) : (
            <h1
              className="font-display font-700 text-forest-900"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            >
          REFUND/REPLACEMENT POLICY
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

        {!loading && (
          <div className="bg-white rounded-2xl border border-forest-100 p-6 md:p-10 shadow-sm space-y-6 text-forest-800 font-body leading-relaxed">
            <h2 className="font-display font-700 text-xl text-forest-900">REFUND/REPLACEMENT POLICY</h2>

            <div className="space-y-4">
              <p>
                YOU HAVE 24 HOURS TO CONTACT US WITH ANY ISSUE REGARDING DAMAGE FROM SHIPPING.
              </p>
              <p>
             ABSOLUTELY NO REFUNDS OR REPLACEMENTS WILL BE CONSIDERED WITHOUT PICTURES AND PREVIOUS COMMUNICATIONS AND NONE WILL BE ISSUED AFTER 21 DAYS!!! WE DO THIS BECAUSE WE KNOW HOW THE PLANTS ARE TAKEN CARE OF WHILE IN OUR POSSESSION, BUT NOT ONCE THEY ARRIVE TO THE CUSTOMER.
              </p>

            
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
