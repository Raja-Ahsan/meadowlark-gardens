import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import SiteLogo from './SiteLogo'
import SocialLinks, { splitSettingLines } from './SocialLinks'

export default function Footer() {
  const { siteName, footerLogo, siteEmail, sitePhone, contactAddress, footerDescription, social } = useSiteSettings()
  const addressLines = splitSettingLines(contactAddress)

  return (
    <footer className="bg-forest-900 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <SiteLogo siteName={siteName} logo={footerLogo} variant="footer" />
            </div>
            {footerDescription && (
              <p className="text-sage-300 text-sm font-body leading-relaxed mb-5">
                {footerDescription}
              </p>
            )}
            <SocialLinks social={social} />
          </div>

          <div>
            <h4 className="font-sans font-700 text-cream-200 mb-4 text-sm tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Shop Plants', to: '/shop' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Wholesale Apply', to: '/wholesale/apply' },
                { label: 'Wholesale Login', to: '/wholesale/login' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sage-300 hover:text-cream-200 text-sm font-body transition-colors duration-200 focus-ring rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-700 text-cream-200 mb-4 text-sm tracking-wide uppercase">Contact Us</h4>
            <ul className="space-y-3">
              {addressLines.length > 0 && (
                <li className="flex items-start gap-3 text-sage-300 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-forest-400 shrink-0" />
                  <span>
                    {addressLines.map((line, i) => (
                      <span key={line}>
                        {line}
                        {i < addressLines.length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                </li>
              )}
              {sitePhone && (
                <li className="flex items-center gap-3 text-sage-300 text-sm">
                  <Phone className="w-4 h-4 text-forest-400 shrink-0" />
                  <a href={`tel:${sitePhone.replace(/\D/g, '')}`} className="hover:text-cream-200 transition-colors">{sitePhone}</a>
                </li>
              )}
              {siteEmail && (
                <li className="flex items-center gap-3 text-sage-300 text-sm">
                  <Mail className="w-4 h-4 text-forest-400 shrink-0" />
                  <a href={`mailto:${siteEmail}`} className="hover:text-cream-200 transition-colors">{siteEmail}</a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-700 text-cream-200 mb-4 text-sm tracking-wide uppercase">Newsletter</h4>
            <p className="text-sage-300 text-sm mb-4">Seasonal planting tips and new arrivals straight to your inbox.</p>
            <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2.5 rounded-xl bg-forest-800 border border-forest-700 text-cream-100 placeholder:text-sage-500 text-sm focus:outline-none focus:border-forest-400 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-forest-600 hover:bg-forest-500 text-white rounded-xl text-sm font-sans font-600 transition-colors duration-200 focus-ring"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-forest-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sage-500 text-xs font-body">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map(item => (
              <a key={item} href="#" className="text-sage-500 hover:text-sage-300 text-xs font-body transition-colors focus-ring rounded">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
