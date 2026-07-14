import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Leaf, Truck, Award, Sprout, Star, ChevronRight, Users, ShoppingBag } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import ProductCard from '@/components/ui/ProductCard'
import { api } from '@/lib/api'
import { Product } from '@/types'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    api.getProducts().then(({ products }) => {
      setFeaturedProducts(products.filter(p => p.inStock).slice(0, 4))
    }).catch(() => setFeaturedProducts([]))
  }, [])

  const features = [
   /* { icon: Leaf, title: 'Tennessee Native', desc: 'Every plant is carefully selected to thrive in our local climate and support native ecosystems.' }, */
    { icon: Truck, title: 'Fast Delivery', desc: 'Fast delivery across states. Your plants arrive fresh, never stressed.' },
    { icon: Award, title: 'Expert Grown', desc: 'Over 10 years growing premium plants with sustainable process.' },
    { icon: Sprout, title: 'Guaranteed Growth', desc: 'All plants come with a 90-day growth guarantee. We stand behind every seedling.' },
  ]

  const testimonials = [
    { name: 'Emily Carter', role: 'Home Gardener, Nashville', text: 'Meadowlark has transformed my backyard into a pollinator paradise. The coneflowers I bought last spring are thriving!', rating: 5 },
    { name: 'Marcus Green', role: 'Landscape Architect', text: 'As a professional, I trust Meadowlark for all my native plant needs. Quality is always consistent and the staff is knowledgeable.', rating:  5 },
    { name: 'Diane & Tom Pruitt', role: 'Franklin, TN', text: 'We drove two hours for their Southern Magnolias and it was absolutely worth it. Stunning specimens, well-rooted.', rating: 5 },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-forest-950">
        {/* Mesh Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="mesh-drift absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #448647 0%, transparent 70%)' }} />
          <div className="mesh-drift absolute -bottom-20 -left-40 w-[600px] h-[600px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #608d64 0%, transparent 70%)', animationDelay: '-8s' }} />
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=60")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/70 to-forest-950/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-6 px-3 py-1.5 bg-forest-900/60 rounded-full border border-forest-700"
            >
              <Leaf className="w-3 h-3" />
              Rooted in Tennessee Since 1998
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-900 text-cream-50 text-balance leading-[1.08] mb-6"
              style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}
            >
              Where Gardens
              <br />
              <span className="text-forest-400">Come to Life</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-sage-300 text-lg font-body leading-relaxed mb-8 max-w-lg"
            >
              Discover plants, flowering trees, and seasonal perennials curated for Tennessee gardens, homes, and landscapes.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/shop"
                className="flex items-center gap-2 px-6 py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all duration-200 shadow-lg shadow-forest-900/40 hover:shadow-xl hover:-translate-y-0.5 focus-ring"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop All Plants
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/wholesale/apply"
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-cream-100 font-sans font-600 rounded-xl border border-white/20 transition-all duration-200 backdrop-blur-sm focus-ring"
              >
                <Users className="w-5 h-5" />
                Wholesale Access
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {[
                  'photo-1544005313-94ddf0286df2',
                  'photo-1507003211169-0a1dd7228f2d',
                  'photo-1494790108377-be9c29b29330',
                ].map(id => (
                  <img
                    key={id}
                    src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=80&h=80&q=80&crop=faces`}
                    alt=""
                    className="w-9 h-9 rounded-full border-2 border-forest-900 object-cover"
                    loading="eager"
                  />
                ))}
              </div>
              <div>
                <div className="flex text-cream-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-sage-400 text-xs font-body mt-0.5"><a href="./shop/reviews">Trusted by 3,239+ garden lovers</a></p>
              </div>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative"
          >
            <div className="relative float-animation">
              <div className="absolute inset-0 bg-gradient-to-br from-forest-500/20 to-forest-900/20 rounded-3xl z-10 mix-blend-overlay" />
              <img
                src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=700&q=80"
                alt="Beautiful garden arrangement"
                className="w-full rounded-3xl object-cover shadow-2xl"
                style={{ height: '520px' }}
                loading="eager"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 z-20">
                <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <p className="font-sans font-700 text-forest-900 text-sm">120+ Native Species</p>
                  <p className="text-sage-500 text-xs">In stock this season</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1.5 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why Choose Us"
            title="Grown with Purpose, Sold with Pride"
            subtitle="Everything we grow is selected for long-term success in unique climate and ecology."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 bg-white rounded-2xl border border-forest-100 hover:border-forest-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-forest-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-forest-600" />
                </div>
                <h3 className="font-display font-700 text-forest-800 text-lg mb-2">{feature.title}</h3>
                <p className="text-sage-600 text-sm font-body leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader
              eyebrow="Featured Plants"
              title="This Season's Favorites"
              subtitle="Hand-selected by our horticulturists for beauty, resilience, and ecological value."
              centered={false}
            />
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-1.5 text-forest-600 hover:text-forest-800 font-sans font-600 text-sm transition-colors focus-ring rounded"
            >
              View all plants <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 text-white font-sans font-600 rounded-xl hover:bg-forest-700 transition-colors focus-ring">
              View All Plants <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Wholesale CTA Banner */}
      <section className="py-16 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=40")', backgroundSize: 'cover' }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-800/80 rounded-full border border-forest-700">
              For Businesses
            </span>
            <h2 className="font-display font-700 text-cream-50 mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Wholesale Partner Program
            </h2>
            <p className="text-sage-300 text-lg font-body leading-relaxed mb-8 max-w-xl mx-auto">
              Nurseries, landscapers, and garden centers — access our full catalog at wholesale pricing with minimum orders of just 5 units.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/wholesale/apply"
                className="px-6 py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-ring"
              >
                Apply for Wholesale Access
              </Link>
              <Link
                to="/wholesale/login"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-cream-100 font-sans font-600 rounded-xl border border-white/20 transition-colors focus-ring"
              >
                Already a Partner? Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Customer Love"
            title="What Our Gardeners Say"
            subtitle="Thousands of satisfied customers across Tennessee and beyond."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white p-6 rounded-2xl border border-forest-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex text-cream-500 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current text-amber-400" />)}
                </div>
                <p className="text-forest-800 font-body leading-relaxed mb-5 italic">"{t.text}"</p>
                <div>
                  <p className="font-sans font-700 text-forest-900 text-sm">{t.name}</p>
                  <p className="text-sage-500 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '10+', label: 'Years Growing' },
              { value: '120+', label: 'Plant Varieties' },
              { value: '2,400+', label: 'Happy Customers' },
              { value: '85+', label: 'Wholesale Partners' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="font-display font-900 text-cream-100 mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                  {stat.value}
                </p>
                <p className="text-sage-400 text-sm font-sans">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}