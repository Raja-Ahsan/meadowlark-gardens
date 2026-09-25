import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Leaf, Sun, Droplets, Sprout, CloudSun, Mountain, Waves, ArrowRight } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import { HydrangeaBloomingGuide, HydrangeaColorAndTips } from '@/components/plant/HydrangeaGuide'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/media'
import type { PlantType, PlantTypeCategory } from '@/types'

const tips = [
  {
    step: '01',
    title: 'Choose the Right Plant',
    desc: 'Consider your light, soil, and moisture conditions. Native and regionally adapted plants need less water and care once established, and they support local pollinators.',
  },
  {
    step: '02',
    title: 'Plant With Care',
    desc: 'Dig a hole roughly twice as wide as the root ball and just as deep. Gently loosen the roots, set the crown at soil level, backfill, and water thoroughly.',
  },
  {
    step: '03',
    title: 'Mulch & Protect',
    desc: 'Mulch around the base to retain moisture and regulate soil temperature. Keep mulch clear of the stem so the plant can breathe and stay healthy.',
  },
  {
    step: '04',
    title: 'Aftercare',
    desc: 'Water regularly for the first few weeks while roots establish. Avoid overwatering — most plants prefer soil that drains well. Check each product page for sun, water, and hardiness tips.',
  },
]

const conditions = [
  {
    icon: CloudSun,
    title: 'Sunlight',
    items: [
      'Full sun: 6+ hours of direct light',
      'Part shade: morning sun or filtered light',
      'Full shade: little to no direct sun',
    ],
  },
  {
    icon: Mountain,
    title: 'Soil',
    items: [
      'Well-drained soil prevents root rot',
      'Amend heavy clay with compost',
      'Match plant preferences to your soil type',
    ],
  },
  {
    icon: Waves,
    title: 'Water',
    items: [
      'Water deeply, then let soil dry slightly',
      'New plantings need steady moisture',
      'Established plants prefer less frequent watering',
    ],
  },
]

