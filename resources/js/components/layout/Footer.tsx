import { Link } from 'react-router-dom'
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-cream-200" />
              </div>
              <div>
                <span className="font-display font-bold text-cream-100 block leading-none">Meadowlark</span>
                <span className="text-[10px] font-sans text-sage-400 tracking-widest uppercase">Gardens TN</span>
              </div>
            </div>
            <p className="text-sage-300 text-sm font-body leading-relaxed mb-5">
              Rooted in Tennessee, growing since 1998. We cultivate native plants that thrive in our unique climate and support local ecosystems.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-forest-800 hover:bg-forest-600 rounded-lg flex items-center justify-center transition-colors duration-200 focus-ring"
                  aria-label={['Facebook', 'Instagram', 'Twitter'][i]}
                >
                  <Icon className="w-4 h-4 text-sage-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
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

          {/* Contact */}
          <div>
            <h4 className="font-sans font-700 text-cream-200 mb-4 text-sm tracking-wide uppercase">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sage-300 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-forest-400 shrink-0" />
                <span>1247 Meadowlark Lane<br />Franklin, TN 37064</span>
              </li>
              <li className="flex items-center gap-3 text-sage-300 text-sm">
                <Phone className="w-4 h-4 text-forest-400 shrink-0" />
                <a href="tel:+16155550182" className="hover:text-cream-200 transition-colors">(615) 555-0182</a>
              </li>
              <li className="flex items-center gap-3 text-sage-300 text-sm">
                <Mail className="w-4 h-4 text-forest-400 shrink-0" />
                <a href="mailto:hello@meadowlarkgardens.com" className="hover:text-cream-200 transition-colors">hello@meadowlarkgardens.com</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
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
          <p className="text-sage-500 text-xs font-body">© 2025 Meadowlark Gardens TN. All rights reserved.</p>
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