export default function PlantInformationPage() {
  const [categories, setCategories] = useState<PlantTypeCategory[]>([])
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('')

  useEffect(() => {
    api.getPlantTypeCategories()
      .then(({ categories: cats }) => {
        setCategories(cats)
        if (cats.length > 0) {
          const roses = cats.find(c => c.slug === 'roses')
          setActiveCategorySlug((roses ?? cats[0]).slug)
        }
      })
      .catch(() => setCategories([]))
  }, [])

  const activeCategory = categories.find(c => c.slug === activeCategorySlug) ?? categories[0]
  const activeTypes: PlantType[] = activeCategory?.types ?? []

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Header */}
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[480px] flex items-center bg-forest-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-forest-950/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/50 via-transparent to-forest-950/70" />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-800/80 rounded-full border border-forest-700"
          >
            Growing Guide
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-700 text-cream-50 text-balance mb-6"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Plant Information
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sage-200 text-lg font-body leading-relaxed max-w-2xl mx-auto"
          >
            Everything you need to help your Meadowlark plants thrive — from choosing the right variety to planting and aftercare.
          </motion.p>
        </div>
      </section>

      {/* Intro / how we grow */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block text-xs font-sans font-700 text-forest-600 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-50 rounded-full border border-forest-200">
                How We Grow
              </span>
              <h2
                className="font-display font-700 text-forest-900 mb-6"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Grown for Real Backyards
              </h2>
              <p className="text-forest-700 font-body leading-relaxed mb-4">
                Every plant we grow is raised outdoors in Tennessee — no greenhouses. That means our plants are hardened for real backyard conditions.
              </p>
              <p className="text-sage-600 font-body leading-relaxed mb-6">
                Our saying is simple: if it grows and is healthy in our backyard, it will do the same in yours. Use the guide below to plant with confidence and give each variety the best start.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Leaf, label: 'Open-Air Grown' },
                  { icon: Sun, label: 'Tennessee Hardened' },
                  { icon: Droplets, label: 'Water-Wise Tips' },
                  { icon: Sprout, label: 'Rooted to Thrive' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-forest-50 rounded-xl">
                    <item.icon className="w-5 h-5 text-forest-600 shrink-0" />
                    <span className="text-forest-700 text-sm font-sans font-600">{item.label}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/how-we-grow"
                className="inline-flex items-center gap-2 text-forest-700 hover:text-forest-900 font-sans font-700 text-sm transition-colors focus-ring rounded"
              >
                Learn how we grow <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <img
                src="/images/plant-info.webp"
                alt="Healthy outdoor plants growing in a garden"
                className="w-full h-[480px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl">
                <p className="font-sans font-700 text-forest-900 text-2xl">TN</p>
                <p className="text-sage-500 text-sm">Open-Air Nursery</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Plant type categories + types */}
      {categories.length > 0 && (
        <section className="py-20 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Plant Types"
              title="Explore by Variety"
              subtitle="Learn more about the plants we grow — from Japanese Maples to Hydrangeas, Roses, and more."
            />

            <div className="flex gap-2 flex-wrap justify-center mb-10">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-sans font-600 transition-all duration-200 focus-ring ${
                    activeCategory?.slug === cat.slug
                      ? 'bg-forest-600 text-white shadow-sm'
                      : 'bg-white text-forest-700 border border-forest-200 hover:border-forest-400 hover:bg-forest-50'
                  }`}
                >
                  {cat.title}
                  {typeof cat.typeCount === 'number' && (
                    <span className={`ml-1.5 text-xs ${activeCategory?.slug === cat.slug ? 'text-forest-200' : 'text-sage-400'}`}>
                      {cat.typeCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeCategory?.excerpt && (
              <p className="text-center text-sage-600 font-body max-w-2xl mx-auto mb-8">
                {activeCategory.excerpt}
              </p>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory?.slug || 'empty'}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {activeCategory?.slug === 'hydrangeas' && <HydrangeaBloomingGuide />}

                {activeTypes.length === 0 ? (
                  <div className="text-center py-16 text-sage-500 font-body">
                    No types published in this category yet.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTypes.map((type, i) => (
                      <motion.div
                        key={type.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={`/plant-information/${type.slug}`}
                          className="group block h-full overflow-hidden rounded-2xl border border-forest-100 bg-white hover:border-forest-200 hover:shadow-lg transition-all duration-300 focus-ring"
                        >
                          <div className="aspect-[16/10] overflow-hidden bg-forest-100">
                            {type.image ? (
                              <img
                                src={mediaUrl(type.image)}
                                alt={type.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Leaf className="w-10 h-10 text-forest-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="font-display font-700 text-forest-900 text-xl mb-2 group-hover:text-forest-700 transition-colors">
                              {type.title}
                            </h3>
                            {type.excerpt && (
                              <p className="text-sage-600 text-sm font-body leading-relaxed mb-4 line-clamp-3">
                                {type.excerpt}
                              </p>
                            )}
                            <span className="inline-flex items-center gap-1.5 text-forest-700 text-sm font-sans font-700">
                              Read more <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeCategory?.slug === 'hydrangeas' && <HydrangeaColorAndTips />}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Care Guide — numbered process grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Care Guide"
            title="From Planting to Thriving"
            subtitle="Four simple steps to help your plants settle in and grow strong."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-x-12">
            {tips.map((tip, i) => (
              <motion.div
                key={tip.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="relative mb-5 flex items-center">
                  <span
                    className="relative z-10 bg-white pr-3 font-display font-700 leading-none text-forest-200"
                    style={{ fontSize: 'clamp(2.5rem, 4vw, 3.25rem)' }}
                  >
                    {tip.step}
                  </span>
                  {i < tips.length - 1 && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute left-[3.75rem] top-1/2 hidden h-px -translate-y-1/2 bg-forest-200/80 lg:block"
                      style={{ width: 'calc(100% - 3.75rem + 3rem)' }}
                    />
                  )}
                </div>
                <h3 className="font-display font-700 text-forest-900 text-xl mb-3">{tip.title}</h3>
                <p className="text-sage-600 text-sm font-body leading-relaxed">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Site conditions */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=700&q=80"
                alt="Healthy garden landscape"
                className="w-full h-[420px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="order-1 lg:order-2"
            >
              <span className="inline-block text-xs font-sans font-700 text-forest-600 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-50 rounded-full border border-forest-200">
                Right Plant, Right Place
              </span>
              <h2
                className="font-display font-700 text-forest-900 mb-6"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Match Plants to Your Site
              </h2>
              <p className="text-sage-600 font-body leading-relaxed mb-8">
                Before you dig, take stock of light, soil, and moisture. Choosing a plant that fits your yard is the surest path to a low-maintenance, thriving garden.
              </p>
              <div className="space-y-6">
                {conditions.map((group, i) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.45 }}
                    className="flex gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-forest-50 flex items-center justify-center shrink-0">
                      <group.icon className="w-5 h-5 text-forest-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-700 text-forest-900 text-lg mb-1.5">{group.title}</h3>
                      <ul className="space-y-1">
                        {group.items.map(item => (
                          <li key={item} className="text-sage-600 text-sm font-body leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Help / next steps CTA */}
      <section className="py-20 bg-forest-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=40")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-sans font-700 text-forest-300 tracking-widest uppercase mb-4 px-3 py-1 bg-forest-800/80 rounded-full border border-forest-700">
              Still Have Questions?
            </span>
            <h2
              className="font-display font-700 text-cream-50 mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              We&apos;re Happy to Help You Grow
            </h2>
            <p className="text-sage-300 text-lg font-body leading-relaxed mb-8 max-w-xl mx-auto">
              Browse our catalog for sun, water, and hardiness notes on every plant — or reach out and we&apos;ll help you pick varieties that belong in your landscape.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-ring"
              >
                Shop Plants <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-cream-100 font-sans font-600 rounded-xl border border-white/20 transition-colors focus-ring"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
